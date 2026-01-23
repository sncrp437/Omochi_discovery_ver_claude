#!/usr/bin/env python3
"""
Local Analytics Dashboard
Reads downloaded Google Sheet (Excel/CSV) and serves a dashboard at localhost:8000

Usage:
1. Download your Analytics Google Sheet as Excel (.xlsx) or CSV
2. Save as 'analytics_data.xlsx' or 'analytics_data.csv' in this folder
3. Run: python analytics_local.py
4. Open browser to http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import json
import os
import sys
from datetime import datetime
from collections import Counter

# Try to import pandas, give helpful error if not installed
try:
    import pandas as pd
except ImportError:
    print("Error: pandas is required. Install with:")
    print("  pip install pandas openpyxl")
    sys.exit(1)

# Configuration
PORT = 8000
DATA_FILES = ['analytics_data.xlsx', 'analytics_data.csv']

# Expected column names (matching Google Sheet headers)
EXPECTED_COLUMNS = ['timestamp', 'event_type', 'video_id', 'session_id',
                    'user_agent', 'referrer', 'screen_size', 'is_mobile', 'custom_data']


def find_data_file():
    """Find the analytics data file (Excel or CSV)"""
    script_dir = os.path.dirname(os.path.abspath(__file__))

    for filename in DATA_FILES:
        filepath = os.path.join(script_dir, filename)
        if os.path.exists(filepath):
            return filepath

    return None


def load_data(filepath):
    """Load data from Excel or CSV file"""
    print(f"Loading data from: {filepath}")

    if filepath.endswith('.xlsx'):
        try:
            df = pd.read_excel(filepath, engine='openpyxl')
        except ImportError:
            print("Error: openpyxl is required for Excel files. Install with:")
            print("  pip install openpyxl")
            sys.exit(1)
    else:
        df = pd.read_csv(filepath)

    # Normalize column names (lowercase, strip whitespace)
    df.columns = df.columns.str.lower().str.strip()

    print(f"Loaded {len(df)} rows")
    return df


def calculate_stats(df):
    """Calculate analytics statistics from the data"""
    stats = {
        'summary': {
            'qr_scans': 0,
            'venue_views': 0,
            'collect_clicks': 0,
            'gps_success': 0,
            'unique_sessions': 0
        },
        'top_venues': [],
        'events': []
    }

    if df.empty:
        return stats

    # Count event types
    event_counts = df['event_type'].value_counts().to_dict() if 'event_type' in df.columns else {}

    stats['summary']['qr_scans'] = event_counts.get('qr_direct_access', 0)
    stats['summary']['venue_views'] = event_counts.get('nfc_venue_view', 0)
    stats['summary']['collect_clicks'] = event_counts.get('nfc_collect_click', 0)
    stats['summary']['gps_success'] = event_counts.get('gps_success', 0)

    # Count unique sessions
    if 'session_id' in df.columns:
        stats['summary']['unique_sessions'] = df['session_id'].nunique()

    # Get top venues from custom_data
    if 'custom_data' in df.columns:
        venue_counts = Counter()
        collect_events = df[df['event_type'] == 'nfc_collect_click']

        for _, row in collect_events.iterrows():
            try:
                custom = row['custom_data']
                if pd.notna(custom):
                    if isinstance(custom, str):
                        data = json.loads(custom)
                    else:
                        data = custom
                    venue_key = data.get('venue_key', 'unknown')
                    venue_counts[venue_key] += 1
            except (json.JSONDecodeError, TypeError, AttributeError):
                pass

        stats['top_venues'] = [
            {'venue': venue, 'collects': count}
            for venue, count in venue_counts.most_common(10)
        ]

    # Get recent events (last 50)
    recent_df = df.tail(50).iloc[::-1]  # Reverse to show newest first

    for _, row in recent_df.iterrows():
        event = {
            'timestamp': str(row.get('timestamp', '')),
            'event_type': str(row.get('event_type', '')),
            'custom_data': str(row.get('custom_data', '')),
            'session_id': str(row.get('session_id', ''))
        }
        stats['events'].append(event)

    return stats


def generate_html(stats):
    """Generate the dashboard HTML with embedded data"""
    summary = stats['summary']

    # Calculate conversion rate
    conversion_rate = 0
    if summary['venue_views'] > 0:
        conversion_rate = round((summary['collect_clicks'] / summary['venue_views']) * 100, 1)

    # Generate funnel HTML
    max_val = max(summary['qr_scans'], summary['venue_views'], summary['collect_clicks'], 1)

    def funnel_percent(value, base):
        if base > 0:
            return f"{round((value / base) * 100)}%"
        return "0%"

    funnel_steps = [
        ('QR/NFC Scans', summary['qr_scans'], '100%'),
        ('Venue Views', summary['venue_views'], funnel_percent(summary['venue_views'], summary['qr_scans'])),
        ('Collects', summary['collect_clicks'], funnel_percent(summary['collect_clicks'], summary['venue_views']))
    ]

    funnel_html = ""
    for label, value, percent in funnel_steps:
        width = max((value / max_val) * 100, 10)
        funnel_html += f'''
            <div class="funnel-step">
                <div class="funnel-label">{label}</div>
                <div class="funnel-bar" style="width: {width}%">{value}</div>
                <div class="funnel-percent">{percent}</div>
            </div>
        '''

    # Generate top venues HTML
    venues_html = '<p style="color: #888;">No venue data yet</p>'
    if stats['top_venues']:
        venues_html = '<ul class="venue-list">'
        for i, v in enumerate(stats['top_venues'], 1):
            venues_html += f'''
                <li>
                    <span class="venue-name">{i}. {v['venue']}</span>
                    <span class="venue-count">{v['collects']} collects</span>
                </li>
            '''
        venues_html += '</ul>'

    # Generate events table HTML
    events_html = '<p style="color: #888;">No events recorded yet</p>'
    if stats['events']:
        events_html = '''
            <div style="overflow-x: auto;">
                <table class="events-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Event</th>
                            <th>Custom Data</th>
                            <th>Session</th>
                        </tr>
                    </thead>
                    <tbody>
        '''
        for e in stats['events']:
            timestamp = e['timestamp'][:16] if len(e['timestamp']) > 16 else e['timestamp']
            session = e['session_id'][:15] + '...' if len(e['session_id']) > 15 else e['session_id']
            custom = format_custom_data(e['custom_data'])
            events_html += f'''
                <tr>
                    <td>{timestamp}</td>
                    <td><span class="event-type">{e['event_type']}</span></td>
                    <td>{custom}</td>
                    <td>{session}</td>
                </tr>
            '''
        events_html += '''
                    </tbody>
                </table>
            </div>
        '''

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFC/QR Analytics Dashboard (Local)</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
            padding: 20px;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}

        header {{
            text-align: center;
            margin-bottom: 30px;
        }}

        header h1 {{
            font-size: 28px;
            margin-bottom: 5px;
        }}

        header p {{
            color: #888;
            font-size: 14px;
        }}

        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }}

        .stat-card {{
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }}

        .stat-card h3 {{
            font-size: 12px;
            text-transform: uppercase;
            color: #888;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }}

        .stat-card .value {{
            font-size: 36px;
            font-weight: bold;
            color: #4ecdc4;
        }}

        .stat-card.highlight .value {{
            color: #ff6b6b;
        }}

        .stat-card.success .value {{
            color: #51cf66;
        }}

        .section {{
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }}

        .section h2 {{
            font-size: 18px;
            margin-bottom: 15px;
            color: #4ecdc4;
        }}

        .funnel {{
            display: flex;
            flex-direction: column;
            gap: 10px;
        }}

        .funnel-step {{
            display: flex;
            align-items: center;
            gap: 15px;
        }}

        .funnel-bar {{
            height: 40px;
            background: linear-gradient(90deg, #4ecdc4, #44a3aa);
            border-radius: 8px;
            display: flex;
            align-items: center;
            padding: 0 15px;
            color: #fff;
            font-weight: bold;
            min-width: 100px;
        }}

        .funnel-label {{
            min-width: 120px;
            font-size: 14px;
            color: #ccc;
        }}

        .funnel-percent {{
            font-size: 14px;
            color: #888;
            min-width: 60px;
        }}

        .venue-list {{
            list-style: none;
        }}

        .venue-list li {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }}

        .venue-list li:last-child {{
            border-bottom: none;
        }}

        .venue-name {{
            font-weight: 500;
        }}

        .venue-count {{
            background: #4ecdc4;
            color: #1a1a2e;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }}

        .events-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }}

        .events-table th,
        .events-table td {{
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }}

        .events-table th {{
            color: #888;
            font-weight: normal;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 1px;
        }}

        .events-table td {{
            color: #ccc;
        }}

        .event-type {{
            background: rgba(78, 205, 196, 0.2);
            color: #4ecdc4;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
        }}

        .last-updated {{
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
        }}

        .two-columns {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }}

        @media (max-width: 768px) {{
            .two-columns {{
                grid-template-columns: 1fr;
            }}
        }}

        .info-banner {{
            background: rgba(78, 205, 196, 0.1);
            border: 1px solid rgba(78, 205, 196, 0.3);
            border-radius: 8px;
            padding: 12px 20px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #4ecdc4;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>NFC/QR Analytics Dashboard</h1>
            <p>Local Version - Reading from downloaded spreadsheet</p>
        </header>

        <div class="info-banner">
            To refresh: Download new Excel file from Google Sheets, save as analytics_data.xlsx, restart this script.
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <h3>QR/NFC Scans</h3>
                <div class="value">{summary['qr_scans']}</div>
            </div>
            <div class="stat-card">
                <h3>Venue Views</h3>
                <div class="value">{summary['venue_views']}</div>
            </div>
            <div class="stat-card highlight">
                <h3>Collects</h3>
                <div class="value">{summary['collect_clicks']}</div>
            </div>
            <div class="stat-card success">
                <h3>Conversion</h3>
                <div class="value">{conversion_rate}%</div>
            </div>
            <div class="stat-card">
                <h3>GPS Success</h3>
                <div class="value">{summary['gps_success']}</div>
            </div>
            <div class="stat-card">
                <h3>Unique Sessions</h3>
                <div class="value">{summary['unique_sessions']}</div>
            </div>
        </div>

        <div class="two-columns">
            <!-- Conversion Funnel -->
            <div class="section">
                <h2>Conversion Funnel</h2>
                <div class="funnel">
                    {funnel_html}
                </div>
            </div>

            <!-- Top Venues -->
            <div class="section">
                <h2>Top Venues</h2>
                {venues_html}
            </div>
        </div>

        <!-- Recent Events -->
        <div class="section">
            <h2>Recent Events (Last 50)</h2>
            {events_html}
        </div>

        <p class="last-updated">Data loaded: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
</body>
</html>'''

    return html


def format_custom_data(data):
    """Format custom_data for display"""
    if not data or data == 'nan' or data == 'None':
        return '-'
    try:
        if isinstance(data, str):
            parsed = json.loads(data)
        else:
            parsed = data
        if isinstance(parsed, dict):
            if 'venue_key' in parsed:
                return f"venue: {parsed['venue_key']}"
            if 'distance_meters' in parsed:
                return f"distance: {parsed['distance_meters']}m"
            if 'error_code' in parsed:
                return f"error: {parsed['error_code']}"
        return str(data)[:50]
    except (json.JSONDecodeError, TypeError):
        return str(data)[:50] if data else '-'


class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler that serves the dashboard HTML"""

    def __init__(self, *args, html_content=None, **kwargs):
        self.html_content = html_content
        super().__init__(*args, **kwargs)

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(self.html_content.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress default logging
        pass


def main():
    """Main entry point"""
    print("=" * 50)
    print("NFC/QR Analytics Dashboard - Local Version")
    print("=" * 50)

    # Find data file
    data_file = find_data_file()
    if not data_file:
        print("\nError: No data file found!")
        print("\nPlease download your Analytics Google Sheet:")
        print("  1. Open your Google Sheet")
        print("  2. File -> Download -> Microsoft Excel (.xlsx)")
        print("  3. Save as 'analytics_data.xlsx' in this folder")
        print(f"\nLooking in: {os.path.dirname(os.path.abspath(__file__))}")
        sys.exit(1)

    # Load and process data
    df = load_data(data_file)
    stats = calculate_stats(df)
    html_content = generate_html(stats)

    # Create handler with HTML content
    handler = lambda *args, **kwargs: DashboardHandler(*args, html_content=html_content, **kwargs)

    # Start server
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"\nDashboard running at: {url}")
        print("Press Ctrl+C to stop\n")

        # Open browser
        webbrowser.open(url)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down...")


if __name__ == "__main__":
    main()

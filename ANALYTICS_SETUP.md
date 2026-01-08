# Analytics Setup - Separate Spreadsheet

## Security Design

**Important**: Analytics uses TWO separate Google Spreadsheets with TWO separate Apps Scripts:

1. **Video Data Spreadsheet** + **Video Apps Script**
   - Public GET endpoint (returns video data)
   - Anyone can call this API
   - Cannot access analytics data

2. **Analytics Spreadsheet** + **Analytics Apps Script**
   - POST-only endpoint (logs events)
   - Anyone can send data TO it
   - Never returns analytics data (GET requests return no data)
   - Only owner can view the spreadsheet

This architecture ensures:
- Users can fetch video data but cannot read analytics
- Each Apps Script only has access to its own spreadsheet
- Analytics data remains private to you (the owner)

## Setup Instructions

### Step 1: Create Analytics Spreadsheet

1. Create a **new, separate** Google Spreadsheet
2. Name it something like "Reels Analytics" or "Video Stats"
3. In the first row, add these column headers:
   ```
   timestamp | event_type | video_id | session_id | user_agent | referrer | screen_size | is_mobile
   ```
4. **Copy the Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part (long string of letters and numbers)
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Step 2: Create Analytics Apps Script

1. In your **Analytics** spreadsheet, go to **Extensions > Apps Script**
2. Delete the default code
3. Copy the entire contents of `ANALYTICS_APPS_SCRIPT.js` from this repository
4. Paste it into the Apps Script editor
5. Save the script (Ctrl+S or Cmd+S)
6. Click **Deploy > New deployment**
7. Choose **Web app** as deployment type
8. Set the following options:
   - Execute as: **Me**
   - Who has access: **Anyone** (don't worry - they can only send data, not read it)
9. Click **Deploy**
10. **Copy the Web app URL** - you'll need this for the frontend

### Step 3: Update Frontend Configuration

1. Open `js/analytics.js` in your project
2. Find the configuration at the top:
```javascript
const ANALYTICS_API_URL = 'YOUR_ANALYTICS_APPS_SCRIPT_URL_HERE';
```
3. Replace with the URL you copied in Step 2:
```javascript
const ANALYTICS_API_URL = 'https://script.google.com/macros/s/YOUR_ANALYTICS_SCRIPT_ID/exec';
```
4. Save the file

### Step 4: Deploy to GitHub Pages

1. Commit and push your changes
2. Your site will now track analytics automatically
3. Check your Analytics spreadsheet to see data flowing in

## Analytics Spreadsheet Structure

### Column Definitions

| Column | Field        | Description                                      | Example                    |
|--------|--------------|--------------------------------------------------|----------------------------|
| A      | timestamp    | When the event occurred                          | 2024-01-15 14:23:45       |
| B      | event_type   | Type of event                                    | page_load, video_view, collect |
| C      | video_id     | Video identifier (if applicable)                 | video_001                 |
| D      | session_id   | Random session identifier                        | sess_abc123def456         |
| E      | user_agent   | Browser/device information                       | Mozilla/5.0...            |
| F      | referrer     | Traffic source                                   | https://google.com        |
| G      | screen_size  | Device screen dimensions                         | 1920x1080                 |
| H      | is_mobile    | Mobile device (TRUE/FALSE)                       | TRUE                      |

### Event Types

**page_load** - User visits the site
- Logged when: Page first loads
- Tracks: Total visits, traffic sources, device types

**video_view** - User scrolls to a video
- Logged when: Video becomes visible (50% in viewport)
- Tracks: Which videos are watched, watch patterns

**collect** - User clicks Collect button
- Logged when: Collect button clicked
- Tracks: Engagement, most collected videos

## How It Works

### Architecture Flow

```
User visits site
    ↓
┌─────────────────────────────────────────────────────┐
│ Frontend makes TWO separate API calls:              │
│                                                      │
│ 1. GET Video Data API                               │
│    ↓                                                 │
│    Video Apps Script (Spreadsheet 1)                │
│    ↓                                                 │
│    Returns video data (public)                      │
│                                                      │
│ 2. POST Analytics API                               │
│    ↓                                                 │
│    Analytics Apps Script (Spreadsheet 2)            │
│    ↓                                                 │
│    Logs event (no data returned)                    │
└─────────────────────────────────────────────────────┘
```

### Two-Script Architecture

**Spreadsheet 1: Video Data**
- File: Video URLs, captions, priorities
- Script: APPS_SCRIPT.js (video data)
- Deployment: Public GET endpoint
- Purpose: Serve video content

**Spreadsheet 2: Analytics**
- File: Event logs (page views, video views, collects)
- Script: ANALYTICS_APPS_SCRIPT.js (analytics)
- Deployment: Public POST endpoint (no data returned)
- Purpose: Track usage

**Security Benefits**:
- Video script CANNOT access analytics spreadsheet
- Analytics script NEVER returns data (POST only)
- Each script is isolated to its own spreadsheet
- Only owner can view analytics spreadsheet

## Analytics You Can Track

### Basic Metrics
- **Total Page Views**: `=COUNTIF(B:B,"page_load")`
- **Unique Sessions**: `=COUNTA(UNIQUE(FILTER(D:D,D:D<>"")))`
- **Total Video Views**: `=COUNTIF(B:B,"video_view")`
- **Collect Actions**: `=COUNTIF(B:B,"collect")`

### Video Performance
- **Most Viewed Video**: See which video_id appears most in video_view events
- **Best Collect Rate**: Ratio of collect to video_view per video
- **Drop-off Analysis**: Which videos users skip

### User Insights
- **Mobile vs Desktop**: `=COUNTIF(H:H,TRUE)` for mobile count
- **Traffic Sources**: Count unique values in referrer column
- **Peak Times**: Group timestamp by hour/day
- **Average Session Length**: Track time between first/last event per session

## Example Dashboard

Create a summary sheet in your Analytics spreadsheet:

```
=== REELS ANALYTICS DASHBOARD ===

Today's Stats:
- Page Views: =COUNTIFS(B:B,"page_load",A:A,">"&TODAY())
- Video Views: =COUNTIFS(B:B,"video_view",A:A,">"&TODAY())
- Collects: =COUNTIFS(B:B,"collect",A:A,">"&TODAY())

This Week:
- Page Views: =COUNTIFS(B:B,"page_load",A:A,">"&TODAY()-7)
- Unique Sessions: =COUNTA(UNIQUE(FILTER(D:D,A:A>"&TODAY()-7)))

Top 5 Videos (All Time):
[Use QUERY function to get most viewed video_ids]

Device Breakdown:
- Mobile: =COUNTIF(H:H,TRUE)
- Desktop: =COUNTIF(H:H,FALSE)
- Mobile %: =COUNTIF(H:H,TRUE)/COUNTA(H:H)*100
```

## Privacy & Data Protection

### What We Track (Minimal)
- Page visits (timestamp only)
- Video views (which videos, when)
- Collect button clicks
- Basic device info (mobile vs desktop)
- Screen size (for responsive design insights)
- Referrer (where users come from)

### What We DON'T Track
- IP addresses
- Personal identifiable information
- Precise geolocation
- Cookies or persistent IDs
- User email or names
- Cross-site tracking

### Session IDs
- Generated randomly in frontend
- Used only to group events in same session
- Not linked to any personal data
- No cookies or localStorage persistence

## Testing

### Test Analytics Logging

1. Deploy the updated Apps Script
2. Visit your site
3. Check the Analytics spreadsheet
4. You should see a new row with `page_load` event
5. Scroll through videos
6. You should see `video_view` events
7. Click Collect button
8. You should see `collect` event

### Troubleshooting

**No data appearing?**
- Check that ANALYTICS_SPREADSHEET_ID is correct
- Verify ENABLE_ANALYTICS is set to true
- Check Apps Script execution logs (View > Logs)
- Ensure script has permission to access both sheets

**Errors in Apps Script?**
- Make sure analytics spreadsheet has correct column headers
- Verify the spreadsheet ID is from the correct sheet
- Re-authorize the script permissions

## Disable Analytics

To turn off analytics completely:

```javascript
const ENABLE_ANALYTICS = false;
```

Or set the spreadsheet ID to empty:

```javascript
const ANALYTICS_SPREADSHEET_ID = "";
```

## Performance Impact

- **Zero impact on frontend**: Logging happens server-side
- **Non-blocking**: Analytics logging doesn't delay API response
- **Lightweight**: Only essential data captured
- **Fast**: No database queries or external services

## Data Retention

Recommendations:
- Keep last 90 days in main Analytics sheet
- Archive older data to another sheet/tab
- Consider monthly exports for long-term storage
- Delete unnecessary data to keep sheet performant

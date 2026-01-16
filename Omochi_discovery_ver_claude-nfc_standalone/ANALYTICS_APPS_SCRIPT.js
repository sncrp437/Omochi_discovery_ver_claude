/**
 * Google Apps Script for Analytics Logging
 *
 * IMPORTANT: This script goes in your ANALYTICS spreadsheet (separate from video data)
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Spreadsheet for analytics
 * 2. Add column headers: timestamp | event_type | video_id | session_id | user_agent | referrer | screen_size | is_mobile
 * 3. Go to Extensions > Apps Script
 * 4. Delete the default code and paste this entire file
 * 5. Save the script (Ctrl+S or Cmd+S)
 * 6. Click Deploy > New deployment
 * 7. Choose "Web app" as deployment type
 * 8. Set "Execute as: Me" and "Who has access: Anyone"
 * 9. Click Deploy and copy the Web app URL
 * 10. Use this URL in your frontend analytics.js file
 */

// ============================================
// CONFIGURATION
// ============================================

/**
 * Enable/disable analytics logging
 * Set to false to stop collecting data without undeploying
 */
const ENABLE_LOGGING = true;

/**
 * Maximum rows before warning (optional)
 * Set to 0 to disable limit
 */
const MAX_ROWS_WARNING = 10000;

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Handle POST requests for analytics logging
 * This is the main endpoint called from the frontend
 */
function doPost(e) {
  try {
    // Check if logging is enabled
    if (!ENABLE_LOGGING) {
      return createJsonResponse({
        success: false,
        message: 'Analytics logging is currently disabled'
      });
    }

    // Parse incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!data.event_type) {
      return createJsonResponse({
        success: false,
        message: 'event_type is required'
      });
    }

    // Log the event
    logEvent(data);

    // Return success
    return createJsonResponse({ success: true });

  } catch (error) {
    console.error('Analytics POST error:', error);
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Handle GET requests
 * We don't return any data - analytics should be private
 */
function doGet(e) {
  // Return minimal response - no data exposed
  return createJsonResponse({
    status: 'Analytics endpoint active',
    message: 'Use POST to log events. No data available via GET.',
    enabled: ENABLE_LOGGING
  });
}

// ============================================
// LOGGING FUNCTIONS
// ============================================

/**
 * Log an analytics event to the spreadsheet
 */
function logEvent(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Check row limit
    if (MAX_ROWS_WARNING > 0 && sheet.getLastRow() >= MAX_ROWS_WARNING) {
      console.warn(`Analytics sheet has ${sheet.getLastRow()} rows. Consider archiving old data.`);
    }

    // Prepare row data matching column structure
    const timestamp = new Date();
    const rowData = [
      timestamp,                        // A: timestamp
      data.event_type || '',           // B: event_type
      data.video_id || '',             // C: video_id
      data.session_id || '',           // D: session_id
      data.user_agent || '',           // E: user_agent
      data.referrer || '',             // F: referrer
      data.screen_size || '',          // G: screen_size
      data.is_mobile || ''             // H: is_mobile
    ];

    // Append row to sheet
    sheet.appendRow(rowData);

    // Log to Apps Script console (for debugging)
    console.log(`Logged ${data.event_type} event${data.video_id ? ' for video ' + data.video_id : ''}`);

  } catch (error) {
    console.error('Failed to log event:', error);
    throw error; // Re-throw so caller knows it failed
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a JSON response
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// UTILITY FUNCTIONS (Optional)
// ============================================

/**
 * Get analytics summary (run manually in Apps Script editor)
 * This is for the owner only - not exposed via web endpoint
 */
function getAnalyticsSummary() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Skip header row
  const events = data.slice(1);

  // Calculate stats
  const totalEvents = events.length;
  const pageLoads = events.filter(row => row[1] === 'page_load').length;
  const videoViews = events.filter(row => row[1] === 'video_view').length;
  const collects = events.filter(row => row[1] === 'collect').length;
  const uniqueSessions = new Set(events.map(row => row[3])).size;

  const summary = {
    total_events: totalEvents,
    page_loads: pageLoads,
    video_views: videoViews,
    collects: collects,
    unique_sessions: uniqueSessions,
    collect_rate: videoViews > 0 ? (collects / videoViews * 100).toFixed(2) + '%' : '0%'
  };

  Logger.log('Analytics Summary:');
  Logger.log(JSON.stringify(summary, null, 2));

  return summary;
}

/**
 * Archive old data (run manually)
 * Moves events older than specified days to archive sheet
 */
function archiveOldData(daysToKeep = 90) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mainSheet = ss.getActiveSheet();

  // Create archive sheet if it doesn't exist
  let archiveSheet = ss.getSheetByName('Archive');
  if (!archiveSheet) {
    archiveSheet = ss.insertSheet('Archive');
    // Copy headers
    const headers = mainSheet.getRange(1, 1, 1, mainSheet.getLastColumn()).getValues();
    archiveSheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  }

  const data = mainSheet.getDataRange().getValues();
  const headers = data[0];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const rowsToKeep = [headers]; // Start with headers
  const rowsToArchive = [];

  // Separate old and recent data
  for (let i = 1; i < data.length; i++) {
    const rowDate = new Date(data[i][0]); // timestamp is first column

    if (rowDate < cutoffDate) {
      rowsToArchive.push(data[i]);
    } else {
      rowsToKeep.push(data[i]);
    }
  }

  // Archive old rows
  if (rowsToArchive.length > 0) {
    archiveSheet.getRange(
      archiveSheet.getLastRow() + 1,
      1,
      rowsToArchive.length,
      rowsToArchive[0].length
    ).setValues(rowsToArchive);

    // Clear main sheet and write recent data
    mainSheet.clear();
    mainSheet.getRange(1, 1, rowsToKeep.length, rowsToKeep[0].length).setValues(rowsToKeep);

    Logger.log(`Archived ${rowsToArchive.length} rows older than ${daysToKeep} days`);
    Logger.log(`Kept ${rowsToKeep.length - 1} recent rows`); // -1 for header
  } else {
    Logger.log('No old data to archive');
  }

  return {
    archived: rowsToArchive.length,
    kept: rowsToKeep.length - 1
  };
}

/**
 * Clear all analytics data (use with caution!)
 * Keeps only the header row
 */
function clearAllData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
    Logger.log(`Cleared ${lastRow - 1} rows of data`);
  } else {
    Logger.log('No data to clear');
  }
}

// ============================================
// TESTING FUNCTIONS
// ============================================

/**
 * Test logging function
 * Run this in Apps Script editor to test that logging works
 */
function testLogEvent() {
  const testEvent = {
    event_type: 'test_event',
    video_id: 'video_test_001',
    session_id: 'sess_test_123',
    user_agent: 'Test User Agent',
    referrer: 'test',
    screen_size: '1920x1080',
    is_mobile: 'FALSE'
  };

  logEvent(testEvent);
  Logger.log('Test event logged successfully');
}

/**
 * Test POST endpoint
 * Run this to simulate a POST request
 */
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        event_type: 'page_load',
        session_id: 'sess_test_456',
        user_agent: 'Mozilla/5.0 Test',
        referrer: 'https://test.com',
        screen_size: '1920x1080',
        is_mobile: 'FALSE'
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}



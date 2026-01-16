/**
 * Google Apps Script for Instagram Reels Style Video Player
 *
 * SETUP INSTRUCTIONS:
 * 1. In your Google Sheet, go to Extensions > Apps Script
 * 2. Delete the default code and paste this entire file
 * 3. Choose your algorithm by setting ALGORITHM_TYPE below
 * 4. Save the script (Ctrl+S or Cmd+S)
 * 5. Click Deploy > New deployment
 * 6. Choose "Web app" as deployment type
 * 7. Set "Execute as: Me" and "Who has access: Anyone"
 * 8. Click Deploy and copy the Web app URL
 */

// ============================================
// CONFIGURATION
// ============================================

/**
 * Choose your algorithm:
 * - "random" : Pure random shuffle every time
 * - "weighted_random" : Random but prioritizes higher priority videos
 * - "fresh_first" : Newest content first, then randomized
 * - "balanced_mix" : Mix of high priority and fresh content
 */
const ALGORITHM_TYPE = "weighted_random";

/**
 * Maximum number of videos to return (0 = no limit)
 */
const MAX_VIDEOS = 0;

// ============================================
// MAIN FUNCTION
// ============================================

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // Get headers from first row
    const headers = data[0];

    // Convert to array of objects
    const jsonData = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      jsonData.push(row);
    }

    // Filter active videos only
    let activeVideos = jsonData.filter(video => {
      // Check if video has required fields
      if (!video.url || !video.caption) return false;

      // Check if active (default to true if not specified)
      const isActive = video.active === undefined ||
                       video.active === null ||
                       video.active === '' ||
                       video.active === true ||
                       video.active === 'TRUE' ||
                       video.active === 'true';

      return isActive;
    });

    // Apply selected algorithm
    let sortedVideos;
    switch(ALGORITHM_TYPE) {
      case "random":
        sortedVideos = randomShuffle(activeVideos);
        break;
      case "weighted_random":
        sortedVideos = weightedRandomShuffle(activeVideos);
        break;
      case "fresh_first":
        sortedVideos = freshFirstShuffle(activeVideos);
        break;
      case "balanced_mix":
        sortedVideos = balancedMixShuffle(activeVideos);
        break;
      default:
        sortedVideos = randomShuffle(activeVideos);
    }

    // Limit results if MAX_VIDEOS is set
    if (MAX_VIDEOS > 0 && sortedVideos.length > MAX_VIDEOS) {
      sortedVideos = sortedVideos.slice(0, MAX_VIDEOS);
    }

    // Clean up data - only return fields needed by frontend
    // All videos are YouTube Shorts, no type detection needed
    // Includes food venue information and NFC/GPS data
    const cleanedData = sortedVideos.map(video => ({
      id: video.id || '',
      url: video.url,
      caption: video.caption,
      venue_name: video.venue_name || '',
      venue_key: video.venue_key || '',
      genre: video.genre || '',
      address: video.address || '',
      lat: video.lat || null,
      lng: video.lng || null,
      image_url: video.image_url || '',
      tags: video.tags || '',
      venue_name_ja: video.venue_name_ja || '',
      caption_ja: video.caption_ja || '',
      genre_ja: video.genre_ja || '',
      redirect_url: video.redirect_url || ''
    }));

    return ContentService.createTextOutput(JSON.stringify(cleanedData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error as JSON
    const errorResponse = {
      error: true,
      message: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// ALGORITHM FUNCTIONS
// ============================================

/**
 * Pure random shuffle (Fisher-Yates algorithm)
 */
function randomShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Weighted random shuffle - videos with higher priority appear more often
 * Priority should be 1-10, defaults to 5 if not specified
 */
function weightedRandomShuffle(array) {
  const weighted = array.map(video => {
    const priority = video.priority || 5;
    // Ensure priority is between 1-10
    const normalizedPriority = Math.max(1, Math.min(10, priority));

    // Generate random value weighted by priority
    // Higher priority = lower random value = appears earlier when sorted
    const weightedRandom = Math.random() / normalizedPriority;

    return {
      video: video,
      weight: weightedRandom
    };
  });

  // Sort by weighted random value
  weighted.sort((a, b) => a.weight - b.weight);

  // Return just the videos
  return weighted.map(item => item.video);
}

/**
 * Fresh content first - newest videos first, then randomized within date groups
 */
function freshFirstShuffle(array) {
  // Group by date
  const dated = array.map(video => ({
    video: video,
    date: video.created_date ? new Date(video.created_date) : new Date(0)
  }));

  // Sort by date (newest first)
  dated.sort((a, b) => b.date - a.date);

  // Get top 30% as "fresh", rest as "older"
  const freshCount = Math.max(1, Math.ceil(dated.length * 0.3));
  const fresh = dated.slice(0, freshCount);
  const older = dated.slice(freshCount);

  // Shuffle each group
  const shuffledFresh = randomShuffle(fresh.map(item => item.video));
  const shuffledOlder = randomShuffle(older.map(item => item.video));

  // Combine: fresh first, then older
  return [...shuffledFresh, ...shuffledOlder];
}

/**
 * Balanced mix - combines priority and freshness
 * High priority videos (8-10) get boosted, recent videos get slight boost
 */
function balancedMixShuffle(array) {
  const scored = array.map(video => {
    const priority = video.priority || 5;
    const normalizedPriority = Math.max(1, Math.min(10, priority));

    // Calculate freshness score (videos from last 30 days get boost)
    let freshnessBoost = 0;
    if (video.created_date) {
      const videoDate = new Date(video.created_date);
      const now = new Date();
      const daysSinceCreated = (now - videoDate) / (1000 * 60 * 60 * 24);

      if (daysSinceCreated < 30) {
        // Boost decreases over 30 days (max boost: 2 points)
        freshnessBoost = 2 * (1 - daysSinceCreated / 30);
      }
    }

    // Combined score: priority + freshness
    const totalScore = normalizedPriority + freshnessBoost;

    // Add randomness weighted by score
    const weightedRandom = Math.random() / totalScore;

    return {
      video: video,
      weight: weightedRandom
    };
  });

  // Sort by weighted score
  scored.sort((a, b) => a.weight - b.weight);

  return scored.map(item => item.video);
}

// ============================================
// TESTING FUNCTION (Optional)
// ============================================

/**
 * Test function - run this to see sample output
 * In Apps Script editor: Select "testDoGet" from dropdown and click Run
 */
function testDoGet() {
  const result = doGet();
  const content = result.getContent();
  Logger.log(content);
  return content;
}



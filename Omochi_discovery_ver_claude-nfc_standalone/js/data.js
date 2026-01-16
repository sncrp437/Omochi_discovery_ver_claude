/**
 * Data fetching module for Google Sheets integration
 * Fetches YouTube Shorts data from Google Apps Script
 *
 * IMPORTANT: Replace GOOGLE_SHEETS_API_URL with your actual Google Apps Script web app URL
 */

// TODO: Replace this with your actual Google Apps Script URL
const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbwtVz9DnO423UJjDQksDMo09BGcK20yOfMlWZTmyhc2y-rMnHyLxYvzi0SUb3IJ_sGy/exec';

/**
 * Fetches video data from Google Sheets via Apps Script
 * @returns {Promise<Array>} Array of video objects
 */
async function fetchVideoData() {
    try {
        const response = await fetch(GOOGLE_SHEETS_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching video data:', error);
        // Return sample data for testing
        return getSampleData();
    }
}

/**
 * Sample YouTube Shorts data for testing (Food/Venue focused)
 * This will be replaced by actual data from Google Sheets
 *
 * Expected data structure from Google Sheets:
 * {
 *   id: "video_001",
 *   url: "https://www.youtube.com/embed/VIDEO_ID",
 *   caption: "Caption text",
 *   venue_name: "Restaurant Name" (required),
 *   genre: "Cuisine type" (optional),
 *   address: "Physical location" (optional),
 *   priority: 5 (optional),
 *   active: true (optional),
 *   tags: "tag1,tag2" (optional)
 * }
 */
function getSampleData() {
    return [
        {
            id: 'sample_001',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            caption: 'Best ramen in town! 🍜',
            venue_name: 'Sample Ramen House',
            genre: 'Japanese',
            address: '123 Food St, Sample City',
            tags: 'ramen,japanese,noodles',
            priority: 5
        },
        {
            id: 'sample_002',
            url: 'https://www.youtube.com/embed/jNQXAC9IVRw',
            caption: 'Amazing wood-fired pizza 🍕',
            venue_name: 'Sample Pizza Co',
            genre: 'Italian',
            address: '456 Main Ave, Sample City',
            tags: 'pizza,italian,woodfired',
            priority: 5
        },
        {
            id: 'sample_003',
            url: 'https://www.youtube.com/embed/9bZkp7q19f0',
            caption: 'Fresh sushi daily 🍣',
            venue_name: 'Sample Sushi Bar',
            genre: 'Japanese',
            address: '789 Ocean Blvd, Sample City',
            tags: 'sushi,japanese,fresh',
            priority: 5
        }
    ];
}

/**
 * Parses and validates YouTube Shorts data
 * @param {Array} rawData - Raw data from Google Sheets
 * @returns {Array} Validated video data
 */
function parseVideoData(rawData) {
    return rawData.filter(item => {
        // Validate required fields (id, url, caption)
        if (!item.url || !item.caption) {
            console.warn('Invalid video data - missing url or caption:', item);
            return false;
        }

        // Ensure URL is a YouTube embed URL
        if (!item.url.includes('youtube.com/embed/')) {
            console.warn('Invalid video URL - must be YouTube embed format:', item.url);
            return false;
        }

        return true;
    }).map(item => {
        // Ensure all items have an id
        if (!item.id) {
            item.id = 'video_' + Math.random().toString(36).substr(2, 9);
        }
        return item;
    });
}




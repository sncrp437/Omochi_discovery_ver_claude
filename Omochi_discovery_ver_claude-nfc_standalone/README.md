# Food Discovery App - Instagram Reels Style

A lightweight, Instagram Reels-style food discovery platform built with vanilla HTML, CSS, and JavaScript. Showcase restaurants and food venues through vertical scrolling YouTube Shorts with venue information stored in Google Sheets.

## Features

- Instagram Reels-style vertical scrolling with snap behavior
- **9:16 aspect ratio** - Perfect for YouTube Shorts (vertical food videos)
- **Food venue focused** - Includes restaurant name, cuisine type, and address
- **Multi-language support** - Switch between English and Japanese
- Mobile-first responsive design
- Autoplay videos on scroll using Intersection Observer
- **YouTube Shorts only** - Optimized for vertical video content
- Google Sheets as backend with venue information
- **Smart video ordering** - 4 algorithm options (random, weighted, fresh-first, balanced)
- Priority-based video promotion (1-10 scale)
- Enable/disable venues without deleting
- Collect button functionality
- **Lightweight analytics** - Track views, collects, and engagement
- Deployable to GitHub Pages (static site)

## Project Structure

```
insta_reelstyle_htmlfile/
├── index.html                  # Main video feed page
├── collect.html                # Collection confirmation page
├── css/
│   └── styles.css              # All styles
├── js/
│   ├── app.js                  # Main application logic
│   ├── data.js                 # Google Sheets data fetching
│   └── i18n.js                 # Internationalization (language switching)
├── assets/                     # Images, icons, etc.
├── APPS_SCRIPT.js              # Google Apps Script code (copy to Google)
├── GOOGLE_SHEETS_TEMPLATE.md   # Detailed sheet structure guide
├── MULTILINGUAL_SETUP.md       # Language switching setup guide
├── README.md                   # This file (setup instructions)
└── claude.md                   # Project documentation
```

## Setup Instructions

### 1. Set Up Google Sheets

**See `GOOGLE_SHEETS_TEMPLATE.md` for detailed column descriptions and examples.**

#### Quick Setup

1. Create a new Google Sheet
2. Add these column headers in the first row:
   ```
   id | url | caption | venue_name | genre | address | title | tags | priority | active | created_date | notes
   ```

3. Add your food venue data starting from row 2

#### Required Columns
- **id**: Unique identifier (e.g., video_001, video_002)
- **url**: YouTube Shorts embed URL (`https://www.youtube.com/embed/VIDEO_ID`)
  - Convert: `https://youtube.com/shorts/ABC123` → `https://www.youtube.com/embed/ABC123`
- **caption**: Text displayed to users (e.g., "Best ramen in town! 🍜")
- **venue_name**: Restaurant or venue name (e.g., "Mario's Italian Kitchen")

#### Optional but Recommended Columns
- **genre**: Cuisine type (e.g., Italian, Japanese, Mexican, Cafe)
- **address**: Physical location (e.g., "123 Main St, New York, NY")
- **priority**: Number 1-10 (higher = more likely to show first, default: 5)
- **active**: TRUE/FALSE to show/hide videos (default: TRUE)
- **tags**: Comma-separated tags (e.g., "ramen,japanese,downtown")
- **created_date**: Date added (YYYY-MM-DD format)
- **title**: Internal name for your reference
- **notes**: Private notes (not shown to users)

#### Sample Data
```
id         url                                      caption                    venue_name           genre      address                    priority  active
video_001  https://www.youtube.com/embed/XXXXX      Best ramen in town! 🍜    Tanaka Ramen House   Japanese   456 East Ave, Brooklyn     9         TRUE
video_002  https://www.youtube.com/embed/XXXXX      Amazing pizza 🍕          Napoli Pizza Co      Italian    789 West St, Manhattan     8         TRUE
video_003  https://www.youtube.com/embed/XXXXX      Fresh sushi daily 🍣      Sakura Sushi Bar     Japanese   321 Main St, Queens        10        TRUE
```

**Note:** Replace XXXXX with actual YouTube Shorts video IDs of food content.

### 2. Create Google Apps Script with Smart Algorithms

The Apps Script includes 4 different video ordering algorithms:

1. **`random`** - Pure random shuffle every time (truly unpredictable)
2. **`weighted_random`** - Videos with higher priority appear more often (recommended)
3. **`fresh_first`** - Newest content first, then randomized
4. **`balanced_mix`** - Combines priority and freshness for optimal variety

#### Setup Steps

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete the default code
3. Copy the entire contents of `APPS_SCRIPT.js` from this repository
4. **Configure the algorithm** at the top of the script:
   ```javascript
   const ALGORITHM_TYPE = "weighted_random";  // Change to your preference
   ```
5. Save the script (Ctrl+S or Cmd+S)
6. Click **Deploy > New deployment**
7. Choose **Web app** as deployment type
8. Set the following options:
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Click **Deploy**
10. Copy the **Web app URL** (it will look like `https://script.google.com/macros/s/.../exec`)

#### Algorithm Details

**Random** - Every user gets a completely different order each time
- Use when: You want maximum unpredictability
- Example: All videos have equal chance regardless of priority

**Weighted Random** ⭐ (Recommended) - High priority videos appear earlier
- Use when: You want to feature important content while maintaining variety
- Example: Priority 10 videos appear ~10x more often than priority 1 videos

**Fresh First** - Recently added content gets priority
- Use when: You add new content regularly and want it featured
- Example: Videos added in last 30 days appear first, then randomized

**Balanced Mix** - Smart combination of priority and freshness
- Use when: You want the best of both worlds
- Example: High priority (8-10) + recent videos (last 30 days) get biggest boost

### 3. Update Your Project

1. Open `js/data.js`
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your actual Apps Script URL:

```javascript
const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

### 4. Test Locally

1. Open `index.html` in a web browser
2. You should see sample videos (or your Google Sheets data if configured)
3. Test vertical scrolling and autoplay
4. Click the Collect button to test navigation

Note: For local testing, you may need to use a local server due to CORS restrictions:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

Then visit `http://localhost:8000`

### 5. Deploy to GitHub Pages

1. Commit all files to your repository:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to your repository on GitHub
3. Navigate to **Settings > Pages**
4. Under **Source**, select **Deploy from a branch**
5. Select the **main** branch and **/ (root)** folder
6. Click **Save**
7. Your site will be available at `https://YOUR_USERNAME.github.io/insta_reelstyle_htmlfile/`

## Video URL Formats

### YouTube
- Format: `https://www.youtube.com/embed/VIDEO_ID`
- Example: `https://www.youtube.com/embed/dQw4w9WgXcQ`
- To get VIDEO_ID: From `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, take `dQw4w9WgXcQ`

### X (Twitter)
- Use the X embed URL from the platform's embed feature
- Example: Check X's embed options for your video

## Language Support

The app supports **English** and **Japanese** with a simple toggle button in the top-right corner.

### How It Works
- Language preference is saved in browser's `localStorage`
- Persists across page reloads and navigation
- All UI text and video captions automatically update when switching languages
- Default language: English
- Video captions are stored in Google Sheets with separate columns for each language

**📖 See [MULTILINGUAL_SETUP.md](MULTILINGUAL_SETUP.md) for complete multilingual setup instructions.**

### Adding More Languages

To add additional languages, edit [js/i18n.js](js/i18n.js):

1. Add a new language object in the `translations` object:
```javascript
const translations = {
    en: { /* English translations */ },
    ja: { /* Japanese translations */ },
    es: { // Add Spanish
        loading: 'Cargando...',
        collectBtn: 'Coleccionar',
        // ... other translations
    }
};
```

2. Add language button in HTML files:
```html
<button class="lang-btn" data-lang="es" data-i18n="spanish">Español</button>
```

### Translatable Elements
To make new text translatable, add the `data-i18n` attribute:
```html
<p data-i18n="yourKey">Default text</p>
```

Then add translations in `i18n.js`:
```javascript
en: { yourKey: 'English text' },
ja: { yourKey: '日本語テキスト' }
```

## Customization

### Styling
Edit [css/styles.css](css/styles.css) to customize:
- Colors and themes
- Button styles
- Layout and spacing
- Mobile breakpoints
- Language selector appearance

### Collect Page
Edit [collect.html](collect.html) to customize:
- Success message
- Call-to-action buttons
- Additional functionality

### Sample Data
If you want to test without Google Sheets, the `getSampleData()` function in [js/data.js](js/data.js) provides sample videos.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight: No external dependencies
- Fast loading: Static files only
- Efficient scrolling: CSS scroll-snap
- Optimized embeds: Lazy loading via Intersection Observer

## Troubleshooting

### Videos not loading
- Check that your Google Apps Script URL is correct
- Verify the Apps Script is deployed with "Anyone" access
- Check browser console for CORS errors

### Autoplay not working
- Some browsers block autoplay; videos should play when scrolled into view
- YouTube embeds may require user interaction first on some browsers

### Collect button not working
- Verify `collect.html` exists in the same directory as `index.html`
- Check browser console for navigation errors

## License

**Proprietary License** - Copyright (c) 2026 Buddila Samarakoon. All rights reserved.

### Personal & Educational Use
✓ Free to use for personal projects and learning
✓ Modify for non-commercial purposes
✓ Educational and research use allowed

### Commercial Use
✗ Commercial use requires written permission
✗ Contact buddila.samarakoon@gmail.com for commercial licensing

See the [LICENSE](LICENSE) file for full terms and conditions.

## Credits

Built with vanilla JavaScript, CSS, and HTML. No external dependencies.

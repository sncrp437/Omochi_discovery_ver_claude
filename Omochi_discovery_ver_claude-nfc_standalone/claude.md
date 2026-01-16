# Food Discovery Platform - Project Documentation

## Project Description

A food discovery platform that mimics Instagram Reels UI/UX with vertical scrolling functionality and autoplay. Showcases restaurants and food venues through YouTube Shorts (9:16 vertical videos) with detailed venue information including restaurant name, cuisine type, and location.

## Git Repository

**Repository URL**: https://github.com/buddila-samarakoon/insta_reelstyle_htmlfile.git

**Remote**: origin

**Main Branch**: main

**GitHub Pages URL**: https://buddila-samarakoon.github.io/insta_reelstyle_htmlfile/

### Common Git Operations

**Push changes to main branch:**
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**Create and push a new branch:**
```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Feature description"
git push origin feature/your-feature-name
```

**Check repository status:**
```bash
git status
git log --oneline -5
```

## Scope

This is an MVP (Minimum Viable Product) focused on delivering core Reels-style functionality for food discovery with a unique data management approach using Google Sheets as the backend.

**Content Focus**: Food and restaurant content only - all videos showcase food venues, dishes, and culinary experiences.

**Hosting Requirement**: The project must be lightweight enough to be hosted for free on GitHub Pages (static site only).

## Tech Stack

### Frontend
- **Vanilla HTML/CSS/JavaScript** - Pure web technologies without frameworks
- **Embedded Video Players** - YouTube and X (Twitter) embed iframes
- **Responsive Design** - Mobile-first approach
- **Static Site** - No build process, deployable directly to GitHub Pages

### Backend/Data Management

**Two-Spreadsheet Architecture** for security:

**1. Food Venue Data Spreadsheet + Apps Script**
- Stores all food venue video content and metadata
- Public GET API endpoint (APPS_SCRIPT.js)
- 12-field comprehensive data structure for food content:
  - **Required**: id, url, caption, venue_name
  - **Optional**: genre (cuisine type), address (location), title, tags, priority (1-10), active (TRUE/FALSE), created_date, notes
- Food-specific fields:
  - **venue_name**: Restaurant/venue name
  - **genre**: Cuisine type (Italian, Japanese, Mexican, etc.)
  - **address**: Physical location of venue
- Smart ordering algorithms (4 options):
  1. **Random** - Pure shuffle
  2. **Weighted Random** ⭐ (Recommended) - Priority-based
  3. **Fresh First** - Newest content first
  4. **Balanced Mix** - Priority + freshness combined

**2. Analytics Spreadsheet + Apps Script**
- Completely separate spreadsheet from video data
- POST-only API endpoint (ANALYTICS_APPS_SCRIPT.js)
- Never returns data (private to owner only)
- Logs 3 event types:
  - page_load (site visits)
  - video_view (which videos watched)
  - collect (engagement tracking)
- 8-field analytics structure:
  - timestamp, event_type, video_id, session_id
  - user_agent, referrer, screen_size, is_mobile

**Security Model**:
- Each Apps Script is tied to ONE spreadsheet only
- Video script CANNOT access analytics data
- Analytics script NEVER exposes data publicly
- Ensures user privacy and data protection

## Key Features

### 1. Vertical Scroll Video Feed
- Instagram Reels-style vertical scrolling
- Snap-to-video behavior
- Autoplay on scroll
- Smooth transitions between videos

### 2. Responsive Mobile-First Design
- Optimized for mobile devices
- Responsive layout that works on desktop
- Touch-friendly interactions

### 3. Collect Button
- "Collect" button on each video
- On click: Navigate directly to collect.html page
- Logs collect event to analytics (if enabled)

### 4. Video Display
- YouTube embed integration
- X (Twitter) embed integration
- Handle both video sources seamlessly

## Development Plan

### Phase 1: Setup & Data Integration
1. Set up basic HTML structure
2. Create Google Apps Script to expose Google Sheets data as API
3. Fetch and parse video data from Google Sheets
4. Test data connectivity

### Phase 2: Core Video Feed
1. Implement vertical scroll container
2. Add snap-to-video behavior
3. Integrate YouTube embed player
4. Integrate X embed player
5. Implement autoplay on scroll

### Phase 3: UI & Interactions
1. Create mobile-first responsive layout
2. Add video overlay UI (caption display)
3. Implement "Collect" button
4. Create modal component
5. Add page navigation after modal

### Phase 4: Polish & Testing
1. Refine scroll behavior and transitions
2. Test on multiple devices and browsers
3. Optimize performance
4. Handle edge cases and errors

## Development Approach

**Complete MVP First** - Build all core features to a working state, then iterate and refine based on testing and feedback.

## Technical Considerations

### GitHub Pages Hosting
- Static files only (HTML, CSS, JS)
- No server-side processing
- Keep total file size minimal
- Optimize for fast loading
- All assets must be static or externally hosted

### Google Sheets Integration
- Apps Script will need CORS configuration
- Apps Script endpoint must be publicly accessible
- Consider caching strategy for API calls
- Handle API rate limits if applicable

### Video Embeds
- YouTube iframe API for better control
- X embed may require their embed script
- No video files stored locally (embeds only)
- Handle different aspect ratios
- Lazy loading for performance

### Scroll Behavior
- Use CSS scroll-snap for smooth snapping
- Intersection Observer API for autoplay detection
- Manage video play/pause states
- Vanilla JS only (no dependencies)

### Modal & Navigation
- Modal should be accessible (keyboard/screen reader)
- Clear close functionality
- Smooth page transition
- Pure CSS/JS implementation

## File Structure

```
insta_reelstyle_htmlfile/
├── index.html                  # Main video feed page
├── collect.html                # Collection confirmation page
├── css/
│   └── styles.css              # All styles (mobile-first)
├── js/
│   ├── app.js                  # Main application logic & autoplay
│   ├── data.js                 # Video data fetching from Google Sheets
│   └── analytics.js            # Analytics tracking module
├── assets/                     # Images, icons, etc. (minimal)
├── APPS_SCRIPT.js              # Video Data Apps Script (copy to Google)
├── ANALYTICS_APPS_SCRIPT.js    # Analytics Apps Script (copy to Google)
├── GOOGLE_SHEETS_TEMPLATE.md   # Video data sheet structure guide
├── ANALYTICS_SETUP.md          # Analytics setup instructions
├── README.md                   # Complete setup guide
└── claude.md                   # This file (project documentation)
```

## Performance Goals

- First page load: < 2 seconds on 3G
- No external dependencies (libraries/frameworks)
- Minimal CSS and JS file sizes (total < 50KB)
- Efficient embed loading
- Analytics logging: non-blocking, zero performance impact

## Analytics & Insights

### Trackable Metrics
- **Page views** - Total site visits
- **Unique sessions** - Distinct visitors
- **Video views** - Which videos are watched
- **Collect rate** - Engagement with Collect feature
- **Mobile vs Desktop** - Device breakdown
- **Traffic sources** - Where users come from
- **Peak usage times** - When users visit

### Privacy-First Approach
- No personal identifiable information collected
- No IP addresses stored
- Anonymous session IDs (not persistent)
- No cookies or localStorage
- No cross-site tracking
- Users can view the source code

### Analytics Features
- Real-time data logging
- Owner-only access to analytics
- Optional manual archiving tools
- Summary dashboard formulas
- Easy to disable (set ENABLE_FRONTEND_ANALYTICS = false)

## Setup Summary

**Total Setup Requirements:**
1. Create Video Data Google Sheet (10 columns)
2. Deploy Video Apps Script (APPS_SCRIPT.js)
3. Create Analytics Google Sheet (8 columns) - Optional
4. Deploy Analytics Apps Script (ANALYTICS_APPS_SCRIPT.js) - Optional
5. Update js/data.js with video API URL
6. Update js/analytics.js with analytics API URL (if using analytics)
7. Deploy to GitHub Pages

**Time Estimate:** 30-45 minutes for complete setup

## Next Steps

1. ✅ Review and approve this project scope
2. ✅ Core development completed
3. **Next:** Set up Google Sheets with your video data
4. **Next:** Create and deploy Apps Scripts
5. **Next:** Update API URLs in frontend code
6. **Next:** Test deployment on GitHub Pages
7. **Next:** Monitor analytics and iterate based on data

# Collections Setup Guide

## Overview

Collections allow you to organize videos into curated lists (like Instagram highlights) such as "Tokyo's Top 10 Ramen" (東京のラーメン10選). Users can filter videos by selecting collections from a horizontal scrolling menu at the top of the page.

## Features

- Instagram-style horizontal scrolling collection selector
- Admin-controlled through Google Sheets
- Multilingual collection names (English/Japanese)
- Videos can belong to multiple collections
- Collection selection persists across page reloads
- Welcome modal shown once per day announcing current collection

## Google Sheets Setup

### 1. Add Collection Column to Video Data Sheet

Add a new **Column N** to your existing video data sheet:

| Column | Field Name  | Type | Required | Description |
|--------|-------------|------|----------|-------------|
| N      | collection  | Text | No       | Comma-separated collection IDs (e.g., "tokyo-ramen,trending") |

**Example:**
```
id          | collection
video_001   | tokyo-ramen,trending
video_002   | best-pizza
video_003   | tokyo-ramen
```

### 2. Create Collections Metadata Sheet

Create a new sheet in the same Google Spreadsheet named **"Collections"** with these columns:

| Column | Field Name     | Type    | Required | Description |
|--------|----------------|---------|----------|-------------|
| A      | collection_id  | Text    | Yes      | Unique ID (must match video data) |
| B      | name_en        | Text    | Yes      | English display name |
| C      | name_ja        | Text    | No       | Japanese display name (fallback to English if empty) |
| D      | icon           | Text    | No       | Emoji or unicode icon |
| E      | display_order  | Number  | No       | Sort order (lower numbers first) |
| F      | active         | Boolean | No       | TRUE to show, FALSE to hide (default: TRUE) |

**Sample Data:**
```
collection_id | name_en           | name_ja        | icon | display_order | active
all           | All Videos        | すべての動画    | 🎬   | 0             | TRUE
tokyo-ramen   | Tokyo Ramen       | 東京ラーメン    | 🍜   | 1             | TRUE
best-pizza    | Best Pizza        | 最高のピザ     | 🍕   | 2             | TRUE
trending      | Trending Now      | トレンド       | 🔥   | 3             | TRUE
```

### 3. Update Apps Script

The Apps Script (`APPS_SCRIPT.js`) has been updated to:
1. Include the `collection` field from video data
2. Fetch the Collections metadata sheet
3. Return combined response: `{ videos: [...], collections: [...] }`

**Action Required:**
1. Copy the updated `APPS_SCRIPT.js` from this repository
2. Go to Extensions > Apps Script in your Google Sheet
3. Replace the existing code
4. Click Deploy > Manage deployments > Edit > Version > New version
5. Click Deploy

## How Collections Work

### Frontend Filtering
- Collections are filtered **client-side** (in JavaScript)
- All videos are fetched once on page load
- Switching collections is instant (no API calls)
- Videos are re-rendered with smooth fade animation

### Multiple Collections
Videos can belong to multiple collections using comma-separated IDs:
- `collection: "tokyo-ramen,trending"` → Appears in both collections
- `collection: "best-pizza"` → Only appears in Best Pizza collection
- `collection: ""` or empty → Only appears in "All Videos"

### Special "all" Collection
- `collection_id: "all"` shows all videos regardless of their collection tags
- Always include this in your Collections sheet
- Set `display_order: 0` to make it appear first

## Admin Control

### Show/Hide Collections
Set `active: FALSE` in the Collections sheet to hide a collection without deleting it.

### Reorder Collections
Change the `display_order` value. Lower numbers appear first (left-to-right).

### Add New Collection
1. Add a row to the Collections sheet with a unique `collection_id`
2. Tag videos with the new `collection_id` in the video data sheet
3. Refresh the website - new collection appears automatically

### Remove Collection
Set `active: FALSE` instead of deleting the row (preserves data).

## Welcome Modal

The welcome modal shows once per day and displays:
- Platform description
- How to use instructions
- Current collection name
- Language reminder

### Manual Reopen
Users can click the ℹ️ info button (top-left) to reopen the modal anytime.

### Disable Welcome Modal
To disable, remove or comment out these lines in `index.html`:
```javascript
// Show welcome modal (if enabled)
if (typeof showWelcomeModal === 'function') {
    const collectionName = typeof getCurrentCollectionName === 'function'
        ? getCurrentCollectionName()
        : (typeof t === 'function' ? t('allVideos') : 'All Videos');
    showWelcomeModal(collectionName);
}
```

## User Experience

### Collection Selector UI
- **Position:** Below language selector, top of page
- **Style:** Horizontal scrolling pills with glassmorphism effect
- **Active State:** White background with black text
- **Inactive State:** Semi-transparent with white text
- **Mobile:** Swipe horizontally to see more collections

### Collection Switching
1. User clicks a collection pill
2. Feed fades out (300ms)
3. Videos are filtered
4. Feed re-renders with filtered videos
5. Feed fades in and scrolls to top
6. Selection saved to localStorage

### Empty Collections
If a collection has no videos, displays:
```
"No videos in this collection"
(このコレクションには動画がありません)
```

## Troubleshooting

### Collections not appearing
- Verify Collections sheet exists and is named exactly "Collections"
- Check Apps Script has been redeployed
- Ensure at least one collection has `active: TRUE`
- Clear browser cache and reload

### Videos not filtering
- Check `collection` values in video data match `collection_id` in Collections sheet
- Verify JavaScript console for errors (F12 in browser)
- Ensure `js/collections.js` is loaded (check Network tab)

### Collection names not translating
- Verify both `name_en` and `name_ja` are filled in Collections sheet
- Check language selector is working
- Look for errors in browser console

### Welcome modal appears every time
- Check browser allows localStorage
- Try incognito/private mode to test
- Verify date/time is correct on device

## Testing Checklist

- [ ] Collections appear in selector
- [ ] "All Videos" shows all videos
- [ ] Selecting collection filters correctly
- [ ] Videos with multiple collections appear in each
- [ ] Empty collections show message
- [ ] Collection selection persists after reload
- [ ] Switching languages updates collection names
- [ ] Welcome modal shows on first visit
- [ ] Info button reopens modal
- [ ] Mobile horizontal scrolling works

## Example Use Cases

### Daily Special
Create a collection called "Today's Special" and update it daily by changing which videos have `collection: "todays-special"`.

### Seasonal Collections
- "Summer Menu" (active June-August)
- "Holiday Specials" (active December)
Use `active: TRUE/FALSE` to show/hide seasonally.

### Location-Based
- "Tokyo Spots" → `tokyo-ramen`, `tokyo-sushi`, `tokyo-cafe`
- "Osaka Food" → `osaka-takoyaki`, `osaka-okonomiyaki`

### Cuisine Type
- "Japanese" → All videos tagged with Japanese cuisine
- "Italian" → All Italian restaurants
- "Street Food" → Food trucks and street vendors

## Performance Notes

- **Initial Load:** All videos + collections fetched once (~2-5KB overhead)
- **Collection Switch:** <300ms animation, no API calls
- **Browser Storage:** ~50 bytes for selection + modal state
- **Mobile Performance:** Smooth on all modern devices

## Future Enhancements

Possible additions (not yet implemented):
- Search/filter collections by name
- Collection thumbnails
- Share collection URLs (`?collection=tokyo-ramen`)
- Collection statistics in admin panel
- Auto-hide selector on scroll

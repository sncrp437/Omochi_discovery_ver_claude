# Multilingual Setup Guide

## Overview

The app now supports **English** and **Japanese** with seamless language switching. Users can toggle between languages using buttons in the top-right corner, and all content (UI text and video captions) updates instantly.

## How It Works

### 1. Language Switching
- Two language buttons appear in the top-right corner: "English" and "日本語"
- Click to switch languages instantly
- Language preference is saved in browser's `localStorage`
- Persists across page reloads and navigation between pages

### 2. Multilingual Content

**UI Elements:**
- Static text (buttons, titles, messages) defined in `js/i18n.js`
- Automatically updates when language changes

**Video Captions:**
- Stored in Google Sheets with separate columns: `caption_en` and `caption_ja`
- Each video can have different captions for each language
- If Japanese caption is missing, falls back to English caption

## Google Sheets Structure

### Required Changes

Your Google Sheets must have these caption columns:

| Column | Field Name  | Required | Description                               |
|--------|-------------|----------|-------------------------------------------|
| C      | caption_en  | **Yes**  | English caption (always required)         |
| D      | caption_ja  | No       | Japanese caption (fallback to English)    |

### Example Data

```
id          url                                 caption_en                      caption_ja
video_001   https://youtube.com/embed/ABC       Best ramen in town! 🍜          この街で最高のラーメン！🍜
video_002   https://youtube.com/embed/XYZ       Amazing pizza 🍕                素晴らしいピザ 🍕
video_003   https://youtube.com/embed/DEF       Fresh sushi 🍣                  新鮮な寿司 🍣
```

### Migration from Old Format

If you have an existing Google Sheet with a single `caption` column:

1. **Rename** column C from `caption` to `caption_en`
2. **Insert** new column D named `caption_ja`
3. **Add** Japanese translations to column D (optional - English will be used as fallback)
4. **Redeploy** your Apps Script

## Apps Script Changes

The Apps Script (`APPS_SCRIPT.js`) has been updated to:

1. Look for `caption_en` instead of `caption` as the required field
2. Return both `caption_en` and `caption_ja` in the API response
3. Use `caption_en` as fallback if `caption_ja` is empty

**After updating your Google Sheet structure:**
1. Copy the updated `APPS_SCRIPT.js` code
2. Go to Extensions > Apps Script in your Google Sheet
3. Replace the existing code with the new version
4. Click Deploy > Manage deployments
5. Click "New deployment" to create a new version
6. Copy the new Web app URL if it changed

## Frontend Implementation

### Files Modified

1. **`js/i18n.js`** - Language switching logic
   - Translations for UI elements
   - Function to update video captions on language change

2. **`js/data.js`** - Data handling
   - Updated to expect `caption_en` and `caption_ja` fields
   - Validates `caption_en` as required field
   - Ensures fallback to English if Japanese is missing

3. **`js/app.js`** - Video rendering
   - Stores both caption languages in DOM (`data-caption-en`, `data-caption-ja`)
   - Displays correct caption based on current language
   - Updates when language is switched

4. **`index.html` & `collect.html`** - HTML pages
   - Language selector buttons added
   - `data-i18n` attributes on translatable elements

5. **`css/styles.css`** - Styling
   - Language selector button styles
   - Active state for selected language
   - Mobile-responsive adjustments

## Adding More Languages

To add a third language (e.g., Spanish):

### 1. Update Google Sheets
Add a new caption column (e.g., `caption_es`)

### 2. Update Apps Script
```javascript
const cleanedData = sortedVideos.map(video => ({
  id: video.id || '',
  url: video.url,
  caption_en: video.caption_en,
  caption_ja: video.caption_ja || video.caption_en,
  caption_es: video.caption_es || video.caption_en, // Add this line
  venue_name: video.venue_name || '',
  // ... other fields
}));
```

### 3. Update i18n.js
Add Spanish translations:
```javascript
const translations = {
    en: { /* English translations */ },
    ja: { /* Japanese translations */ },
    es: { // Add Spanish
        loading: 'Cargando...',
        collectBtn: 'Coleccionar',
        // ... all other keys
    }
};
```

Update the caption update function:
```javascript
function updateVideoCaptions() {
    const captions = document.querySelectorAll('.reel-caption');
    captions.forEach(caption => {
        if (currentLanguage === 'ja' && caption.dataset.captionJa) {
            caption.textContent = caption.dataset.captionJa;
        } else if (currentLanguage === 'es' && caption.dataset.captionEs) {
            caption.textContent = caption.dataset.captionEs;
        } else if (caption.dataset.captionEn) {
            caption.textContent = caption.dataset.captionEn;
        }
    });
}
```

### 4. Update app.js
Store the new caption in data attributes:
```javascript
caption.dataset.captionEs = video.caption_es || video.caption_en || '';
```

### 5. Update HTML files
Add the Spanish language button:
```html
<button class="lang-btn" data-lang="es" data-i18n="spanish">Español</button>
```

## Testing Checklist

- [ ] Language buttons appear in top-right corner
- [ ] Clicking buttons switches language immediately
- [ ] Language preference persists after page reload
- [ ] UI text changes in both `index.html` and `collect.html`
- [ ] Video captions update when language is switched
- [ ] Collect button text updates when language is switched
- [ ] Modal text updates when language is switched
- [ ] If Japanese caption is missing, English caption is shown
- [ ] Mobile layout looks good with language selector

## Troubleshooting

### Video captions don't change when switching language
- Check browser console for errors
- Verify Google Sheets has `caption_en` and `caption_ja` columns
- Ensure Apps Script has been redeployed with updated code
- Clear browser cache and reload

### Language preference not saving
- Check if browser allows `localStorage`
- Try different browser or disable privacy extensions
- Check browser console for storage errors

### Japanese text appears garbled
- Ensure your Google Sheet is saved with UTF-8 encoding
- Check that your HTML files have `<meta charset="UTF-8">`
- Verify Japanese text is displaying correctly in Google Sheets

### Apps Script deployment fails
- Ensure `caption_en` column exists in Google Sheets
- Check that all video rows have `caption_en` filled
- Review Apps Script logs: View > Logs

## Performance Considerations

- Language switching is instant (no API calls needed)
- Both caption versions are loaded once at page load
- Minimal overhead (~10-20KB for translations)
- No external dependencies

## Privacy

- Language preference is stored locally in browser only
- No language data sent to servers
- Users can clear preference by clearing browser storage

## Future Enhancements

Possible improvements:
- Auto-detect browser language on first visit
- Add more languages (Spanish, Chinese, Korean, etc.)
- Translate venue names and addresses
- Allow users to see both languages side-by-side
- Add language selector in settings menu

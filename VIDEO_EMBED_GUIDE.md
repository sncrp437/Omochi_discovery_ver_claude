# Video Embed Guide - How Videos Are Displayed

## Visual Behavior

### YouTube Shorts (9:16 Vertical Videos)

**Mobile Devices (Portrait):**
```
┌─────────────┐
│             │
│             │
│   VIDEO     │  ← Fills screen perfectly
│   9:16      │     No black bars
│             │
│             │
│   Caption   │  ← Overlay at bottom
│   [Collect] │
└─────────────┘
```

**Desktop/Laptop (Landscape):**
```
┌─────────────────────────────────────────┐
│ Black │           │           │ Black   │
│ Bars  │   VIDEO   │           │ Bars    │
│       │   9:16    │           │         │
│       │           │           │         │
│       │  Caption  │           │         │
│       │ [Collect] │           │         │
└─────────────────────────────────────────┘
        ↑
    Max 56.25vh wide (maintains 9:16 ratio)
    Centered on screen
```

**Tablet (Varies):**
- Adapts based on screen orientation
- Always maintains 9:16 aspect ratio
- Centers video if screen is wider

## YouTube Embed URLs

### YouTube Shorts

**Original Shorts URL:**
```
https://youtube.com/shorts/VIDEO_ID
```

**Convert to Embed URL:**
```
https://www.youtube.com/embed/VIDEO_ID
```

**Example:**
- Original: `https://youtube.com/shorts/dQw4w9WgXcQ`
- Embed: `https://www.youtube.com/embed/dQw4w9WgXcQ`

**In Google Sheets:**
```
url column: https://www.youtube.com/embed/dQw4w9WgXcQ
type column: youtube
```

### Regular YouTube Videos (16:9)

**Note:** Regular YouTube videos will have black bars on top/bottom to fit the 9:16 container.

**Visual:**
```
┌─────────────┐
│   Black     │  ← Letterboxing
├─────────────┤
│             │
│  VIDEO 16:9 │
│             │
├─────────────┤
│   Black     │  ← Letterboxing
│  [Collect]  │
└─────────────┘
```

**This is expected behavior** - regular YouTube videos aren't meant for vertical viewing.

**Recommendation:** Only use YouTube Shorts or vertical videos for best results.

## X (Twitter) Video Embeds

### The Challenge

X/Twitter doesn't offer simple iframe embeds like YouTube. There are **two approaches**:

### Option 1: Use Tweet Embed (Includes Full Tweet)

**How it looks:**
```
┌─────────────┐
│ @username   │  ← Tweet header
│ Tweet text  │
│             │
│   VIDEO     │  ← The actual video
│             │
│ ♥ 123  ↻ 45 │  ← Tweet footer
│  [Collect]  │
└─────────────┘
```

**Embed URL Format:**
```
https://platform.twitter.com/embed/Tweet.html?id=TWEET_ID
```

**How to get Tweet ID:**
1. Go to the tweet with the video
2. URL looks like: `https://twitter.com/username/status/1234567890123456789`
3. The numbers at the end are the Tweet ID: `1234567890123456789`
4. Embed URL: `https://platform.twitter.com/embed/Tweet.html?id=1234567890123456789`

**Pros:**
- Works as iframe
- No additional JavaScript needed
- Officially supported by X

**Cons:**
- Shows full tweet (not just video)
- Includes retweet/like counts
- Less "clean" than YouTube embeds
- May not maintain 9:16 ratio perfectly

### Option 2: Direct Video URL (Not Recommended)

X video files (`.mp4`) can be accessed directly, but:
- URLs expire
- Against X's Terms of Service
- Unreliable
- Not recommended for production

### Recommendation for X Videos

**If you want ONLY X videos in your feed:**
1. Consider downloading the video
2. Re-uploading as YouTube Short
3. Use the YouTube embed instead

**OR**

Accept that X embeds will include the full tweet interface.

## Aspect Ratio Handling

### Current Implementation (9:16 Focus)

**CSS Applied:**
```css
.video-wrapper {
    aspect-ratio: 9 / 16;  /* Forces 9:16 ratio */
    max-width: 56.25vh;    /* Prevents excessive width */
}
```

**What this means:**

1. **9:16 videos (YouTube Shorts):** Perfect fit ✓
2. **16:9 videos (Regular YouTube):** Letterboxed (black bars top/bottom)
3. **Square videos (1:1):** Pillarboxed (black bars left/right)
4. **X embeds:** May not fit perfectly due to tweet UI

## Recommendations

### For Best User Experience

1. **Use YouTube Shorts exclusively**
   - Always vertical (9:16)
   - Consistent appearance
   - Reliable embeds
   - Autoplay works well

2. **If using X/Twitter videos:**
   - Understand they'll show full tweet
   - Test the embed first
   - May need CSS adjustments

3. **Avoid mixing aspect ratios**
   - Don't mix Shorts and regular YouTube videos
   - Consistency creates better UX
   - Users expect vertical scrolling = vertical videos

## Getting YouTube Shorts Embed URLs

### Method 1: Manual Conversion

```
Original URL:  https://youtube.com/shorts/ABC123
Embed URL:     https://www.youtube.com/embed/ABC123
                                         ↑ Just use this part
```

### Method 2: YouTube Share Button

1. Click "Share" on the Short
2. Copy the shorts URL
3. Extract VIDEO_ID
4. Format as: `https://www.youtube.com/embed/VIDEO_ID`

### Method 3: From Watch URL

```
Watch URL:  https://www.youtube.com/watch?v=ABC123
Embed URL:  https://www.youtube.com/embed/ABC123
```

## Testing Your Embeds

### Test Checklist

Before adding to your Google Sheet:

1. **Does the embed URL work?**
   - Paste it in browser address bar
   - Should show just the video player
   - No YouTube chrome/UI around it

2. **Is it the right aspect ratio?**
   - YouTube Shorts = 9:16 ✓
   - Regular videos = 16:9 (will letterbox)

3. **Does autoplay work?**
   - Add `?autoplay=1` to test
   - Example: `https://www.youtube.com/embed/ABC123?autoplay=1`

## Example Google Sheet Entries

### YouTube Shorts (Recommended)

```
| id        | url                                         | caption               | type    |
|-----------|---------------------------------------------|-----------------------|---------|
| video_001 | https://www.youtube.com/embed/ABC123        | Amazing dance moves!  | youtube |
| video_002 | https://www.youtube.com/embed/DEF456        | Cooking hack #shorts  | youtube |
```

### X/Twitter Embeds (Full Tweet)

```
| id        | url                                                              | caption          | type |
|-----------|------------------------------------------------------------------|------------------|------|
| video_003 | https://platform.twitter.com/embed/Tweet.html?id=1234567890      | Viral tweet      | x    |
```

### Mixed (Not Recommended)

```
| id        | url                                         | caption               | type    |
|-----------|---------------------------------------------|-----------------------|---------|
| video_001 | https://www.youtube.com/embed/ABC123        | Short (9:16) ✓        | youtube |
| video_002 | https://www.youtube.com/embed/XYZ789        | Regular (16:9) ⚠      | youtube |
```
↑ This will create inconsistent experience (some videos letterboxed)

## Visual Summary

### Perfect Setup (All YouTube Shorts)
- Every video: 9:16
- Seamless scrolling
- No black bars on mobile
- Centered nicely on desktop
- Instagram Reels experience ✓

### Mixed Aspect Ratios
- Some videos: 9:16
- Some videos: 16:9 (letterboxed)
- Inconsistent feel
- Still works, but not ideal

### X/Twitter Embeds
- Shows full tweet interface
- Video may not be 9:16
- Different UX from YouTube
- Works, but breaks consistency

## Recommendation

**For the best Instagram Reels-style experience:**

1. Use **only YouTube Shorts** (9:16 vertical videos)
2. All embeds follow format: `https://www.youtube.com/embed/VIDEO_ID`
3. Test each embed URL before adding to sheet
4. Keep aspect ratios consistent across all videos
5. If you need X content, download and re-upload to YouTube as Shorts

This ensures:
- Consistent visual experience
- Reliable autoplay
- Perfect mobile/desktop display
- True Instagram Reels feel

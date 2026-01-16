# Google Sheets Template Structure - Food Content (YouTube Shorts)

## Column Structure

Create a Google Sheet with the following columns in this exact order:

**IMPORTANT:** This project is designed for food-related YouTube Shorts (9:16 vertical videos) showcasing restaurants and venues.

| Column | Field Name    | Type    | Required | Description                                          | Example                                    |
|--------|---------------|---------|----------|------------------------------------------------------|--------------------------------------------|
| A      | id            | Text    | Yes      | Unique identifier for the video                      | video_001                                  |
| B      | url           | URL     | Yes      | YouTube Shorts embed URL (must be 9:16)              | https://www.youtube.com/embed/dQw4w9WgXcQ |
| C      | caption       | Text    | Yes      | Caption text displayed on the video                  | Best pasta in town! 🍝                    |
| D      | venue_name    | Text    | Yes      | Name of the restaurant/venue                         | Mario's Italian Kitchen                    |
| E      | venue_key     | Text    | NFC      | Unique key for NFC/QR code identification            | ichiran_shibuya                            |
| F      | genre         | Text    | No       | Cuisine type or food category                        | Italian                                    |
| G      | address       | Text    | No       | Physical location (display only)                     | 123 Main St, New York, NY                  |
| H      | lat           | Number  | GPS      | GPS latitude coordinate (decimal degrees)            | 40.7589                                    |
| I      | lng           | Number  | GPS      | GPS longitude coordinate (decimal degrees)           | -73.9851                                   |
| J      | image_url     | URL     | No       | Venue image URL for grid display                     | https://example.com/venue.jpg              |
| K      | tags          | Text    | No       | Comma-separated tags for categorization              | pasta,italian,downtown,trending            |
| L      | priority      | Number  | No       | Priority weight 1-10 (higher = more likely to show)  | 8                                          |
| M      | active        | Boolean | No       | TRUE to show, FALSE to hide (default: TRUE)          | TRUE                                       |
| N      | created_date  | Date    | No       | When the video was added                             | 2024-01-15                                 |
| O      | notes         | Text    | No       | Internal notes (not shown to users)                  | Need to update caption                     |
| P      | venue_name_ja | Text    | No       | Japanese translation of venue name                   | さくら寿司バー                              |
| Q      | caption_ja    | Text    | No       | Japanese translation of caption                      | 新鮮な寿司ロール 🍣                        |
| R      | genre_ja      | Text    | No       | Japanese translation of genre/cuisine type           | 日本料理                                   |
| S      | redirect_url  | URL     | No       | Destination URL after venue collection               | https://myapp.com/venues/tanaka            |

## Sample Data

Here's sample data you can copy into your Google Sheet:

```
id          url                                         caption                             venue_name              venue_key           genre           address                         lat         lng         image_url                               tags                        priority  active  created_date  notes               venue_name_ja       caption_ja                      genre_ja
video_001   https://www.youtube.com/embed/XXXXX         Best ramen in the city! 🍜          Tanaka Ramen House      tanaka_ramen        Japanese        456 East Ave, Brooklyn, NY      40.6782     -73.9442    https://example.com/tanaka.jpg          ramen,japanese,brooklyn     9         TRUE    2024-01-15    Featured venue      田中ラーメン        街で一番美味しいラーメン！🍜   日本料理
video_002   https://www.youtube.com/embed/XXXXX         Amazing wood-fired pizza 🍕         Napoli Pizza Co         napoli_pizza        Italian         789 West St, Manhattan, NY      40.7589     -73.9851                                            pizza,italian,manhattan     8         TRUE    2024-01-15    Top rated           ナポリピザ          本格薪窯ピザ 🍕                 イタリア料理
video_003   https://www.youtube.com/embed/XXXXX         Fresh sushi rolls 🍣                Sakura Sushi Bar        sakura_sushi        Japanese        321 Main St, Queens, NY         40.7282     -73.7949    https://example.com/sakura.jpg          sushi,japanese,queens       10        TRUE    2024-01-16    Must try            さくら寿司バー      新鮮な寿司ロール 🍣             日本料理
video_004   https://www.youtube.com/embed/XXXXX         Authentic tacos 🌮                  El Patron Taqueria      el_patron_tacos     Mexican         654 5th Ave, Bronx, NY          40.8448     -73.8648                                            tacos,mexican,bronx         7         TRUE    2024-01-16    Local favorite
video_005   https://www.youtube.com/embed/XXXXX         Artisan coffee ☕                   Third Wave Coffee       third_wave_coffee   Cafe            987 Park Pl, Manhattan, NY      40.6743     -73.9597    https://example.com/coffee.jpg          coffee,cafe,manhattan       6         TRUE    2024-01-17    Instagram worthy    サードウェーブ      職人のコーヒー ☕               カフェ
```

**Note:** Replace XXXXX with actual YouTube Shorts video IDs. Use food-related YouTube Shorts (9:16 vertical videos) for best results.

## Field Descriptions

### Required Fields

**id** - Unique identifier
- Keep it simple and consistent (video_001, video_002, etc.)
- Used for internal tracking
- Must be unique for each row

**url** - YouTube Shorts embed URL
- Must be the embed URL format: `https://www.youtube.com/embed/VIDEO_ID`
- NOT the regular watch URL or shorts URL
- To convert YouTube Shorts URL to embed:
  - Original: `https://youtube.com/shorts/dQw4w9WgXcQ`
  - Embed: `https://www.youtube.com/embed/dQw4w9WgXcQ` ✓
- To convert watch URL to embed:
  - Original: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
  - Embed: `https://www.youtube.com/embed/dQw4w9WgXcQ` ✓
- **IMPORTANT:** Only use YouTube Shorts (9:16 vertical videos) for best results

**caption** - Display text
- Shown to users below the video
- Keep it concise and engaging (1-2 sentences)
- Can include emojis for personality
- Focus on the food/dish being showcased

**venue_name** - Restaurant/Venue name
- Name of the restaurant, cafe, or food venue
- This is what people will search for
- Use the official name of the establishment
- Examples: "Joe's Pizza", "The French Laundry", "Shake Shack"

### NFC/GPS Fields (Required for Location Features)

**venue_key** - Unique identifier for NFC/QR codes
- Lowercase identifier with underscores (no spaces)
- Used for NFC card and QR code detection
- Examples: `ichiran_shibuya`, `joes_pizza_brooklyn`, `sakura_sushi_queens`
- This value is embedded in QR codes at the venue
- Used in collection URL: `omochi.com/collect?v=ichiran_shibuya`
- **Important:** Must be unique for each venue

**lat** - GPS Latitude coordinate
- **Decimal degrees format** (NOT degrees/minutes/seconds)
- Example: `35.6625` ✓ (NOT `35°39'45"N` ✗)
- **Required for GPS-based venue detection** (100-meter radius)
- How to get coordinates from Google Maps:
  1. Right-click on the venue location in Google Maps
  2. Click the coordinates shown at the top to copy them
  3. Paste the first number (latitude) into this column
- Accuracy: 4-6 decimal places is sufficient
- Range: -90 to 90 (negative = South, positive = North)
- **Important:** The address field is for display only - GPS uses lat/lng coordinates

**lng** - GPS Longitude coordinate
- **Decimal degrees format** (NOT degrees/minutes/seconds)
- Example: `139.6981` ✓ (NOT `139°41'53"E` ✗)
- **Required for GPS-based venue detection** (100-meter radius)
- Use the second number from Google Maps coordinates (longitude)
- Accuracy: 4-6 decimal places is sufficient
- Range: -180 to 180 (negative = West, positive = East)
- **Important:** Both lat AND lng must be filled for GPS detection to work

**Note on GPS Detection:**
- Users within 100 meters of your venue will see it when using NFC cards
- The system does NOT automatically geocode from the address field
- You must manually add lat/lng coordinates for each venue
- If lat/lng are empty, the venue can only be found via QR code scanning

### Optional but Recommended Fields

**image_url** - Venue image for grid display
- Full URL to a venue photo or food image
- Used when multiple venues are detected nearby (2-column grid)
- If empty, venue card will display text only
- Recommended image size: 400x300px or similar aspect ratio
- Can use any image hosting service (Imgur, Google Drive public link, etc.)
- Examples: `https://example.com/venue-photo.jpg`
- **Tip:** Use a representative photo of your venue or signature dish

**genre** - Cuisine type
- Category of food or cuisine style
- Helps users discover similar content
- Examples: `Italian`, `Japanese`, `Mexican`, `Cafe`, `Dessert`, `Street Food`
- Can be more specific: `Korean BBQ`, `Neapolitan Pizza`, `Farm-to-Table`

**address** - Physical location
- Full street address of the venue
- Helps users find the place
- Format: `Street, City, State` or `Street, City, Country`
- Example: `123 Main Street, New York, NY`
- Can include landmarks: `Corner of 5th & Main, Downtown`

### Other Optional Fields

**title** - Internal name
- For your organization only (not shown to users)
- Helps you identify videos in the sheet
- Can be more descriptive than caption

**tags** - Categories
- Comma-separated values
- Useful for potential filtering in future versions
- Food-related examples: `ramen,spicy,downtown`, `pizza,woodfired,italian`, `sushi,omakase,fresh`
- Can include: dish types, neighborhoods, attributes (spicy, vegan, etc.), occasions

**priority** - Algorithm weight
- Number from 1-10 (default: 5)
- Higher numbers = more likely to appear earlier
- Used by weighted random algorithm
- 10 = highest priority, 1 = lowest priority

**active** - Enable/disable
- TRUE = video will be shown
- FALSE = video will be hidden
- Allows you to temporarily disable videos without deleting them
- If empty, defaults to TRUE

**created_date** - Track when added
- Format: YYYY-MM-DD or use Google Sheets date picker
- Useful for "fresh content" algorithms
- Helps track content age

**notes** - Internal documentation
- For your reference only (not shown to users)
- Track updates, issues, or reminders
- Examples: "Update caption", "Replace with higher quality version"

## Japanese Translation Columns (Optional)

The platform supports English/Japanese bilingual content via optional translation columns:

**venue_name_ja** - Japanese venue name
- Japanese translation of the venue name
- If empty, English venue_name will be displayed when user selects Japanese
- Example: "Sakura Sushi Bar" → "さくら寿司バー"

**caption_ja** - Japanese caption
- Japanese translation of the video caption
- Can include emojis (same as English)
- If empty, English caption will be displayed
- Example: "Fresh sushi rolls 🍣" → "新鮮な寿司ロール 🍣"

**genre_ja** - Japanese genre
- Japanese translation of cuisine type
- If empty, English genre will be displayed
- Example: "Japanese" → "日本料理"

**Fallback Behavior:**
- Frontend checks for `_ja` field first
- If empty or missing → displays English version
- No errors if Japanese translations not provided

## Redirect URL (NFC Collection)

**redirect_url** - Custom redirect destination
- Full URL where users are redirected after finding this venue via NFC/GPS
- Each venue can have a unique destination URL
- **Required for venue collection to work**
- Examples:
  - `https://myapp.com/venues/tanaka-ramen`
  - `https://example.com/collect?venue=xyz&src=nfc`
  - `https://omochi.com/collect?v=tanaka_ramen&src=nfc`
- **If empty:** Venue will show "No Venue Found" message with QR scanner fallback
- **Important:** Must be a full URL including `https://`
- **Security:** These URLs are public (visible in the Google Sheet), so don't include sensitive data

**Use Cases:**
- Redirect to your app's venue page
- Redirect to a collection/rewards system
- Redirect to venue-specific landing page
- Pass venue data as URL parameters

## Setup Instructions

1. Create a new Google Sheet
2. Add the column headers in the first row (all 19 columns A-S):
   - **A-D (Required):** id, url, caption, venue_name
   - **E-J (NFC/GPS/Display):** venue_key, genre, address, lat, lng, image_url
   - **K-O (Metadata):** tags, priority, active, created_date, notes
   - **P-R (Japanese):** venue_name_ja, caption_ja, genre_ja
   - **S (Redirect):** redirect_url
3. Add your video data starting from row 2
4. Ensure at minimum the required fields (id, url, caption, venue_name) are filled
5. For GPS-based venue detection, fill in venue_key, lat, and lng columns
6. Set up the Apps Script (see README.md)

## Tips

- Start with a few test videos to ensure everything works
- Use priority to feature important content (8-10 for featured, 5-7 for normal, 1-4 for less important)
- Set active=FALSE instead of deleting rows to preserve your data
- Use tags to organize content for future filtering features
- Keep captions short and engaging (1-2 sentences)
- Test your embed URLs before adding them to the sheet


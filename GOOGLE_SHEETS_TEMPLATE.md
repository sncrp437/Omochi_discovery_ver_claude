# Google Sheets Template Structure - Food Content (YouTube Shorts)

## Column Structure

Create a Google Sheet with the following columns in this exact order:

**IMPORTANT:** This project is designed for food-related YouTube Shorts (9:16 vertical videos) showcasing restaurants and venues.

| Column | Field Name    | Type    | Required | Description                                          | Example                                    |
|--------|---------------|---------|----------|------------------------------------------------------|--------------------------------------------|
| A      | id            | Text    | Yes      | Unique identifier for the video                      | video_001                                  |
| B      | url           | URL     | Yes      | YouTube Shorts embed URL (must be 9:16)              | https://www.youtube.com/embed/dQw4w9WgXcQ |
| C      | caption_en    | Text    | Yes      | English caption text displayed on the video          | Best pasta in town! 🍝                    |
| D      | caption_ja    | Text    | No       | Japanese caption text (fallback to English if empty) | この街で最高のパスタ！🍝                    |
| E      | venue_name    | Text    | Yes      | Name of the restaurant/venue                         | Mario's Italian Kitchen                    |
| F      | genre         | Text    | No       | Cuisine type or food category                        | Italian                                    |
| G      | address       | Text    | No       | Physical location of the venue                       | 123 Main St, New York, NY                  |
| H      | title         | Text    | No       | Internal title for your organization                 | Mario's Carbonara Special                  |
| I      | tags          | Text    | No       | Comma-separated tags for categorization              | pasta,italian,downtown,trending            |
| J      | priority      | Number  | No       | Priority weight 1-10 (higher = more likely to show)  | 8                                          |
| K      | active        | Boolean | No       | TRUE to show, FALSE to hide (default: TRUE)          | TRUE                                       |
| L      | created_date  | Date    | No       | When the video was added                             | 2024-01-15                                 |
| M      | notes         | Text    | No       | Internal notes (not shown to users)                  | Need to update caption                     |

## Sample Data

Here's sample data you can copy into your Google Sheet:

```
id          url                                         caption_en                          caption_ja                          venue_name              genre           address                         title                   tags                        priority  active  created_date  notes
video_001   https://www.youtube.com/embed/XXXXX         Best ramen in the city! 🍜          この街で最高のラーメン！🍜           Tanaka Ramen House      Japanese        456 East Ave, Brooklyn, NY      Tonkotsu Special        ramen,japanese,brooklyn     9         TRUE    2024-01-15    Featured venue
video_002   https://www.youtube.com/embed/XXXXX         Amazing wood-fired pizza 🍕         素晴らしい薪窯ピザ 🍕              Napoli Pizza Co         Italian         789 West St, Manhattan, NY      Margherita Pizza        pizza,italian,manhattan     8         TRUE    2024-01-15    Top rated
video_003   https://www.youtube.com/embed/XXXXX         Fresh sushi rolls 🍣                新鮮な寿司ロール 🍣                Sakura Sushi Bar        Japanese        321 Main St, Queens, NY         Omakase Experience      sushi,japanese,queens       10        TRUE    2024-01-16    Must try
video_004   https://www.youtube.com/embed/XXXXX         Authentic tacos 🌮                  本格的なタコス 🌮                  El Patron Taqueria      Mexican         654 5th Ave, Bronx, NY          Street Tacos            tacos,mexican,bronx         7         TRUE    2024-01-16    Local favorite
video_005   https://www.youtube.com/embed/XXXXX         Artisan coffee ☕                   職人のコーヒー ☕                  Third Wave Coffee       Cafe            987 Park Pl, Manhattan, NY      Latte Art               coffee,cafe,manhattan       6         TRUE    2024-01-17    Instagram worthy
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

**caption_en** - English caption text
- Shown to users when English is selected
- Keep it concise and engaging (1-2 sentences)
- Can include emojis for personality
- Focus on the food/dish being showcased
- **REQUIRED** - Always provide English caption

**caption_ja** - Japanese caption text
- Shown to users when Japanese is selected
- Optional - If empty, English caption will be used as fallback
- Translate the essence of the English caption
- Maintain emojis for consistency
- Use natural Japanese expressions

**venue_name** - Restaurant/Venue name
- Name of the restaurant, cafe, or food venue
- This is what people will search for
- Use the official name of the establishment
- Examples: "Joe's Pizza", "The French Laundry", "Shake Shack"

### Optional but Recommended Fields

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

## Setup Instructions

1. Create a new Google Sheet
2. Add the column headers in the first row (id, url, caption_en, caption_ja, venue_name, genre, address, title, tags, priority, active, created_date, notes)
3. Add your video data starting from row 2
4. Ensure at minimum the required fields (id, url, caption_en, venue_name) are filled
5. Optionally fill caption_ja for Japanese language support
6. Set up the Apps Script (see README.md)

## Tips

- Start with a few test videos to ensure everything works
- Use priority to feature important content (8-10 for featured, 5-7 for normal, 1-4 for less important)
- Set active=FALSE instead of deleting rows to preserve your data
- Use tags to organize content for future filtering features
- Keep captions short and engaging (1-2 sentences)
- Test your embed URLs before adding them to the sheet

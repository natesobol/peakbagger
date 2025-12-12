# Achievement Icons

Place 512x512 PNG badge images in this folder. Name files exactly as shown below.

## 25 Achievement Icons Required

| # | Filename | Achievement Name | Description |
|---|----------|------------------|-------------|
| 1 | `first_ascent.png` | First Summit | Log your first ascent |
| 2 | `rookie_hiker.png` | Rookie Hiker | Log 5 ascents |
| 3 | `mountaineer.png` | Mountaineer | Log 25 ascents |
| 4 | `peakbagger_club.png` | Peakbagger Club | Log 100 ascents |
| 5 | `century_unique.png` | Century of Peaks | Visit 100 unique summits |
| 6 | `world_explorer.png` | World Explorer | Ascents in 5 countries |
| 7 | `state_high_points.png` | State High Points | High-point 5 U.S. states |
| 8 | `range_completer.png` | Range Completer | Finish a peak range |
| 9 | `list_master.png` | List Master | Complete 3 peak lists |
| 10 | `altitude_seeker.png` | Altitude Seeker | Summit above 4,000m (13,123 ft) |
| 11 | `fourteeners.png` | Fourteen Fourteeners | Summit 14 peaks above 14,000 ft |
| 12 | `trip_reporter.png` | Trip Reporter | Publish 10 trip reports |
| 13 | `photographer.png` | Trail Photographer | Upload 20 photos |
| 14 | `trailblazer.png` | Trailblazer | First to log a new peak |
| 15 | `custom_completist.png` | Custom Completist | Finish a custom list |
| 16 | `seasonal_hiker.png` | Seasonal Hiker | Ascents in all 4 seasons |
| 17 | `week_streak.png` | Week-long Streak | Ascents on 7 consecutive days |
| 18 | `partner_climber.png` | Partner Climber | Tag 10 companions |
| 19 | `elevation_gain.png` | Elevation Gain | One ascent with >1,000m elevation gain |
| 20 | `year_marathon.png` | Yearly Marathon | 50 ascents in one year |
| 21 | `globetrotter.png` | Globetrotter | Ascents on 3 continents |
| 22 | `night_hiker.png` | Night Hiker | Ascent starting after 6pm or finishing after midnight |
| 23 | `winter_warrior.png` | Winter Warrior | Winter summit (December-February) |
| 24 | `repeat_offender.png` | Repeat Offender | Same summit on 10 occasions |
| 25 | `personal_best.png` | Personal Best | Highest elevation record above 5,000m |

## Icon Specifications

- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Style**: Consistent badge/medal design recommended

## File Naming Convention

All icon files must use **snake_case** naming exactly matching the `achievement_type` field in the database.

Example: The "First Summit" achievement has type `first_ascent`, so the icon file must be named `first_ascent.png`.

## Usage in Code

Icons are loaded dynamically in the profile page:

```javascript
// Icon URL pattern
const iconUrl = `/ico/${achievement.achievement_type}.png`;

// With fallback to emoji
<img src="${iconUrl}" onerror="this.style.display='none'; this.nextSibling.style.display='block';" />
<span class="achievement-emoji" style="display:none">${achievement.icon}</span>
```

## Fallback Emojis

If PNG not found, the app displays these emoji fallbacks:

| Achievement Type | Emoji | Achievement Name |
|------------------|-------|------------------|
| `first_ascent` | 🏔️ | First Summit |
| `rookie_hiker` | 🥾 | Rookie Hiker |
| `mountaineer` | ⛰️ | Mountaineer |
| `peakbagger_club` | 🏆 | Peakbagger Club |
| `century_unique` | 💯 | Century of Peaks |
| `world_explorer` | 🌍 | World Explorer |
| `state_high_points` | 🗺️ | State High Points |
| `range_completer` | 🏔️ | Range Completer |
| `list_master` | 📋 | List Master |
| `altitude_seeker` | 🎯 | Altitude Seeker |
| `fourteeners` | 🔝 | Fourteen Fourteeners |
| `trip_reporter` | 📝 | Trip Reporter |
| `photographer` | 📷 | Trail Photographer |
| `trailblazer` | 🔥 | Trailblazer |
| `custom_completist` | ✨ | Custom Completist |
| `seasonal_hiker` | 🍂 | Seasonal Hiker |
| `week_streak` | 🔥 | Week-long Streak |
| `partner_climber` | 👥 | Partner Climber |
| `elevation_gain` | 📈 | Elevation Gain |
| `year_marathon` | 🗓️ | Yearly Marathon |
| `globetrotter` | ✈️ | Globetrotter |
| `night_hiker` | 🌙 | Night Hiker |
| `winter_warrior` | ❄️ | Winter Warrior |
| `repeat_offender` | 🔄 | Repeat Offender |
| `personal_best` | 👑 | Personal Best |

## Database Schema Reference

Achievements are stored in `user_achievements` table:

```sql
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,      -- e.g., 'first_ascent'
  achievement_name TEXT NOT NULL,      -- e.g., 'First Summit'
  description TEXT,
  icon TEXT,                           -- Emoji fallback
  icon_url TEXT,                       -- Path: /ico/{achievement_type}.png
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_type)
);
```

## Quick Checklist

Use this to track which icons have been created:

- [ ] `first_ascent.png`
- [ ] `rookie_hiker.png`
- [ ] `mountaineer.png`
- [ ] `peakbagger_club.png`
- [ ] `century_unique.png`
- [ ] `world_explorer.png`
- [ ] `state_high_points.png`
- [ ] `range_completer.png`
- [ ] `list_master.png`
- [ ] `altitude_seeker.png`
- [ ] `fourteeners.png`
- [ ] `trip_reporter.png`
- [ ] `photographer.png`
- [ ] `trailblazer.png`
- [ ] `custom_completist.png`
- [ ] `seasonal_hiker.png`
- [ ] `week_streak.png`
- [ ] `partner_climber.png`
- [ ] `elevation_gain.png`
- [ ] `year_marathon.png`
- [ ] `globetrotter.png`
- [ ] `night_hiker.png`
- [ ] `winter_warrior.png`
- [ ] `repeat_offender.png`
- [ ] `personal_best.png`

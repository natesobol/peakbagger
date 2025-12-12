-- =====================================================
-- User Achievements / Badges System
-- Migration: 20251212_user_achievements.sql
-- =====================================================
-- 25 Achievement Types with icon images in /ico folder
-- Icon files: 512x512 PNG named after achievement slug
-- Example: /ico/first_ascent.png, /ico/winter_warrior.png
-- =====================================================

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,                         -- Emoji fallback
  icon_url TEXT,                     -- Path to PNG: /ico/{achievement_type}.png
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  -- Composite unique constraint to prevent duplicate achievements
  UNIQUE(user_id, achievement_type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);

-- Enable Row Level Security
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own achievements
CREATE POLICY "Users can view own achievements" 
  ON user_achievements FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own achievements
CREATE POLICY "Users can earn achievements" 
  ON user_achievements FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own achievements (for metadata updates)
CREATE POLICY "Users can update own achievements" 
  ON user_achievements FOR UPDATE 
  USING (auth.uid() = user_id);

-- =====================================================
-- Achievement Types Reference (25 total):
-- =====================================================
-- Slug                 | Name                  | Icon File
-- ---------------------|-----------------------|-------------------------
-- first_ascent         | First Summit          | /ico/first_ascent.png
-- rookie_hiker         | Rookie Hiker          | /ico/rookie_hiker.png
-- mountaineer          | Mountaineer           | /ico/mountaineer.png
-- peakbagger_club      | Peakbagger Club       | /ico/peakbagger_club.png
-- century_unique       | Century of Peaks      | /ico/century_unique.png
-- world_explorer       | World Explorer        | /ico/world_explorer.png
-- state_high_points    | State High Points     | /ico/state_high_points.png
-- range_completer      | Range Completer       | /ico/range_completer.png
-- list_master          | List Master           | /ico/list_master.png
-- altitude_seeker      | Altitude Seeker       | /ico/altitude_seeker.png
-- fourteeners          | Fourteen Fourteeners  | /ico/fourteeners.png
-- trip_reporter        | Trip Reporter         | /ico/trip_reporter.png
-- photographer         | Trail Photographer    | /ico/photographer.png
-- trailblazer          | Trailblazer           | /ico/trailblazer.png
-- custom_completist    | Custom Completist     | /ico/custom_completist.png
-- seasonal_hiker       | Seasonal Hiker        | /ico/seasonal_hiker.png
-- week_streak          | Week-long Streak      | /ico/week_streak.png
-- partner_climber      | Partner Climber       | /ico/partner_climber.png
-- elevation_gain       | Elevation Gain        | /ico/elevation_gain.png
-- year_marathon        | Yearly Marathon       | /ico/year_marathon.png
-- globetrotter         | Globetrotter          | /ico/globetrotter.png
-- night_hiker          | Night Hiker           | /ico/night_hiker.png
-- winter_warrior       | Winter Warrior        | /ico/winter_warrior.png
-- repeat_offender      | Repeat Offender       | /ico/repeat_offender.png
-- personal_best        | Personal Best         | /ico/personal_best.png
-- =====================================================

-- =====================================================
-- Achievement Definitions Table (Reference)
-- This stores the master list of all achievements
-- =====================================================
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id SERIAL PRIMARY KEY,
  achievement_type TEXT UNIQUE NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all 25 achievement definitions
INSERT INTO achievement_definitions (achievement_type, achievement_name, description, icon, icon_url, category, sort_order) VALUES
  ('first_ascent', 'First Summit', 'Log your first ascent', '🏔️', '/ico/first_ascent.png', 'milestones', 1),
  ('rookie_hiker', 'Rookie Hiker', 'Log 5 ascents', '🥾', '/ico/rookie_hiker.png', 'milestones', 2),
  ('mountaineer', 'Mountaineer', 'Log 25 ascents', '⛰️', '/ico/mountaineer.png', 'milestones', 3),
  ('peakbagger_club', 'Peakbagger Club', 'Log 100 ascents', '🏆', '/ico/peakbagger_club.png', 'milestones', 4),
  ('century_unique', 'Century of Peaks', 'Visit 100 unique summits', '💯', '/ico/century_unique.png', 'milestones', 5),
  ('world_explorer', 'World Explorer', 'Ascents in 5 countries', '🌍', '/ico/world_explorer.png', 'exploration', 6),
  ('state_high_points', 'State High Points', 'High-point 5 U.S. states', '🗺️', '/ico/state_high_points.png', 'exploration', 7),
  ('range_completer', 'Range Completer', 'Finish a peak range', '🏔️', '/ico/range_completer.png', 'lists', 8),
  ('list_master', 'List Master', 'Complete 3 peak lists', '📋', '/ico/list_master.png', 'lists', 9),
  ('altitude_seeker', 'Altitude Seeker', 'Summit above 4,000m (13,123 ft)', '🎯', '/ico/altitude_seeker.png', 'altitude', 10),
  ('fourteeners', 'Fourteen Fourteeners', 'Summit 14 peaks above 14,000 ft', '🔝', '/ico/fourteeners.png', 'altitude', 11),
  ('trip_reporter', 'Trip Reporter', 'Publish 10 trip reports', '📝', '/ico/trip_reporter.png', 'community', 12),
  ('photographer', 'Trail Photographer', 'Upload 20 photos', '📷', '/ico/photographer.png', 'community', 13),
  ('trailblazer', 'Trailblazer', 'First to log a new peak', '🔥', '/ico/trailblazer.png', 'community', 14),
  ('custom_completist', 'Custom Completist', 'Finish a custom list', '✨', '/ico/custom_completist.png', 'lists', 15),
  ('seasonal_hiker', 'Seasonal Hiker', 'Ascents in all 4 seasons', '🍂', '/ico/seasonal_hiker.png', 'seasons', 16),
  ('week_streak', 'Week-long Streak', 'Ascents on 7 consecutive days', '🔥', '/ico/week_streak.png', 'streaks', 17),
  ('partner_climber', 'Partner Climber', 'Tag 10 companions', '👥', '/ico/partner_climber.png', 'social', 18),
  ('elevation_gain', 'Elevation Gain', 'One ascent with >1,000m elevation gain', '📈', '/ico/elevation_gain.png', 'altitude', 19),
  ('year_marathon', 'Yearly Marathon', '50 ascents in one year', '🗓️', '/ico/year_marathon.png', 'streaks', 20),
  ('globetrotter', 'Globetrotter', 'Ascents on 3 continents', '✈️', '/ico/globetrotter.png', 'exploration', 21),
  ('night_hiker', 'Night Hiker', 'Ascent starting after 6pm or finishing after midnight', '🌙', '/ico/night_hiker.png', 'special', 22),
  ('winter_warrior', 'Winter Warrior', 'Winter summit (December-February)', '❄️', '/ico/winter_warrior.png', 'seasons', 23),
  ('repeat_offender', 'Repeat Offender', 'Same summit on 10 occasions', '🔄', '/ico/repeat_offender.png', 'special', 24),
  ('personal_best', 'Personal Best', 'Highest elevation record above 5,000m', '👑', '/ico/personal_best.png', 'altitude', 25)
ON CONFLICT (achievement_type) DO UPDATE SET
  achievement_name = EXCLUDED.achievement_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  icon_url = EXCLUDED.icon_url,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements()
RETURNS TRIGGER AS $$
DECLARE
  ascent_count INTEGER;
  unique_peak_count INTEGER;
  user_uuid UUID;
BEGIN
  user_uuid := NEW.user_id;
  
  -- Only process if marking as completed
  IF NEW.completed = true THEN
    -- Count total ascents (completed entries) for this user
    SELECT COUNT(*) INTO ascent_count
    FROM user_peak_progress
    WHERE user_id = user_uuid AND completed = true;
    
    -- Count unique peaks
    SELECT COUNT(DISTINCT peak_id) INTO unique_peak_count
    FROM user_peak_progress
    WHERE user_id = user_uuid AND completed = true;
    
    -- =========================================================
    -- 1. first_ascent - First Summit (1 ascent)
    -- =========================================================
    IF ascent_count = 1 THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon, icon_url)
      VALUES (user_uuid, 'first_ascent', 'First Summit', 'Log your first ascent - welcome to Peakbagger!', '🏔️', '/ico/first_ascent.png')
      ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;
    
    -- =========================================================
    -- 2. rookie_hiker - Rookie Hiker (5 ascents)
    -- =========================================================
    IF ascent_count = 5 THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon, icon_url)
      VALUES (user_uuid, 'rookie_hiker', 'Rookie Hiker', 'Log 5 ascents - you''re getting started!', '🥾', '/ico/rookie_hiker.png')
      ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;
    
    -- =========================================================
    -- 3. mountaineer - Mountaineer (25 ascents)
    -- =========================================================
    IF ascent_count = 25 THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon, icon_url)
      VALUES (user_uuid, 'mountaineer', 'Mountaineer', 'Log 25 ascents - experienced and dedicated!', '⛰️', '/ico/mountaineer.png')
      ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;
    
    -- =========================================================
    -- 4. peakbagger_club - Peakbagger Club (100 ascents)
    -- =========================================================
    IF ascent_count = 100 THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon, icon_url)
      VALUES (user_uuid, 'peakbagger_club', 'Peakbagger Club', 'Log 100 ascents - welcome to the club!', '🏆', '/ico/peakbagger_club.png')
      ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;
    
    -- =========================================================
    -- 5. century_unique - Century of Peaks (100 unique summits)
    -- =========================================================
    IF unique_peak_count = 100 THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon, icon_url)
      VALUES (user_uuid, 'century_unique', 'Century of Peaks', 'Visit 100 unique summits - true explorer!', '💯', '/ico/century_unique.png')
      ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;
    
    -- =========================================================
    -- 23. winter_warrior - Winter Warrior (Dec, Jan, Feb ascent)
    -- =========================================================
    IF EXTRACT(MONTH FROM COALESCE(NEW.first_completed_at, NOW())) IN (12, 1, 2) THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon, icon_url)
      VALUES (user_uuid, 'winter_warrior', 'Winter Warrior', 'Summit during winter (December-February) - brave the cold!', '❄️', '/ico/winter_warrior.png')
      ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically check achievements on peak completion
DROP TRIGGER IF EXISTS trigger_check_achievements ON user_peak_progress;
CREATE TRIGGER trigger_check_achievements
  AFTER INSERT OR UPDATE ON user_peak_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_achievements();

-- =====================================================
-- Manual Achievement Award Function
-- For achievements that require complex queries or
-- cannot be determined from a single row trigger
-- =====================================================
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id UUID,
  p_achievement_type TEXT,
  p_achievement_name TEXT,
  p_description TEXT,
  p_icon TEXT DEFAULT '🏅',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon, icon_url, metadata)
  VALUES (p_user_id, p_achievement_type, p_achievement_name, p_description, p_icon, '/ico/' || p_achievement_type || '.png', p_metadata)
  ON CONFLICT (user_id, achievement_type) DO NOTHING;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT SELECT, INSERT, UPDATE ON user_achievements TO authenticated;
GRANT SELECT ON achievement_definitions TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

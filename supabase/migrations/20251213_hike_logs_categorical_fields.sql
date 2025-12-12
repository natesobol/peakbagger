-- =====================================================
-- User Hike Logs - Categorical Fields Migration
-- Migration: 20251213_hike_logs_categorical_fields.sql
-- =====================================================
-- Replaces numeric ratings with text-based dropdowns:
-- effort, trail_condition, views, temperature,
-- precipitation, wind, crowds, bugs
-- =====================================================

-- Add new categorical text columns to user_hike_logs
ALTER TABLE user_hike_logs 
  ADD COLUMN IF NOT EXISTS effort TEXT,
  ADD COLUMN IF NOT EXISTS trail_condition TEXT,
  ADD COLUMN IF NOT EXISTS views TEXT,
  ADD COLUMN IF NOT EXISTS temperature TEXT,
  ADD COLUMN IF NOT EXISTS precipitation TEXT,
  ADD COLUMN IF NOT EXISTS wind TEXT,
  ADD COLUMN IF NOT EXISTS crowds TEXT,
  ADD COLUMN IF NOT EXISTS bugs TEXT;

-- Add comments for column documentation
COMMENT ON COLUMN user_hike_logs.effort IS 
  'Effort level: Very Easy, Easy, Moderate, Hard, Very Hard';

COMMENT ON COLUMN user_hike_logs.trail_condition IS 
  'Trail condition: Excellent, Good, Fair, Poor';

COMMENT ON COLUMN user_hike_logs.views IS 
  'View quality: Excellent, Good, Average, Poor, None';

COMMENT ON COLUMN user_hike_logs.temperature IS 
  'Temperature: Very Cold, Cold, Cool, Mild, Warm, Hot, Very Hot';

COMMENT ON COLUMN user_hike_logs.precipitation IS 
  'Precipitation: None, Drizzle, Light Rain, Heavy Rain, Snow, Thunderstorm, Hail, Sleet';

COMMENT ON COLUMN user_hike_logs.wind IS 
  'Wind conditions: Calm, Light Breeze, Breezy, Windy, Very Windy';

COMMENT ON COLUMN user_hike_logs.crowds IS 
  'Trail crowding: No one, Few, Moderate, Crowded';

COMMENT ON COLUMN user_hike_logs.bugs IS 
  'Bug level: None, Few, Moderate, Many, Swarmed';

-- =====================================================
-- Optional: Migrate old numeric ratings to new fields
-- Uncomment if you had prior numeric data to preserve
-- =====================================================
-- UPDATE user_hike_logs SET effort = CASE
--   WHEN rating = 1 THEN 'Very Easy'
--   WHEN rating = 2 THEN 'Easy'
--   WHEN rating = 3 THEN 'Moderate'
--   WHEN rating = 4 THEN 'Hard'
--   WHEN rating = 5 THEN 'Very Hard'
--   ELSE NULL
-- END WHERE effort IS NULL AND rating IS NOT NULL;

-- =====================================================
-- Optional: Remove old numeric columns after migration
-- Only run after verifying data migration worked
-- =====================================================
-- ALTER TABLE user_hike_logs 
--   DROP COLUMN IF EXISTS rating,
--   DROP COLUMN IF EXISTS difficulty;

-- =====================================================
-- Field Value Reference:
-- =====================================================
-- effort:          'Very Easy' | 'Easy' | 'Moderate' | 'Hard' | 'Very Hard'
-- trail_condition: 'Excellent' | 'Good' | 'Fair' | 'Poor'
-- views:           'Excellent' | 'Good' | 'Average' | 'Poor' | 'None'
-- temperature:     'Very Cold' | 'Cold' | 'Cool' | 'Mild' | 'Warm' | 'Hot' | 'Very Hot'
-- precipitation:   'None' | 'Drizzle' | 'Light Rain' | 'Heavy Rain' | 'Snow' | 'Thunderstorm' | 'Hail' | 'Sleet'
-- wind:            'Calm' | 'Light Breeze' | 'Breezy' | 'Windy' | 'Very Windy'
-- crowds:          'No one' | 'Few' | 'Moderate' | 'Crowded'
-- bugs:            'None' | 'Few' | 'Moderate' | 'Many' | 'Swarmed'
-- =====================================================

# Supabase Integration Guide

## Overview

This document describes the Supabase backend integration for the Peakbagger application. The integration replaces the previous localStorage-based authentication and data storage with a cloud-based Supabase backend.

## Changes Made

### 1. Supabase Client Setup

- **Added**: Supabase JS client library via CDN in `peakbagger-clean.html`
- **Created**: `.env` file with Supabase credentials (not committed to git)
- **Created**: `.gitignore` to exclude `.env` files
- **Initialized**: Supabase client in `app.js` with anon key (safe for client-side use)

### 2. Authentication

**Replaced**: localStorage-based password hashing with Supabase Auth
- `signUp()` now uses `supabase.auth.signUp()` with email/password
- `signIn()` now uses `supabase.auth.signInWithPassword()`
- `signOut()` now uses `supabase.auth.signOut()`
- Added `getCurrentUserData()` to fetch current user from Supabase
- Added `onAuthStateChange` listener to update UI on auth state changes
- User metadata (name, TOS acceptance) stored in `user_metadata`

### 3. Data Loading

**Lists and Peaks**: 
- `fetchAllLists()` now queries Supabase `lists` table
- `fetchListItems()` queries Supabase `list_peaks` and `peaks` tables
- Falls back to static JSON if Supabase query fails
- Merges peak data from Supabase with photo data from NH48 API

**Photos**: 
- Continue to load from existing GitHub-hosted JSON via NH48 API
- Photo data is merged with peak data by slug

### 4. User Progress Storage

**Completions**:
- `loadStateFromSupabase()` loads from `user_peak_progress` table
- `saveStateToSupabase()` upserts to `user_peak_progress` table
- Replaces localStorage-based `loadState()` and `saveState()`
- Automatically saves when user checks/unchecks peaks

**Grid Mode**:
- `loadGridFromSupabase()` loads from `user_peak_grid_cells` table
- `saveGridToSupabase()` upserts/deletes grid cells
- Replaces localStorage-based `loadGrid()` and `saveGrid()`

### 5. User Settings

**Preferences**:
- `saveUserSettingsToSupabase()` saves theme, view mode, grid settings
- `loadUserSettingsFromSupabase()` loads user preferences
- Still uses localStorage for quick access, but syncs to Supabase
- Settings saved to `user_settings` table

### 6. Backward Compatibility

**Kept Functions**:
- `queueRemoteSave()` - now a no-op (was for old API)
- `saveToRemote()` - now a no-op
- `restoreFromRemote()` - now a no-op
- `loadState()` - fallback for guest users
- `saveState()` - no-op, using Supabase

## Database Tables Used

### `lists`
- `id` (UUID, primary key)
- `slug` (text, unique)
- `name` (text)

### `peaks`
- `id` (UUID, primary key)
- `slug` (text, unique)
- `name` (text)
- `elevation_ft` (integer)
- `prominence_ft` (integer)
- `range` (text)
- `coords_text` (text)
- `metadata` (jsonb)

### `list_peaks`
- `id` (UUID, primary key)
- `list_id` (UUID, foreign key)
- `peak_id` (UUID, foreign key)
- `rank` (integer)

### `user_peak_progress`
- `user_id` (UUID, foreign key)
- `list_id` (UUID, foreign key)
- `peak_id` (UUID, foreign key)
- `completed` (boolean)
- `first_completed_at` (timestamp)
- `last_completed_at` (timestamp)

### `user_peak_grid_cells`
- `user_id` (UUID, foreign key)
- `list_id` (UUID, foreign key)
- `peak_id` (UUID, foreign key)
- `month` (integer, 1-12)
- `completed_at` (date)

### `user_settings`
- `user_id` (UUID, primary key, foreign key)
- `theme` (text)
- `view_mode` (text)
- `grid_enabled` (boolean)
- `default_list_id` (UUID)
- `updated_at` (timestamp)

## Row-Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data:
- Users can only read/write their own progress in `user_peak_progress`
- Users can only read/write their own grid cells in `user_peak_grid_cells`
- Users can only read/write their own settings in `user_settings`
- All users can read `lists`, `peaks`, and `list_peaks` (public data)

## Environment Variables

The following environment variables are used (stored in `.env`):

```env
VITE_SUPABASE_URL=https://uobvavnsstrgyezcklib.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Note**: The anon key is safe to expose in client-side code. The service role key should NEVER be used in the frontend.

## Testing

To test the integration:

1. Open `peakbagger-clean.html` in a browser
2. Sign up for a new account
3. Check/uncheck peaks and verify they save
4. Change list and verify progress persists
5. Sign out and sign in again to verify data loads correctly
6. Test theme changes, unit toggles, and other settings

## Deployment

1. Ensure `.env` is not committed to version control (already in `.gitignore`)
2. Commit changes: `git add . && git commit -m "Integrate Supabase backend"`
3. Push to repository: `git push origin main`
4. Deploy to hosting service (GitHub Pages, Netlify, Vercel, etc.)

## Fallback Behavior

If Supabase is unavailable:
- Lists and peaks fall back to static JSON from GitHub
- Progress is stored in localStorage (guest mode)
- Users see auth UI but cannot sign in
- App remains functional for offline use

## Future Enhancements

- Add email verification for new sign-ups
- Add password reset functionality
- Add social auth (Google, GitHub)
- Add real-time sync for multi-device usage
- Add export/import functionality for data portability
- Add admin dashboard for data management

## Support

For issues or questions:
- Check Supabase dashboard for errors
- Review browser console for error messages
- Verify RLS policies in Supabase
- Check network tab for failed API requests

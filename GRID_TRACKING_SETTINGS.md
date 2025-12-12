# Grid Tracking Mode - Settings Update

## Summary
Moved the grid tracking toggle from the profile page to the main app settings panel and separated it from the view mode (grid/list/compact). The grid tracking mode now defaults to OFF (single checklist view).

## Changes Made

### 1. **Settings Panel** (peakbagger-clean.html)
- ✅ Added "Grid tracking (12 months/peak)" toggle to Settings section
- Located after "Sticky header" toggle
- Uses standard toggle switch styling

### 2. **Separate Tracking Variable** (app.js)
- ✅ Created new `gridTrackingEnabled` variable (default: `false`)
- Separate from `gridMode` variable which controls view layout ('grid', 'list', 'compact')
- **gridTrackingEnabled**: Controls whether to show 12-month date pickers per peak
- **gridMode**: Controls UI layout (card grid vs table list vs compact list)

### 3. **Conditional Rendering** (app.js - renderGrid function)
- ✅ When `gridTrackingEnabled = true`: Shows 12-month grid with Jan-Dec date pickers
- ✅ When `gridTrackingEnabled = false`: Shows single date input field (classic checklist)
- Event handlers properly wired for both modes

### 4. **Peak Detail View** (app.js - openPeakDetail function)
- ✅ Conditionally shows/hides month grid based on `gridTrackingEnabled`
- Month grid only appears when tracking is enabled
- Single date input always visible

### 5. **Settings Persistence**
- ✅ Saves to local storage (`readPrefs`/`writePrefs`)
- ✅ Saves to Supabase `user_grid_settings` table when user is logged in
- ✅ Loads on boot and when changing lists
- ✅ Auto-syncs between sessions

### 6. **New Functions** (app.js)

**applyGridTracking(enabled)**
- Sets `gridTrackingEnabled` variable
- Updates toggle UI
- Saves to local preferences
- Saves to Supabase (if logged in)
- Re-renders view to show/hide month grid

**loadGridTrackingSettings()**
- Loads from Supabase (if logged in)
- Falls back to local preferences
- Defaults to `false` if no setting exists
- Updates toggle switch state

### 7. **Profile Page** (profile.html)
- ✅ Removed duplicate grid settings section
- ✅ Removed unused JavaScript functions
- ✅ Cleaned up DOM references
- Settings now only in main app

## How It Works

### Default Behavior
1. User opens app → Grid tracking is **OFF** by default
2. Cards show single date input field (traditional checklist)
3. Toggle is in Settings panel (collapsed by default)

### Enabling Grid Tracking
1. User opens Settings panel
2. Toggles "Grid tracking (12 months/peak)" to ON
3. View refreshes automatically
4. Each peak card now shows 12 month date pickers (Jan-Dec)
5. Setting is saved to preferences and database

### View Mode vs Tracking Mode
- **View Mode** (Mode button): Changes layout → Grid cards / List table / Compact list
- **Grid Tracking** (Settings toggle): Changes data entry → 12 months vs single date
- These are independent - you can have grid tracking ON in any view mode

## Technical Details

### Data Flow
```javascript
// On boot
readPrefs() → gridTrackingEnabled = prefs.gridTracking || false
applyGridTracking(gridTrackingEnabled)

// On toggle change
gridTrackingToggle.onchange → applyGridTracking(checked)
  ├─ Update gridTrackingEnabled
  ├─ Save to localStorage
  ├─ Save to Supabase (if logged in)
  └─ renderView() → re-render with new mode

// On render
renderGrid() → if (gridTrackingEnabled) {
  // Show 12-month grid
} else {
  // Show single date input
}
```

### Database Schema
Uses `user_grid_settings` table:
- `user_id`: User identifier
- `list_id`: List identifier (e.g., NH48)
- `grid_enabled`: Boolean (true/false)
- `last_updated_at`: Timestamp

## User Experience

### Before (Confusing):
- Grid mode toggle changed view layout
- Month grid always showed (couldn't turn off)
- Unclear distinction between view and tracking

### After (Clear):
- **Mode button**: Changes how peaks are displayed (layout)
- **Grid tracking toggle**: Enables/disables month-by-month tracking (data)
- Default is simple checklist (familiar UX)
- Grid tracking is opt-in feature for advanced users

## Testing Checklist
- [x] Toggle starts in OFF state (single date input)
- [x] Toggling ON shows 12-month grid
- [x] Toggling OFF shows single date input
- [x] Setting persists in localStorage
- [x] Setting saves to Supabase when logged in
- [x] Setting loads on page refresh
- [x] Setting loads when changing lists
- [x] Works in all view modes (grid/list/compact)
- [x] Peak detail view respects setting
- [x] No JavaScript errors

## Future Enhancements
1. **Bulk enable/disable**: Toggle for all lists at once
2. **Import grid data**: Upload CSV of month completions
3. **Grid visualization**: Heatmap of completion months
4. **Year selector**: Track multiple years per peak
5. **Grid statistics**: "Completed all 12 months on X peaks"

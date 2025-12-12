# Social Features Implementation

## Overview
The profile page now includes comprehensive social networking features, hike tracking, and user preferences management. All features are fully integrated with Supabase and use the existing database schema.

## Features Implemented

### 1. **Hike Logs Display** 📊
- **Location**: Profile page, "Recent Hikes" section
- **Functionality**: Displays user's 10 most recent hikes sorted by date (newest first)
- **Data Source**: `user_hike_logs` table
- **Displays**:
  - Hike date
  - Peak name
  - List name  
  - Trail name
  - Distance (miles)
  - Duration (hours and minutes)

### 2. **Grid Mode Settings** ⚙️
- **Location**: Profile page, "Preferences" section
- **Functionality**: Toggle switch to enable/disable Grid Mode
- **Data Source**: `user_grid_settings` table
- **Behavior**:
  - Saves preference per user and per list
  - Automatically loads grid mode preference when user logs in
  - Syncs with main app mode toggle
  - Updates `last_updated_at` timestamp on changes

### 3. **User Search** 🔍
- **Location**: Profile page, "Find Friends" section
- **Functionality**: Search for other users by display name or email
- **Features**:
  - Minimum 2 characters required
  - Case-insensitive search
  - Shows up to 10 results
  - Displays user avatar with initials
  - Shows user's display name and email
  - Smart action buttons:
    - "Add Friend" - if not connected
    - "Pending" badge - if request already sent
    - "Friends" badge - if already friends
  - Real-time search (press Enter or click Search)

### 4. **Friend Requests** 📬
- **Location**: Profile page, "Friend Requests" section
- **Functionality**: View and manage incoming friend requests
- **Features**:
  - Shows all pending incoming requests
  - Displays sender's avatar, name, and email
  - **Accept**: Creates bidirectional friendship
  - **Decline**: Marks request as rejected
  - Auto-refreshes after actions
  - Updates both `friend_requests` and `friendships` tables

### 5. **Friends List** 👥
- **Location**: Profile page, "My Friends" section
- **Functionality**: View and manage your friends
- **Features**:
  - Shows all current friends
  - Displays friend's avatar, name, and email
  - **Remove Friend**: Deletes bidirectional friendship
  - Confirmation dialog before removal
  - Sorted by friendship creation date (newest first)

## Database Schema Used

### Tables
All social features use the following Supabase tables:

1. **profiles** - User profile information
   - `id`, `email`, `display_name`, `created_at`

2. **friend_requests** - Friend request management
   - `id`, `from_user_id`, `to_user_id`, `status`, `created_at`, `updated_at`
   - Status values: 'pending', 'accepted', 'rejected'

3. **friendships** - Active friendships
   - `id`, `user_id`, `friend_user_id`, `created_at`
   - Bidirectional relationships (2 rows per friendship)

4. **user_hike_logs** - Hike tracking
   - `id`, `user_id`, `list_id`, `peak_id`, `hike_date`, `trail_name`, `miles`, `duration_minutes`, etc.

5. **user_grid_settings** - Grid mode preferences
   - `id`, `user_id`, `list_id`, `grid_enabled`, `start_year`, `end_year`, `last_updated_at`

## Technical Implementation

### Profile Page (profile.html)

#### New Sections Added:
```html
<!-- Preferences -->
<div class="profile-card">
  <h2>Preferences</h2>
  <div class="info-item">
    <label>Grid Mode Enabled</label>
    <label class="switch">
      <input type="checkbox" id="gridModeToggle">
      <span class="slider"></span>
    </label>
  </div>
</div>

<!-- Recent Hikes -->
<div class="profile-card">
  <h2>Recent Hikes</h2>
  <div id="hikesContainer"></div>
</div>

<!-- Social Features -->
<div class="profile-card">
  <h2>Social</h2>
  <div class="social-container">
    <!-- User Search -->
    <!-- Friend Requests -->
    <!-- Friends List -->
  </div>
</div>
```

#### Key Functions:

**Grid Settings:**
```javascript
async function loadGridSettings()
async function saveGridSettings(enabled)
```

**Hike Logs:**
```javascript
async function loadRecentHikes()
```

**User Search:**
```javascript
async function searchUsers()
window.sendFriendRequest(toUserId)
```

**Friend Requests:**
```javascript
async function loadFriendRequests()
window.acceptFriendRequest(requestId, friendUserId)
window.rejectFriendRequest(requestId)
```

**Friends List:**
```javascript
async function loadFriends()
window.removeFriend(friendshipId, friendUserId)
```

### Main App (app.js)

#### New Functions:
```javascript
async function loadGridModeSettings()
```
- Loads grid mode preference from `user_grid_settings`
- Sets `gridMode` variable to 'grid' or 'list'
- Updates mode label in UI

#### Modified Functions:
```javascript
async function reflectAuthUI()
```
- Now calls `loadGridModeSettings()` after loading user data

```javascript
modeBtn.onclick = async () => { ... }
```
- Now saves grid mode preference to database when toggled
- Uses `upsert` to create or update settings

```javascript
async function changeList(newList)
```
- Now calls `loadGridModeSettings()` when switching lists

## Styling

### New CSS Classes:

**Social Components:**
- `.social-container` - Grid layout for social sections
- `.social-section` - Individual section card
- `.user-list`, `.friend-list`, `.request-list` - List containers
- `.user-item`, `.friend-item`, `.request-item` - Individual list items
- `.user-avatar-small` - 40px circular avatar
- `.user-details` - User name and email container
- `.action-buttons` - Button group

**Hike Logs:**
- `.hike-logs-table` - Table styling
- `.no-logs-message` - Empty state message

**Toggle Switch:**
- `.switch` - Toggle container
- `.slider` - Animated slider
- Animated transitions with blue accent when enabled

**Badges:**
- `.badge` - Base badge style
- `.badge-pending` - Yellow pending indicator
- `.badge-accepted` - Green accepted indicator

**Responsive:**
- Social container switches to single column on mobile (<960px)
- Table font sizes reduce on mobile
- All padding/spacing optimized for mobile

## User Flow Examples

### Adding a Friend:
1. User types friend's name or email in search box
2. Clicks "Search" or presses Enter
3. Search results display with "Add Friend" button
4. User clicks "Add Friend"
5. Friend request is sent, button changes to "Pending" badge
6. Recipient sees request in "Friend Requests" section
7. Recipient clicks "Accept"
8. Both users now see each other in "My Friends" section

### Managing Grid Mode:
1. User toggles "Grid Mode Enabled" switch on profile page
2. Setting is saved to `user_grid_settings` table
3. User returns to main app
4. Grid mode automatically loads based on saved preference
5. User can toggle mode button in main app
6. Change is saved back to database

### Viewing Recent Hikes:
1. User navigates to profile page
2. Recent Hikes section automatically loads
3. Table displays 10 most recent hikes
4. Sorted by date (newest to oldest)
5. Shows peak name, trail, distance, duration

## Security Considerations

### Row Level Security (RLS)
All tables should have RLS policies enabled:

```sql
-- Example policies for friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON friend_requests FOR SELECT
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create requests"
  ON friend_requests FOR INSERT
  WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update their incoming requests"
  ON friend_requests FOR UPDATE
  USING (to_user_id = auth.uid());
```

### Data Validation
- User IDs are validated against authenticated user
- Foreign key constraints ensure data integrity
- Status fields are constrained to valid values
- Email searches are case-insensitive and sanitized

## Future Enhancements

### Potential Features:
1. **Activity Feed**: Show friend's recent hikes
2. **Friend Profiles**: View friend's progress and stats
3. **Group Hikes**: Plan and track group hiking events
4. **Achievements**: Badges for milestones (first 10 peaks, etc.)
5. **Leaderboards**: Compare progress with friends
6. **Privacy Settings**: Control who can see your data
7. **Notifications**: Real-time friend request notifications
8. **Messaging**: Direct messages between friends
9. **Photo Sharing**: Share hike photos with friends
10. **Route Sharing**: Share trail routes and notes

## Testing Checklist

- [ ] Grid mode toggle saves and loads correctly
- [ ] Grid mode syncs between profile and main app
- [ ] User search returns accurate results
- [ ] User search respects existing friendships
- [ ] Friend requests send successfully
- [ ] Friend requests can be accepted
- [ ] Friend requests can be rejected
- [ ] Bidirectional friendships are created
- [ ] Friends list displays all friends
- [ ] Remove friend deletes both directions
- [ ] Recent hikes load and display correctly
- [ ] All features work on mobile devices
- [ ] All features require authentication
- [ ] Proper error handling for network issues

## API Reference

### Supabase Queries Used:

**Load Grid Settings:**
```javascript
.from('user_grid_settings')
.select('grid_enabled')
.eq('user_id', userId)
.eq('list_id', listId)
.single()
```

**Search Users:**
```javascript
.from('profiles')
.select('id, email, display_name')
.or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
.neq('id', currentUserId)
.limit(10)
```

**Send Friend Request:**
```javascript
.from('friend_requests')
.insert({
  from_user_id: userId,
  to_user_id: targetUserId,
  status: 'pending'
})
```

**Accept Friend Request:**
```javascript
// Update request
.from('friend_requests')
.update({ status: 'accepted' })
.eq('id', requestId)

// Create friendships (both directions)
.from('friendships')
.insert([
  { user_id: userId, friend_user_id: friendId },
  { user_id: friendId, friend_user_id: userId }
])
```

**Load Recent Hikes:**
```javascript
.from('user_hike_logs')
.select('*, peaks(name, slug), lists(name)')
.eq('user_id', userId)
.order('hike_date', { ascending: false })
.limit(10)
```

## Troubleshooting

### Common Issues:

**Grid mode not persisting:**
- Check that `user_grid_settings` table exists
- Verify RLS policies allow insert/update
- Ensure `list_id` is correctly resolved

**Friend requests not appearing:**
- Verify `friend_requests` table has correct foreign keys
- Check RLS policies on `friend_requests` and `profiles`
- Ensure joins on profiles table are working

**Search not finding users:**
- Check that `profiles` table is populated
- Verify `display_name` field exists and has data
- Ensure RLS allows reading other user profiles

**Hikes not loading:**
- Verify `user_hike_logs` table exists
- Check joins with `peaks` and `lists` tables
- Ensure RLS allows reading own hike logs

# Peakbagger Feature Implementation Guide

This document provides vanilla JavaScript implementations for the requested features.

## 1. Favorites/Wishlist System

### Add to app.js after the completions variables:

```javascript
// Favorites and Wishlist
let favorites = new Set();
let wishlist = new Set();

// Load favorites from Supabase
async function loadFavorites() {
  if (!currentUser) return;
  
  try {
    const { data } = await supabase
      .from('user_favorite_peaks')
      .select('peak_id')
      .eq('user_id', currentUser.id);
    
    favorites = new Set(data?.map(f => f.peak_id) || []);
  } catch (e) {
    console.error('Error loading favorites:', e);
  }
}

// Toggle favorite
async function toggleFavorite(peakName) {
  if (!currentUser) return;
  
  const peak = await getPeakByName(peakName);
  if (!peak) return;
  
  try {
    if (favorites.has(peak.id)) {
      await supabase
        .from('user_favorite_peaks')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('peak_id', peak.id);
      favorites.delete(peak.id);
    } else {
      await supabase
        .from('user_favorite_peaks')
        .insert({
          user_id: currentUser.id,
          peak_id: peak.id
        });
      favorites.add(peak.id);
    }
    renderView();
  } catch (e) {
    console.error('Error toggling favorite:', e);
  }
}

// Get peak by name
async function getPeakByName(name) {
  const { data } = await supabase
    .from('peaks')
    .select('id')
    .eq('name', name)
    .single();
  return data;
}
```

### Update renderGrid to show colored borders:

In the renderGrid function, after creating the card element, add this logic:

```javascript
// Add status-based coloring
const peak = await getPeakByName(it.name);
if (peak) {
  if (it.completed) {
    card.classList.add('card-complete');
  } else if (favorites.has(peak.id)) {
    card.classList.add('card-favorite');
  } else if (wishlist.has(peak.id)) {
    card.classList.add('card-wishlist');
  } else {
    card.classList.add('card-incomplete');
  }
}
```

### Add CSS to styles.css:

```css
.peak-card.card-complete {
  border-color: var(--good);
}

.peak-card.card-favorite {
  border-color: #d4af37; /* gold */
  box-shadow: 0 0 0 1px #d4af37;
}

.peak-card.card-wishlist {
  border-color: #800000; /* maroon */
  box-shadow: 0 0 0 1px #800000;
}

.peak-card.card-incomplete {
  border-color: #646464;
}
```

### Add favorite/wishlist buttons to Peak Detail page:

In openPeakDetail function, add after the title:

```javascript
// Add favorite/wishlist toggles
const peak = await getPeakByName(it.name);
const isFav = peak && favorites.has(peak.id);
const isWish = peak && wishlist.has(peak.id);

const toggleContainer = document.createElement('div');
toggleContainer.style.cssText = 'display: flex; gap: 12px; margin: 16px 0;';
toggleContainer.innerHTML = `
  <button class="btn btn-small ${isFav ? 'btn-primary' : 'btn-ghost'}" id="favoriteToggle">
    ${isFav ? '⭐' : '☆'} Favorite
  </button>
  <button class="btn btn-small ${isWish ? 'btn-primary' : 'btn-ghost'}" id="wishlistToggle">
    ${isWish ? '❤️' : '♡'} Wishlist
  </button>
`;

document.getElementById('peakDetailTitle').after(toggleContainer);

document.getElementById('favoriteToggle').onclick = async (e) => {
  e.stopPropagation();
  await toggleFavorite(it.name);
  closePeakDetail();
};
```

## 2. Advanced Filters

### Add to peakbagger-clean.html in the controls section:

```html
<div class="ctrl">
  <label for="statusFilter">Status:</label>
  <select id="statusFilter" class="select">
    <option value="all">All</option>
    <option value="completed">Completed</option>
    <option value="incomplete">Not Completed</option>
    <option value="favorites">Favorites</option>
    <option value="wishlist">Wishlist</option>
  </select>
</div>

<div class="ctrl">
  <label for="rangeFilter">Range:</label>
  <select id="rangeFilter" class="select">
    <option value="all">All Ranges</option>
    <option value="Presidential">Presidential</option>
    <option value="Franconia">Franconia</option>
    <option value="Carter-Moriah">Carter-Moriah</option>
    <!-- Add more ranges as needed -->
  </select>
</div>

<div class="ctrl">
  <label for="elevationMin">Min Elevation:</label>
  <input type="number" id="elevationMin" placeholder="0" style="width: 100px;">
</div>

<div class="ctrl">
  <label for="elevationMax">Max Elevation:</label>
  <input type="number" id="elevationMax" placeholder="6288" style="width: 100px;">
</div>
```

### Add filter variables and handlers to app.js:

```javascript
let statusFilter = 'all';
let rangeFilter = 'all';
let elevationMin = 0;
let elevationMax = 99999;

// Add to event handlers section
const statusFilterEl = document.getElementById('statusFilter');
const rangeFilterEl = document.getElementById('rangeFilter');
const elevationMinEl = document.getElementById('elevationMin');
const elevationMaxEl = document.getElementById('elevationMax');

if (statusFilterEl) {
  statusFilterEl.onchange = () => {
    statusFilter = statusFilterEl.value;
    PAGE = 1;
    renderView();
  };
}

if (rangeFilterEl) {
  rangeFilterEl.onchange = () => {
    rangeFilter = rangeFilterEl.value;
    PAGE = 1;
    renderView();
  };
}

if (elevationMinEl) {
  elevationMinEl.oninput = () => {
    elevationMin = parseInt(elevationMinEl.value) || 0;
    PAGE = 1;
    renderView();
  };
}

if (elevationMaxEl) {
  elevationMaxEl.oninput = () => {
    elevationMax = parseInt(elevationMaxEl.value) || 99999;
    PAGE = 1;
    renderView();
  };
}
```

### Update filtering logic in renderGrid and renderTable:

```javascript
// After existing filtering, add:
if (statusFilter === 'completed') {
  filteredItems = filteredItems.filter(it => it.completed);
} else if (statusFilter === 'incomplete') {
  filteredItems = filteredItems.filter(it => !it.completed);
} else if (statusFilter === 'favorites') {
  filteredItems = filteredItems.filter(async it => {
    const peak = await getPeakByName(it.name);
    return peak && favorites.has(peak.id);
  });
} else if (statusFilter === 'wishlist') {
  filteredItems = filteredItems.filter(async it => {
    const peak = await getPeakByName(it.name);
    return peak && wishlist.has(peak.id);
  });
}

// Range filter
if (rangeFilter !== 'all') {
  filteredItems = filteredItems.filter(it => {
    const slug = getSlugForName(it.name);
    const data = NH48_DATA?.[slug];
    const range = data?.['Range / Subrange'] || data?.Range || '';
    return range.toLowerCase().includes(rangeFilter.toLowerCase());
  });
}

// Elevation filter
filteredItems = filteredItems.filter(it => {
  const elev = it.elevation_ft || 0;
  return elev >= elevationMin && elev <= elevationMax;
});
```

## 3. Legend in Settings

### Add to peakbagger-clean.html in Settings section:

```html
<!-- Add before closing </div> of settings -->
<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
  <label style="display: block; margin-bottom: 12px; color: var(--ink); font-weight: 600;">
    Color Legend
  </label>
  <div class="legend">
    <div class="legend-item">
      <span class="legend-square complete"></span>
      <span>Complete</span>
    </div>
    <div class="legend-item">
      <span class="legend-square favorite"></span>
      <span>Favorite</span>
    </div>
    <div class="legend-item">
      <span class="legend-square wishlist"></span>
      <span>Wishlist</span>
    </div>
    <div class="legend-item">
      <span class="legend-square incomplete"></span>
      <span>Incomplete</span>
    </div>
  </div>
</div>
```

### Add CSS to styles.css:

```css
.legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ink);
}

.legend-square {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid currentColor;
  flex-shrink: 0;
}

.legend-square.complete {
  background: var(--good);
  border-color: var(--good);
}

.legend-square.favorite {
  background: transparent;
  border-color: #d4af37;
}

.legend-square.wishlist {
  background: transparent;
  border-color: #800000;
}

.legend-square.incomplete {
  background: transparent;
  border-color: #646464;
}
```

## 4. Implementation Checklist

- [ ] Add favorites/wishlist variables to app.js
- [ ] Add loadFavorites() function and call it on auth
- [ ] Add toggleFavorite() and toggleWishlist() functions
- [ ] Update renderGrid to apply CSS classes based on status
- [ ] Add CSS classes for card-favorite, card-wishlist, etc.
- [ ] Add favorite/wishlist buttons to peak detail page
- [ ] Add filter dropdowns to HTML
- [ ] Add filter variables and event handlers
- [ ] Update filtering logic in render functions
- [ ] Add legend HTML to settings section
- [ ] Add legend CSS styles
- [ ] Call loadFavorites() in reflectAuthUI()

## 5. Testing

1. Test favorite toggling on detail page
2. Verify colors update in grid view
3. Test filters (status, range, elevation)
4. Verify legend displays correctly
5. Test persistence across page reloads

## 6. Database Schema Requirements

Ensure these tables exist in Supabase:

- user_favorite_peaks (id, user_id, peak_id, created_at)
- user_favorite_lists (id, user_id, list_id, created_at)
- user_hike_logs (all hiking journal fields)

Enable Row Level Security on all tables.

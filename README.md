# peakbagger

Peakbagger's Journal Web is a **single-page peak-logging web app** hosted at [nh48.app](https://nh48.app). It runs as a static HTML file with **no build step** and is deployed via GitHub Pages.

The app connects to:

- The **Peakbagger Lists API** (`/_functions/peakbagger_lists`, `/_functions/peakbagger_list`)
- The **NH48 API dataset** (`nh48.json` via rawcdn.githack.com)
- The **NH48 Images endpoint** (`/_functions/nh48_images?peak=...`)

to provide a rich, offline-friendly experience for logging progress on the **NH 48** and other peak lists.

---

## Web App Overview

The web UI is a **pure HTML/CSS/JS single file**. When opened in a browser, it:

- Fetches available lists (e.g. “NH 48”) from `/_functions/peakbagger_lists`
- Fetches items (peaks) for the selected list from `/_functions/peakbagger_list?name=...`
- Enriches each peak with metadata from `nh48.json` (elevation, range/subrange, prominence, difficulty)
- Tries to load photos for each peak either from the NH48 dataset (`photos` array) or from the NH48 images function at `/_functions/nh48_images?peak=...`

All completion state is stored **per-device** in `localStorage`, with optional remote sync (for signed-in users) via `/_functions/peakbagger_progress`.

---

## Key Features

### 1. Peak List UI

- **Checklist mode (default)**  
  - Rank, mountain name, elevation, date completed, status, and a “details” chevron.  
  - Supports **search**, **sorting** (rank, name, elevation, status), **hide completed**, and **pagination** (25 rows per page) with keyboard navigation (← / →).

- **Grid mode (monthly log)**  
  - Toggles via “Mode: Checklist/Grid” control.  
  - Each peak row shows a 12-month strip of chips (Jan–Dec).  
  - Tap a month to attach a date and log that month as “completed” for that peak.  
  - A progress bar summarizes completion as **cells filled** instead of peaks.

### 2. Completion Tracking

- **Per-peak date input** in the table (checklist mode)  
  - Uses native `<input type="date">`.  
  - Changing the date:
    - Marks the peak as completed.
    - Saves to `localStorage` (per-user session key).
    - Triggers an optional remote sync (if signed in).

- **Detail panel “Date completed” input**  
  - The Fast Facts card includes an editable date field that stays in sync with the table.  
  - Editing here uses the same `setDateFor()` logic, so the table and sidebar always reflect the current value.

- **Grid mode monthly dates**  
  - Each month chip opens a small date picker.  
  - Saved dates are stored in a **grid record** so the app can derive:
    - Latest date per peak → classic “completed” state
    - Per-month completion for the grid progress bar

### 3. NH48 Data Integration

The app loads additional fields from the **NH48 API dataset** (`nh48.json`):

- `Range / Subrange` → shown as **Location**
- `Prominence (ft)` → converted to meters when the user toggles units
- `Difficulty` → shown as-is (e.g. “Moderate”, “Very Difficult”)
- Optional `photos` array → used for thumbnail & carousel when present

Name matching uses a robust **slug map** that understands:

- `Mount Washington` vs `Washington`
- `South Twin Mountain` vs `South Twin`
- Other “Mount/Mountain” prefix/suffix variations

If the dataset is missing or a field is unknown, the UI falls back to `—` gracefully.

### 4. Image Thumbnails & Detail Carousel

**List view**

- Each peak row includes a **circular profile thumbnail** when at least one image is available.
- Thumbnail source order:
  1. First `photo.url` from `nh48.json` (if present)
  2. First image (thumb or url) from `/_functions/nh48_images?peak=...`
- Hovering a thumbnail shows a **larger preview** near the cursor.

**Detail panel**

- When you click a peak row, the detail panel:
  1. Looks up the peak in `nh48.json`
  2. Builds a photo list:
     - From `data.photos`, or (if empty)
     - From `/_functions/nh48_images?peak=slug`, expecting:
       ```json
       {
         "images": [
           { "url": "...", "thumb": "...", "caption": "..." },
           ...
         ]
       }
       ```
  3. Renders a **carousel** with:
     - Main image
     - Previous / next arrow buttons
     - Horizontal thumbnail strip
     - Dot indicators
     - Auto-advance with pause on hover

If there are no photos at all, the app renders a **generated SVG placeholder** showing the peak’s name.

### 5. Detail Panel “Fast Facts” & Links

The slide-in detail pane shows:

- **Fast facts**
  - Elevation (unit-aware)
  - Date completed (editable)
  - Location (range/subrange)
  - Prominence (unit-aware)
  - Difficulty

- **Weather links**
  - NOAA point forecast
  - Open-Meteo docs
  - MWOBS (Presidentials)  

- **Learn more**
  - Wikipedia search for the peak
  - Peakbagger
  - AllTrails search
  - SummitPost object list (NH)
  - OpenStreetMap

Links currently use generic search queries; they can be tightened later using coordinates and known slug mapping.

### 6. Local Auth & Optional Remote Sync

The app includes a **local-only auth system**:

- Sign up with name, email, and password
- Passwords are salted + SHA-256 hashed and stored in `localStorage` (not a real auth backend)
- A lightweight **Terms & Conditions** box is included in the modal

For signed-in users, it can persist a summary to the `/_functions/peakbagger_progress` endpoint:

- `POST /_functions/peakbagger_progress` with:
  - `email`
  - `list`
  - `grid` (monthly completion structure)
  - `completions` (summary string like `"23/48 peaks completed"`)
  - `updatedAt`

On load, the app attempts to restore any remote record and merge it into local state.

### 7. Preferences & Themes

User preferences are stored in `localStorage` (`pb_prefs_v1`):

- Units (feet/meters)
- Theme (dark / light / forest / sky)
- Row density (comfortable/compact)
- Sticky header (on/off)

The theme system uses CSS custom properties and `.theme-light`, `.theme-forest`, `.theme-sky` classes on `<body>`.

### 8. Mobile & Accessibility

- **Responsive layout**
  - Sidebar and table stack on smaller screens
  - Rows become a two-line card layout on phones
  - Detail panel width becomes full-width on small devices
- **Keyboard support**
  - Arrow keys paginate left/right
  - Focus styles (`:focus-visible`) are present for interactive elements
- **Print view**
  - Hides sidebar, topbar, and detail slides
  - Renders a clean, black-on-white table

---

## Files

- `peakbagger-clean.html`  
  The main web app entry point.

- `index.html`  
  Redirects to `peakbagger-clean.html` for GitHub Pages.

- `CNAME`  
  Contains the custom domain `nh48.app` for GitHub Pages.

---

## Deployment

The app is deployed via **GitHub Pages** with a custom domain:

- **URL**: [https://nh48.app](https://nh48.app)
- **Branch**: `main` (or your deployment branch)
- **Custom Domain**: `nh48.app`

### DNS Configuration

For the custom domain to work, configure your DNS:
- A record pointing to GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
- Or CNAME record pointing to `<username>.github.io`

---

## API Expectations

The app currently expects:

- **Functions base URL**  
  ```js
  const API = (location.hostname.endsWith('nh48pics.com') || location.hostname === 'nh48.app')
    ? '/_functions'
    : 'https://www.nh48pics.com/_functions';

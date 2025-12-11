// Peakbagger's Journal — Application Module
// ES6 Module with async/await support

// =====================================================
// Supabase Client Setup
// =====================================================
const supabaseUrl = 'https://uobvavnsstrgyezcklib.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYnZhdm5zc3RyZ3llemNrbGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEzNTksImV4cCI6MjA4MTA1NzM1OX0.KL32AFytJcOC5RPEPlWlCzBDiA8N_Su9qb0yXT2n2ZI';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

let currentUser = null;

// =====================================================
// NH48 API Integration Constants & Helpers
// =====================================================
const NH48_API_URL = 'https://cdn.jsdelivr.net/gh/natesobol/nh48-api@main/data/nh48.json';

let NH48_DATA = null;
let NH48_SLUG_MAP = {};

async function fetchNh48Data() {
  if (NH48_DATA && Object.keys(NH48_DATA).length > 0) return NH48_DATA;
  try {
    const url = NH48_API_URL + '?t=' + Date.now();  // Cache buster
    const resp = await fetch(url, { mode: 'cors', headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    NH48_DATA = await resp.json();
    console.log('Loaded NH48 data, peaks:', Object.keys(NH48_DATA).length);
    buildSlugMap();
  } catch (e) {
    console.error('Failed to load NH48 data', e);
    NH48_DATA = {};
  }
  return NH48_DATA;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function buildSlugMap() {
  NH48_SLUG_MAP = {};
  if (!NH48_DATA) return;
  Object.entries(NH48_DATA).forEach(([slug, entry]) => {
    const names = [];
    // Try multiple field names for peak names
    if (entry.peakName) names.push(entry.peakName);
    if (entry['Peak Name']) names.push(entry['Peak Name']);
    if (entry.name) names.push(entry.name);
    if (entry['Name']) names.push(entry['Name']);
    // Also add the slug itself as a name variant
    names.push(slug);
    
    names.forEach(n => {
      const key = (n || '').toLowerCase().trim();
      if (!key) return;
      NH48_SLUG_MAP[key] = slug;
      
      // Try variations without 'mount' and 'mountain'
      if (key.startsWith('mount ')) {
        const base = key.replace(/^mount\s+/, '').trim();
        NH48_SLUG_MAP[base] = slug;
      }
      if (key.endsWith(' mountain')) {
        const base2 = key.replace(/\s*mountain$/, '').trim();
        NH48_SLUG_MAP[base2] = slug;
      }
      // Try hyphenated versions
      const hyphenated = key.replace(/\s+/g, '-');
      if (hyphenated !== key) NH48_SLUG_MAP[hyphenated] = slug;
    });
  });
}

function getSlugForName(name) {
  const key = (name || '').toLowerCase().trim();
  return NH48_SLUG_MAP[key] || slugify(name || '');
}

const API = location.hostname.endsWith('nh48pics.com') ? '/_functions' : 'https://www.nh48pics.com/_functions';

// Images API cache
const _imagesCache = new Map();
async function fetchPeakImages(slug) {
  if (_imagesCache.has(slug)) return _imagesCache.get(slug);
  try {
    // Try multiple slug variations
    const slugVariants = [
      slug,
      slug.replace(/^mount-/, ''),  // remove mount- prefix
      slug.replace(/-mountain$/, ''),  // remove -mountain suffix
      slug.replace(/\s+/g, '-'),  // try hyphenated version
      slugify(slug),  // try slugified version
    ].filter((v, i, arr) => arr.indexOf(v) === i);  // deduplicate
    
    let imgs = [];
    for (const variant of slugVariants) {
      try {
        const r = await fetch(API + '/nh48_images?peak=' + encodeURIComponent(variant));
        if (r.ok) {
          const data = await r.json();
          const images = Array.isArray(data?.images) ? data.images : [];
          if (images.length > 0) {
            imgs = images;
            break;  // Found images, stop trying variants
          }
        }
      } catch (e) {
        // Try next variant
      }
    }
    
    _imagesCache.set(slug, imgs);
    return imgs;
  } catch (e) {
    console.error('Failed to load images for', slug, e);
    _imagesCache.set(slug, []);
    return [];
  }
}

// =====================================================
// List & Item Fetching (NH48-API GitHub)
// =====================================================

// Mapping of list names to JSON file names in NH48-API
const LIST_TO_JSON_MAP = {
  'ADK 46': 'ADK46.json',
  'AZ 2020 Peaks': 'AZ2020Peaks.json',
  'CA 14ers': 'CA14ers.json',
  'CO 14': 'CO14.json',
  'Catskill 3500': 'Catskill3500.json',
  'Colorado Centennials': 'ColoradoCentennials.json',
  'ME 4000': 'ME4000.json',
  'Montana 53': 'Montana53.json',
  'NE 115': 'NE115.json',
  'NE 67': 'NE67.json',
  'NH 48': 'nh48.json',
  'NH 200': 'NH200.json',
  'NH 300': 'NH300.json',
  'NH 500': 'NH500.json',
  'NH 52 WAV': 'NH52WAV.json',
  'Southern Sixers': 'SouthernSixers.json',
  'US State Highpoints': 'USStateHighpoints.json',
  'Ultras': 'Ultras.json',
  'VT 4000': 'VT4000.json',
  'WA Bulgers': 'WABulgers.json'
};

const NH48_API_REPO_URL = 'https://cdn.jsdelivr.net/gh/natesobol/nh48-api@main/data';

async function fetchAllLists() {
  try {
    // Load lists from Supabase
    const { data: lists, error } = await supabase
      .from('lists')
      .select('slug, name')
      .order('name');
    
    if (error) throw error;
    
    // Return array of list names (to match existing API)
    return lists.map(l => l.name);
  } catch (e) {
    console.error('Failed to load lists from Supabase:', e);
    // Fallback to static list
    return Object.keys(LIST_TO_JSON_MAP);
  }
}

async function fetchListItems(name) {
  try {
    // First, try to get peaks from Supabase
    const { data: lists } = await supabase
      .from('lists')
      .select('id, slug')
      .eq('name', name)
      .single();
    
    if (lists) {
      // Get peaks for this list via list_peaks join
      const { data: listPeaks, error } = await supabase
        .from('list_peaks')
        .select('rank, peak_id, peaks!inner(*)')
        .eq('list_id', lists.id)
        .order('rank');
      
      if (error) throw error;
      
      if (listPeaks && listPeaks.length > 0) {
        // Transform to match the existing format
        const items = listPeaks.map(lp => {
          const peak = lp.peaks;
          return {
            rank: lp.rank,
            slug: peak.slug,
            name: peak.name,
            elevation_ft: peak.elevation_ft,
            prominence_ft: peak.prominence_ft,
            range: peak.range,
            coords_text: peak.coords_text,
            ...peak.metadata // Spread metadata for optional fields
          };
        });
        
        console.log(`Loaded ${items.length} peaks from Supabase for ${name}`);
        
        // Merge with NH48 API photos data
        await fetchNh48Data();
        items.forEach(item => {
          const slug = getSlugForName(item.name);
          const nh48Data = NH48_DATA?.[slug];
          if (nh48Data) {
            item.photos = nh48Data.photos || [];
            // Also merge any missing fields from NH48 API
            if (!item.range && nh48Data['Range / Subrange']) {
              item.range = nh48Data['Range / Subrange'];
            }
            if (!item.prominence_ft && nh48Data['Prominence (ft)']) {
              item.prominence_ft = nh48Data['Prominence (ft)'];
            }
          }
        });
        
        return items;
      }
    }
  } catch (e) {
    console.warn('Failed to load from Supabase, falling back to static JSON:', e);
  }
  
  // Fallback to the original static JSON approach
  const jsonFileName = LIST_TO_JSON_MAP[name];
  if (!jsonFileName) throw new Error('Unknown list: ' + name);
  
  try {
    const url = `${NH48_API_REPO_URL}/${jsonFileName}?t=` + Date.now();
    console.log('Fetching from:', url);
    const r = await fetch(url, { mode: 'cors', headers: { 'Accept': 'application/json' } });
    console.log('Fetch response status:', r.status, r.statusText);
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    const data = await r.json();
    console.log('Raw data for', name, 'length:', Array.isArray(data) ? data.length : Object.keys(data).length, 'sample:', data);
    
    // Convert object to array (peaks are keyed by slug in the JSON)
    let itemArray;
    if (Array.isArray(data)) {
      itemArray = data.map((peakData, idx) => {
        const normalized = { ...peakData };
        if (!normalized.slug) normalized.slug = normalized.peakname?.toLowerCase().replace(/\s+/g, '-') || `peak-${idx}`;
        if (!normalized.name) {
          normalized.name = normalized.peakName || normalized['Peak Name'] || normalized.peakname || normalized.name || 'Unknown';
        }
        if (!normalized.elevation_ft) {
          normalized.elevation_ft = normalized['Elevation (ft)'] || normalized.elevation || normalized['elevation_ft'];
        }
        if (normalized.elevation_ft && typeof normalized.elevation_ft === 'string') {
          const parsed = parseFloat(normalized.elevation_ft);
          normalized.elevation_ft = isNaN(parsed) ? 0 : parsed;
        } else if (!normalized.elevation_ft) {
          normalized.elevation_ft = 0;
        }
        return normalized;
      });
    } else if (typeof data === 'object' && data !== null) {
      itemArray = Object.entries(data).map(([keySlug, peakData]) => {
        const normalized = { ...peakData };
        if (!normalized.slug) normalized.slug = keySlug;
        if (!normalized.name) {
          normalized.name = normalized.peakName || normalized['Peak Name'] || normalized.peakname || keySlug;
        }
        if (!normalized.elevation_ft) {
          normalized.elevation_ft = normalized['Elevation (ft)'] || normalized.elevation || normalized['elevation_ft'];
        }
        if (normalized.elevation_ft && typeof normalized.elevation_ft === 'string') {
          const parsed = parseFloat(normalized.elevation_ft);
          normalized.elevation_ft = isNaN(parsed) ? 0 : parsed;
        } else if (!normalized.elevation_ft) {
          normalized.elevation_ft = 0;
        }
        return normalized;
      });
    } else {
      throw new Error('Invalid data format: expected object or array');
    }
    
    console.log('Normalized items for', name, ':', itemArray.slice(0, 3));
    itemArray.sort((a, b) => (b.elevation_ft ?? 0) - (a.elevation_ft ?? 0));
    return itemArray.map((p, i) => ({ rank: i + 1, ...p }));
  } catch (e) {
    console.error('Failed to load items for ' + name, e);
    throw new Error('Failed to load items for ' + name);
  }
}

// =====================================================
// DOM Elements (Cache)
// =====================================================
const listSelect = document.getElementById('listSelect');
const rows = document.getElementById('rows');
const bar = document.getElementById('bar');
const progressText = document.getElementById('progressText');
const searchEl = document.getElementById('search');
const sortBtn = document.getElementById('sortBtn');
const sortLabel = document.getElementById('sortLabel');
const showBtn = document.getElementById('showComplete');
const exportBtn = document.getElementById('exportBtn');
const unitToggle = document.getElementById('unitToggle');
const unitLabel = document.getElementById('unitLabel');
const metersToggle = document.getElementById('metersToggle');
const themeSelect = document.getElementById('themeSelect');
const openAuthBtn = document.getElementById('openAuth');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const authName = document.getElementById('authName');
const authEmail = document.getElementById('authEmail');
const authPass = document.getElementById('authPass');
const doSigninBtn = document.getElementById('doSignin');
const doSignupBtn = document.getElementById('doSignup');
const closeAuthBtn = document.getElementById('closeAuth');
const authMsg = document.getElementById('authMsg');
const meNameEl = document.getElementById('meName');
const meEmailEl = document.getElementById('meEmail');
const signedOutBox = document.getElementById('authSignedOut');
const signedInBox = document.getElementById('authSignedIn');
const detail = document.getElementById('detail');
const dTitle = document.getElementById('detailTitle');
const dElev = document.getElementById('detailElev');
const dDate = document.getElementById('detailDateInput');
const dLocation = document.getElementById('detailLocation');
const dProm = document.getElementById('detailProm');
const dDiff = document.getElementById('detailDiff');
const listTitle = document.getElementById('listTitle');
const densityToggle = document.getElementById('densityToggle');
const stickyToggle = document.getElementById('stickyToggle');
const densityLabel = document.getElementById('densityLabel');
const copyrightYear = document.getElementById('copyrightYear');
const tosToggle = document.getElementById('tosToggle');
const tosBox = document.getElementById('tosBox');
const tosAgree = document.getElementById('tosAgree');
const tosTextEl = document.getElementById('tosText');

// Old detail close button (from side panel) - removed in favor of peakDetailBackBtn
// document.getElementById('detailClose').onclick = () => detail.classList.remove('open');

// =====================================================
// Asset URLs
// =====================================================
const CHECKED_IMG = "https://static.wixstatic.com/media/66b1b2_43cfcfcd91f6481694959e1baed6f5cf~mv2.png";
const UNCHECKED_IMG = "https://static.wixstatic.com/media/66b1b2_bf1066c3b19041c29c150fc56658b841~mv2.png";
const TOS_VERSION = '1.0';
const TERMS_TEXT = `<strong>Peakbagger's Journal – Terms & Conditions (v${TOS_VERSION})</strong><br><br>1) Local, offline-first storage. 2) No resale of your data. 3) Outdoor safety is your responsibility. 4) Clearing browser data will remove local progress. 5) Email + hashed password are stored locally for sign-in on this device.`;

// =====================================================
// State Management
// =====================================================
let ALL_LISTS = [];
let currentList = '';
const cache = new Map();
let hideCompleted = false;
let sortMode = 'rank';
let meters = false;
let lastTotalItems = 0;  // Track total items for pagination
let gridMode = 'grid';  // 'grid', 'list', 'compact'
let completionsGrid = {};
let completions = {};

// Local storage keys and utilities (still used for preferences)
const PREF_KEY = 'pb_prefs_v1';

function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
  } catch {
    return {};
  }
}

function writePrefs(p) {
  localStorage.setItem(PREF_KEY, JSON.stringify(p));
  
  // Also save to Supabase if logged in
  if (currentUser) {
    saveUserSettingsToSupabase(p);
  }
}

// Save user settings to Supabase
async function saveUserSettingsToSupabase(prefs) {
  if (!currentUser) return;
  
  try {
    await supabase.from('user_settings').upsert({
      user_id: currentUser.id,
      theme: prefs.theme || 'dark',
      view_mode: gridMode || 'grid',
      grid_enabled: false,
      default_list_id: null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch (e) {
    console.error('Failed to save settings to Supabase:', e);
  }
}

// Load user settings from Supabase
async function loadUserSettingsFromSupabase() {
  if (!currentUser) return null;
  
  try {
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();
    
    return settings;
  } catch (e) {
    console.error('Failed to load settings from Supabase:', e);
    return null;
  }
}

// Load state from Supabase
async function loadStateFromSupabase() {
  if (!currentUser || !currentList) {
    completions = {};
    return;
  }
  
  try {
    // Get the list ID first
    const { data: lists } = await supabase
      .from('lists')
      .select('id')
      .eq('slug', slugify(currentList))
      .single();
    
    if (!lists) {
      completions = {};
      return;
    }
    
    const listId = lists.id;
    
    // Load user progress for this list
    const { data: progressRows } = await supabase
      .from('user_peak_progress')
      .select('peak_id, completed, first_completed_at, last_completed_at, peaks(slug, name)')
      .eq('user_id', currentUser.id)
      .eq('list_id', listId)
      .eq('completed', true);
    
    completions[currentList] = {};
    if (progressRows) {
      progressRows.forEach(row => {
        const peakName = row.peaks?.name || `peak-${row.peak_id}`;
        completions[currentList][peakName] = {
          checked: true,
          date: row.first_completed_at || row.last_completed_at || ''
        };
      });
    }
  } catch (e) {
    console.error('Failed to load state from Supabase:', e);
    completions = {};
  }
}

// Save state to Supabase
async function saveStateToSupabase(peakName, checked, date) {
  if (!currentUser || !currentList) return;
  
  try {
    // Get the list ID
    const { data: lists } = await supabase
      .from('lists')
      .select('id')
      .eq('slug', slugify(currentList))
      .single();
    
    if (!lists) return;
    
    const listId = lists.id;
    
    // Get the peak ID by name
    const { data: peaks } = await supabase
      .from('peaks')
      .select('id')
      .eq('name', peakName)
      .single();
    
    if (!peaks) return;
    
    const peakId = peaks.id;
    
    // Upsert the progress
    await supabase
      .from('user_peak_progress')
      .upsert({
        user_id: currentUser.id,
        list_id: listId,
        peak_id: peakId,
        completed: checked,
        first_completed_at: checked ? (date || new Date().toISOString()) : null,
        last_completed_at: checked ? (date || new Date().toISOString()) : null
      }, { onConflict: 'user_id,list_id,peak_id' });
  } catch (e) {
    console.error('Failed to save state to Supabase:', e);
  }
}

// Load grid from Supabase
async function loadGridFromSupabase() {
  if (!currentUser || !currentList) {
    completionsGrid = {};
    return;
  }
  
  try {
    const { data: lists } = await supabase
      .from('lists')
      .select('id')
      .eq('slug', slugify(currentList))
      .single();
    
    if (!lists) {
      completionsGrid = {};
      return;
    }
    
    const listId = lists.id;
    
    // Load grid cells for this list
    const { data: gridCells } = await supabase
      .from('user_peak_grid_cells')
      .select('peak_id, month, completed_at, peaks(name)')
      .eq('user_id', currentUser.id)
      .eq('list_id', listId);
    
    completionsGrid[currentList] = {};
    if (gridCells) {
      gridCells.forEach(cell => {
        const peakName = cell.peaks?.name || `peak-${cell.peak_id}`;
        if (!completionsGrid[currentList][peakName]) {
          completionsGrid[currentList][peakName] = { "1": "", "2": "", "3": "", "4": "", "5": "", "6": "", "7": "", "8": "", "9": "", "10": "", "11": "", "12": "" };
        }
        completionsGrid[currentList][peakName][String(cell.month)] = cell.completed_at || '';
      });
    }
  } catch (e) {
    console.error('Failed to load grid from Supabase:', e);
    completionsGrid = {};
  }
}

// Save grid to Supabase
async function saveGridToSupabase(peakName, month, date) {
  if (!currentUser || !currentList) return;
  
  try {
    const { data: lists } = await supabase
      .from('lists')
      .select('id')
      .eq('slug', slugify(currentList))
      .single();
    
    if (!lists) return;
    
    const listId = lists.id;
    
    const { data: peaks } = await supabase
      .from('peaks')
      .select('id')
      .eq('name', peakName)
      .single();
    
    if (!peaks) return;
    
    const peakId = peaks.id;
    
    if (date) {
      await supabase
        .from('user_peak_grid_cells')
        .upsert({
          user_id: currentUser.id,
          list_id: listId,
          peak_id: peakId,
          month: parseInt(month),
          completed_at: date
        }, { onConflict: 'user_id,list_id,peak_id,month' });
    } else {
      // Delete the cell if date is empty
      await supabase
        .from('user_peak_grid_cells')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('list_id', listId)
        .eq('peak_id', peakId)
        .eq('month', parseInt(month));
    }
  } catch (e) {
    console.error('Failed to save grid to Supabase:', e);
  }
}

// Backward compatibility - keep localStorage functions for fallback
function loadState() {
  try {
    const raw = localStorage.getItem('peakbagger_web_state_v3_guest');
    completions = raw ? (JSON.parse(raw).completions || {}) : {};
  } catch {
    completions = {};
  }
}

function saveState() {
  // No-op for now - we're using Supabase
}

function loadGrid() {
  try {
    completionsGrid = JSON.parse(localStorage.getItem('peakbagger_web_grid_v1_guest') || '{}');
  } catch {
    completionsGrid = {};
  }
}

function saveGrid() {
  // No-op for now - we're using Supabase
}

// =====================================================
// Grid Mode Helpers
// =====================================================
function ensureGridRecord(list, peak) {
  completionsGrid[list] ??= {};
  completionsGrid[list][peak] ??= { "1": "", "2": "", "3": "", "4": "", "5": "", "6": "", "7": "", "8": "", "9": "", "10": "", "11": "", "12": "" };
  const one = completions[list]?.[peak]?.date || "";
  if (one) {
    const m = new Date(one).getMonth() + 1;
    const k = String(m);
    if (!completionsGrid[list][peak][k]) completionsGrid[list][peak][k] = one;
  }
  return completionsGrid[list][peak];
}

function setGridDate(list, peak, month, dateStr) {
  const rec = ensureGridRecord(list, peak);
  rec[String(month)] = dateStr || "";
  
  // Save to Supabase
  saveGridToSupabase(peak, month, dateStr);
  
  saveGrid();
  // Sync classic mode
  const months = Object.values(rec).filter(Boolean);
  const any = months.length > 0;
  completions[list] ??= {};
  completions[list][peak] ??= { done: false, date: '' };
  completions[list][peak].done = any;
  completions[list][peak].date = any ? months.sort().slice(-1)[0] : '';
  
  // Also save classic mode to Supabase
  saveStateToSupabase(peak, any, completions[list][peak].date);
  
  saveState();
  queueRemoteSave();
}

function monthHasDate(list, peak, month) {
  return !!ensureGridRecord(list, peak)[String(month)];
}

function getMonthDate(list, peak, month) {
  return ensureGridRecord(list, peak)[String(month)] || "";
}

// =====================================================
// Authentication with Supabase
// =====================================================
async function signUp(name, email, pass, opts = {}) {
  email = (email || '').trim().toLowerCase();
  if (!name || !email || !pass) throw new Error('Please enter name, email, and password.');
  if (!opts.tosAgreed) throw new Error('Please agree to the Terms & Conditions.');
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: pass,
    options: {
      data: {
        name: name,
        tosAcceptedAt: new Date().toISOString(),
        tosVersion: TOS_VERSION
      }
    }
  });
  
  if (error) throw new Error(error.message);
  
  // Also create user_settings record with default settings
  if (data.user) {
    await supabase.from('user_settings').upsert({
      user_id: data.user.id,
      theme: 'dark',
      view_mode: 'grid',
      grid_enabled: false,
      default_list_id: null
    }, { onConflict: 'user_id' });
  }
  
  currentUser = data.user;
  return data.user;
}

async function signIn(email, pass) {
  email = (email || '').trim().toLowerCase();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: pass
  });
  
  if (error) throw new Error(error.message);
  currentUser = data.user;
  return data.user;
}

async function signOut() {
  await supabase.auth.signOut();
  currentUser = null;
}

async function getCurrentUserData() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  currentUser = user;
  return user;
}

async function reflectAuthUI() {
  const me = await getCurrentUserData();
  if (me) {
    signedOutBox.style.display = 'none';
    signedInBox.style.display = '';
    meNameEl.textContent = me.user_metadata?.name || me.email;
    meEmailEl.textContent = me.email || '';
  } else {
    signedOutBox.style.display = '';
    signedInBox.style.display = 'none';
    meNameEl.textContent = '';
    meEmailEl.textContent = '';
  }
  
  // Load data from Supabase instead of localStorage
  await loadStateFromSupabase();
  await loadGridFromSupabase();
  renderView();
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  if (event === 'SIGNED_IN') {
    currentUser = session.user;
    reflectAuthUI();
  } else if (event === 'SIGNED_OUT') {
    currentUser = null;
    completions = {};
    completionsGrid = {};
    reflectAuthUI();
  }
});

// =====================================================
// Modal Helpers
// =====================================================
function openModal() {
  authModal.classList.add('open');
  authMsg.textContent = '';
}

function closeModal() {
  authModal.classList.remove('open');
  authName.value = '';
  authEmail.value = '';
  authPass.value = '';
  authMsg.textContent = '';
  tosAgree.checked = false;
  doSignupBtn.disabled = true;
}

// =====================================================
// Detail Panel & Carousel
// =====================================================
function placeholderFor(name, w = 800, h = 420) {
  const bg = encodeURIComponent('#2c2c2c');
  const fg = encodeURIComponent('#ffffff');
  const txt = encodeURIComponent(name || 'No Photo');
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='${bg}'/><g fill='${fg}' font-family='Segoe UI, Roboto, Arial' font-weight='600' font-size='28'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>${txt}</text></g></svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

async function openPeakDetail(it) {
  // Store current item for back button and updates
  window._currentPeakDetail = it;
  
  // Show peak detail page, hide main content
  document.getElementById('peakDetailPage').style.display = 'block';
  document.querySelector('.content').style.display = 'none';
  document.querySelector('.topbar').style.display = 'none';

  // Set title and subtitle
  document.getElementById('peakDetailTitle').textContent = it.name;
  
  const slug = getSlugForName(it.name);
  const data = NH48_DATA?.[slug] || null;

  // Update fast facts
  document.getElementById('peakDetailElev').textContent = fmtElevation(it.elevation_ft ?? null) || '—';
  document.getElementById('peakDetailLocation').textContent = data?.["Range / Subrange"] || data?.Range || '—';
  if (document.getElementById('peakDetailLocation').textContent === '') {
    document.getElementById('peakDetailLocation').textContent = '—';
  }
  
  const promFt = data?.["Prominence (ft)"] || data?.Prominence_ft;
  document.getElementById('peakDetailProm').textContent = promFt ? (meters ? Math.round(promFt * 0.3048) + ' m' : promFt + ' ft') : '—';
  document.getElementById('peakDetailDiff').textContent = data?.Difficulty || '—';
  
  // Set date input
  document.getElementById('peakDetailDateInput').value = completions[currentList]?.[it.name]?.date || '';
  document.getElementById('peakDetailDateInput').onchange = () => {
    const val = document.getElementById('peakDetailDateInput').value;
    if (val) setDateFor(it.name, val);
  };

  // Load and display photos
  const photoContainer = document.getElementById('peakDetailPhotos');
  photoContainer.innerHTML = '';
  let photos = [];

  if (data && Array.isArray(data.photos) && data.photos.length > 0) {
    photos = data.photos.filter(p => p && (p.url || p.image_url));
  } else {
    try {
      const apiImgs = await fetchPeakImages(slug);
      if (apiImgs && apiImgs.length > 0) {
        photos = apiImgs.map(img => ({ url: img.url || img.thumb || img.image_url || '', caption: img.caption || '' })).filter(p => p.url);
      }
    } catch (e) {
      console.error('Failed to load photos:', e);
    }
  }

  if (photos.length > 0) {
    let idx = 0;
    const wrap = document.createElement('div');
    wrap.className = 'carousel-wrap';
    const main = document.createElement('div');
    main.className = 'carousel-main';
    const img = document.createElement('img');
    img.alt = it.name;
    img.src = photos[0].url;
    img.className = 'carousel-main-img';
    img.loading = 'lazy';
    img.onerror = () => { img.src = placeholderFor(it.name, 800, 420); };
    main.appendChild(img);
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-prev';
    prevBtn.textContent = '‹';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-next';
    nextBtn.textContent = '›';
    main.appendChild(prevBtn);
    main.appendChild(nextBtn);

    const thumbs = document.createElement('div');
    thumbs.className = 'carousel-thumbs';
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';

    const makeThumb = (p, i) => {
      const t = document.createElement('img');
      t.className = 'carousel-thumb';
      t.src = p.url;
      t.alt = it.name + ' thumbnail';
      t.dataset.i = String(i);
      t.loading = 'lazy';
      t.onerror = () => { t.src = placeholderFor(it.name, 60, 60); };
      t.addEventListener('click', (e) => { e.stopPropagation(); setIndex(i); });
      return t;
    };

    const setIndex = (n) => {
      idx = ((n % photos.length) + photos.length) % photos.length;
      img.src = photos[idx].url;
      thumbs.querySelectorAll('.carousel-thumb').forEach((el) => el.classList.toggle('active', el.dataset.i == String(idx)));
      indicators.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    };

    photos.forEach((p, i) => {
      thumbs.appendChild(makeThumb(p, i));
      const dot = document.createElement('div');
      dot.className = 'dot';
      indicators.appendChild(dot);
    });

    const AUTOPLAY_MS = 3500;
    const startTimer = () => {
      if (photoContainer._carouselTimer) clearInterval(photoContainer._carouselTimer);
      photoContainer._carouselTimer = setInterval(() => { setIndex(idx + 1); }, AUTOPLAY_MS);
    };
    const stopTimer = () => {
      if (photoContainer._carouselTimer) {
        clearInterval(photoContainer._carouselTimer);
        photoContainer._carouselTimer = null;
      }
    };

    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); setIndex(idx - 1); startTimer(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); setIndex(idx + 1); startTimer(); });
    main.addEventListener('mouseenter', stopTimer);
    main.addEventListener('mouseleave', startTimer);

    wrap.appendChild(main);
    wrap.appendChild(thumbs);
    wrap.appendChild(indicators);
    photoContainer.appendChild(wrap);
    setIndex(0);
    startTimer();
  } else {
    const ph = document.createElement('div');
    ph.style.width = '100%';
    ph.style.borderRadius = '8px';
    ph.style.overflow = 'hidden';
    const pimg = document.createElement('img');
    pimg.alt = it.name;
    pimg.src = placeholderFor(it.name, 800, 420);
    pimg.loading = 'lazy';
    ph.appendChild(pimg);
    photoContainer.appendChild(ph);
  }
}

function closePeakDetail() {
  document.getElementById('peakDetailPage').style.display = 'none';
  document.querySelector('.content').style.display = 'flex';
  document.querySelector('.topbar').style.display = 'block';
}

// =====================================================
// Appearance & Settings
// =====================================================
function fmtElevation(ft) {
  if (!ft) return '';
  return meters ? Math.round(ft * 0.3048) + ' m' : ft + ' ft';
}

function applyUnitsFlag(flag) {
  meters = flag;
  metersToggle.checked = meters;
  unitLabel.textContent = meters ? 'Meters (m)' : 'Feet (ft)';
  renderView();
  const prefs = readPrefs();
  prefs.meters = meters;
  writePrefs(prefs);
}

function applyTheme(theme) {
  document.body.classList.remove('theme-light', 'theme-forest', 'theme-sky');
  if (!theme || theme === 'dark') {
    // dark = default
  } else if (theme === 'light') {
    document.body.classList.add('theme-light');
  } else if (theme === 'forest') {
    document.body.classList.add('theme-forest');
  } else if (theme === 'sky') {
    document.body.classList.add('theme-sky');
  }
  if (themeSelect) themeSelect.value = theme || 'dark';
  const prefs = readPrefs();
  prefs.theme = theme || 'dark';
  writePrefs(prefs);
}

function applyDensity(compact) {
  document.body.classList.toggle('compact-rows', !!compact);
  if (densityToggle) densityToggle.checked = !!compact;
  if (densityLabel) densityLabel.textContent = compact ? 'Compact' : 'Comfortable';
  const p = readPrefs();
  p.compact = !!compact;
  writePrefs(p);
}

function applyStickyHeader(sticky) {
  document.body.classList.toggle('sticky-header', !!sticky);
  if (stickyToggle) stickyToggle.checked = !!sticky;
  const p = readPrefs();
  p.sticky = !!sticky;
  writePrefs(p);
}

// =====================================================
// Remote Persistence
// =====================================================
function summarizeCompletions(list, allItems) {
  const done = allItems.filter(it => completions[list]?.[it.name]?.done).length;
  return `${done}/${allItems.length} peaks completed`;
}

let saveTimer = null;
function queueRemoteSave() {
  // No-op: We're saving directly to Supabase in real-time now
  // This function is kept for backward compatibility
}

async function saveToRemote() {
  // No-op: We're saving directly to Supabase in real-time now
}

async function restoreFromRemote(email, list) {
  // No-op: We're loading from Supabase directly now
  // This function is kept for backward compatibility
}

// =====================================================
// Pagination
// =====================================================
let PAGE = 1;
const PAGE_SIZE = 25;
let TOTAL_PAGES = 1;

const pgStatsTop = document.getElementById('pg-stats-top');
const pgStatsBot = document.getElementById('pg-stats-bot');
const pgListTop = document.getElementById('pg-list-top');
const pgListBot = document.getElementById('pg-list-bot');

function pageBounds(page, size, total) {
  const maxPages = Math.max(1, Math.ceil((total || 0) / size));
  const p = Math.max(1, Math.min(page, maxPages));
  const start = (p - 1) * size;
  const end = Math.min(start + size, total);
  return { p, start, end, maxPages };
}

function updatePager(total, from, to) {
  const { maxPages } = pageBounds(PAGE, PAGE_SIZE, total);
  TOTAL_PAGES = maxPages;

  const label = total ? `Showing ${from}–${to} of ${total}` : 'No results';
  if (pgStatsTop) pgStatsTop.textContent = label;
  if (pgStatsBot) pgStatsBot.textContent = label;

  const buildButtons = (host) => {
    if (!host) return;
    host.innerHTML = '';

    const mk = (txt, disabled, onClick, aria) => {
      const b = document.createElement('button');
      b.className = 'page-btn';
      b.textContent = txt;
      if (disabled) b.disabled = true;
      if (aria) b.setAttribute('aria-label', aria);
      b.addEventListener('click', onClick);
      return b;
    };

    host.appendChild(mk('«', PAGE === 1, () => gotoPage(1), 'First page'));
    host.appendChild(mk('‹', PAGE === 1, () => gotoPage(PAGE - 1), 'Previous page'));

    const windowSize = 7;
    let start = Math.max(1, PAGE - Math.floor(windowSize / 2));
    let end = Math.min(maxPages, start + windowSize - 1);
    start = Math.max(1, Math.min(start, Math.max(1, end - windowSize + 1)));
    for (let i = start; i <= end; i++) {
      const btn = mk(String(i), false, () => gotoPage(i));
      if (i === PAGE) btn.setAttribute('aria-current', 'page');
      host.appendChild(btn);
    }

    host.appendChild(mk('›', PAGE === maxPages, () => gotoPage(PAGE + 1), 'Next page'));
    host.appendChild(mk('»', PAGE === maxPages, () => gotoPage(maxPages), 'Last page'));
  };

  buildButtons(pgListTop);
  buildButtons(pgListBot);
}

function gotoPage(p) {
  const { p: clamped } = pageBounds(p, PAGE_SIZE, lastTotalItems);
  PAGE = clamped;
  renderView();
  try {
    const mainEl = document.querySelector('main.panel');
    const y = mainEl?.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top: y, behavior: 'smooth' });
  } catch (_) {}
}

window.addEventListener('keydown', (e) => {
  if (e.target && (/input|select|textarea/i).test(e.target.tagName)) return;
  if (e.key === 'ArrowRight') { gotoPage(PAGE + 1); }
  if (e.key === 'ArrowLeft') { gotoPage(PAGE - 1); }
});

// =====================================================
// Core Data & Rendering
// =====================================================
async function baseItemsFor(listName) {
  if (!cache.has(listName)) {
    console.log('🔄 Fetching items for:', listName);
    try {
      const items = await fetchListItems(listName);
      console.log('✅ Fetched', items.length, 'items for', listName);
      if (items.length > 0) console.log('   First item:', items[0]);
      cache.set(listName, items);
    } catch (e) {
      console.error('❌ Error fetching items for', listName, e);
      throw e;
    }
  } else {
    console.log('📦 Using cached items for:', listName);
  }
  const result = cache.get(listName);
  console.log('📋 Returning', result ? result.length : 0, 'items for', listName);
  return result;
}

function renderListDropdown() {
  listSelect.innerHTML = '';
  ALL_LISTS.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (name === currentList) opt.selected = true;
    listSelect.appendChild(opt);
  });
}

function setDateFor(peakName, dateStr) {
  completions[currentList] ??= {};
  completions[currentList][peakName] ??= { done: false, date: '' };
  completions[currentList][peakName].date = dateStr;
  if (dateStr && !completions[currentList][peakName].done) {
    completions[currentList][peakName].done = true;
  }
  
  // Save to Supabase
  saveStateToSupabase(peakName, !!dateStr, dateStr);
  
  saveState();
  queueRemoteSave();
  renderTable();
}

function toggleComplete(peakName) {
  completions[currentList] ??= {};
  const rec = completions[currentList][peakName] ??= { done: false, date: '' };
  rec.done = !rec.done;
  if (!rec.done) {
    rec.date = '';
  } else {
    // When marking as complete, auto-set today's date if no date exists
    if (!rec.date) {
      const today = new Date();
      rec.date = today.toISOString().split('T')[0];
    }
  }
  completions[currentList][peakName] = rec;
  
  // Save to Supabase
  saveStateToSupabase(peakName, rec.done, rec.date);
  
  saveState();
  queueRemoteSave();
  playPingSound();
  renderView();
}

function playPingSound() {
  // Create a simple xylophone-like ping using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  
  // Create oscillator for xylophone-like tone
  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Xylophone-like frequency (around F5: 740 Hz)
  osc.frequency.value = 740;
  osc.type = 'sine';
  
  // Sharp attack, quick decay (like xylophone)
  gainNode.gain.setValueAtTime(1, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  
  osc.start(now);
  osc.stop(now + 0.15);
}

function renderProgressBase(allItems) {
  const done = allItems.filter(it => completions[currentList]?.[it.name]?.done).length;
  const total = allItems.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  bar.style.width = pct + '%';
  progressText.textContent = `${done}/${total} • ${pct}%`;
}

/* ======= Render View Router ======= */
async function renderView() {
  const gridView = document.getElementById('grid-view');
  const listView = document.getElementById('list-view');
  
  console.log('🎯 renderView() called, gridMode:', gridMode);
  
  if (gridMode === 'list') {
    gridView.innerHTML = '';
    gridView.style.display = 'none';
    listView.style.display = 'table';
    console.log('   → Rendering as LIST');
    await renderList();
  } else if (gridMode === 'compact') {
    listView.style.display = 'none';
    gridView.style.display = 'grid';
    gridView.classList.add('compact');
    console.log('   → Rendering as COMPACT GRID');
    await renderGrid();
  } else {
    listView.style.display = 'none';
    gridView.style.display = 'grid';
    gridView.classList.remove('compact');
    console.log('   → Rendering as GRID');
    await renderGrid();
  }
}

/* ======= Render List (Table View) ======= */
async function renderList() {
  const listView = document.getElementById('list-view');
  if (!currentList) {
    listView.innerHTML = '';
    console.warn('⚠️ No current list selected');
    return;
  }

  try {
    console.log('🎬 renderList() starting for:', currentList);
    const q = searchEl.value.trim().toLowerCase();
    const baseItems = await baseItemsFor(currentList);
    console.log('👉 Got items from baseItemsFor:', baseItems ? baseItems.length : 0, 'items');
    
    if (!baseItems || baseItems.length === 0) {
      console.warn('⚠️ No items returned for', currentList);
      listView.innerHTML = '<div style="padding:20px;text-align:center">No peaks found</div>';
      return;
    }
    
    const allItems = baseItems.map(it => {
      const c = completions[currentList]?.[it.name] ?? { done: false, date: '' };
      return { ...it, completed: !!c.done, date: c.date || '' };
    });

    // Sort
    allItems.sort((a, b) => {
      if (sortMode === 'name') return a.name.localeCompare(b.name);
    if (sortMode === 'elev') return (b.elevation_ft ?? 0) - (a.elevation_ft ?? 0);
    if (sortMode === 'status') return (b.completed ? 1 : 0) - (a.completed ? 1 : 0) || a.rank - b.rank;
    return a.rank - b.rank;
  });

  // Filter
  let filteredItems = allItems.filter(it => !q || it.name.toLowerCase().includes(q));
  if (hideCompleted) filteredItems = filteredItems.filter(it => !it.completed);

  // Progress
  renderProgressBase(allItems);

  // Pagination
  const total = filteredItems.length;
  lastTotalItems = total;
  const { p, start, end } = pageBounds(PAGE, PAGE_SIZE, total);
  PAGE = p;
  const pageItems = filteredItems.slice(start, end);
  updatePager(total, total ? (start + 1) : 0, end);

  listView.innerHTML = `
    <div class="list-view-header">
      <div class="list-view-header-cell rank">Rank</div>
      <div class="list-view-header-cell name">Name</div>
      <div class="list-view-header-cell elev">Elevation</div>
      <div class="list-view-header-cell range">Range</div>
      <div class="list-view-header-cell date">Date</div>
      <div class="list-view-header-cell completed">Done</div>
    </div>
  `;

  for (const it of pageItems) {
    const elevStr = fmtElevation(it.elevation_ft ?? null) || '—';
    const nhData = NH48_DATA?.[it.slug] || {};
    const rangeStr = (nhData['Range / Subrange'] || '—').replace(/^Range\s*[:\-\s]*/i, '').trim() || '—';

    const row = document.createElement('div');
    row.className = 'list-view-row';
    row.innerHTML = `
      <div class="list-view-cell rank">${it.rank}</div>
      <div class="list-view-cell name" style="cursor:pointer;text-decoration:underline;color:var(--accent)">${it.name}</div>
      <div class="list-view-cell elev">${elevStr}</div>
      <div class="list-view-cell range">${rangeStr}</div>
      <div class="list-view-cell date"><input type="date" class="list-date-input" value="${it.date || ''}" data-name="${it.name}" /></div>
      <div class="list-view-cell completed"><img class="list-check" alt="completed" src="${it.completed ? CHECKED_IMG : UNCHECKED_IMG}" loading="lazy" /></div>
    `;

    // Event handlers
    row.querySelector('.name')?.addEventListener('click', () => openPeakDetail(it));
    const dateInput = row.querySelector('.list-date-input');
    dateInput?.addEventListener('click', e => e.stopPropagation());
    dateInput?.addEventListener('change', () => {
      if (dateInput.value) setDateFor(it.name, dateInput.value);
    });
    row.querySelector('.list-check')?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleComplete(it.name);
    });

    listView.appendChild(row);
  }
  } catch (e) {
    console.error('Error rendering list:', e);
    listView.innerHTML = '<div style="padding:20px;text-align:center;color:red">Error loading list: ' + e.message + '</div>';
  }
}

/* ======= Render Grid (Cards View) ======= */
async function renderGrid() {
  const gridView = document.getElementById('grid-view');
  if (!currentList) {
    gridView.innerHTML = '';
    console.warn('⚠️ No current list for grid');
    return;
  }

  try {
    console.log('🎬 renderGrid() starting for:', currentList);
    const q = searchEl.value.trim().toLowerCase();
    const baseItems = await baseItemsFor(currentList);
    console.log('👉 Got items from baseItemsFor:', baseItems ? baseItems.length : 0, 'items');
    
    if (!baseItems || baseItems.length === 0) {
      console.warn('⚠️ No items to render for', currentList);
      gridView.innerHTML = '<div style="padding:20px;text-align:center">No peaks found</div>';
      return;
    }
    
    const allItems = baseItems.map(it => {
      const c = completions[currentList]?.[it.name] ?? { done: false, date: '' };
      return { ...it, completed: !!c.done, date: c.date || '' };
    });

  // Sort
  allItems.sort((a, b) => {
    if (sortMode === 'name') return a.name.localeCompare(b.name);
    if (sortMode === 'elev') return (b.elevation_ft ?? 0) - (a.elevation_ft ?? 0);
    if (sortMode === 'status') return (b.completed ? 1 : 0) - (a.completed ? 1 : 0) || a.rank - b.rank;
    return a.rank - b.rank;
  });

  // Filter
  let filteredItems = allItems.filter(it => !q || it.name.toLowerCase().includes(q));
  if (hideCompleted) filteredItems = filteredItems.filter(it => !it.completed);

  // Progress
  renderProgressBase(allItems);

  // Pagination
  const total = filteredItems.length;
  lastTotalItems = total;  // Store for gotoPage pagination calculations
  const { p, start, end } = pageBounds(PAGE, PAGE_SIZE, total);
  PAGE = p;
  const pageItems = filteredItems.slice(start, end);
  updatePager(total, total ? (start + 1) : 0, end);

  gridView.innerHTML = '';
  for (const it of pageItems) {
    const card = document.createElement('article');
    card.className = 'peak-card';

    // Get peak image
    const slug = getSlugForName(it.name);
    let imgSrc = '';
    const photoData = NH48_DATA?.[slug]?.photos;
    const listHasImages = currentList && currentList.toLowerCase() === 'nh 48';
    if (listHasImages && photoData && photoData.length > 0 && photoData[0].url) {
      imgSrc = photoData[0].url;
    } else if (listHasImages) {
      const apiImgs = await fetchPeakImages(slug);
      if (apiImgs.length > 0) {
        imgSrc = apiImgs[0].thumb || apiImgs[0].url || '';
      }
    }

    const elevStr = fmtElevation(it.elevation_ft ?? null) || '—';
    const nhData = NH48_DATA?.[slug] || {};
    const promStr = nhData['Prominence (ft)'] ? fmtElevation(nhData['Prominence (ft)']) : '—';
    const rangeStr = (nhData['Range / Subrange'] || '—').replace(/^Range\s*[:\-\s]*/i, '').trim() || '—';
    const trailStr = nhData['Trail Type'] || '—';
    const diffStr = nhData['Difficulty'] || '—';
    const expStr = nhData['Exposure Level'] || nhData['Weather Exposure Rating'] || '—';

    card.innerHTML = `
      <div class="peak-card-thumb">
        ${imgSrc ? `<img src="${imgSrc}" alt="${it.name}" loading="lazy" decoding="async">` : `<img src="${placeholderFor(it.name, 800, 480)}" alt="${it.name}" loading="lazy">`}
      </div>
      <div class="peak-card-body ${it.completed ? 'completed' : ''}">
        <h3>${it.name}</h3>
        <div class="peak-card-meta">
          <div class="peak-card-meta-row">
            <span class="peak-card-meta-label">Rank</span>
            <span class="peak-card-meta-value">${it.rank}</span>
          </div>
          <div class="peak-card-meta-row">
            <span class="peak-card-meta-label">Elevation</span>
            <span class="peak-card-meta-value">${elevStr}</span>
          </div>
          <div class="peak-card-meta-row">
            <span class="peak-card-meta-label">Range</span>
            <span class="peak-card-meta-value">${rangeStr}</span>
          </div>
          <div class="peak-card-meta-row">
            <span class="peak-card-meta-label">Date</span>
            <span class="peak-card-meta-value"><input type="date" class="card-date-input" value="${it.date || ''}" data-name="${it.name}" placeholder="mm/dd/yyyy" style="background:var(--input-bg);border:1px solid var(--border);border-radius:6px;padding:4px 8px;color:var(--ink);font-size:0.85rem;width:100%;min-width:120px;box-sizing:border-box;"></span>
          </div>
          <div class="peak-card-meta-row">
            <span class="peak-card-meta-label">Completed</span>
            <span class="peak-card-meta-value"><img class="check card-check" alt="completed" src="${it.completed ? CHECKED_IMG : UNCHECKED_IMG}" loading="lazy" style="width:20px;height:20px;cursor:pointer;"></span>
          </div>
        </div>
      </div>
    `;

    // Event handlers
    card.addEventListener('click', () => openPeakDetail(it));
    const dateInput = card.querySelector('.card-date-input');
    dateInput?.addEventListener('click', e => e.stopPropagation());
    dateInput?.addEventListener('change', () => {
      if (dateInput.value) setDateFor(it.name, dateInput.value);
    });
    card.querySelector('.card-check')?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleComplete(it.name);
    });

    gridView.appendChild(card);
  }
  } catch (e) {
    console.error('Error rendering grid:', e);
    gridView.innerHTML = '<div style="padding:20px;text-align:center;color:red">Error loading grid: ' + e.message + '</div>';
  }
}

async function renderTable() {
  if (!currentList) {
    rows.innerHTML = '';
    return;
  }
  const q = searchEl.value.trim().toLowerCase();

  const allItems = (await baseItemsFor(currentList)).map(it => {
    const c = completions[currentList]?.[it.name] ?? { done: false, date: '' };
    return { ...it, completed: !!c.done, date: c.date || '' };
  });

  // Sort
  allItems.sort((a, b) => {
    if (sortMode === 'name') return a.name.localeCompare(b.name);
    if (sortMode === 'elev') return (b.elevation_ft ?? 0) - (a.elevation_ft ?? 0);
    if (sortMode === 'status') return (b.completed ? 1 : 0) - (a.completed ? 1 : 0) || a.rank - b.rank;
    return a.rank - b.rank;
  });

  // Filter
  let items = allItems.filter(it => !q || it.name.toLowerCase().includes(q));
  if (hideCompleted) items = items.filter(it => !it.completed);

  // Progress
  renderProgressBase(allItems);

  // Grid progress override
  if (gridMode) {
    let totalCells = items.length * 12;
    let filled = 0;
    items.forEach(it => {
      const rec = ensureGridRecord(currentList, it.name);
      filled += Object.values(rec).filter(Boolean).length;
    });
    const pct = totalCells ? Math.round(filled / totalCells * 100) : 0;
    bar.style.width = pct + '%';
    progressText.textContent = `${filled}/${totalCells} • ${pct}%`;
  }

  // Pagination
  const total = items.length;
  const { p, start, end } = pageBounds(PAGE, PAGE_SIZE, total);
  PAGE = p;
  rows.dataset.total = String(total);
  const pageItems = items.slice(start, end);
  updatePager(total, total ? (start + 1) : 0, end);

  // Rows
  rows.innerHTML = '';
  for (const it of pageItems) {
    ensureGridRecord(currentList, it.name);
    const tr = document.createElement('tr');

    // Profile image
    const slug = getSlugForName(it.name);
    let imgHtml = '';
    let profileUrl = '';
    const photoData = NH48_DATA?.[slug]?.photos;
    const listHasImages = currentList && currentList.toLowerCase() === 'nh 48';
    if (listHasImages && photoData && photoData.length > 0 && photoData[0].url) {
      profileUrl = photoData[0].url;
    } else if (listHasImages) {
      const apiImgs = await fetchPeakImages(slug);
      if (apiImgs.length > 0) {
        profileUrl = apiImgs[0].thumb || apiImgs[0].url || '';
      }
    }
    if (profileUrl) {
      imgHtml = `<img src="${profileUrl}" alt="${it.name}" class="profile-img" loading="lazy" />`;
    }

    const isMobile = window.innerWidth <= 700;
    if (imgHtml) {
      if (isMobile) {
        const picCell = document.createElement('td');
        picCell.setAttribute('data-cell', 'pic');
        picCell.innerHTML = imgHtml;
        tr.appendChild(picCell);
      } else {
        const photo = document.createElement('div');
        photo.className = 'row-photo';
        photo.innerHTML = imgHtml;
        tr.appendChild(photo);
      }
    }

    if (!gridMode) {
      // Checklist mode
      tr.innerHTML += `
        <td class="stat" data-cell="rank"><span class="cell-value">${it.rank}</span></td>
        <td data-cell="name" style="text-align:center; vertical-align:middle;">
          <span class="mountain-link" style="cursor:pointer; display:inline-flex; align-items:center; max-width:100%;">${it.name}</span>
        </td>
        <td class="stat" data-cell="elev"><span class="cell-value">${fmtElevation(it.elevation_ft ?? null)}</span></td>
        <td data-cell="date">
          <input type="date" class="date-input" required value="${it.date || ''}" data-name="${it.name}">
        </td>
        <td class="stat" data-cell="done">
          <img class="check js-check" alt="completed" src="${it.completed ? CHECKED_IMG : UNCHECKED_IMG}" loading="lazy" />
        </td>
        <td data-cell="open">›</td>
      `;
    } else {
      // Grid mode
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const chips = monthLabels.map((lbl, idx) => {
        const m = idx + 1;
        const done = monthHasDate(currentList, it.name, m);
        const dot = done ? '<span class="dot"></span>' : '';
        return `<button class="month-chip ${done ? 'done' : ''}" data-m="${m}" title="${lbl}">${lbl}${dot}</button>`;
      }).join('');

      tr.innerHTML += `
        <td class="stat" data-cell="rank">${it.rank}</td>
        <td data-cell="name" style="text-align:center; vertical-align:middle;">
          <span class="mountain-link" style="cursor:pointer; display:inline-flex; align-items:center; max-width:100%;">${it.name}</span>
        </td>
        <td class="stat" data-cell="elev">${fmtElevation(it.elevation_ft ?? null)}</td>
        <td data-cell="months" colspan="2">
          <div class="grid-hint">Tap a month to add/edit a date.</div>
          <div class="month-strip">${chips}</div>
          <div class="month-picker">
            <input type="date" class="grid-date" value="" />
            <button class="btn btn-small btn-primary grid-save">Save</button>
            <button class="btn btn-small btn-ghost grid-clear">Clear</button>
          </div>
        </td>
        <td data-cell="open">›</td>
      `;
    }

    if (it.completed) {
      tr.classList.add('completed');
    }

    tr.querySelector('[data-cell="name"]')?.addEventListener('click', () => openPeakDetail(it));
    tr.querySelector('[data-cell="open"]')?.addEventListener('click', () => openPeakDetail(it));

    if (!gridMode) {
      const dateInput = tr.querySelector('.date-input');
      dateInput?.addEventListener('click', e => e.stopPropagation());
      dateInput?.addEventListener('change', () => {
        if (dateInput.value) setDateFor(it.name, dateInput.value);
      });
      tr.querySelector('.js-check')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleComplete(it.name);
      });
    } else {
      const picker = tr.querySelector('.month-picker');
      const dateEl = tr.querySelector('.grid-date');
      let activeMonth = 0;
      tr.querySelectorAll('.month-chip').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          activeMonth = parseInt(btn.dataset.m, 10);
          dateEl.value = getMonthDate(currentList, it.name, activeMonth);
          picker.classList.add('open');
          dateEl.focus();
        });
      });
      tr.querySelector('.grid-save')?.addEventListener('click', e => {
        e.stopPropagation();
        setGridDate(currentList, it.name, activeMonth, dateEl.value);
        renderView();
      });
      tr.querySelector('.grid-clear')?.addEventListener('click', e => {
        e.stopPropagation();
        setGridDate(currentList, it.name, activeMonth, '');
        renderView();
      });
    }

    rows.appendChild(tr);
  }

  // Image preview hover handlers
  rows.querySelectorAll('.profile-img').forEach(img => {
    let previewEl = null;
    const makePreview = () => {
      if (previewEl) return previewEl;
      previewEl = document.createElement('div');
      previewEl.className = 'img-preview';
      const big = document.createElement('img');
      big.alt = img.alt || '';
      big.src = img.src || placeholderFor(img.alt || '');
      big.loading = 'lazy';
      previewEl.appendChild(big);
      document.body.appendChild(previewEl);
      return previewEl;
    };
    const movePreview = (e) => {
      const rect = img.getBoundingClientRect();
      const px = rect.right + 10;
      const py = Math.max(8, rect.top + window.scrollY - 8);
      const el = previewEl;
      if (el) {
        el.style.left = px + 'px';
        el.style.top = (rect.top + window.scrollY) + 'px';
      }
    };
    img.addEventListener('mouseenter', (e) => {
      makePreview();
      previewEl.style.display = 'block';
      movePreview(e);
    });
    img.addEventListener('mousemove', (e) => { if (previewEl) movePreview(e); });
    img.addEventListener('mouseleave', () => {
      if (previewEl) {
        previewEl.remove();
        previewEl = null;
      }
    });
  });
}

// =====================================================
// List Switching
// =====================================================
async function changeList(name) {
  currentList = name;
  PAGE = 1;
  if (listTitle) listTitle.textContent = currentList || '—';
  console.log('📌 changeList() called with:', name);
  try {
    await renderView();
    console.log('✅ List rendered successfully');
  } catch (e) {
    console.error('❌ Error rendering list:', e);
  }
  // Load data from Supabase for the new list
  if (currentUser) {
    await loadStateFromSupabase();
    await loadGridFromSupabase();
  }
}

// =====================================================
// Event Handlers
// =====================================================
listSelect.onchange = async () => { await changeList(listSelect.value); };
searchEl.oninput = () => { PAGE = 1; renderView(); };

// Sync mobile search with desktop search
const mobileSearch = document.getElementById('mobileSearch');
if (mobileSearch) {
  mobileSearch.oninput = () => { searchEl.value = mobileSearch.value; PAGE = 1; renderView(); };
  searchEl.addEventListener('input', () => { mobileSearch.value = searchEl.value; });
}

sortBtn.onclick = () => {
  const modes = ['rank', 'name', 'elev', 'status'];
  const idx = (modes.indexOf(sortMode) + 1) % modes.length;
  sortMode = modes[idx];
  sortLabel.textContent = (sortMode === 'elev' ? 'Elevation' : sortMode === 'status' ? 'Status' : sortMode[0].toUpperCase() + sortMode.slice(1));
  PAGE = 1;
  renderView();
};
showBtn.onclick = () => {
  hideCompleted = !hideCompleted;
  showBtn.innerHTML = hideCompleted ? '<span class="ico">◎</span> <span>Show completed</span>' : '<span class="ico">◯</span> <span>Hide completed</span>';
  PAGE = 1;
  renderView();
};
exportBtn.onclick = async () => {
  const base = await baseItemsFor(currentList);
  const items = base.map((it, i) => {
    const c = completions[currentList]?.[it.name] ?? { done: false, date: '' };
    return [i + 1, it.name, fmtElevation(it.elevation_ft ?? null), c.date || '', c.done ? 'Yes' : 'No'];
  });
  const ws = XLSX.utils.aoa_to_sheet([['Rank', 'Mountain', 'Elevation', 'Date', 'Completed'], ...items]);
  ws['!cols'] = [{ wch: 6 }, { wch: 26 }, { wch: 14 }, { wch: 12 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, currentList.slice(0, 31));
  XLSX.writeFile(wb, `${currentList.replace(/\s+/g, '_')}.xlsx`);
};

unitToggle.onclick = () => applyUnitsFlag(!meters);
metersToggle.onchange = () => applyUnitsFlag(metersToggle.checked);
if (themeSelect) themeSelect.onchange = () => applyTheme(themeSelect.value);

densityToggle.onchange = () => applyDensity(densityToggle.checked);
stickyToggle.onchange = () => applyStickyHeader(stickyToggle.checked);

tosTextEl.innerHTML = TERMS_TEXT;
tosToggle.onclick = () => {
  tosBox.classList.toggle('open');
  tosToggle.textContent = tosBox.classList.contains('open') ? '📄 Hide Terms & Conditions' : '📄 View Terms & Conditions';
};
tosAgree.addEventListener('change', () => { doSignupBtn.disabled = !tosAgree.checked; });

const modeBtn = document.getElementById('modeBtn');
const modeLabel = document.getElementById('modeLabel');
if (modeLabel) modeLabel.textContent = 'Grid';  // Initialize to Grid
modeBtn.onclick = () => {
  const isMobile = window.innerWidth < 960;
  const modes = isMobile ? ['grid'] : ['grid', 'list', 'compact'];
  const currentIdx = modes.indexOf(gridMode);
  const nextIdx = (currentIdx + 1) % modes.length;
  gridMode = modes[nextIdx];
  
  const modeLabels = { grid: 'Grid', list: 'List', compact: 'Compact' };
  modeLabel.textContent = modeLabels[gridMode];
  PAGE = 1;
  renderView();
};

// Peak detail page back button
const peakDetailBackBtn = document.getElementById('peakDetailBackBtn');
if (peakDetailBackBtn) {
  peakDetailBackBtn.onclick = () => closePeakDetail();
}

// Intro panel toggle logic
const introPanelDetails = document.getElementById('introPanelDetails');
const introPanelToggle = document.getElementById('introPanelToggle');
if (introPanelDetails) {
  // Load saved state from localStorage
  function getIntroPanelState() {
    const sessionData = localStorage.getItem('pb_session_v1');
    if (!sessionData) return false;
    try {
      const session = JSON.parse(sessionData);
      return session.introPanelOpen || false;
    } catch (e) {
      return false;
    }
  }

  function saveIntroPanelState(isOpen) {
    const sessionData = localStorage.getItem('pb_session_v1');
    const session = sessionData ? JSON.parse(sessionData) : {};
    session.introPanelOpen = isOpen;
    localStorage.setItem('pb_session_v1', JSON.stringify(session));
  }

  // Initialize the panel state
  introPanelDetails.open = getIntroPanelState();
  updateIntroPanelToggle();

  function updateIntroPanelToggle() {
    if (introPanelToggle) {
      introPanelToggle.textContent = introPanelDetails.open ? '▲' : '▼';
    }
  }

  // Handle toggle
  introPanelDetails.addEventListener('toggle', () => {
    saveIntroPanelState(introPanelDetails.open);
    updateIntroPanelToggle();
  });
}

if (openAuthBtn) openAuthBtn.onclick = () => openModal();
if (closeAuthBtn) closeAuthBtn.onclick = () => closeModal();
if (logoutBtn) logoutBtn.onclick = () => { signOut(); reflectAuthUI(); };
if (doSigninBtn) doSigninBtn.onclick = async () => {
  authMsg.textContent = '';
  try {
    await signIn(authEmail.value, authPass.value);
    authMsg.textContent = 'Success!';
    authMsg.className = 'ok';
    closeModal();
    reflectAuthUI();
  } catch (e) {
    authMsg.textContent = e.message || 'Failed to sign in';
    authMsg.className = 'err';
  }
};
if (doSignupBtn) doSignupBtn.onclick = async () => {
  authMsg.textContent = '';
  try {
    await signUp(authName.value, authEmail.value, authPass.value, { tosAgreed: tosAgree.checked });
    authMsg.textContent = 'Account created & signed in!';
    authMsg.className = 'ok';
    closeModal();
    reflectAuthUI();
  } catch (e) {
    authMsg.textContent = e.message || 'Failed to create account';
    authMsg.className = 'err';
  }
};

// =====================================================
// Boot Sequence
// =====================================================
(async function boot() {
  try {
    const prefs = readPrefs();
    applyTheme(prefs.theme || 'dark');
    applyUnitsFlag(!!prefs.meters);
    applyDensity(!!prefs.compact);
    applyStickyHeader(!!prefs.sticky);

    if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

    // Initialize auth state
    await getCurrentUserData();
    await reflectAuthUI();
    
    await loadGridFromSupabase();
    ALL_LISTS = await fetchAllLists();
    const preferred = 'NH 48';
    currentList = ALL_LISTS.includes(preferred) ? preferred : (ALL_LISTS[0] || '');
    renderListDropdown();
    if (listTitle) listTitle.textContent = currentList || '—';
    await fetchNh48Data();
    await changeList(currentList);
  } catch (e) {
    console.error(e);
    rows.innerHTML = `<tr><td colspan="6" class="subtle">Couldn't load data. Please check your connection.</td></tr>`;
  }
})();

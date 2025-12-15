// Peakbagger's Journal — Application Module
// ES6 Module with async/await support

// =====================================================
// Supabase Client Setup
// =====================================================
const supabaseUrl = 'https://uobvavnsstrgyezcklib.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYnZhdm5zc3RyZ3llemNrbGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEzNTksImV4cCI6MjA4MTA1NzM1OX0.KL32AFytJcOC5RPEPlWlCzBDiA8N_Su9qb0yXT2n2ZI';

// Check if Supabase is loaded
if (!window.supabase) {
  console.error('Supabase client library not loaded!');
}

// Create Supabase client with persistent session storage
const supabase = window.supabase?.createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Keep user logged in across browser sessions
    autoRefreshToken: true, // Automatically refresh the token before it expires
    detectSessionInUrl: true, // Detect session from URL (for OAuth)
    storage: window.localStorage // Use localStorage for session persistence
  }
});

let currentUser = null;

// =====================================================
// Translation System
// =====================================================
let currentLanguage = 'en';

const translations = {
  en: {
    // Progress & stats
    'peaks completed': 'peaks completed',
    'Showing': 'Showing',
    'of': 'of',
    'No results': 'No results',
    
    // Filters & controls
    'Search peaks...': 'Search peaks...',
    'Sort': 'Sort',
    'Mode': 'Mode',
    'Export XLSX': 'Export XLSX',
    'All Peaks': 'All Peaks',
    'Hide completed': 'Hide completed',
    'Advanced Filters': 'Advanced Filters',
    
    // Sort options
    'Rank': 'Rank',
    'Name': 'Name',
    'Elevation': 'Elevation',
    'Status': 'Status',
    
    // View modes
    'Grid': 'Grid',
    'List': 'List',
    'Compact': 'Compact',
    
    // Status filters
    'All': 'All',
    'Completed': 'Completed',
    'Favorites': 'Favorites',
    'Wishlist': 'Wishlist',
    'Incomplete': 'Incomplete',
    
    // Table headers
    'Name': 'Name',
    'Date': 'Date',
    'Done': 'Done',
    'Range': 'Range',
    
    // Peak detail
    'Prominence': 'Prominence',
    'Trail Type': 'Trail Type',
    'Difficulty': 'Difficulty',
    'Exposure': 'Exposure',
    'Coordinates': 'Coordinates',
    'Add to Favorites': 'Add to Favorites',
    'Remove from Favorites': 'Remove from Favorites',
    'Add to Wishlist': 'Add to Wishlist',
    'Remove from Wishlist': 'Remove from Wishlist',
    'Fast facts': 'Fast facts',
    'Weather': 'Weather',
    'Learn more': 'Learn more',
    '← Back to Peakbagger': '← Back to Peakbagger',
    'Quick facts, weather & helpful links.': 'Quick facts, weather & helpful links.',
    'Date completed': 'Date completed',
    'Location': 'Location',
    'Monthly Completions': 'Monthly Completions',
    'Forecast links open in a new tab. NOAA point forecasts work best near the summit.': 'Forecast links open in a new tab. NOAA point forecasts work best near the summit.',
    'Favorite': 'Favorite',
    
    // Sidebar & misc
    'About Peakbagger': 'About Peakbagger',
    'Choose List': 'Choose List',
    'Search': 'Search',
    'Resources': 'Resources',
    'Clear All Filters': 'Clear All Filters',
    'Filters': 'Filters',
    'Close': 'Close',
    
    // Auth
    'Log in to access your peak tracking data.': 'Log in to access your peak tracking data.',
    'Email *': 'Email *',
    'Password *': 'Password *',
    'Stay signed in': 'Stay signed in',
    'Don\'t have an account?': 'Don\'t have an account?',
    'Create account': 'Create account',
    'Create your account to start tracking peaks.': 'Create your account to start tracking peaks.',
    'First Name *': 'First Name *',
    'Last Name': 'Last Name',
    'Confirm Password *': 'Confirm Password *',
    '📄 View Terms & Conditions': '📄 View Terms & Conditions',
    'I agree to the Terms & Conditions *': 'I agree to the Terms & Conditions *',
    'you@email.com': 'you@email.com',
    'John': 'John',
    'Doe': 'Doe',
    '••••••••': '••••••••',
    
    // Settings
    'Settings': 'Settings',
    'Units: Meters': 'Units: Meters',
    'Row density': 'Row density',
    'Comfortable': 'Comfortable',
    'Compact': 'Compact',
    'Sticky header': 'Sticky header',
    'Grid tracking (12 months/peak)': 'Grid tracking (12 months/peak)',
    'Card Color Legend': 'Card Color Legend',
    'Language': 'Language',
    
    // Themes
    'Themes': 'Themes',
    'Choose theme': 'Choose theme',
    'Dark (default)': 'Dark (default)',
    'Light (white & black)': 'Light (white & black)',
    'Forest Green': 'Forest Green',
    'Sky Blue': 'Sky Blue',
    
    // Auth
    'You\'re not signed in': 'You\'re not signed in',
    'Sign in to save your progress': 'Sign in to save your progress',
    'Log in': 'Log in',
    'Log out': 'Log out',
    'Signed in as': 'Signed in as',
    
    // Month abbreviations
    'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Apr', 'May': 'May', 'Jun': 'Jun',
    'Jul': 'Jul', 'Aug': 'Aug', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dec',
    
    // Errors
    'Error loading peak details': 'Error loading peak details. Please try again.',
    'Error loading list': 'Error loading list',
    'Error loading table': 'Error loading table',
    'Couldn\'t load data': 'Couldn\'t load data. Please check your connection.',
    
    // Export
    'peakbagger-export': 'peakbagger-export'
  },
  es: {
    'peaks completed': 'picos completados',
    'Showing': 'Mostrando',
    'of': 'de',
    'No results': 'Sin resultados',
    
    'Search peaks...': 'Buscar picos...',
    'Sort': 'Ordenar',
    'Mode': 'Modo',
    'Export XLSX': 'Exportar XLSX',
    'All Peaks': 'Todos los Picos',
    'Hide completed': 'Ocultar completados',
    'Advanced Filters': 'Filtros Avanzados',
    
    'Rank': 'Rango',
    'Name': 'Nombre',
    'Elevation': 'Elevación',
    'Status': 'Estado',
    
    'Grid': 'Cuadrícula',
    'List': 'Lista',
    'Compact': 'Compacto',
    
    'All': 'Todos',
    'Completed': 'Completado',
    'Favorites': 'Favoritos',
    'Wishlist': 'Lista de Deseos',
    'Incomplete': 'Incompleto',
    
    'Date': 'Fecha',
    'Done': 'Hecho',
    'Range': 'Cordillera',
    
    'Prominence': 'Prominencia',
    'Trail Type': 'Tipo de Sendero',
    'Difficulty': 'Dificultad',
    'Exposure': 'Exposición',
    'Coordinates': 'Coordenadas',
    'Add to Favorites': 'Añadir a Favoritos',
    'Remove from Favorites': 'Quitar de Favoritos',
    'Add to Wishlist': 'Añadir a Lista de Deseos',
    'Remove from Wishlist': 'Quitar de Lista de Deseos',
    'Fast facts': 'Datos rápidos',
    'Weather': 'Clima',
    'Learn more': 'Aprende más',
    '← Back to Peakbagger': '← Volver a Peakbagger',
    'Quick facts, weather & helpful links.': 'Datos rápidos, clima y enlaces útiles.',
    'Date completed': 'Fecha completada',
    'Location': 'Ubicación',
    'Monthly Completions': 'Completaciones mensuales',
    'Forecast links open in a new tab. NOAA point forecasts work best near the summit.': 'Los enlaces de pronóstico se abren en una nueva pestaña. Los pronósticos puntuales de NOAA funcionan mejor cerca de la cumbre.',
    'Favorite': 'Favorito',
    
    'About Peakbagger': 'Acerca de Peakbagger',
    'Choose List': 'Elegir Lista',
    'Search': 'Buscar',
    'Resources': 'Recursos',
    'Clear All Filters': 'Borrar Todos los Filtros',
    'Filters': 'Filtros',
    'Close': 'Cerrar',
    
    'Log in to access your peak tracking data.': 'Inicia sesión para acceder a tus datos de seguimiento de picos.',
    'Email *': 'Correo electrónico *',
    'Password *': 'Contraseña *',
    'Stay signed in': 'Mantener sesión iniciada',
    'Don\'t have an account?': '¿No tienes una cuenta?',
    'Create account': 'Crear cuenta',
    'Create your account to start tracking peaks.': 'Crea tu cuenta para comenzar a rastrear picos.',
    'First Name *': 'Nombre *',
    'Last Name': 'Apellido',
    'Confirm Password *': 'Confirmar Contraseña *',
    '📄 View Terms & Conditions': '📄 Ver Términos y Condiciones',
    'I agree to the Terms & Conditions *': 'Acepto los Términos y Condiciones *',
    'you@email.com': 'tu@email.com',
    'John': 'Juan',
    'Doe': 'Pérez',
    '••••••••': '••••••••',
    
    'Settings': 'Configuración',
    'Units: Meters': 'Unidades: Metros',
    'Row density': 'Densidad de filas',
    'Comfortable': 'Cómodo',
    'Sticky header': 'Encabezado fijo',
    'Grid tracking (12 months/peak)': 'Seguimiento de cuadrícula (12 meses/pico)',
    'Card Color Legend': 'Leyenda de Colores',
    'Language': 'Idioma',
    
    'Themes': 'Temas',
    'Choose theme': 'Elegir tema',
    'Dark (default)': 'Oscuro (predeterminado)',
    'Light (white & black)': 'Claro (blanco y negro)',
    'Forest Green': 'Verde Bosque',
    'Sky Blue': 'Azul Cielo',
    
    'You\'re not signed in': 'No has iniciado sesión',
    'Sign in to save your progress': 'Inicia sesión para guardar tu progreso',
    'Log in': 'Iniciar sesión',
    'Log out': 'Cerrar sesión',
    'Signed in as': 'Conectado como',
    
    // Month abbreviations
    'Jan': 'Ene', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Abr', 'May': 'May', 'Jun': 'Jun',
    'Jul': 'Jul', 'Aug': 'Ago', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dic',
    
    'Error loading peak details': 'Error al cargar detalles del pico. Por favor, inténtalo de nuevo.',
    'Error loading list': 'Error al cargar lista',
    'Error loading table': 'Error al cargar tabla',
    'Couldn\'t load data': 'No se pudieron cargar los datos. Por favor, verifica tu conexión.',
    
    'peakbagger-export': 'peakbagger-exportar'
  },
  fr: {
    'peaks completed': 'sommets complétés',
    'Showing': 'Affichage',
    'of': 'de',
    'No results': 'Aucun résultat',
    
    'Search peaks...': 'Rechercher des sommets...',
    'Sort': 'Trier',
    'Mode': 'Mode',
    'Export XLSX': 'Exporter XLSX',
    'All Peaks': 'Tous les Sommets',
    'Hide completed': 'Masquer complétés',
    'Advanced Filters': 'Filtres Avancés',
    
    'Rank': 'Rang',
    'Name': 'Nom',
    'Elevation': 'Élévation',
    'Status': 'Statut',
    
    'Grid': 'Grille',
    'List': 'Liste',
    'Compact': 'Compact',
    
    'All': 'Tous',
    'Completed': 'Complété',
    'Favorites': 'Favoris',
    'Wishlist': 'Liste de Souhaits',
    'Incomplete': 'Incomplet',
    
    'Date': 'Date',
    'Done': 'Fait',
    'Range': 'Chaîne',
    
    'Prominence': 'Prominence',
    'Trail Type': 'Type de Sentier',
    'Difficulty': 'Difficulté',
    'Exposure': 'Exposition',
    'Coordinates': 'Coordonnées',
    'Add to Favorites': 'Ajouter aux Favoris',
    'Remove from Favorites': 'Retirer des Favoris',
    'Add to Wishlist': 'Ajouter à la Liste de Souhaits',
    'Remove from Wishlist': 'Retirer de la Liste de Souhaits',
    
    'Settings': 'Paramètres',
    'Units: Meters': 'Unités: Mètres',
    'Row density': 'Densité des rangées',
    'Comfortable': 'Confortable',
    'Sticky header': 'En-tête fixe',
    'Grid tracking (12 months/peak)': 'Suivi de grille (12 mois/sommet)',
    'Card Color Legend': 'Légende des Couleurs',
    'Language': 'Langue',
    
    'Themes': 'Thèmes',
    'Choose theme': 'Choisir un thème',
    'Dark (default)': 'Sombre (par défaut)',
    'Light (white & black)': 'Clair (blanc et noir)',
    'Forest Green': 'Vert Forêt',
    'Sky Blue': 'Bleu Ciel',
    
    'You\'re not signed in': 'Vous n\'êtes pas connecté',
    'Sign in to save your progress': 'Connectez-vous pour sauvegarder votre progression',
    'Log in': 'Se connecter',
    'Log out': 'Se déconnecter',
    'Signed in as': 'Connecté en tant que',
    
    // Month abbreviations
    'Jan': 'Jan', 'Feb': 'Fév', 'Mar': 'Mar', 'Apr': 'Avr', 'May': 'Mai', 'Jun': 'Jun',
    'Jul': 'Jul', 'Aug': 'Aoû', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Déc',
    
    'Error loading peak details': 'Erreur lors du chargement des détails du sommet. Veuillez réessayer.',
    'Error loading list': 'Erreur lors du chargement de la liste',
    'Error loading table': 'Erreur lors du chargement du tableau',
    'Couldn\'t load data': 'Impossible de charger les données. Veuillez vérifier votre connexion.',
    
    'peakbagger-export': 'peakbagger-exporter'
  },
  de: {
    'peaks completed': 'Gipfel abgeschlossen',
    'Showing': 'Zeige',
    'of': 'von',
    'No results': 'Keine Ergebnisse',
    
    'Search peaks...': 'Gipfel suchen...',
    'Sort': 'Sortieren',
    'Mode': 'Modus',
    'Export XLSX': 'XLSX Exportieren',
    'All Peaks': 'Alle Gipfel',
    'Hide completed': 'Abgeschlossene ausblenden',
    'Advanced Filters': 'Erweiterte Filter',
    
    'Rank': 'Rang',
    'Name': 'Name',
    'Elevation': 'Höhe',
    'Status': 'Status',
    
    'Grid': 'Raster',
    'List': 'Liste',
    'Compact': 'Kompakt',
    
    'All': 'Alle',
    'Completed': 'Abgeschlossen',
    'Favorites': 'Favoriten',
    'Wishlist': 'Wunschliste',
    'Incomplete': 'Unvollständig',
    
    'Date': 'Datum',
    'Done': 'Erledigt',
    'Range': 'Gebirge',
    
    'Prominence': 'Schartenhöhe',
    'Trail Type': 'Wegtyp',
    'Difficulty': 'Schwierigkeit',
    'Exposure': 'Exposition',
    'Coordinates': 'Koordinaten',
    'Add to Favorites': 'Zu Favoriten hinzufügen',
    'Remove from Favorites': 'Aus Favoriten entfernen',
    'Add to Wishlist': 'Zur Wunschliste hinzufügen',
    'Remove from Wishlist': 'Von Wunschliste entfernen',
    
    'Settings': 'Einstellungen',
    'Units: Meters': 'Einheiten: Meter',
    'Row density': 'Zeilendichte',
    'Comfortable': 'Komfortabel',
    'Sticky header': 'Fixierte Kopfzeile',
    'Grid tracking (12 months/peak)': 'Raster-Tracking (12 Monate/Gipfel)',
    'Card Color Legend': 'Kartenfarben-Legende',
    'Language': 'Sprache',
    
    'Themes': 'Themen',
    'Choose theme': 'Thema wählen',
    'Dark (default)': 'Dunkel (Standard)',
    'Light (white & black)': 'Hell (weiß und schwarz)',
    'Forest Green': 'Waldgrün',
    'Sky Blue': 'Himmelblau',
    
    'You\'re not signed in': 'Sie sind nicht angemeldet',
    'Sign in to save your progress': 'Melden Sie sich an, um Ihren Fortschritt zu speichern',
    'Log in': 'Anmelden',
    'Log out': 'Abmelden',
    'Signed in as': 'Angemeldet als',
    
    // Month abbreviations
    'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mär', 'Apr': 'Apr', 'May': 'Mai', 'Jun': 'Jun',
    'Jul': 'Jul', 'Aug': 'Aug', 'Sep': 'Sep', 'Oct': 'Okt', 'Nov': 'Nov', 'Dec': 'Dez',
    
    'Error loading peak details': 'Fehler beim Laden der Gipfeldetails. Bitte versuchen Sie es erneut.',
    'Error loading list': 'Fehler beim Laden der Liste',
    'Error loading table': 'Fehler beim Laden der Tabelle',
    'Couldn\'t load data': 'Daten konnten nicht geladen werden. Bitte überprüfen Sie Ihre Verbindung.',
    
    'peakbagger-export': 'peakbagger-export'
  },
  zh: {
    'peaks completed': '完成的山峰',
    'Showing': '显示',
    'of': '的',
    'No results': '无结果',
    
    'Search peaks...': '搜索山峰...',
    'Sort': '排序',
    'Mode': '模式',
    'Export XLSX': '导出 XLSX',
    'All Peaks': '所有山峰',
    'Hide completed': '隐藏已完成',
    'Advanced Filters': '高级筛选',
    
    'Rank': '排名',
    'Name': '名称',
    'Elevation': '海拔',
    'Status': '状态',
    
    'Grid': '网格',
    'List': '列表',
    'Compact': '紧凑',
    
    'All': '全部',
    'Completed': '已完成',
    'Favorites': '收藏',
    'Wishlist': '愿望清单',
    'Incomplete': '未完成',
    
    'Date': '日期',
    'Done': '完成',
    'Range': '山脉',
    
    'Prominence': '突起度',
    'Trail Type': '小径类型',
    'Difficulty': '难度',
    'Exposure': '暴露度',
    'Coordinates': '坐标',
    'Add to Favorites': '添加到收藏',
    'Remove from Favorites': '从收藏中移除',
    'Add to Wishlist': '添加到愿望清单',
    'Remove from Wishlist': '从愿望清单中移除',
    
    'Settings': '设置',
    'Units: Meters': '单位：米',
    'Row density': '行密度',
    'Comfortable': '舒适',
    'Sticky header': '固定标题',
    'Grid tracking (12 months/peak)': '网格追踪（12个月/山峰）',
    'Card Color Legend': '卡片颜色图例',
    'Language': '语言',
    
    'Themes': '主题',
    'Choose theme': '选择主题',
    'Dark (default)': '深色（默认）',
    'Light (white & black)': '浅色（黑白）',
    'Forest Green': '森林绿',
    'Sky Blue': '天空蓝',
    
    'You\'re not signed in': '您未登录',
    'Sign in to save your progress': '登录以保存您的进度',
    'Log in': '登录',
    'Log out': '登出',
    'Signed in as': '登录为',
    
    // Month abbreviations
    'Jan': '1月', 'Feb': '2月', 'Mar': '3月', 'Apr': '4月', 'May': '5月', 'Jun': '6月',
    'Jul': '7月', 'Aug': '8月', 'Sep': '9月', 'Oct': '10月', 'Nov': '11月', 'Dec': '12月',
    
    'Error loading peak details': '加载山峰详情时出错。请重试。',
    'Error loading list': '加载列表时出错',
    'Error loading table': '加载表格时出错',
    'Couldn\'t load data': '无法加载数据。请检查您的连接。',
    
    'peakbagger-export': 'peakbagger-导出'
  },
  ja: {
    'peaks completed': '完了した山',
    'Showing': '表示',
    'of': 'の',
    'No results': '結果なし',
    
    'Search peaks...': '山を検索...',
    'Sort': '並び替え',
    'Mode': 'モード',
    'Export XLSX': 'XLSX エクスポート',
    'All Peaks': 'すべての山',
    'Hide completed': '完了を非表示',
    'Advanced Filters': '高度なフィルター',
    
    'Rank': 'ランク',
    'Name': '名前',
    'Elevation': '標高',
    'Status': 'ステータス',
    
    'Grid': 'グリッド',
    'List': 'リスト',
    'Compact': 'コンパクト',
    
    'All': 'すべて',
    'Completed': '完了',
    'Favorites': 'お気に入り',
    'Wishlist': '欲しいものリスト',
    'Incomplete': '未完了',
    
    'Date': '日付',
    'Done': '完了',
    'Range': '山脈',
    
    'Prominence': '卓立度',
    'Trail Type': 'トレイルタイプ',
    'Difficulty': '難易度',
    'Exposure': '露出度',
    'Coordinates': '座標',
    'Add to Favorites': 'お気に入りに追加',
    'Remove from Favorites': 'お気に入りから削除',
    'Add to Wishlist': '欲しいものリストに追加',
    'Remove from Wishlist': '欲しいものリストから削除',
    
    'Settings': '設定',
    'Units: Meters': '単位：メートル',
    'Row density': '行密度',
    'Comfortable': '快適',
    'Sticky header': '固定ヘッダー',
    'Grid tracking (12 months/peak)': 'グリッド追跡（12ヶ月/山）',
    'Card Color Legend': 'カード色の凡例',
    'Language': '言語',
    
    'Themes': 'テーマ',
    'Choose theme': 'テーマを選択',
    'Dark (default)': 'ダーク（デフォルト）',
    'Light (white & black)': 'ライト（白と黒）',
    'Forest Green': 'フォレストグリーン',
    'Sky Blue': 'スカイブルー',
    
    'You\'re not signed in': 'サインインしていません',
    'Sign in to save your progress': '進行状況を保存するためにサインイン',
    'Log in': 'ログイン',
    'Log out': 'ログアウト',
    'Signed in as': 'サインイン中',
    
    // Month abbreviations
    'Jan': '1月', 'Feb': '2月', 'Mar': '3月', 'Apr': '4月', 'May': '5月', 'Jun': '6月',
    'Jul': '7月', 'Aug': '8月', 'Sep': '9月', 'Oct': '10月', 'Nov': '11月', 'Dec': '12月',
    
    'Error loading peak details': '山の詳細の読み込みエラー。もう一度お試しください。',
    'Error loading list': 'リストの読み込みエラー',
    'Error loading table': 'テーブルの読み込みエラー',
    'Couldn\'t load data': 'データを読み込めませんでした。接続を確認してください。',
    
    'peakbagger-export': 'peakbagger-エクスポート'
  }
};

function t(key) {
  return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

function setLanguage(lang) {
  if (!translations[lang]) {
    console.warn('Unknown language:', lang);
    return;
  }
  
  currentLanguage = lang;
  
  // Save to preferences
  const prefs = readPrefs();
  prefs.language = lang;
  writePrefs(prefs);
  
  // Update UI
  updateLanguageButtons();
  translatePage();
}

function updateLanguageButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
  });
}

function translatePage() {
  // Translate all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated) {
      el.textContent = translated;
    }
  });
  
  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = t(key);
    if (translated && el.hasAttribute('placeholder')) {
      el.placeholder = translated;
    }
  });
  
  // Translate select options
  document.querySelectorAll('[data-i18n-option]').forEach(option => {
    const key = option.getAttribute('data-i18n-option');
    const translated = t(key);
    if (translated) {
      option.textContent = translated;
    }
  });
  
  // Update unit toggle
  if (unitLabel) {
    unitLabel.textContent = meters ? t('Meters (m)') : t('Feet (ft)');
  }
  
  // Update sort label
  if (sortLabel) {
    const sortKey = sortMode === 'elev' ? 'Elevation' : sortMode === 'status' ? 'Status' : sortMode[0].toUpperCase() + sortMode.slice(1);
    sortLabel.textContent = t(sortKey);
  }
  
  // Update mode label
  if (modeLabel) {
    const modeLabels = { grid: 'Grid', list: 'List', compact: 'Compact' };
    modeLabel.textContent = t(modeLabels[gridMode]);
  }
  
  // Update show completed button
  const showBtn = document.getElementById('showComplete');
  if (showBtn) {
    const text = hideCompleted ? 'Show completed' : 'Hide completed';
    const span = showBtn.querySelector('span:last-child');
    if (span) span.textContent = t(text);
  }
  
  // Re-render current view to translate dynamic content
  renderView();
}

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

const API = (location.hostname.endsWith('nh48pics.com') || location.hostname === 'nh48.app') 
  ? '/_functions' 
  : 'https://www.nh48pics.com/_functions';

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
  // Always use the static list from LIST_TO_JSON_MAP for reliability
  // This ensures the app works even if Supabase is unavailable
  console.log('📋 Loading lists from static LIST_TO_JSON_MAP');
  return Object.keys(LIST_TO_JSON_MAP);
}

async function fetchListItems(name) {
  console.log('🔍 fetchListItems called for:', name);
  
  // Load from API JSON files first (original design)
  console.log('📁 Loading from API JSON for:', name);
  const jsonFileName = LIST_TO_JSON_MAP[name];
  if (!jsonFileName) {
    console.error('❌ Unknown list:', name, 'Available lists:', Object.keys(LIST_TO_JSON_MAP));
    throw new Error('Unknown list: ' + name);
  }
  
  try {
    const url = `${NH48_API_REPO_URL}/${jsonFileName}?t=` + Date.now();
    console.log('🌐 Fetching from:', url);
    const r = await fetch(url, { mode: 'cors', headers: { 'Accept': 'application/json' } });
    console.log('✅ Fetch response status:', r.status, r.statusText);
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    const data = await r.json();
    console.log('✅ Raw data for', name, 'length:', Array.isArray(data) ? data.length : Object.keys(data).length);
    
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
const authModal = document.getElementById('authModal');
const authTitle = document.getElementById('authTitle');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginEmail = document.getElementById('loginEmail');
const loginPass = document.getElementById('loginPass');
const rememberMe = document.getElementById('rememberMe');
const doLoginBtn = document.getElementById('doLogin');
const signupFirstName = document.getElementById('signupFirstName');
const signupLastName = document.getElementById('signupLastName');
const signupEmail = document.getElementById('signupEmail');
const signupPass = document.getElementById('signupPass');
const signupPassConfirm = document.getElementById('signupPassConfirm');
const signupHoneypot = document.getElementById('signupHoneypot');
const doSignupBtn = document.getElementById('doSignup');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
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
const gridTrackingToggle = document.getElementById('gridTrackingToggle');
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
let favorites = new Set();  // Peak IDs that are favorited
let wishlist = new Set();   // Peak IDs on wishlist
let statusFilter = 'all';  // Filter: 'all', 'completed', 'favorites', 'wishlist', 'incomplete'
let rangeFilter = 'all';  // Filter by mountain range
let elevationMin = '';  // Minimum elevation filter
let elevationMax = '';  // Maximum elevation filter
let gridTrackingEnabled = false;  // Grid tracking mode (12 months/peak)

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
  if (!currentUser || !supabase) return;
  
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

// Load state from Supabase - reads from user_hike_logs table
// Each peak's completion status is determined by having at least one hike log entry
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
    
    // Load hike logs for this user - these are the source of truth for completion
    // We get the most recent hike date per peak as the "completion date"
    const { data: hikeLogs, error } = await supabase
      .from('user_hike_logs')
      .select('peak_id, hike_date, list_id, peaks(slug, name)')
      .eq('user_id', currentUser.id)
      .order('hike_date', { ascending: false });
    
    if (error) {
      console.error('Failed to load hike logs:', error);
      completions = {};
      return;
    }
    
    completions[currentList] = {};
    
    if (hikeLogs) {
      // Group by peak - first occurrence (most recent) determines the date shown for classic mode
      // But we also store ALL hike dates for grid mode sync
      const peaksSeen = new Set();
      hikeLogs.forEach(log => {
        const peakName = log.peaks?.name;
        if (!peakName) return;
        
        // Only include logs that match this list or have no list_id
        if (log.list_id && log.list_id !== listId) return;
        
        // Initialize completion record if not exists
        if (!completions[currentList][peakName]) {
          completions[currentList][peakName] = {
            done: true,
            date: log.hike_date || '',
            logId: log.id,
            allDates: []  // Store ALL hike dates for grid mode sync
          };
        }
        
        // Add this date to allDates array for grid sync
        if (log.hike_date) {
          completions[currentList][peakName].allDates.push(log.hike_date);
        }
        
        peaksSeen.add(peakName);
      });
    }
    
    console.log('loadStateFromSupabase: Loaded', Object.keys(completions[currentList] || {}).length, 'completed peaks from hike logs');
  } catch (e) {
    console.error('Failed to load state from Supabase:', e);
    completions = {};
  }
}

// Save state to Supabase - now only uses user_hike_logs table
// This function is a wrapper that delegates to createOrUpdateHikeLog or deleteHikeLog
async function saveStateToSupabase(peakName, checked, date) {
  if (!currentUser || !currentList) return;
  
  if (checked && date) {
    // Create or update a hike log entry
    await createOrUpdateHikeLog(peakName, date);
  } else if (!checked) {
    // When unchecking, we don't delete logs - user might want to keep history
    // They can delete individual logs from the peak detail page
    console.log('saveStateToSupabase: Peak unchecked but not deleting logs -', peakName);
  }
}

// Delete a hike log entry by peak name and date
async function deleteHikeLog(peakName, dateStr) {
  if (!currentUser || !currentList) return;
  
  try {
    // Get the peak ID by name
    const { data: peak, error: peakError } = await supabase
      .from('peaks')
      .select('id')
      .eq('name', peakName)
      .single();
    
    if (peakError || !peak) {
      console.log('deleteHikeLog: Peak not found:', peakName);
      return;
    }
    
    const peakId = peak.id;
    
    // Delete the hike log entry for this date
    const { error: deleteError } = await supabase
      .from('user_hike_logs')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('peak_id', peakId)
      .eq('hike_date', dateStr);
    
    if (deleteError) {
      console.error('deleteHikeLog: Delete error:', deleteError);
    } else {
      console.log('deleteHikeLog: Deleted log for', peakName, dateStr);
    }
  } catch (e) {
    console.error('deleteHikeLog error:', e);
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
    
    // Initialize grid for this list
    completionsGrid[currentList] = {};
    
    // Load ALL hike logs from user_hike_logs - this is the ONLY source of truth
    const { data: hikeLogs } = await supabase
      .from('user_hike_logs')
      .select('peak_id, hike_date, list_id, peaks(name)')
      .eq('user_id', currentUser.id)
      .order('hike_date', { ascending: false });
    
    if (hikeLogs) {
      hikeLogs.forEach(log => {
        const peakName = log.peaks?.name;
        if (!peakName || !log.hike_date) return;
        
        // Only include logs that match this list or have no list_id
        if (log.list_id && log.list_id !== listId) return;
        
        // Initialize grid record for this peak if needed
        if (!completionsGrid[currentList][peakName]) {
          completionsGrid[currentList][peakName] = { "1": "", "2": "", "3": "", "4": "", "5": "", "6": "", "7": "", "8": "", "9": "", "10": "", "11": "", "12": "" };
        }
        
        // Get the month from the hike date and populate the grid cell
        const m = new Date(log.hike_date).getMonth() + 1;
        const k = String(m);
        // Only set if not already set (use first/most recent date for duplicate months)
        if (!completionsGrid[currentList][peakName][k]) {
          completionsGrid[currentList][peakName][k] = log.hike_date;
        }
      });
    }
    
    console.log('loadGridFromSupabase: Loaded grid data from user_hike_logs for', Object.keys(completionsGrid[currentList] || {}).length, 'peaks');
  } catch (e) {
    console.error('Failed to load grid from Supabase:', e);
    completionsGrid = {};
  }
}

// Save grid to Supabase - saves to user_hike_logs table
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
      // Check if a hike log already exists for this peak on this exact date
      const { data: existingLog } = await supabase
        .from('user_hike_logs')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('peak_id', peakId)
        .eq('hike_date', date)
        .single();
      
      if (!existingLog) {
        // Create a new hike log entry
        await supabase
          .from('user_hike_logs')
          .insert({
            user_id: currentUser.id,
            list_id: listId,
            peak_id: peakId,
            hike_date: date
          });
      }
    } else {
      // When clearing a date from grid, we need to find and delete hike logs for this month
      // Get all hike logs for this peak
      const { data: hikeLogs } = await supabase
        .from('user_hike_logs')
        .select('id, hike_date')
        .eq('user_id', currentUser.id)
        .eq('peak_id', peakId);
      
      if (hikeLogs) {
        // Delete logs that match this month
        const logsToDelete = hikeLogs.filter(log => {
          const logMonth = new Date(log.hike_date).getMonth() + 1;
          return logMonth === parseInt(month);
        });
        
        for (const log of logsToDelete) {
          await supabase
            .from('user_hike_logs')
            .delete()
            .eq('id', log.id);
        }
      }
    }
  } catch (e) {
    console.error('Failed to save grid to Supabase:', e);
  }
}

// Load favorites from Supabase
async function loadFavorites() {
  // Skip if not logged in
  if (!currentUser) {
    favorites.clear();
    wishlist.clear();
    return;
  }
  
  try {
    const { data: favData, error } = await supabase
      .from('user_favorite_peaks')
      .select('peak_id, favorite_type')
      .eq('user_id', currentUser.id);
    
    if (error) {
      // Silently handle missing table/column errors - don't spam console
      if (error.code === '42703' || error.message?.includes('does not exist')) {
        console.log('Favorites table not configured - using local storage only');
      } else {
        console.error('Error loading favorites:', error);
      }
      favorites.clear();
      wishlist.clear();
      return;
    }
    
    favorites.clear();
    wishlist.clear();
    
    if (favData && Array.isArray(favData)) {
      favData.forEach(fav => {
        if (fav && fav.peak_id) {
          if (fav.favorite_type === 'favorite') {
            favorites.add(fav.peak_id);
          } else if (fav.favorite_type === 'wishlist') {
            wishlist.add(fav.peak_id);
          }
        }
      });
    }
    
    console.log(`Loaded ${favorites.size} favorites and ${wishlist.size} wishlist items`);
  } catch (e) {
    // Silently fail - favorites will just use local storage
    favorites.clear();
    wishlist.clear();
  }
}

// Toggle favorite or wishlist for a peak
async function toggleFavorite(peakId, favoriteType) {
  if (!currentUser || !peakId) {
    console.warn('Cannot toggle favorite: missing user or peak ID');
    return;
  }
  
  if (favoriteType !== 'favorite' && favoriteType !== 'wishlist') {
    console.error('Invalid favorite type:', favoriteType);
    return;
  }
  
  try {
    const targetSet = favoriteType === 'favorite' ? favorites : wishlist;
    const otherSet = favoriteType === 'favorite' ? wishlist : favorites;
    const otherType = favoriteType === 'favorite' ? 'wishlist' : 'favorite';
    
    if (targetSet.has(peakId)) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorite_peaks')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('peak_id', peakId)
        .eq('favorite_type', favoriteType);
      
      if (error) throw error;
      
      targetSet.delete(peakId);
      console.log(`Removed ${favoriteType} for peak ${peakId}`);
    } else {
      // Add to favorites (and remove from other type if present)
      if (otherSet.has(peakId)) {
        await supabase
          .from('user_favorite_peaks')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('peak_id', peakId)
          .eq('favorite_type', otherType);
        otherSet.delete(peakId);
      }
      
      const { error } = await supabase
        .from('user_favorite_peaks')
        .insert({
          user_id: currentUser.id,
          peak_id: peakId,
          favorite_type: favoriteType
        });
      
      if (error) throw error;
      
      targetSet.add(peakId);
      console.log(`Added ${favoriteType} for peak ${peakId}`);
    }
    
    // Re-render to update card colors
    renderView();
  } catch (e) {
    console.error(`Failed to toggle ${favoriteType}:`, e);
    alert(`Failed to update ${favoriteType}. Please try again.`);
  }
}

// Load grid tracking settings from Supabase
async function loadGridTrackingSettings() {
  if (!currentUser || !currentList) {
    // Load from local preferences if not logged in
    const prefs = readPrefs();
    gridTrackingEnabled = prefs.gridTracking || false;
    if (gridTrackingToggle) gridTrackingToggle.checked = gridTrackingEnabled;
    return;
  }
  
  try {
    const { data: lists } = await supabase
      .from('lists')
      .select('id')
      .eq('slug', slugify(currentList))
      .single();
    
    if (!lists) return;
    
    const { data: settings } = await supabase
      .from('user_grid_settings')
      .select('grid_enabled')
      .eq('user_id', currentUser.id)
      .eq('list_id', lists.id)
      .single();
    
    if (settings && typeof settings.grid_enabled === 'boolean') {
      gridTrackingEnabled = settings.grid_enabled;
      if (gridTrackingToggle) gridTrackingToggle.checked = gridTrackingEnabled;
    } else {
      // Default to false if no setting exists
      gridTrackingEnabled = false;
      if (gridTrackingToggle) gridTrackingToggle.checked = false;
    }
  } catch (e) {
    console.error('Failed to load grid tracking settings:', e);
    // Default to false on error
    gridTrackingEnabled = false;
    if (gridTrackingToggle) gridTrackingToggle.checked = false;
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
  
  // Sync ALL hike dates from completions to grid (not just the most recent)
  const peakData = completions[list]?.[peak];
  const allDates = peakData?.allDates || (peakData?.date ? [peakData.date] : []);
  
  // For each hike date, populate the corresponding month in the grid
  // If multiple dates exist for same month, use the first one encountered (most recent since sorted desc)
  allDates.forEach(dateStr => {
    if (!dateStr) return;
    const m = new Date(dateStr).getMonth() + 1;
    const k = String(m);
    // Only set if not already set (preserves grid-specific entries and uses first/most recent for duplicates)
    if (!completionsGrid[list][peak][k]) {
      completionsGrid[list][peak][k] = dateStr;
    }
  });
  
  return completionsGrid[list][peak];
}

function setGridDate(list, peak, month, dateStr) {
  const rec = ensureGridRecord(list, peak);
  rec[String(month)] = dateStr || "";
  
  // Save to Supabase immediately
  saveGridToSupabase(peak, month, dateStr);
  
  saveGrid();
  // Sync classic mode - grid determines list completion
  const months = Object.values(rec).filter(Boolean);
  const any = months.length > 0;
  completions[list] ??= {};
  completions[list][peak] ??= { done: false, date: '' };
  completions[list][peak].done = any;
  // Use most recent date from any month as the "list" completion date
  completions[list][peak].date = any ? months.sort().slice(-1)[0] : '';
  
  // Also save classic mode to Supabase immediately
  saveStateToSupabase(peak, any, completions[list][peak].date);
  
  saveState();
  queueRemoteSave();
  playPingSound();
  renderView(); // Update UI to reflect changes in both views
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
async function signUp(firstName, lastName, email, pass, opts = {}) {
  email = (email || '').trim().toLowerCase();
  firstName = (firstName || '').trim();
  
  if (!firstName || !email || !pass) {
    throw new Error('Please enter first name, email, and password.');
  }
  if (!opts.tosAgreed) {
    throw new Error('Please agree to the Terms & Conditions.');
  }
  
  // Construct full name
  const fullName = lastName ? `${firstName} ${lastName.trim()}` : firstName;
  
  if (!supabase) throw new Error('Authentication service not available');
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: pass,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName || '',
        name: fullName,
        tosAcceptedAt: new Date().toISOString(),
        tosVersion: TOS_VERSION
      }
    }
  });
  
  if (error) throw new Error(error.message);
  
  // Also create user_settings record with default settings
  if (data.user && supabase) {
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

async function signIn(email, pass, rememberSession = true) {
  email = (email || '').trim().toLowerCase();
  
  if (!supabase) throw new Error('Authentication service not available');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: pass
  });
  
  if (error) throw new Error(error.message);
  
  // Set session persistence based on remember me checkbox
  if (!rememberSession) {
    // Session will expire when browser closes
    await supabase.auth.updateUser({ data: { sessionType: 'temporary' } });
  }
  
  currentUser = data.user;
  return data.user;
}

async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
  currentUser = null;
}

async function getCurrentUserData() {
  if (!supabase) return null;
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
  
  // Mobile auth elements
  const mobileSignedOutBox = document.getElementById('mobileAuthSignedOut');
  const mobileSignedInBox = document.getElementById('mobileAuthSignedIn');
  const mobileUserInitials = document.getElementById('mobileUserInitials');
  
  // Nav auth elements
  const navSignedOutBox = document.getElementById('navAuthSignedOut');
  const navSignedInBox = document.getElementById('navAuthSignedIn');
  const navUserInitials = document.getElementById('navUserInitials');
  
  if (me) {
    if (signedOutBox) signedOutBox.style.display = 'none';
    if (signedInBox) signedInBox.style.display = '';
    
    // Mobile auth state
    if (mobileSignedOutBox) mobileSignedOutBox.style.display = 'none';
    if (mobileSignedInBox) mobileSignedInBox.style.display = '';
    
    // Nav auth state
    if (navSignedOutBox) navSignedOutBox.style.display = 'none';
    if (navSignedInBox) navSignedInBox.style.display = '';
    
    // Get name from user metadata
    const firstName = me.user_metadata?.first_name || me.user_metadata?.name || '';
    const lastName = me.user_metadata?.last_name || '';
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    
    if (meNameEl) meNameEl.textContent = fullName || me.email;
    if (meEmailEl) meEmailEl.textContent = me.email || '';
    
    // Set user initials in avatar
    const userInitials = document.getElementById('userInitials');
    const initials = firstName.charAt(0).toUpperCase() + (lastName ? lastName.charAt(0).toUpperCase() : '');
    if (userInitials) {
      userInitials.textContent = initials || me.email.charAt(0).toUpperCase();
    }
    if (mobileUserInitials) {
      mobileUserInitials.textContent = initials || me.email.charAt(0).toUpperCase();
    }
    if (navUserInitials) {
      navUserInitials.textContent = initials || me.email.charAt(0).toUpperCase();
    }
  } else {
    if (signedOutBox) signedOutBox.style.display = '';
    if (signedInBox) signedInBox.style.display = 'none';
    if (meNameEl) meNameEl.textContent = '';
    if (meEmailEl) meEmailEl.textContent = '';
    
    // Mobile auth state
    if (mobileSignedOutBox) mobileSignedOutBox.style.display = '';
    if (mobileSignedInBox) mobileSignedInBox.style.display = 'none';
    
    // Nav auth state
    if (navSignedOutBox) navSignedOutBox.style.display = '';
    if (navSignedInBox) navSignedInBox.style.display = 'none';
  }
  
  // Load data from Supabase instead of localStorage
  await loadStateFromSupabase();
  await loadGridFromSupabase();
  await loadGridTrackingSettings();
  await loadFavorites();
  // Only render if a list is already selected (avoid rendering empty state on initial load)
  if (currentList) renderView();
}

// Listen for auth state changes
if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    if (event === 'SIGNED_IN') {
      currentUser = session.user;
      reflectAuthUI();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      completions = {};
      completionsGrid = {};
      favorites.clear();
      wishlist.clear();
      reflectAuthUI();
    }
  });
}

// =====================================================
// Modal Helpers
// =====================================================
function openModal() {
  authModal.classList.add('open');
  authMsg.textContent = '';
  // Default to login form
  showLoginForm();
}

function closeModal() {
  authModal.classList.remove('open');
  // Clear login form
  if (loginEmail) loginEmail.value = '';
  if (loginPass) loginPass.value = '';
  // Clear signup form
  if (signupFirstName) signupFirstName.value = '';
  if (signupLastName) signupLastName.value = '';
  if (signupEmail) signupEmail.value = '';
  if (signupPass) signupPass.value = '';
  if (signupPassConfirm) signupPassConfirm.value = '';
  if (signupHoneypot) signupHoneypot.value = '';
  authMsg.textContent = '';
  if (tosAgree) tosAgree.checked = false;
  if (doSignupBtn) doSignupBtn.disabled = true;
}

function showLoginForm() {
  if (loginForm) loginForm.style.display = 'block';
  if (signupForm) signupForm.style.display = 'none';
  if (authTitle) authTitle.textContent = 'Log in';
  authMsg.textContent = '';
}

function showSignupForm() {
  if (loginForm) loginForm.style.display = 'none';
  if (signupForm) signupForm.style.display = 'block';
  if (authTitle) authTitle.textContent = 'Create Account';
  authMsg.textContent = '';
}

function validatePasswordMatch() {
  if (!signupPass || !signupPassConfirm) return false;
  const pass = signupPass.value;
  const confirm = signupPassConfirm.value;
  
  // Check if passwords match (case and type sensitive)
  if (pass !== confirm) {
    authMsg.textContent = 'Passwords do not match';
    authMsg.className = 'err';
    return false;
  }
  
  if (pass.length < 6) {
    authMsg.textContent = 'Password must be at least 6 characters';
    authMsg.className = 'err';
    return false;
  }
  
  return true;
}

function checkBotPrevention() {
  // Honeypot check - if filled, it's likely a bot
  if (signupHoneypot && signupHoneypot.value !== '') {
    console.warn('Bot detected via honeypot');
    return false;
  }
  return true;
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

// Low-res placeholder with blur-up effect
function lowResPlaceholder(w = 20, h = 12) {
  // Generate a tiny colored placeholder that will be blurred
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='%231a1a1a'/><rect x='0' y='${h*0.6}' width='100%' height='${h*0.4}' fill='%23223322'/></svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// Progressive image loading: show low-res first, then load full image
function loadImageProgressive(img, fullSrc, lowResSrc) {
  if (!img || !fullSrc) return;
  
  // Get parent container for skeleton state
  const container = img.closest('.peak-card-thumb');
  
  // Set up blur effect
  img.classList.add('img-blur');
  img.src = lowResSrc || lowResPlaceholder();
  
  // Load full image in background
  const fullImg = new Image();
  fullImg.onload = () => {
    img.src = fullSrc;
    // Small delay for smoother transition
    requestAnimationFrame(() => {
      img.classList.add('loaded');
      img.classList.remove('img-blur');
      if (container) container.classList.remove('img-loading');
    });
  };
  fullImg.onerror = () => {
    img.classList.add('loaded'); // Remove blur even on error
    img.classList.remove('img-blur');
    if (container) container.classList.remove('img-loading');
  };
  fullImg.src = fullSrc;
}

// IntersectionObserver for lazy loading grid images
let gridImageObserver = null;
function observeGridImages() {
  // Disconnect previous observer if exists
  if (gridImageObserver) gridImageObserver.disconnect();
  
  const images = document.querySelectorAll('.peak-card-thumb img[data-full-src]');
  if (!images.length) return;
  
  gridImageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const fullSrc = img.dataset.fullSrc;
        if (fullSrc && !img.classList.contains('loaded')) {
          // Use thumbnail version for catalog (50% quality)
          const thumbSrc = getThumbnailUrl(fullSrc, 400);
          loadImageProgressive(img, thumbSrc);
        }
        gridImageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '300px', // Start loading 300px before viewport for smoother scroll
    threshold: 0.01
  });
  
  images.forEach(img => gridImageObserver.observe(img));
}

// Get thumbnail URL with reduced size for catalog page
function getThumbnailUrl(url, maxWidth = 400) {
  if (!url) return url;
  
  // Handle Wix media URLs - add resize parameters
  if (url.includes('wixstatic.com')) {
    // Wix supports /v1/fill/w_WIDTH,h_HEIGHT,al_c,q_QUALITY/ format
    if (url.includes('/v1/')) {
      // Already has transform params, modify them
      return url.replace(/w_\d+/, `w_${maxWidth}`).replace(/q_\d+/, 'q_70');
    }
    // Add transform params for standard Wix URLs
    const baseUrl = url.split('?')[0];
    return `${baseUrl}/v1/fill/w_${maxWidth},h_240,al_c,q_70/image.jpg`;
  }
  
  // Handle other CDN URLs that support width params
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${maxWidth},q_70/`);
  }
  
  // Handle imgix or similar
  if (url.includes('imgix.net')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${maxWidth}&q=70`;
  }
  
  // Return original URL if no CDN transform available
  return url;
}

async function openPeakDetail(it) {
  if (!it || !it.name) {
    console.error('Cannot open detail: invalid peak data');
    return;
  }
  
  try {
    console.log('Opening peak detail for:', it.name, 'Slug:', it.slug);
    
    // Always store all peaks data in localStorage for the detail page to access
    const allPeaks = window._filteredPeaks || window._allPeaks || [];
    console.log('Storing', allPeaks.length, 'peaks in localStorage');
    localStorage.setItem('peakbagger_peaks', JSON.stringify(allPeaks));
    
    // Navigate to the standalone detail page using slug as primary identifier
    if (!it.slug) {
      console.error('Peak has no slug:', it);
      return;
    }
    // Use clean masked URL
    const url = `/peak-detail?slug=${it.slug}`;
    console.log('Navigating to:', url);
    window.location.href = url;
  } catch (err) {
    console.error('Error opening peak detail:', err);
  }
}

// Keep old implementation for reference (can be removed later)
async function openPeakDetailOLD(it) {
  if (!it || !it.name) {
    console.error('Cannot open detail: invalid peak data');
    return;
  }
  
  try {
    // Store current item for back button and updates
    window._currentPeakDetail = it;
    
    // Show peak detail page, hide main content
    const mainPanel = document.querySelector('main.panel');
    const sidebar = document.querySelector('.sidebar');
    const gridView = document.getElementById('grid-view');
    const listView = document.getElementById('list-view');
    const pagerWraps = document.querySelectorAll('.pager-wrap');
    const topbar = document.querySelector('.topbar');
    const peakDetailPage = document.getElementById('peakDetailPage');
    
    if (!peakDetailPage) {
      console.error('Peak detail page element not found');
      return;
    }
    
    // Hide everything except peakDetailPage
    if (gridView) gridView.style.display = 'none';
    if (listView) listView.style.display = 'none';
    pagerWraps.forEach(p => p.style.display = 'none');
    if (sidebar) sidebar.style.display = 'none';
    if (topbar) topbar.style.display = 'none';
    
    // Remove content padding for full frame
    const content = document.querySelector('.content');
    if (content) content.style.padding = '0';
    
    // Show peakDetailPage
    peakDetailPage.style.display = 'block';

    // Set title and subtitle
    const titleEl = document.getElementById('peakDetailTitle');
    if (titleEl) titleEl.textContent = it.name || '\u2014';
    
    const slug = getSlugForName(it.name);
    const data = NH48_DATA?.[slug] || null;

    // Update fast facts with null checks
    const elevEl = document.getElementById('peakDetailElev');
    const locEl = document.getElementById('peakDetailLocation');
    const promEl = document.getElementById('peakDetailProm');
    const diffEl = document.getElementById('peakDetailDiff');
    
    if (elevEl) elevEl.textContent = fmtElevation(it.elevation_ft ?? null) || '\u2014';
    if (locEl) {
      locEl.textContent = data?.["Range / Subrange"] || data?.Range || '\u2014';
      if (locEl.textContent === '') locEl.textContent = '\u2014';
    }
    
    const promFt = data?.["Prominence (ft)"] || data?.Prominence_ft;
    if (promEl) {
      promEl.textContent = promFt ? (meters ? Math.round(promFt * 0.3048) + ' m' : promFt + ' ft') : '\u2014';
    }
    if (diffEl) diffEl.textContent = data?.Difficulty || '\u2014';
    
    // Set date input
    const dateInput = document.getElementById('peakDetailDateInput');
    if (dateInput) {
      dateInput.value = completions[currentList]?.[it.name]?.date || '';
      dateInput.onchange = () => {
        const val = document.getElementById('peakDetailDateInput').value;
        if (val) setDateFor(it.name, val);
      };
    }
  
    // Setup favorite/wishlist buttons
    const favBtn = document.getElementById('peakDetailFavBtn');
    const wishBtn = document.getElementById('peakDetailWishBtn');
    const favIcon = document.getElementById('peakDetailFavIcon');
    const wishIcon = document.getElementById('peakDetailWishIcon');
    const favText = document.getElementById('peakDetailFavText');
    const wishText = document.getElementById('peakDetailWishText');
  
    if (favBtn && wishBtn && it.peak_id) {
      // Update button states
      const isFavorite = favorites.has(it.peak_id);
      const isWishlist = wishlist.has(it.peak_id);
    
    if (isFavorite) {
      favIcon.textContent = '⭐';
      favText.textContent = 'Unfavorite';
      favBtn.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
      favBtn.style.borderColor = '#d4af37';
    } else {
      favIcon.textContent = '☆';
      favText.textContent = 'Favorite';
      favBtn.style.backgroundColor = '';
      favBtn.style.borderColor = '';
    }
    
    if (isWishlist) {
      wishIcon.textContent = '❤️';
      wishText.textContent = 'Remove from Wishlist';
      wishBtn.style.backgroundColor = 'rgba(128, 0, 0, 0.2)';
      wishBtn.style.borderColor = '#800000';
    } else {
      wishIcon.textContent = '🤍';
      wishText.textContent = 'Add to Wishlist';
      wishBtn.style.backgroundColor = '';
      wishBtn.style.borderColor = '';
    }
    
    // Wire up click handlers
    favBtn.onclick = async () => {
      if (!currentUser) {
        alert('Please sign in to use favorites');
        return;
      }
      await toggleFavorite(it.peak_id, 'favorite');
      // Re-open detail to refresh button states
      openPeakDetail(it);
    };
    
    wishBtn.onclick = async () => {
      if (!currentUser) {
        alert('Please sign in to use wishlist');
        return;
      }
      await toggleFavorite(it.peak_id, 'wishlist');
      // Re-open detail to refresh button states
      openPeakDetail(it);
    };
    }

    // Populate month grid if grid tracking is enabled
    const monthGridContainer = document.getElementById('peakDetailMonthGrid');
    const monthGridEl = monthGridContainer?.querySelector('.detail-month-grid');
    if (monthGridEl && gridTrackingEnabled) {
    monthGridEl.innerHTML = '';
    // Use ensureGridRecord to sync classic dates to grid and get/create grid data
    const gridData = ensureGridRecord(currentList, it.name);
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].forEach((month, idx) => {
      const monthNum = idx + 1;
      const dateValue = gridData[String(monthNum)] || '';
      const cell = document.createElement('div');
      cell.className = 'detail-month-cell';
      cell.innerHTML = `
        <label class="month-label">${month}</label>
        <input type="date" class="month-date-input" data-month="${monthNum}" data-name="${it.name}" value="${dateValue}">
      `;
      
      const input = cell.querySelector('.month-date-input');
      input.addEventListener('change', async () => {
        const monthNum = parseInt(input.dataset.month, 10);
        const peakName = input.dataset.name;
        const dateValue = input.value;
        await setGridDate(currentList, peakName, monthNum, dateValue);
      });
      
      monthGridEl.appendChild(cell);
    });
    
    // Show month grid
    if (monthGridContainer) {
      monthGridContainer.style.display = 'block';
    }
  } else if (monthGridContainer) {
    // Hide month grid if tracking is disabled
    monthGridContainer.style.display = 'none';
  }

  // Load and display photos
  const photoContainer = document.getElementById('peakDetailPhotos');
  const carouselEl = document.getElementById('peakCarousel');
  const dotsEl = document.getElementById('peakDots');
  const timerEl = document.getElementById('peakCarouselTimer');
  
  if (!carouselEl || !dotsEl) return;
  
  carouselEl.innerHTML = '';
  dotsEl.innerHTML = '';
  
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
      window.peakCarouselImages = photos;
      window.peakCarouselIndex = 0;
      
      // Build slides
      photos.forEach((photo, i) => {
        const slide = document.createElement('div');
        slide.className = 'peak-carousel-slide' + (i === 0 ? ' active' : '');
        
        const img = document.createElement('img');
        img.alt = `${it.name} image ${i+1} of ${photos.length}`;
        img.src = i === 0 ? photo.url : '';
        img.loading = i === 0 ? 'eager' : 'lazy';
        img.dataset.src = photo.url;
        img.onerror = () => { img.src = placeholderFor(it.name, 800, 600); };
        
        slide.appendChild(img);
        carouselEl.appendChild(slide);
        
        // Create dot
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => window.goToPeakSlide(i, true);
        dotsEl.appendChild(dot);
      });
      
      // Wire up controls
      document.getElementById('peakPrevBtn').onclick = () => window.prevPeakSlide(true);
      document.getElementById('peakNextBtn').onclick = () => window.nextPeakSlide(true);
      
      // Show timer and start carousel
      if (timerEl) timerEl.style.display = 'flex';
      window.startPeakCarousel();
    } else {
      // No photos - show placeholder
      const slide = document.createElement('div');
      slide.className = 'peak-carousel-slide active';
      const img = document.createElement('img');
      img.src = placeholderFor(it.name, 800, 600);
      img.alt = it.name;
      slide.appendChild(img);
      carouselEl.appendChild(slide);
    }
  
  // Update links
  const wxNoaa = document.getElementById('peakWxNoaa');
  const wxOpenMeteo = document.getElementById('peakWxOpenMeteo');
  const wxTrailsNH = document.getElementById('peakWxTrailsNH');
  const wxMWOBS = document.getElementById('peakWxMWOBS');
  const lnkWikipedia = document.getElementById('peakLnkWikipedia');
  const lnkPeakbagger = document.getElementById('peakLnkPeakbagger');
  const lnkAllTrails = document.getElementById('peakLnkAllTrails');
  const lnkSummitPost = document.getElementById('peakLnkSummitPost');
  const lnkMaps = document.getElementById('peakLnkMaps');
  
  if (data) {
    const lat = parseFloat(data.Latitude_dd);
    const lon = parseFloat(data.Longitude_dd);
    if (!isNaN(lat) && !isNaN(lon)) {
      if (wxNoaa) wxNoaa.href = `https://forecast.weather.gov/MapClick.php?lat=${lat}&lon=${lon}`;
      if (wxOpenMeteo) wxOpenMeteo.href = `https://open-meteo.com/en/docs#latitude=${lat}&longitude=${lon}`;
      if (lnkMaps) lnkMaps.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=14`;
    }
    
    const searchName = encodeURIComponent(it.name.replace(/\bMount\b/gi, 'Mt'));
    if (lnkWikipedia) lnkWikipedia.href = `https://en.wikipedia.org/wiki/${searchName.replace(/ /g, '_')}`;
    if (lnkPeakbagger) lnkPeakbagger.href = `https://www.peakbagger.com/search.aspx?tid=S&ss=${searchName}`;
    if (lnkAllTrails) lnkAllTrails.href = `https://www.alltrails.com/search?q=${searchName}`;
    if (lnkSummitPost) lnkSummitPost.href = `https://www.summitpost.org/search?query=${searchName}`;
    if (wxTrailsNH) wxTrailsNH.href = `https://trailsnh.com/search?q=${searchName}`;
    if (wxMWOBS) wxMWOBS.href = 'https://www.mountwashington.org/experience-the-weather/';
  }
  
  } catch (e) {
    console.error('Error opening peak detail:', e);
    alert('An error occurred while loading peak details. Please try again.');
    closePeakDetail();
  }
}

// NH48-style carousel functions
window.updatePeakSlides = function() {
  const slides = document.querySelectorAll('.peak-carousel-slide');
  const dots = document.querySelectorAll('.peak-carousel-dots .dot');
  const idx = window.peakCarouselIndex || 0;
  
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  
  // Lazy load current image
  const currentSlide = slides[idx];
  if (currentSlide) {
    const img = currentSlide.querySelector('img');
    if (img && img.dataset.src && !img.src.includes(img.dataset.src)) {
      img.src = img.dataset.src;
    }
  }
};

window.nextPeakSlide = function(manual = false) {
  const photos = window.peakCarouselImages || [];
  if (photos.length === 0) return;
  
  window.peakCarouselIndex = (window.peakCarouselIndex + 1) % photos.length;
  window.updatePeakSlides();
  if (manual) window.startPeakCarousel();
};

window.prevPeakSlide = function(manual = false) {
  const photos = window.peakCarouselImages || [];
  if (photos.length === 0) return;
  
  window.peakCarouselIndex = (window.peakCarouselIndex - 1 + photos.length) % photos.length;
  window.updatePeakSlides();
  if (manual) window.startPeakCarousel();
};

window.goToPeakSlide = function(index, manual = false) {
  const photos = window.peakCarouselImages || [];
  if (photos.length === 0) return;
  
  window.peakCarouselIndex = index % photos.length;
  window.updatePeakSlides();
  if (manual) window.startPeakCarousel();
};

window.startPeakCarousel = function() {
  window.stopPeakCarousel();
  
  const delay = 8000; // 8 seconds like NH48
  window.startPeakTimer(delay);
  
  window.peakCarouselTimer = setInterval(() => {
    window.nextPeakSlide(false);
    window.startPeakTimer(delay);
  }, delay);
};

window.stopPeakCarousel = function() {
  if (window.peakCarouselTimer) {
    clearInterval(window.peakCarouselTimer);
    window.peakCarouselTimer = null;
  }
  if (window.peakTimerInterval) {
    clearInterval(window.peakTimerInterval);
    window.peakTimerInterval = null;
  }
};

window.startPeakTimer = function(duration) {
  const ring = document.getElementById('peakTimerRing');
  const textEl = document.getElementById('peakTimerText');
  if (!ring || !textEl) return;
  
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = 0;
  
  const start = Date.now();
  const end = start + duration;
  
  if (window.peakTimerInterval) clearInterval(window.peakTimerInterval);
  
  window.peakTimerInterval = setInterval(() => {
    const now = Date.now();
    const remaining = Math.max(end - now, 0);
    const percent = remaining / duration;
    const offset = circumference * (1 - percent);
    ring.style.strokeDashoffset = offset;
    const secs = Math.ceil(remaining / 1000);
    textEl.textContent = secs;
    if (remaining <= 0) {
      clearInterval(window.peakTimerInterval);
      window.peakTimerInterval = null;
    }
  }, 100);
  
  textEl.textContent = Math.ceil(duration / 1000);
};

function closePeakDetail() {
  // Stop carousel timer
  if (window.stopPeakCarousel) {
    window.stopPeakCarousel();
  }
  
  const gridView = document.getElementById('grid-view');
  const listView = document.getElementById('list-view');
  const pagerWraps = document.querySelectorAll('.pager-wrap');
  const sidebar = document.querySelector('.sidebar');
  const topbar = document.querySelector('.topbar');
  const content = document.querySelector('.content');
  
  // Hide detail page
  document.getElementById('peakDetailPage').style.display = 'none';
  
  // Show main content
  if (sidebar) sidebar.style.display = 'block';
  if (topbar) topbar.style.display = 'block';
  if (content) content.style.padding = '';
  
  // Show the appropriate view (grid or list)
  if (gridMode) {
    if (gridView) gridView.style.display = 'grid';
    if (listView) listView.style.display = 'none';
  } else {
    if (gridView) gridView.style.display = 'none';
    if (listView) listView.style.display = 'block';
  }
  
  // Show pagination
  pagerWraps.forEach(p => p.style.display = 'flex');
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

async function applyGridTracking(enabled) {
  gridTrackingEnabled = !!enabled;
  if (gridTrackingToggle) gridTrackingToggle.checked = !!enabled;
  
  // Save to local preferences
  const p = readPrefs();
  p.gridTracking = !!enabled;
  writePrefs(p);
  
  // Save to Supabase if user is logged in
  if (currentUser && currentList) {
    try {
      const { data: lists } = await supabase
        .from('lists')
        .select('id')
        .eq('slug', slugify(currentList))
        .single();
      
      if (lists) {
        await supabase
          .from('user_grid_settings')
          .upsert({
            user_id: currentUser.id,
            list_id: lists.id,
            grid_enabled: !!enabled,
            last_updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,list_id'
          });
      }
    } catch (e) {
      console.error('Failed to save grid tracking setting:', e);
    }
  }
  
  // Re-render to show/hide month grid
  renderView();
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

// Set date for a peak - creates/updates hike log in user_hike_logs table
function setDateFor(peakName, dateStr) {
  completions[currentList] ??= {};
  completions[currentList][peakName] ??= { done: false, date: '' };
  
  const oldDate = completions[currentList][peakName].date;
  completions[currentList][peakName].date = dateStr;
  
  // SYNC: When date is set, always mark as completed
  // When date is cleared, mark as not completed (but don't delete logs)
  if (dateStr) {
    completions[currentList][peakName].done = true;
    
    // PRIMARY: Create/update hike log entry - this is the source of truth
    createOrUpdateHikeLog(peakName, dateStr, { updateExisting: !!oldDate });
    
    // SYNC TO GRID: Also set the corresponding month in grid mode (legacy support)
    if (gridTrackingEnabled) {
      const month = new Date(dateStr).getMonth() + 1;
      const gridRec = ensureGridRecord(currentList, peakName);
      gridRec[String(month)] = dateStr;
      saveGridToSupabase(peakName, month, dateStr);
    }
  } else {
    completions[currentList][peakName].done = false;
    // Note: We don't delete hike logs when clearing date via date picker
    // User can delete individual logs from the peak detail page
  }
  
  saveState();
  queueRemoteSave();
  playPingSound();
  renderView();  // Full re-render to update both list and grid UI
}

// Create or update a hike log entry when quick-logging a date
// This is the PRIMARY function for saving completion status - all progress is stored in user_hike_logs
async function createOrUpdateHikeLog(peakName, dateStr, options = {}) {
  if (!currentUser || !currentList) return null;
  
  try {
    // Get the list ID
    const { data: listData } = await supabase
      .from('lists')
      .select('id')
      .eq('slug', slugify(currentList))
      .single();
    
    const listId = listData?.id || null;
    
    // Get the peak ID by name
    const { data: peak, error: peakError } = await supabase
      .from('peaks')
      .select('id')
      .eq('name', peakName)
      .single();
    
    if (peakError || !peak) {
      console.log('createOrUpdateHikeLog: Peak not found:', peakName);
      return null;
    }
    
    const peakId = peak.id;
    
    // Check if a hike log already exists for this peak (any date)
    // This helps us decide whether to update an existing log or create new
    const { data: existingLogs } = await supabase
      .from('user_hike_logs')
      .select('id, hike_date')
      .eq('user_id', currentUser.id)
      .eq('peak_id', peakId)
      .order('hike_date', { ascending: false })
      .limit(1);
    
    const existingLog = existingLogs?.[0];
    
    // Check if a log exists for this specific date
    const { data: existingForDate } = await supabase
      .from('user_hike_logs')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('peak_id', peakId)
      .eq('hike_date', dateStr)
      .maybeSingle();
    
    if (existingForDate) {
      // Already exists for this date, no need to create
      console.log('createOrUpdateHikeLog: Log already exists for', peakName, dateStr);
      return existingForDate.id;
    }
    
    // If updating from checkbox (options.updateExisting) and a log exists, update its date
    if (options.updateExisting && existingLog && !existingForDate) {
      const { error: updateError } = await supabase
        .from('user_hike_logs')
        .update({
          hike_date: dateStr,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLog.id);
      
      if (updateError) {
        console.error('createOrUpdateHikeLog: Update error:', updateError);
        return null;
      }
      
      console.log('createOrUpdateHikeLog: Updated log date for', peakName, 'to', dateStr);
      return existingLog.id;
    }
    
    // Create a new hike log entry
    const { data: newLog, error: insertError } = await supabase
      .from('user_hike_logs')
      .insert({
        user_id: currentUser.id,
        list_id: listId,
        peak_id: peakId,
        hike_date: dateStr,
        notes: '',
        visibility: 'private',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error('createOrUpdateHikeLog: Insert error:', insertError);
      return null;
    }
    
    console.log('createOrUpdateHikeLog: Created log for', peakName, dateStr, '- ID:', newLog?.id);
    return newLog?.id || null;
  } catch (e) {
    console.error('createOrUpdateHikeLog error:', e);
    return null;
  }
}

// Toggle completion status - creates hike log on check, preserves log on uncheck
function toggleComplete(peakName) {
  completions[currentList] ??= {};
  const rec = completions[currentList][peakName] ??= { done: false, date: '' };
  rec.done = !rec.done;
  
  if (!rec.done) {
    // Unchecking - clear local state but preserve hike logs in DB
    // User can delete individual logs from peak detail page if needed
    rec.date = '';
    console.log('toggleComplete: Unchecked', peakName, '- hike logs preserved in DB');
  } else {
    // Checking - create a new hike log entry with today's date
    const today = new Date();
    rec.date = today.toISOString().split('T')[0];
    
    // PRIMARY: Create hike log entry - this is the source of truth
    createOrUpdateHikeLog(peakName, rec.date);
    
    // SYNC TO GRID: Also set the corresponding month in grid mode (legacy support)
    if (gridTrackingEnabled) {
      const month = today.getMonth() + 1;
      const gridRec = ensureGridRecord(currentList, peakName);
      gridRec[String(month)] = rec.date;
      saveGridToSupabase(peakName, month, rec.date);
    }
  }
  
  completions[currentList][peakName] = rec;
  
  saveState();
  queueRemoteSave();
  playPingSound();
  renderView(); // Update both list and grid UI
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
  
  // Apply status filter
  filteredItems = applyStatusFilter(filteredItems);
  
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
      // Always sync date and completion
      setDateFor(it.name, dateInput.value || '');
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
// Helper function to apply status filter
function applyStatusFilter(items) {
  if (!items || !Array.isArray(items)) return [];
  
  let filtered = items;
  
  // Status filter
  if (statusFilter === 'completed') {
    filtered = filtered.filter(it => it.completed);
  } else if (statusFilter === 'incomplete') {
    filtered = filtered.filter(it => !it.completed);
  } else if (statusFilter === 'favorites') {
    filtered = filtered.filter(it => it.peak_id && favorites.has(it.peak_id));
  } else if (statusFilter === 'wishlist') {
    filtered = filtered.filter(it => it.peak_id && wishlist.has(it.peak_id));
  }
  
  // Range filter
  if (rangeFilter && rangeFilter !== 'all') {
    filtered = filtered.filter(it => {
      const range = it.range || '';
      return range.toLowerCase().includes(rangeFilter.toLowerCase());
    });
  }
  
  // Elevation filters
  if (elevationMin !== '' && elevationMin !== null) {
    const minElev = parseInt(elevationMin, 10);
    if (!isNaN(minElev)) {
      filtered = filtered.filter(it => (it.elevation_ft || 0) >= minElev);
    }
  }
  if (elevationMax !== '' && elevationMax !== null) {
    const maxElev = parseInt(elevationMax, 10);
    if (!isNaN(maxElev)) {
      filtered = filtered.filter(it => (it.elevation_ft || 0) <= maxElev);
    }
  }
  
  return filtered;
}

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
  
  // Apply status filter
  filteredItems = applyStatusFilter(filteredItems);
  
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
  
  // Use DocumentFragment for batch DOM updates - much faster
  const fragment = document.createDocumentFragment();
  
  for (const it of pageItems) {
    const card = document.createElement('article');
    card.className = 'peak-card';
    
    // Determine card color based on completion and favorite status
    if (it.peak_id) {
      if (it.completed) {
        card.classList.add('card-complete');
      } else if (favorites.has(it.peak_id)) {
        card.classList.add('card-favorite');
      } else if (wishlist.has(it.peak_id)) {
        card.classList.add('card-wishlist');
      } else {
        card.classList.add('card-incomplete');
      }
    }

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
      <div class="peak-card-thumb img-loading">
        <img class="img-blur" data-full-src="${imgSrc || placeholderFor(it.name, 800, 480)}" src="${lowResPlaceholder()}" alt="${it.name}" loading="lazy" decoding="async">
      </div>
      <div class="peak-card-body ${it.completed ? 'completed' : ''}">
        <h3>${it.name}</h3>
        <div class="peak-card-meta">
          <div class="peak-card-meta-row">
            <span class="peak-card-meta-label">${t('Rank')}</span>
            <span class="peak-card-meta-value">${it.rank}</span>
          </div>
          <div class="peak-card-meta-row">
            <span class="peak-card-meta-label">${t('Elevation')}</span>
            <span class="peak-card-meta-value">${elevStr}</span>
          </div>
          <div class="peak-card-meta-row range-row">
            <span class="peak-card-meta-label">${t('Range')}</span>
            <span class="peak-card-meta-value">${rangeStr}</span>
          </div>
          ${gridTrackingEnabled ? `
          <div class="peak-card-month-grid-container">
            <div class="peak-card-month-grid-label">${t('Monthly Completions')}</div>
            <div class="peak-card-month-grid">
              ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                const monthNum = idx + 1;
                // Use ensureGridRecord to sync classic dates to grid and get/create grid data
                const gridData = ensureGridRecord(currentList, it.name);
                const dateValue = gridData[String(monthNum)] || '';
                return `
                  <div class="month-cell">
                    <label class="month-label">${t(month)}</label>
                    <input type="date" class="month-date-input" data-month="${monthNum}" data-name="${it.name}" value="${dateValue}">
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          ` : `
          <div class="peak-card-meta-row">
            <span class="peak-card-meta-label">${t('Date')}</span>
            <span class="peak-card-meta-value"><input type="date" class="card-date-input" value="${it.date || ''}" data-name="${it.name}" placeholder="mm/dd/yyyy" style="background:var(--input-bg);border:1px solid var(--border);border-radius:6px;padding:4px 8px;color:var(--ink);font-size:0.85rem;width:100%;min-width:120px;box-sizing:border-box;"></span>
          </div>
          `}
          <div class="peak-card-meta-row">
            <span class="peak-card-meta-label">${t('Completed')}</span>
            <span class="peak-card-meta-value"><img class="check card-check" alt="completed" src="${it.completed ? CHECKED_IMG : UNCHECKED_IMG}" loading="lazy" style="width:20px;height:20px;cursor:pointer;"></span>
          </div>
        </div>
      </div>
    `;

    // Event handlers
    card.addEventListener('click', () => openPeakDetail(it));
    
    if (gridTrackingEnabled) {
      // Wire up all month date inputs
      const monthInputs = card.querySelectorAll('.month-date-input');
      monthInputs.forEach(input => {
        input.addEventListener('click', e => e.stopPropagation());
        input.addEventListener('change', async () => {
          const monthNum = parseInt(input.dataset.month, 10);
          const peakName = input.dataset.name;
          const dateValue = input.value;
          await setGridDate(currentList, peakName, monthNum, dateValue);
        });
      });
    } else {
      // Wire up single date input
      const dateInput = card.querySelector('.card-date-input');
      dateInput?.addEventListener('click', e => e.stopPropagation());
      dateInput?.addEventListener('change', () => {
        // Always sync date and completion - setting date marks complete, clearing date marks incomplete
        setDateFor(it.name, dateInput.value || '');
      });
    }
    
    card.querySelector('.card-check')?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleComplete(it.name);
    });

    fragment.appendChild(card);
  }
  
  // Append all cards at once for better performance
  gridView.appendChild(fragment);
  
  // Progressive image loading using IntersectionObserver
  observeGridImages();
  
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
  
  try {
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
  
  // Apply status filter
  items = applyStatusFilter(items);
  
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
        // Always sync date and completion
        setDateFor(it.name, dateInput.value || '');
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
        // renderView is called by setGridDate
      });
      tr.querySelector('.grid-clear')?.addEventListener('click', e => {
        e.stopPropagation();
        setGridDate(currentList, it.name, activeMonth, '');
        // renderView is called by setGridDate
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
  } catch (e) {
    console.error('Error rendering table:', e);
    rows.innerHTML = '<tr><td colspan="6" style="padding:20px;text-align:center;color:red">Error loading table: ' + e.message + '</td></tr>';
  }
}

// =====================================================
// List Switching
// =====================================================
async function changeList(name) {
  currentList = name;
  PAGE = 1;
  if (listTitle) listTitle.textContent = currentList || '—';
  console.log('📌 changeList() called with:', name);
  
  // Load data from Supabase BEFORE rendering so completions are available
  if (currentUser) {
    await loadStateFromSupabase();
    await loadGridFromSupabase();
    await loadGridTrackingSettings();
  }
  
  try {
    await renderView();
    console.log('✅ List rendered successfully');
  } catch (e) {
    console.error('❌ Error rendering list:', e);
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

// Status filter dropdown
const statusFilterEl = document.getElementById('statusFilter');
if (statusFilterEl) {
  statusFilterEl.addEventListener('change', () => {
    statusFilter = statusFilterEl.value;
    PAGE = 1;
    renderView();
  });
}

// Advanced filters
const rangeFilterEl = document.getElementById('rangeFilter');
const elevationMinEl = document.getElementById('elevationMin');
const elevationMaxEl = document.getElementById('elevationMax');
const clearFiltersBtn = document.getElementById('clearFilters');

if (rangeFilterEl) {
  rangeFilterEl.addEventListener('change', () => {
    rangeFilter = rangeFilterEl.value;
    PAGE = 1;
    renderView();
  });
}

if (elevationMinEl) {
  elevationMinEl.addEventListener('change', () => {
    elevationMin = elevationMinEl.value;
    PAGE = 1;
    renderView();
  });
}

if (elevationMaxEl) {
  elevationMaxEl.addEventListener('change', () => {
    elevationMax = elevationMaxEl.value;
    PAGE = 1;
    renderView();
  });
}

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener('click', () => {
    statusFilter = 'all';
    rangeFilter = 'all';
    elevationMin = '';
    elevationMax = '';
    
    if (statusFilterEl) statusFilterEl.value = 'all';
    if (rangeFilterEl) rangeFilterEl.value = 'all';
    if (elevationMinEl) elevationMinEl.value = '';
    if (elevationMaxEl) elevationMaxEl.value = '';
    
    PAGE = 1;
    renderView();
  });
}

exportBtn.onclick = async () => {
  try {
    const q = searchEl.value.trim().toLowerCase();
    const base = await baseItemsFor(currentList);
    
    if (!base || base.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Apply same filters as current view
    let allItems = base.map(it => {
      const c = completions[currentList]?.[it.name] ?? { done: false, date: '' };
      return { ...it, completed: !!c.done, date: c.date || '' };
    });
    
    // Apply search filter
    let filteredItems = allItems.filter(it => !q || it.name.toLowerCase().includes(q));
    
    // Apply status, range, and elevation filters
    filteredItems = applyStatusFilter(filteredItems);
    
    // Apply hideCompleted filter
    if (hideCompleted) {
      filteredItems = filteredItems.filter(it => !it.completed);
    }
    
    // Convert to export format
    const items = filteredItems.map((it, i) => {
      const gridData = gridTrackingEnabled && completionsGrid[currentList]?.[it.name];
      const monthsCompleted = gridData ? Object.values(gridData).filter(d => d).length : 0;
      
      return [
        it.rank || (i + 1),
        it.name || '',
        fmtElevation(it.elevation_ft ?? null) || '—',
        it.range || '—',
        it.date || '',
        it.completed ? 'Yes' : 'No',
        gridTrackingEnabled ? monthsCompleted : ''
      ];
    });
    
    const headers = gridTrackingEnabled 
      ? ['Rank', 'Mountain', 'Elevation', 'Range', 'First Date', 'Completed', 'Months']
      : ['Rank', 'Mountain', 'Elevation', 'Range', 'Date', 'Completed'];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...items]);
    ws['!cols'] = [{ wch: 6 }, { wch: 26 }, { wch: 14 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 8 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentList.slice(0, 31));
    
    const fileName = `${currentList.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (e) {
    console.error('Export failed:', e);
    alert('Failed to export data. Please try again.');
  }
};

if (unitToggle) unitToggle.onclick = () => applyUnitsFlag(!meters);
if (metersToggle) metersToggle.onchange = () => applyUnitsFlag(metersToggle.checked);
if (themeSelect) themeSelect.onchange = () => applyTheme(themeSelect.value);

if (densityToggle) densityToggle.onchange = () => applyDensity(densityToggle.checked);
if (stickyToggle) stickyToggle.onchange = () => applyStickyHeader(stickyToggle.checked);
if (gridTrackingToggle) gridTrackingToggle.onchange = () => applyGridTracking(gridTrackingToggle.checked);

if (tosTextEl) tosTextEl.innerHTML = TERMS_TEXT;
if (tosToggle) tosToggle.onclick = () => {
  tosBox.classList.toggle('open');
  tosToggle.textContent = tosBox.classList.contains('open') ? '📄 Hide Terms & Conditions' : '📄 View Terms & Conditions';
};
if (tosAgree) tosAgree.addEventListener('change', () => { if (doSignupBtn) doSignupBtn.disabled = !tosAgree.checked; });

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

// Mobile login button
const openAuthMobileBtn = document.getElementById('openAuthMobile');
if (openAuthMobileBtn) openAuthMobileBtn.onclick = () => openModal();

// Nav login button
const openAuthNavBtn = document.getElementById('openAuthNav');
if (openAuthNavBtn) openAuthNavBtn.onclick = () => openModal();

// Toggle between login and signup forms
if (showSignup) showSignup.onclick = (e) => {
  e.preventDefault();
  showSignupForm();
};
if (showLogin) showLogin.onclick = (e) => {
  e.preventDefault();
  showLoginForm();
};

// Login handler
if (doLoginBtn) doLoginBtn.onclick = async () => {
  authMsg.textContent = '';
  try {
    const remember = rememberMe ? rememberMe.checked : true;
    await signIn(loginEmail.value, loginPass.value, remember);
    authMsg.textContent = 'Success!';
    authMsg.className = 'ok';
    setTimeout(() => {
      closeModal();
      reflectAuthUI();
    }, 500);
  } catch (e) {
    authMsg.textContent = e.message || 'Failed to log in';
    authMsg.className = 'err';
  }
};

// Signup handler
if (doSignupBtn) doSignupBtn.onclick = async () => {
  authMsg.textContent = '';
  
  // Bot prevention check
  if (!checkBotPrevention()) {
    authMsg.textContent = 'Invalid submission';
    authMsg.className = 'err';
    return;
  }
  
  // Validate password match
  if (!validatePasswordMatch()) {
    return; // Error message already set in validatePasswordMatch
  }
  
  try {
    await signUp(
      signupFirstName.value,
      signupLastName.value,
      signupEmail.value,
      signupPass.value,
      { tosAgreed: tosAgree.checked }
    );
    authMsg.textContent = 'Account created & signed in!';
    authMsg.className = 'ok';
    setTimeout(() => {
      closeModal();
      reflectAuthUI();
    }, 1000);
  } catch (e) {
    authMsg.textContent = e.message || 'Failed to create account';
    authMsg.className = 'err';
  }
};

// Real-time password match validation
if (signupPassConfirm) {
  signupPassConfirm.addEventListener('input', () => {
    if (signupPass.value && signupPassConfirm.value) {
      if (signupPass.value === signupPassConfirm.value) {
        authMsg.textContent = '';
        signupPassConfirm.style.borderColor = '';
      } else {
        signupPassConfirm.style.borderColor = '#ff6b6b';
      }
    }
  });
}

// Language selector event listeners
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.lang);
  });
});

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
    applyGridTracking(!!prefs.gridTracking);  // Default to false
    
    // Set language
    if (prefs.language) {
      currentLanguage = prefs.language;
      updateLanguageButtons();
    }

    if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

    // Initialize auth state
    await getCurrentUserData();
    await reflectAuthUI();
    
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

/**
 * i18n.js - Internationalization system for English/Japanese language toggle
 * Handles all UI text translations and language switching
 */

// Translation dictionary
const translations = {
  en: {
    // index.html - Auth Modal
    auth: {
      title: "Sign in to continue",
      message: "Please log in or register to collect videos and save your favorites.",
      loginBtn: "Log In",
      registerBtn: "Register"
    },

    // nfc.html - Landing Screen
    nfc: {
      title: "Want to come back?",
      tagline: "Save good spots on the spot.",
      findVenueBtn: "Save this venue",
      benefit1: "All your favorite spots in one app",
      benefit2: "Reservations, perks & updates arrive here",
      benefit3: "No Line or social follows needed",
      loadingText: "Finding venue near you...",
      qrLoadingText: "Loading venue...",
      gridHeader: "Choose a Nearby Venue",
      allVenuesHeader: "Browse All Venues",
      allVenuesSubheader: "Select a venue or scan a QR code",
      scanQRInstead: "📷 Scan QR Code Instead",
      scanTitle: "Scan Venue QR Code",
      scanDescription: "Point your camera at the QR code at this venue",
      cancelBtn: "Cancel",
      noVenueTitle: "No venue nearby",
      noVenueDescription: "We couldn't find a partnered venue within 100m of your location.",
      tryQRBtn: "Scan QR Code Instead",
      backBtn: "Go Back",
      collectBtn: "Collect to Omochi",
      cameraError: "Camera access denied. Please enable camera permission."
    },

    // Store Choice Modal
    storeChoice: {
      title: "Choose Your Store",
      subtitle: "Select how you'd like to find your venue",
      browseBtn: "🏪 Browse Stores",
      scanQRBtn: "📷 Scan QR Code"
    },

    // nfc.html - Omochi Modal
    omochiModal: {
      title: "Collect this venue",
      message: "Once Omochi opens, add it to your home screen. You'll be able to access all your collected venues anytime.",
      iosStep1: "1. Tap the Share icon",
      iosStep2: '2. Scroll down and tap "Add to Home Screen"',
      androidStep1: "1. Tap the Menu icon",
      androidStep2: '2. Tap "Add to Home screen"',
      organizationNote: "📱 Save once. Then access all your collected venues with one tap.",
      registrationNote: "",
      continueBtn: "Open Omochi"
    },

    // collect.html
    collection: {
      backBtn: "← Back",
      title: "Your Collection",
      successIcon: "✓",
      successTitle: "Item Collected!",
      successMessage: "Your item has been successfully added to your collection.",
      continueBtn: "Continue Browsing"
    },

    // app.js - Dynamic Strings
    errors: {
      noVideos: "No videos available",
      loadingError: "Error loading videos"
    },

    // Common
    common: {
      collectBtn: "Collect"
    }
  },

  ja: {
    // index.html - Auth Modal
    auth: {
      title: "サインインして続ける",
      message: "動画を収集してお気に入りを保存するには、ログインまたは登録してください。",
      loginBtn: "ログイン",
      registerBtn: "登録"
    },

    // nfc.html - Landing Screen
    nfc: {
      title: "また来たい？",
      tagline: "いい店は、その場で残す。",
      findVenueBtn: "このお店を残す",
      benefit1: "お気に入りのお店だけが一つのアプリに集まる",
      benefit2: "予約・特典・最新情報もここに届く",
      benefit3: "Line・SNSフォロー不要",
      loadingText: "お店を探しています...",
      qrLoadingText: "読み込み中...",
      gridHeader: "今いるお店を選択",
      allVenuesHeader: "全てのお店を見る",
      allVenuesSubheader: "お店を選択するか、QRコードをスキャン",
      scanQRInstead: "📷 QRコードをスキャン",
      scanTitle: "お店のQRコードをスキャン",
      scanDescription: "このお店のQRコードにカメラを向けてください",
      cancelBtn: "キャンセル",
      noVenueTitle: "近くにお店がありません",
      noVenueDescription: "あなたの位置から100m以内にお店が見つかりませんでした。",
      tryQRBtn: "代わりにQRコードをスキャン",
      backBtn: "戻る",
      collectBtn: "Omochiに集める",
      cameraError: "カメラアクセスが拒否されました。カメラの許可を有効にしてください。"
    },

    // Store Choice Modal
    storeChoice: {
      title: "お店を選択",
      subtitle: "お店の探し方を選んでください",
      browseBtn: "🏪 お店一覧から選ぶ",
      scanQRBtn: "📷 QRコードをスキャン"
    },

    // nfc.html - Omochi Modal
    omochiModal: {
      title: "このお店を集める",
      message: "あと少しで完了！Omochiを開いたら、ホーム画面に追加してください。集めたお店がいつでもすぐ見れるようになります。",
      iosStep1: "1. 共有アイコンをタップ",
      iosStep2: "2. 下にスクロールして「ホーム画面に追加」をタップ",
      androidStep1: "1. メニューアイコンをタップ",
      androidStep2: "2. 「ホーム画面に追加」をタップ",
      organizationNote: "保存出来たら、ホーム画面からOmochiを開いて20秒で無料登録完了",
      registrationNote: "これで終わり！次からはOmochiを使って、街やSNSで見つけたいいお店を自分だけのコレクションに集めましょう",
      continueBtn: "Omochiで開く"
    },

    // collect.html
    collection: {
      backBtn: "← 戻る",
      title: "あなたのコレクション",
      successIcon: "✓",
      successTitle: "お店をコレクションしました！",
      successMessage: "アイテムがコレクションに正常に追加されました。",
      continueBtn: "閲覧を続ける"
    },

    // app.js - Dynamic Strings
    errors: {
      noVideos: "動画がありません",
      loadingError: "動画の読み込みエラー"
    },

    // Common
    common: {
      collectBtn: "集める"
    }
  }
};

// Global state - always default to Japanese
let currentLanguage = 'ja';

/**
 * Core translation function
 * @param {string} key - Dot-notation key (e.g., 'auth.title')
 * @returns {string} - Translated string or key if not found
 */
function t(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];

  // Navigate through nested object
  for (const k of keys) {
    value = value?.[k];
  }

  // Fallback to English if Japanese translation missing
  if (!value) {
    value = translations.en;
    for (const k of keys) {
      value = value?.[k];
    }
  }

  return value || key;
}

/**
 * Set current language and update all page text
 * @param {string} lang - Language code ('en' or 'ja')
 */
function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'ja') {
    console.warn('[i18n] Unsupported language:', lang);
    return;
  }

  console.log(`[i18n] Switching language to: ${lang}`);
  currentLanguage = lang;
  updatePageText();      // Update static HTML elements
  updateDynamicContent(); // Update already-rendered videos/venues
  updateToggleUI();       // Update toggle button active state
  console.log('[i18n] Language switch complete');
}

/**
 * Get current language
 * @returns {string} - Current language code
 */
function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Get page name from URL
 * @returns {string} - Page name ('index', 'nfc', 'collect')
 */
function getPageName() {
  const path = window.location.pathname;
  // On nfc-standalone branch, index.html IS the NFC page
  if (path.includes('index.html') || path.endsWith('/')) return 'nfc';
  if (path.includes('collect.html')) return 'collect';
  return 'nfc';  // Default to nfc for standalone branch
}

/**
 * Update all translatable text on current page
 */
function updatePageText() {
  const pageName = getPageName();

  switch(pageName) {
    case 'index':
      updateIndexPage();
      break;
    case 'nfc':
      updateNFCPage();
      break;
    case 'collect':
      updateCollectPage();
      break;
  }
}

/**
 * Update index.html page text
 */
function updateIndexPage() {
  // Auth modal
  const authTitle = document.querySelector('#authModal h2');
  const authMessage = document.querySelector('.auth-modal-message');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (authTitle) authTitle.textContent = t('auth.title');
  if (authMessage) authMessage.textContent = t('auth.message');
  if (loginBtn) loginBtn.textContent = t('auth.loginBtn');
  if (registerBtn) registerBtn.textContent = t('auth.registerBtn');

  // Update all collect buttons (dynamically created)
  document.querySelectorAll('.collect-btn').forEach(btn => {
    if (btn.tagName === 'A') {
      btn.textContent = t('common.collectBtn');
    }
  });
}

/**
 * Update nfc.html page text
 */
function updateNFCPage() {
  const elements = {
    '#nfcTitle': t('nfc.title'),
    '#nfcTagline': t('nfc.tagline'),
    '#findVenueBtnText': t('nfc.findVenueBtn'),
    '#benefit1Text': t('nfc.benefit1'),
    '#benefit2Text': t('nfc.benefit2'),
    '#benefit3Text': t('nfc.benefit3'),
    '#loadingScreen p': t('nfc.loadingText'),
    '#qrLoadingText': t('nfc.qrLoadingText'),
    '.scanner-header h2': t('nfc.scanTitle'),
    '.scanner-header p': t('nfc.scanDescription'),
    '#cancelScanBtn': t('nfc.cancelBtn'),
    '#noVenueScreen h2': t('nfc.noVenueTitle'),
    '#noVenueScreen p': t('nfc.noVenueDescription'),
    '#tryQRBtn': t('nfc.tryQRBtn'),
    '#backBtn': t('nfc.backBtn')
  };

  for (const [selector, text] of Object.entries(elements)) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  // Store Choice Modal
  const storeChoiceTitle = document.getElementById('storeChoiceTitle');
  const storeChoiceSubtitle = document.getElementById('storeChoiceSubtitle');
  const browseStoresBtn = document.getElementById('browseStoresBtn');
  const scanQRBtn = document.getElementById('scanQRBtn');

  if (storeChoiceTitle) storeChoiceTitle.textContent = t('storeChoice.title');
  if (storeChoiceSubtitle) storeChoiceSubtitle.textContent = t('storeChoice.subtitle');
  if (browseStoresBtn) browseStoresBtn.textContent = t('storeChoice.browseBtn');
  if (scanQRBtn) scanQRBtn.textContent = t('storeChoice.scanQRBtn');

  // Omochi Modal - Special handling for elements with nested HTML
  const omochiModalMessage = document.getElementById('omochiModalMessage');
  const omochiOrganizationNote = document.getElementById('omochiOrganizationNote');
  const omochiRegistrationNote = document.getElementById('omochiRegistrationNote');
  const registrationNoteContainer = document.getElementById('registrationNote');

  if (omochiModalMessage) omochiModalMessage.textContent = t('omochiModal.message');
  if (omochiOrganizationNote) omochiOrganizationNote.textContent = t('omochiModal.organizationNote');

  // Hide registration note container if translation is empty
  const registrationNoteText = t('omochiModal.registrationNote');
  if (omochiRegistrationNote) omochiRegistrationNote.textContent = registrationNoteText;
  if (registrationNoteContainer) {
    registrationNoteContainer.style.display = registrationNoteText ? 'block' : 'none';
  }

  // Re-translate modal title and button if modal is currently visible
  const modal = document.getElementById('omochiModal');
  if (modal && modal.classList.contains('show')) {
    const modalTitle = document.getElementById('omochiModalTitle');
    if (modalTitle) {
      modalTitle.textContent = t('omochiModal.title');
    }

    const continueBtn = document.getElementById('omochiContinueBtn');
    if (continueBtn) {
      continueBtn.textContent = t('omochiModal.continueBtn');
    }
  }

  // iOS Instructions (preserve icon)
  const iosStep1 = document.getElementById('omochiIOSStep1');
  if (iosStep1) {
    iosStep1.innerHTML = '';
    const iosStep1Strong = document.createElement('strong');
    iosStep1Strong.textContent = t('omochiModal.iosStep1');
    iosStep1.appendChild(iosStep1Strong);
    iosStep1.innerHTML += ' <svg class="ios-share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M12 3l4 4M12 3L8 7"/><path d="M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"/></svg>';
  }

  const iosStep2 = document.getElementById('omochiIOSStep2');
  if (iosStep2) {
    iosStep2.innerHTML = '';
    const iosStep2Strong = document.createElement('strong');
    iosStep2Strong.textContent = t('omochiModal.iosStep2');
    iosStep2.appendChild(iosStep2Strong);
  }

  // Android Instructions (preserve icon)
  const androidStep1 = document.getElementById('omochiAndroidStep1');
  if (androidStep1) {
    androidStep1.innerHTML = '';
    const androidStep1Strong = document.createElement('strong');
    androidStep1Strong.textContent = t('omochiModal.androidStep1');
    androidStep1.appendChild(androidStep1Strong);
    androidStep1.innerHTML += ' <svg class="android-menu-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
  }

  const androidStep2 = document.getElementById('omochiAndroidStep2');
  if (androidStep2) {
    androidStep2.innerHTML = '';
    const androidStep2Strong = document.createElement('strong');
    androidStep2Strong.textContent = t('omochiModal.androidStep2');
    androidStep2.appendChild(androidStep2Strong);
  }
}

/**
 * Update collect.html page text
 */
function updateCollectPage() {
  const backBtn = document.querySelector('.back-btn');
  const title = document.querySelector('.collection-header h1');
  const successTitle = document.querySelector('.success-message h2');
  const successMessage = document.querySelector('.success-message p');
  const continueBtn = document.querySelector('.btn-primary');

  if (backBtn) backBtn.textContent = t('collection.backBtn');
  if (title) title.textContent = t('collection.title');
  if (successTitle) successTitle.textContent = t('collection.successTitle');
  if (successMessage) successMessage.textContent = t('collection.successMessage');
  if (continueBtn) continueBtn.textContent = t('collection.continueBtn');
}

/**
 * Update dynamic content (already-rendered videos/venues) when language changes
 */
function updateDynamicContent() {
  const pageName = getPageName();

  if (pageName === 'index') {
    // Update all video captions
    const captions = document.querySelectorAll('.reel-caption');
    captions.forEach((caption, index) => {
      // Check if videos array exists (from app.js)
      if (typeof videos !== 'undefined' && videos[index]) {
        caption.textContent = currentLanguage === 'ja' && videos[index].caption_ja
          ? videos[index].caption_ja
          : videos[index].caption;
      }
    });
  } else if (pageName === 'nfc') {
    const venueScreen = document.getElementById('venueScreen');

    if (venueScreen && venueScreen.classList.contains('active')) {
      // Check if grid is displayed (not single venue)
      const isGridView = venueScreen.querySelector('.venue-grid-container');

      if (isGridView) {
        // Re-render the appropriate grid
        if (window._currentVenueGrid && window._currentVenueGrid.length > 0) {
          // This was the nearby venues grid
          if (typeof displayVenueGrid === 'function') {
            displayVenueGrid(window._currentVenueGrid);
          }
        } else {
          // This was the "all venues" fallback grid
          if (typeof displayAllVenuesGrid === 'function') {
            displayAllVenuesGrid();
          }
        }
      } else if (typeof currentVenue !== 'undefined' && currentVenue) {
        // Single venue display
        if (typeof displayVenue === 'function') {
          displayVenue(currentVenue);
        }
      }
    }
  }
}

/**
 * Update toggle button active states
 */
function updateToggleUI() {
  const buttons = document.querySelectorAll('.lang-btn');
  console.log(`[i18n] Updating toggle UI for language: ${currentLanguage}`);
  console.log(`[i18n] Found ${buttons.length} buttons to update`);

  buttons.forEach(btn => {
    const isActive = btn.dataset.lang === currentLanguage;
    if (isActive) {
      btn.classList.add('active');
      console.log(`[i18n] Set ${btn.dataset.lang} button to active`);
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Initialize language toggle button listeners
 */
function initLanguageToggle() {
  console.log('[i18n] Initializing language toggle...');

  const toggle = document.getElementById('languageToggle');
  if (!toggle) {
    console.error('[i18n] Language toggle element (#languageToggle) not found!');
    return;
  }

  const buttons = toggle.querySelectorAll('.lang-btn');
  console.log(`[i18n] Found ${buttons.length} language buttons`);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      console.log(`[i18n] Language button clicked: ${lang}`);
      setLanguage(lang);
    });
  });

  console.log('[i18n] Language toggle initialized successfully');
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLanguageToggle();
    updatePageText();       // Apply translations to match default language
  });
} else {
  initLanguageToggle();
  updatePageText();         // Apply translations to match default language
}

// Export functions to window global scope
if (typeof window !== 'undefined') {
  window.t = t;
  window.setLanguage = setLanguage;
  window.getCurrentLanguage = getCurrentLanguage;
}



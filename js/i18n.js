/**
 * Internationalization (i18n) module for language switching
 * Supports English and Japanese
 */

// Language translations
const translations = {
    en: {
        // Index page
        loading: 'Loading...',
        noVideos: 'No videos available',
        errorLoading: 'Error loading videos',
        signInTitle: 'Sign in to continue',
        signInMessage: 'Please log in or register to collect videos and save your favorites.',
        loginBtn: 'Log In',
        registerBtn: 'Register',
        collectBtn: 'Collect',

        // Collect page
        backBtn: 'Back',
        collectionTitle: 'Your Collection',
        collectedTitle: 'Item Collected!',
        collectedMessage: 'Your item has been successfully added to your collection.',
        continueBrowsing: 'Continue Browsing',

        // Language selector
        language: 'Language',
        english: 'English',
        japanese: '日本語'
    },
    ja: {
        // Index page
        loading: '読み込み中...',
        noVideos: '動画がありません',
        errorLoading: '動画の読み込みエラー',
        signInTitle: 'ログインしてください',
        signInMessage: 'ビデオをコレクションに追加してお気に入りを保存するには、ログインまたは登録してください。',
        loginBtn: 'ログイン',
        registerBtn: '登録',
        collectBtn: 'コレクション',

        // Collect page
        backBtn: '戻る',
        collectionTitle: 'あなたのコレクション',
        collectedTitle: 'アイテムを追加しました！',
        collectedMessage: 'アイテムがコレクションに正常に追加されました。',
        continueBrowsing: '続けて見る',

        // Language selector
        language: '言語',
        english: 'English',
        japanese: '日本語'
    }
};

// Current language (default: English)
let currentLanguage = localStorage.getItem('language') || 'en';

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
function t(key) {
    return translations[currentLanguage][key] || key;
}

/**
 * Set language and update UI
 * @param {string} lang - Language code ('en' or 'ja')
 */
function setLanguage(lang) {
    if (!translations[lang]) {
        console.error(`Language '${lang}' not supported`);
        return;
    }

    currentLanguage = lang;
    localStorage.setItem('language', lang);

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update all elements with data-i18n attribute
    updateTranslations();

    // Update language selector state
    updateLanguageSelector();
}

/**
 * Update all translations in the DOM
 */
function updateTranslations() {
    // Update UI elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.dataset.i18n;
        const translation = t(key);

        // Update text content or placeholder based on element type
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });

    // Update video captions based on language
    updateVideoCaptions();

    // Update collect button text (dynamically created)
    const collectBtns = document.querySelectorAll('.collect-btn');
    collectBtns.forEach(btn => {
        btn.textContent = t('collectBtn');
    });
}

/**
 * Update video captions based on current language
 */
function updateVideoCaptions() {
    const captions = document.querySelectorAll('.reel-caption');
    captions.forEach(caption => {
        if (currentLanguage === 'ja' && caption.dataset.captionJa) {
            caption.textContent = caption.dataset.captionJa;
        } else if (caption.dataset.captionEn) {
            caption.textContent = caption.dataset.captionEn;
        }
    });
}

/**
 * Update language selector button states
 */
function updateLanguageSelector() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Initialize language system
 */
function initLanguage() {
    // Set initial language
    document.documentElement.lang = currentLanguage;

    // Update initial translations
    updateTranslations();

    // Set up language selector buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.dataset.lang;
            setLanguage(lang);
        });
    });

    // Update selector state
    updateLanguageSelector();
}

/**
 * Get current language
 * @returns {string} Current language code
 */
function getCurrentLanguage() {
    return currentLanguage;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}

/**
 * Main application logic for Instagram Reels-style video player
 */

// Global state
let videos = [];
let currentVideoIndex = 0;
let players = [];

/**
 * Initialize the application
 */
async function init() {
    try {
        // Initialize analytics (if enabled)
        if (typeof initAnalytics === 'function') {
            initAnalytics();
        }

        // Show loading indicator
        const loading = document.getElementById('loading');

        // Fetch video data
        const rawData = await fetchVideoData();
        videos = parseVideoData(rawData);

        if (videos.length === 0) {
            console.error('No valid video data found');
            loading.innerHTML = `<p>${t('noVideos')}</p>`;
            return;
        }

        // Render video feed
        renderVideoFeed();

        // Hide loading indicator
        loading.classList.add('hidden');

        // Set up intersection observer for autoplay
        setupIntersectionObserver();

    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('loading').innerHTML = `<p>${t('errorLoading')}</p>`;
    }
}

/**
 * Renders the video feed with all videos
 */
function renderVideoFeed() {
    const container = document.getElementById('reelsContainer');
    const loading = document.getElementById('loading');

    videos.forEach((video, index) => {
        const reelItem = createReelItem(video, index);
        container.appendChild(reelItem);
    });

    // Keep loading indicator in DOM but hidden
    container.appendChild(loading);
}

/**
 * Creates a single reel item element
 * @param {Object} video - Video data object
 * @param {number} index - Video index
 * @returns {HTMLElement} Reel item element
 */
function createReelItem(video, index) {
    const reelItem = document.createElement('div');
    reelItem.className = 'reel-item';
    reelItem.dataset.index = index;

    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';

    // Create 9:16 aspect ratio wrapper
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'video-wrapper';

    // Create iframe based on video type
    const iframe = createVideoIframe(video, index);
    videoWrapper.appendChild(iframe);
    videoContainer.appendChild(videoWrapper);

    // Create overlay with caption and collect button
    const overlay = createOverlay(video);

    // Append to reel item
    reelItem.appendChild(videoContainer);
    reelItem.appendChild(overlay);

    return reelItem;
}

/**
 * Creates YouTube Shorts iframe element
 * @param {Object} video - Video data object
 * @param {number} index - Video index
 * @returns {HTMLIFrameElement} iframe element
 */
function createVideoIframe(video, index) {
    const iframe = document.createElement('iframe');
    iframe.dataset.videoIndex = index;

    // YouTube Shorts embed with autoplay control via API
    iframe.src = `${video.url}?enablejsapi=1&mute=1&loop=1&controls=1&modestbranding=1&playsinline=1`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title = video.caption || 'YouTube Short';

    return iframe;
}

/**
 * Creates overlay with caption and collect button
 * @param {Object} video - Video data object
 * @returns {HTMLElement} Overlay element
 */
function createOverlay(video) {
    const overlay = document.createElement('div');
    overlay.className = 'reel-overlay';

    // Caption - store both languages as data attributes
    const caption = document.createElement('p');
    caption.className = 'reel-caption';
    caption.dataset.captionEn = video.caption_en || '';
    caption.dataset.captionJa = video.caption_ja || video.caption_en || '';

    // Set initial caption based on current language
    const currentLang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
    caption.textContent = currentLang === 'ja' ? caption.dataset.captionJa : caption.dataset.captionEn;

    // Collect button (link to collect.html)
    const collectBtn = document.createElement('a');
    collectBtn.href = 'collect.html';
    collectBtn.className = 'collect-btn';
    collectBtn.textContent = t('collectBtn');

    // Log collect event when clicked (if analytics enabled)
    collectBtn.addEventListener('click', () => {
        if (typeof logCollectEvent === 'function' && video.id) {
            logCollectEvent(video.id);
        }
    });

    overlay.appendChild(caption);
    overlay.appendChild(collectBtn);

    return overlay;
}

/**
 * Sets up Intersection Observer for autoplay functionality
 */
function setupIntersectionObserver() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Video must be 50% visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const iframe = entry.target.querySelector('iframe');
            if (!iframe) return;

            if (entry.isIntersecting) {
                // Video is visible - play
                playVideo(iframe);

                // Log video view (if analytics enabled)
                const videoIndex = entry.target.dataset.index;
                if (typeof logVideoView === 'function' && videos[videoIndex] && videos[videoIndex].id) {
                    logVideoView(videos[videoIndex].id);
                }
            } else {
                // Video is not visible - pause
                pauseVideo(iframe);
            }
        });
    }, options);

    // Observe all reel items
    const reelItems = document.querySelectorAll('.reel-item');
    reelItems.forEach(item => observer.observe(item));
}

/**
 * Play video (works for YouTube iframes)
 * @param {HTMLIFrameElement} iframe - Video iframe element
 */
function playVideo(iframe) {
    try {
        // Send postMessage to YouTube iframe to play
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    } catch (error) {
        console.error('Error playing video:', error);
    }
}

/**
 * Pause video (works for YouTube iframes)
 * @param {HTMLIFrameElement} iframe - Video iframe element
 */
function pauseVideo(iframe) {
    try {
        // Send postMessage to YouTube iframe to pause
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    } catch (error) {
        console.error('Error pausing video:', error);
    }
}

/**
 * Handle scroll events (optional - for additional functionality)
 */
function handleScroll() {
    const container = document.getElementById('reelsContainer');
    const scrollPosition = container.scrollTop;
    const windowHeight = window.innerHeight;

    // Calculate current video index based on scroll position
    currentVideoIndex = Math.round(scrollPosition / windowHeight);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

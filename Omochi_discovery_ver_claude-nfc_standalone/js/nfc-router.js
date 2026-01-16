/**
 * NFC Router - Universal Card Landing Page
 * Handles GPS detection, QR scanning, and single-venue display
 */

// State management
let allVenues = [];
let currentVenue = null;

/**
 * Detect user's platform for home screen instructions
 * @returns {string} 'ios', 'android', or 'other'
 */
function detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
        return 'ios';
    } else if (/Android/i.test(userAgent)) {
        return 'android';
    } else {
        return 'other';
    }
}

// DOM elements
const screens = {
    landing: document.getElementById('landingScreen'),
    loading: document.getElementById('loadingScreen'),
    venue: document.getElementById('venueScreen'),
    qrScanner: document.getElementById('qrScannerScreen'),
    noVenue: document.getElementById('noVenueScreen')
};

const buttons = {
    findVenue: document.getElementById('findVenueBtn'),
    tryQR: document.getElementById('tryQRBtn'),
    back: document.getElementById('backBtn')
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Track NFC page load
    logNFCPageLoad();

    // Load venue data from Google Sheets
    allVenues = await loadVenueData();

    // Set up button listeners
    buttons.findVenue.addEventListener('click', handleFindVenue);
    buttons.tryQR.addEventListener('click', showQRScanner);
    buttons.back.addEventListener('click', () => showScreen('landing'));
});

/**
 * Main flow: User clicks "Find Venue Near Me"
 */
async function handleFindVenue() {
    showScreen('loading');

    // Request location permission
    if (!navigator.geolocation) {
        // GPS not available - fallback to QR
        showQRScanner();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => handleGPSSuccess(position),
        (error) => handleGPSError(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

/**
 * GPS Success: Find venues within radius
 */
function handleGPSSuccess(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    // Find ALL venues within 100m
    const venuesInRange = findVenuesWithinRadius(userLat, userLng, 100);

    if (venuesInRange.length === 0) {
        // No venues within 100m - show all venues as fallback
        logGPSNoVenue();
        displayAllVenuesGrid();
    } else if (venuesInRange.length === 1) {
        // Only one venue - trigger collect flow directly
        currentVenue = venuesInRange[0].venue;
        logGPSSuccess(venuesInRange[0].distance);
        logVenueView(currentVenue.venue_key || currentVenue.id);
        collectToOmochi(); // Go directly to modal/redirect
    } else {
        // Multiple venues - show grid
        displayVenueGrid(venuesInRange);
        logGPSSuccess(venuesInRange[0].distance); // Log nearest venue distance
    }
}

/**
 * GPS Error: Location denied or failed
 */
function handleGPSError(error) {
    console.error('GPS error:', error);
    logGPSError(error.code);

    // Show all venues grid as fallback (with QR option)
    displayAllVenuesGrid();
}

/**
 * Find nearest venue using Haversine formula
 */
function findNearestVenue(userLat, userLng) {
    let nearest = null;
    let minDistance = Infinity;

    allVenues.forEach(venue => {
        // Skip venues without coordinates
        if (!venue.lat || !venue.lng) return;

        const distance = calculateDistance(userLat, userLng, venue.lat, venue.lng);

        if (distance < minDistance) {
            minDistance = distance;
            nearest = { venue, distance };
        }
    });

    return nearest;
}

/**
 * Find ALL venues within specified radius (default 100m)
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} radius - Search radius in meters (default 100)
 * @returns {Array} - Array of {venue, distance} objects, sorted by distance
 */
function findVenuesWithinRadius(userLat, userLng, radius = 100) {
    const venuesInRange = [];

    allVenues.forEach(venue => {
        // Skip venues without coordinates
        if (!venue.lat || !venue.lng) return;

        const distance = calculateDistance(userLat, userLng, venue.lat, venue.lng);

        if (distance <= radius) {
            venuesInRange.push({ venue, distance });
        }
    });

    // Sort by distance (nearest first)
    venuesInRange.sort((a, b) => a.distance - b.distance);

    return venuesInRange;
}

/**
 * Haversine formula - calculate distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

/**
 * Display single venue (GPS success path)
 */
function displayVenue(venue) {
    const currentLang = getCurrentLanguage();

    const venueName = currentLang === 'ja' && venue.venue_name_ja
        ? venue.venue_name_ja
        : venue.venue_name;

    const venueGenre = currentLang === 'ja' && venue.genre_ja
        ? venue.genre_ja
        : venue.genre;

    const venueCaption = currentLang === 'ja' && venue.caption_ja
        ? venue.caption_ja
        : venue.caption;

    screens.venue.innerHTML = `
        <div class="venue-video-container">
            <iframe
                src="${venue.url}?autoplay=1&mute=1&loop=1&controls=0"
                frameborder="0"
                allow="autoplay; encrypted-media"
                allowfullscreen>
            </iframe>
        </div>
        <div class="venue-info">
            <h2>${venueName}</h2>
            <p class="venue-genre">${venueGenre || ''}</p>
            <p class="venue-caption">${venueCaption}</p>
        </div>
        <div class="venue-actions">
            <button class="collect-to-omochi-btn" onclick="collectToOmochi()">
                ${t('nfc.collectBtn')}
            </button>
        </div>
    `;

    showScreen('venue');
    logVenueView(venue.venue_key || venue.id);
}

/**
 * Display multiple venues in 2-column grid
 * @param {Array} venuesArray - Array of {venue, distance} objects
 */
function displayVenueGrid(venuesArray) {
    const currentLang = getCurrentLanguage();

    // Build grid HTML
    let gridHTML = '<div class="venue-grid-header"><h2>';
    gridHTML += t('nfc.gridHeader');
    gridHTML += '</h2></div>';
    gridHTML += '<div class="venue-grid-container">';

    venuesArray.forEach(({ venue, distance }) => {
        const venueName = currentLang === 'ja' && venue.venue_name_ja
            ? venue.venue_name_ja
            : venue.venue_name;

        const venueGenre = currentLang === 'ja' && venue.genre_ja
            ? venue.genre_ja
            : venue.genre;

        const venueId = venue.venue_key || venue.id;
        const imageUrl = venue.image_url || '';

        gridHTML += `
            <div class="venue-card" onclick="selectVenueFromGrid('${venueId}')">
                ${imageUrl ? `<div class="venue-card-image" style="background-image: url('${imageUrl}')"></div>` : ''}
                <div class="venue-card-content">
                    <h3 class="venue-card-name">${venueName}</h3>
                    ${venueGenre ? `<p class="venue-card-genre">${venueGenre}</p>` : ''}
                </div>
            </div>
        `;
    });

    gridHTML += '</div>';

    // Inject into venue screen
    screens.venue.innerHTML = gridHTML;
    showScreen('venue');

    // Store venues for selection
    window._currentVenueGrid = venuesArray;
}

/**
 * Display all venues in browseable 2-column grid (GPS fallback)
 * Shows when GPS fails or no venues within 100m
 */
function displayAllVenuesGrid() {
    const currentLang = getCurrentLanguage();

    // Build grid HTML with header
    let gridHTML = '<div class="venue-grid-header">';
    gridHTML += '<h2>' + t('nfc.allVenuesHeader') + '</h2>';
    gridHTML += '<p class="venue-grid-subheader">' + t('nfc.allVenuesSubheader') + '</p>';
    gridHTML += '</div>';

    // Add QR scanner button at top
    gridHTML += '<div class="venue-grid-actions">';
    gridHTML += '<button class="qr-scan-btn" onclick="showQRScanner()">';
    gridHTML += t('nfc.scanQRInstead');
    gridHTML += '</button>';
    gridHTML += '</div>';

    // Build venue grid container
    gridHTML += '<div class="venue-grid-container">';

    allVenues.forEach(venue => {
        const venueName = currentLang === 'ja' && venue.venue_name_ja
            ? venue.venue_name_ja
            : venue.venue_name;

        const venueGenre = currentLang === 'ja' && venue.genre_ja
            ? venue.genre_ja
            : venue.genre;

        const venueId = venue.venue_key || venue.id;
        const imageUrl = venue.image_url || '';

        gridHTML += `
            <div class="venue-card" onclick="selectVenueFromAllGrid('${venueId}')">
                ${imageUrl ? `<div class="venue-card-image" style="background-image: url('${imageUrl}')"></div>` : ''}
                <div class="venue-card-content">
                    <h3 class="venue-card-name">${venueName}</h3>
                    ${venueGenre ? `<p class="venue-card-genre">${venueGenre}</p>` : ''}
                </div>
            </div>
        `;
    });

    gridHTML += '</div>';

    // Inject into venue screen
    screens.venue.innerHTML = gridHTML;
    showScreen('venue');

    // Log analytics
    if (typeof logEvent === 'function') {
        logEvent('all_venues_grid_shown', { total_venues: allVenues.length });
    }
}

/**
 * Handle venue selection from grid
 * @param {string} venueId - Selected venue ID or key
 */
function selectVenueFromGrid(venueId) {
    const venuesArray = window._currentVenueGrid;
    if (!venuesArray) return;

    // Find the selected venue
    const selected = venuesArray.find(v =>
        (v.venue.venue_key === venueId) || (v.venue.id === venueId)
    );

    if (selected) {
        currentVenue = selected.venue;
        logVenueView(venueId);
        collectToOmochi(); // Go directly to modal/redirect
    }
}

/**
 * Handle venue selection from "all venues" grid
 * @param {string} venueId - Selected venue ID or key
 */
function selectVenueFromAllGrid(venueId) {
    // Find the selected venue in allVenues array
    const venue = allVenues.find(v =>
        (v.venue_key === venueId) || (v.id === venueId)
    );

    if (venue) {
        currentVenue = venue;
        logVenueView(venueId);
        collectToOmochi(); // Go directly to modal/redirect
    }
}

/**
 * Dynamically create QR scanner DOM elements
 * Only creates if doesn't already exist
 */
function createQRScannerDOM() {
    const qrScreen = document.getElementById('qrScannerScreen');

    // Check if already created
    if (qrScreen.querySelector('#qr-video')) {
        return; // Already exists, don't recreate
    }

    // Build QR scanner HTML
    const scannerHTML = `
        <div class="scanner-header">
            <h2>${t('nfc.scanTitle')}</h2>
            <p>${t('nfc.scanDescription')}</p>
        </div>
        <div id="qr-video-container">
            <video id="qr-video" autoplay playsinline></video>
        </div>
        <button id="cancelScanBtn">${t('nfc.cancelBtn')}</button>
    `;

    qrScreen.innerHTML = scannerHTML;

    // Attach cancel button listener
    document.getElementById('cancelScanBtn').addEventListener('click', closeQRScanner);
}

/**
 * Close QR scanner and clean up camera stream
 */
function closeQRScanner() {
    const video = document.getElementById('qr-video');

    // Stop camera stream
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }

    // Remove DOM elements to free memory
    const qrScreen = document.getElementById('qrScannerScreen');
    qrScreen.innerHTML = '';

    // Return to landing
    showScreen('landing');
}

/**
 * Collect venue to Omochi
 */
function collectToOmochi() {
    if (!currentVenue) return;

    // Check if venue has redirect_url from Google Sheets
    if (!currentVenue.redirect_url || currentVenue.redirect_url.trim() === '') {
        // No redirect URL configured - treat as geolocation failure
        // Show "No Venue Found" screen with QR scanner fallback
        showScreen('noVenue');
        return;
    }

    // Use redirect_url from Google Sheets
    const omochiURL = currentVenue.redirect_url;

    // Log analytics event BEFORE showing modal
    const venueKey = currentVenue.venue_key || currentVenue.id;
    logCollectClick(venueKey);

    // Show modal instead of immediate redirect
    showOmochiModal(omochiURL);
}

/**
 * Show QR scanner (fallback for GPS failure)
 */
function showQRScanner() {
    // Create QR scanner elements dynamically
    createQRScannerDOM();
    showScreen('qrScanner');
    startQRScanning();
}

/**
 * Start QR code scanning
 */
function startQRScanning() {
    const video = document.getElementById('qr-video');

    // Request camera permission
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;
            scanQRCode(video);
        })
        .catch(error => {
            console.error('Camera error:', error);
            alert(t('nfc.cameraError'));
            showScreen('landing');
        });
}

/**
 * Scan QR code from video stream
 * (Uses jsQR library - included in HTML)
 */
function scanQRCode(video) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // Check if jsQR is available
            if (typeof jsQR !== 'undefined') {
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    // QR code detected - should contain venue_key
                    const venueKey = code.data;
                    const venue = allVenues.find(v =>
                        (v.venue_key === venueKey) || (v.id === venueKey)
                    );

                    if (venue) {
                        // Stop camera
                        video.srcObject.getTracks().forEach(track => track.stop());

                        // Show this venue
                        currentVenue = venue;
                        displayVenue(venue);
                        logQRSuccess(venueKey);
                        return;
                    }
                }
            }
        }

        requestAnimationFrame(tick);
    }

    tick();
}

/**
 * Screen navigation
 */
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

/**
 * Load venue data (reuses existing data.js)
 */
async function loadVenueData() {
    // This calls your existing fetchVideoData() function
    if (typeof fetchVideoData === 'function') {
        const data = await fetchVideoData();
        return data;
    }

    // Fallback to empty array if data.js not loaded
    console.warn('fetchVideoData() not available - using empty venue list');
    return [];
}

/**
 * Show Omochi save to home screen modal
 * @param {string} omochiURL - URL to redirect to after user confirms
 */
function showOmochiModal(omochiURL) {
    const modal = document.getElementById('omochiModal');
    const platform = detectPlatform();

    // Get current language
    const currentLang = getCurrentLanguage();

    // Get venue name (with fallback)
    const venueName = currentLang === 'ja' && currentVenue.venue_name_ja
        ? currentVenue.venue_name_ja
        : currentVenue.venue_name || 'this venue';

    // Show platform-specific instructions
    const iosInstructions = document.getElementById('instructionIOS');
    const androidInstructions = document.getElementById('instructionAndroid');

    iosInstructions.classList.remove('active');
    androidInstructions.classList.remove('active');

    if (platform === 'ios') {
        iosInstructions.classList.add('active');
    } else if (platform === 'android') {
        androidInstructions.classList.add('active');
    } else {
        // Default to iOS for other platforms
        iosInstructions.classList.add('active');
    }

    // Update modal text with venue name
    const modalTitle = document.getElementById('omochiModalTitle');
    const continueBtn = document.getElementById('omochiContinueBtn');

    if (modalTitle) {
        modalTitle.textContent = t('omochiModal.title').replace('{venueName}', venueName);
    }

    if (continueBtn) {
        continueBtn.textContent = t('omochiModal.continueBtn').replace('{venueName}', venueName);
    }

    // Show modal
    modal.classList.add('show');

    // Set up continue button to redirect
    continueBtn.onclick = () => performOmochiRedirect(omochiURL);

    // Set up close handlers
    setupModalCloseHandlers();
}

/**
 * Hide Omochi modal
 */
function hideOmochiModal() {
    const modal = document.getElementById('omochiModal');
    modal.classList.remove('show');
}

/**
 * Perform actual redirect to Omochi
 * @param {string} omochiURL - URL to redirect to
 */
function performOmochiRedirect(omochiURL) {
    hideOmochiModal();

    // Small delay for smooth transition
    setTimeout(() => {
        window.location.href = omochiURL;
    }, 200);
}

/**
 * Set up modal close handlers (X button and overlay click)
 */
function setupModalCloseHandlers() {
    const closeBtn = document.getElementById('omochiModalClose');
    const overlay = document.getElementById('omochiModalOverlay');

    closeBtn.onclick = hideOmochiModal;
    overlay.onclick = hideOmochiModal;
}

/**
 * Analytics tracking (reuses existing analytics.js)
 */
function logNFCPageLoad() {
    if (typeof logEvent === 'function') {
        logEvent('nfc_page_load', { card_id: getCardID() });
    }
}

function logGPSSuccess(distance) {
    if (typeof logEvent === 'function') {
        logEvent('gps_success', { distance_meters: Math.round(distance) });
    }
}

function logGPSError(code) {
    if (typeof logEvent === 'function') {
        logEvent('gps_error', { error_code: code });
    }
}

function logGPSNoVenue() {
    if (typeof logEvent === 'function') {
        logEvent('gps_no_venue', {});
    }
}

function logVenueView(venueKey) {
    if (typeof logEvent === 'function') {
        logEvent('nfc_venue_view', { venue_key: venueKey });
    }
}

function logCollectClick(venueKey) {
    if (typeof logEvent === 'function') {
        logEvent('nfc_collect_click', { venue_key: venueKey });
    }
}

function logQRSuccess(venueKey) {
    if (typeof logEvent === 'function') {
        logEvent('qr_success', { venue_key: venueKey });
    }
}

function getCardID() {
    const params = new URLSearchParams(window.location.search);
    return params.get('card') || 'unknown';
}



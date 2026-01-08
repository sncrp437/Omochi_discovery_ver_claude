# Django Authentication Integration - TODO & Issues

## Branch: feature/django-auth-integration

This document outlines the Django authentication integration work in progress and critical issues that need to be resolved before deployment.

---

## Overview

**Goal**: Integrate Django app collection system with this discovery app's "Collect" button.

**Django App Behavior**:
- Each venue has a unique URL: `https://your-django-app.com/venue/{venue-slug}/`
- When a **logged-in user** visits that URL → Django automatically adds venue to their collection
- Users can view all collected venues inside the Django app later

**Discovery App Behavior**:
- User clicks "Collect" button on a video
- If not authenticated → Show login modal
- If authenticated → Open Django venue URL (background/hidden iframe)
- This triggers Django's existing collection mechanism
- Venue gets added to user's collection automatically

---

## CONFIRMED: Django Uses JWT Token Authentication

**STATUS**: ✅ VERIFIED

**Discovery Process:**
- Checked Django app in browser Developer Tools (Application → Local Storage)
- Found: `access_token: eyJ...` (JWT token)
- Found: `isAuthenticated: true`
- Found: `user_id`, `remember_me` fields

**Conclusion**: Django uses JWT (JSON Web Token) authentication stored in **localStorage**, NOT session cookies.

### Critical Implication: localStorage Isolation

**The localStorage Security Model:**
- localStorage is **isolated per origin** (protocol + domain + port)
- Browser prevents cross-origin localStorage access (security feature)
- Even iframes from different origins have separate localStorage
- Cannot be shared like cookies (no equivalent to `Domain=.example.com`)

**What This Means:**
```javascript
// Django app at: https://app.yoursite.com
localStorage.setItem('access_token', 'eyJ...');  // Stored here

// Discovery app at: https://discover.yoursite.com (DIFFERENT subdomain)
localStorage.getItem('access_token');  // ❌ Returns null
// Cannot access app.yoursite.com's localStorage

// Discovery app at: https://yoursite.com/discover (SAME domain)
localStorage.getItem('access_token');  // ✅ Returns 'eyJ...'
// CAN access because exact same origin
```

**Only Exception**: Apps on the **exact same domain** share localStorage:
- ✅ `https://yoursite.com/` and `https://yoursite.com/discover` → **SHARED**
- ❌ `https://app.yoursite.com` and `https://discover.yoursite.com` → **ISOLATED**
- ❌ `https://yoursite.com` and `https://app.yoursite.com` → **ISOLATED**

---

## Two Implementation Paths

Based on JWT + localStorage authentication, there are **two viable approaches**:

---

### OPTION A: Same Domain Setup (RECOMMENDED)
**Zero Django Code Changes Required**

#### Setup:
```
yoursite.com/          → Django app (AWS)
yoursite.com/discover  → Discovery app (GitHub Pages via reverse proxy)
```

#### How It Works:
1. **Infrastructure**: Set up reverse proxy (nginx/Apache) on AWS to serve GitHub Pages content at `/discover` path
2. **Shared Storage**: Both apps at same origin → automatically share localStorage
3. **Authentication Flow**:
   - User clicks "Collect" in discovery app
   - Discovery app checks: `localStorage.getItem('access_token')`
   - If no token → Show login modal with Django login page (iframe or popup)
   - User logs into Django (normal flow, no changes)
   - Django stores token in localStorage (already does this)
   - Discovery app reads token from shared localStorage
   - Discovery app opens venue URL with token in header/parameter
   - Django validates token, adds venue to collection

#### Pros:
- ✅ **Zero Django code changes** - Uses existing authentication as-is
- ✅ **Most secure** - Token never exposed via postMessage or URL
- ✅ **Simplest long-term** - No cross-origin communication logic
- ✅ **Future-proof** - Works regardless of Django changes
- ✅ **Best user experience** - Seamless authentication state sharing

#### Cons:
- ⚠️ **One-time infrastructure setup** - Requires nginx/Apache reverse proxy configuration
- ⚠️ **AWS access needed** - Must be able to modify web server config
- ⚠️ **Moderate technical complexity** - Need to understand reverse proxy concepts

#### Technical Requirements:
- Access to AWS EC2/Elastic Beanstalk web server configuration
- Ability to modify nginx/Apache config files
- Custom domain pointed to AWS
- HTTPS certificate for domain (AWS Certificate Manager or Let's Encrypt)

#### Implementation Difficulty: **6/10**
- One-time setup (~30-60 minutes)
- Requires server configuration knowledge
- After setup, zero ongoing maintenance

---

### OPTION B: Different Domains (Subdomain Setup)
**Requires Small Django Code Change**

#### Setup:
```
app.yoursite.com       → Django app (AWS)
discover.yoursite.com  → Discovery app (GitHub Pages - simple CNAME)
```

#### How It Works:
1. **Infrastructure**: Simple DNS CNAME record pointing to GitHub Pages
2. **Separate Storage**: Different subdomains → separate localStorage
3. **Authentication Flow**:
   - User clicks "Collect" in discovery app
   - Discovery app checks: `localStorage.getItem('access_token')` → null (different origin)
   - Show login modal with Django login page (iframe or popup)
   - User logs into Django
   - **Django login success page sends token via postMessage** ← NEW CODE NEEDED
   - Discovery app receives message, stores token in its own localStorage
   - Discovery app opens venue URL with token
   - Django validates token, adds venue to collection

#### Pros:
- ✅ **Easier infrastructure** - Just DNS CNAME, no reverse proxy
- ✅ **Simpler AWS setup** - No web server configuration changes
- ✅ **Lower technical barrier** - DNS changes only

#### Cons:
- ⚠️ **Requires Django modification** - Must add postMessage code to login success page
- ⚠️ **Token exposure** - Token sent via postMessage (still secure if origin-checked)
- ⚠️ **Ongoing maintenance** - Any Django login flow changes may need updates
- ⚠️ **More complex frontend** - Need postMessage listener and origin validation

#### Django Code Changes Required:

**Add to Django's login success page/template:**
```javascript
<!-- templates/accounts/login_success.html or wherever login redirects -->
<script>
  // Get token from localStorage (Django already stores it)
  const accessToken = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  // Check if opened in iframe or popup from discovery app
  if (window.opener || window.parent !== window) {
    const targetOrigin = 'https://discover.yoursite.com';  // Discovery app domain

    // Send authentication data to parent/opener window
    const message = {
      type: 'AUTH_SUCCESS',
      access_token: accessToken,
      user_id: userId,
      isAuthenticated: isAuthenticated
    };

    (window.opener || window.parent).postMessage(message, targetOrigin);

    // Optional: Close popup or redirect
    if (window.opener) {
      window.close();  // Close popup window
    } else {
      // If in iframe, just redirect to success page
      window.location.href = '/dashboard/';
    }
  }
</script>
```

**Discovery app code (no Django changes):**
```javascript
// Listen for authentication message from Django
window.addEventListener('message', (event) => {
  // Verify message is from Django app
  if (event.origin !== 'https://app.yoursite.com') {
    return;  // Ignore messages from other origins
  }

  if (event.data.type === 'AUTH_SUCCESS') {
    // Store token in discovery app's localStorage
    localStorage.setItem('access_token', event.data.access_token);
    localStorage.setItem('user_id', event.data.user_id);
    localStorage.setItem('isAuthenticated', event.data.isAuthenticated);

    // Close login modal
    closeLoginModal();

    // Proceed with venue collection
    collectVenue();
  }
});
```

#### Implementation Difficulty: **3/10**
- Easy DNS setup (~5 minutes)
- Small Django template change (~10 minutes)
- Frontend already has modal (just add postMessage listener)

---

## Comparison Matrix

| Aspect | Option A: Same Domain | Option B: Different Domains |
|--------|----------------------|----------------------------|
| **Django Code Changes** | ✅ None | ⚠️ ~10 lines of JavaScript |
| **Infrastructure Setup** | ⚠️ Reverse proxy (medium) | ✅ DNS CNAME only (easy) |
| **Security** | ✅ Token never exposed | ⚠️ Token in postMessage (safe if origin-checked) |
| **Ongoing Maintenance** | ✅ Zero | ⚠️ Must maintain postMessage code |
| **Technical Complexity** | ⚠️ One-time medium | ✅ Low |
| **User Experience** | ✅ Seamless | ✅ Seamless |
| **Future-Proof** | ✅ Very | ⚠️ Moderate |
| **Setup Time** | ⚠️ 30-60 min | ✅ 10-15 min |
| **Best For** | Production, long-term | Testing, quick setup |

---

## Recommendation

### For Production / Long-Term Use:
**→ Choose OPTION A (Same Domain)**

**Reasoning:**
- One-time infrastructure investment (~1 hour) pays off forever
- Zero Django code changes means no ongoing maintenance
- Most secure and future-proof approach
- Django team can make any changes without breaking integration
- Best practice for production applications

### For Testing / Quick Prototype:
**→ Choose OPTION B (Different Domains)**

**Reasoning:**
- Quick setup to test concept
- Easy to implement and verify functionality
- Can always migrate to Option A later
- Lower initial technical barrier

### Hybrid Approach:
**→ Start with Option B, migrate to Option A**

1. **Phase 1 (Testing)**: Use Option B to validate the integration works
2. **Phase 2 (Production)**: Migrate to Option A for production deployment
3. **Benefit**: Lower risk, proven concept before infrastructure investment

---

## Critical Issues to Resolve

### 1. Django Authentication Method

**STATUS**: ⚠️ NEEDS INVESTIGATION

**Question**: How does your Django app authenticate users?

**Options**:
- **A) Session Cookies** (most common Django default)
  - User logs in → Django sets session cookie
  - Subsequent requests include cookie automatically
  - Works well for same-domain or properly configured CORS

- **B) JWT/Token-based**
  - User logs in → Django returns JWT token
  - Token passed in URL params or headers
  - Better for cross-domain scenarios

- **C) OAuth/Social Auth**
  - Third-party authentication (Google, Facebook, etc.)
  - May require special redirect flows

**Action Required**:
- [ ] Check Django settings.py authentication backend
- [ ] Check if Django uses session middleware or token authentication
- [ ] Document which method is used

---

### 2. Cross-Domain Cookie/Session Sharing

**STATUS**: ⚠️ CRITICAL - May block entire integration

**The Problem**:
- Discovery app hosted on: `https://buddila-samarakoon.github.io/insta_reelstyle_htmlfile/`
- Django app hosted on: `https://your-app.amazonaws.com/` (or custom domain)
- Different domains = browsers block cookie sharing by default

**If Django uses session cookies, you need**:

**Django Settings Required**:
```python
# settings.py
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True  # Requires HTTPS
CORS_ALLOWED_ORIGINS = [
    'https://buddila-samarakoon.github.io',
]
CORS_ALLOW_CREDENTIALS = True
```

**Frontend Requirements**:
```javascript
// When making requests to Django
fetch(djangoUrl, {
    credentials: 'include',  // Send cookies cross-domain
    mode: 'cors'
})
```

**Action Required**:
- [ ] Verify both apps use HTTPS (required for SameSite=None cookies)
- [ ] Check if Django CORS is configured
- [ ] Test if session cookies work across domains
- [ ] If cookies don't work, switch to token-based authentication

---

### 3. Django Venue URL Structure

**STATUS**: ⚠️ NEEDS DATA STRUCTURE UPDATE

**Required Changes**:

**Google Sheets - Add Column**:
Need to add a new column to the video data spreadsheet:

| Column | Field Name        | Type | Required | Description                           |
|--------|-------------------|------|----------|---------------------------------------|
| M      | django_venue_url  | URL  | Yes      | Full Django venue collection URL      |

**Example Data**:
```
id         venue_name          django_venue_url
video_001  Tanaka Ramen House  https://your-app.com/venue/tanaka-ramen/
video_002  Napoli Pizza Co     https://your-app.com/venue/napoli-pizza/
video_003  Sakura Sushi Bar    https://your-app.com/venue/sakura-sushi/
```

**Apps Script Update**:
Update APPS_SCRIPT.js to return the new field:
```javascript
const cleanedData = sortedVideos.map(video => ({
  id: video.id || '',
  url: video.url,
  caption: video.caption,
  venue_name: video.venue_name || '',
  genre: video.genre || '',
  address: video.address || '',
  tags: video.tags || '',
  django_venue_url: video.django_venue_url || ''  // NEW FIELD
}));
```

**Action Required**:
- [ ] Add django_venue_url column to Google Sheets
- [ ] Populate with actual Django venue URLs
- [ ] Update APPS_SCRIPT.js to include field
- [ ] Update GOOGLE_SHEETS_TEMPLATE.md documentation

---

### 4. Authentication Token Passing (If Not Using Cookies)

**STATUS**: ⚠️ ALTERNATIVE APPROACH IF COOKIES FAIL

**If session cookies don't work cross-domain**, implement token-based collection:

**Flow**:
1. User logs into Django via modal
2. Django returns authentication token
3. Store token in localStorage
4. When collecting, open: `https://django-app.com/venue/ramen/?auth_token={token}`
5. Django validates token and adds to collection

**Django Backend Changes Needed**:
```python
# Django view for venue collection
def collect_venue(request, venue_slug):
    # Option 1: Check session (existing)
    if request.user.is_authenticated:
        add_to_collection(request.user, venue_slug)

    # Option 2: Check token parameter (new)
    elif 'auth_token' in request.GET:
        user = validate_token(request.GET['auth_token'])
        if user:
            add_to_collection(user, venue_slug)

    return redirect('collection_success')
```

**Action Required**:
- [ ] Determine if Django can accept tokens via URL parameter
- [ ] If not, add token validation endpoint to Django
- [ ] Document token format (JWT, custom, etc.)

---

### 5. Login Modal - Django Page Integration

**STATUS**: ✅ MODAL CREATED - Needs Django URL configuration

**Current Implementation**:
- Modal with login/register buttons created
- Can load Django login page in iframe OR open in new window

**Options**:

**Option A: Iframe (Seamless)**
```javascript
// Open Django login in modal iframe
document.getElementById('authIframe').src = 'https://django-app.com/accounts/login/';
```
- **Pros**: User stays in discovery app
- **Cons**: Django needs to allow iframe embedding (X-Frame-Options)

**Option B: New Window/Tab**
```javascript
// Open Django in new window
window.open('https://django-app.com/accounts/login/?next=/auth-success/', '_blank');
```
- **Pros**: No iframe restrictions
- **Cons**: User leaves discovery app temporarily

**Action Required**:
- [ ] Check if Django allows iframe embedding
- [ ] Check X-Frame-Options header in Django
- [ ] Decide: iframe or new window approach

---

### 6. Post-Login Communication

**STATUS**: ⚠️ NEEDS IMPLEMENTATION

**How does Django tell this app "user logged in successfully"?**

**Option A: PostMessage (for iframe)**
```javascript
// In Django's login success page
window.parent.postMessage({
    type: 'AUTH_SUCCESS',
    token: 'user_jwt_token_here',
    user_id: 123
}, 'https://buddila-samarakoon.github.io');
```

**Option B: Redirect with Token (for new window)**
```
https://buddila-samarakoon.github.io/insta_reelstyle_htmlfile/?auth_token=xyz
```

**Option C: Cookie Only (simplest)**
- Django sets session cookie
- No explicit message needed
- Discovery app just tries to collect, Django validates via cookie

**Action Required**:
- [ ] Choose communication method
- [ ] Add postMessage handler if using iframe
- [ ] Add URL parameter handler if using redirect
- [ ] Test authentication state persistence

---

## Implementation Checklist

### Phase 1: Investigation (Do This First)
- [ ] Check Django authentication method (session/JWT/OAuth)
- [ ] Check Django CORS configuration
- [ ] Test cross-domain cookie sharing
- [ ] Verify HTTPS on both apps
- [ ] Check Django X-Frame-Options header
- [ ] Document Django venue URL structure

### Phase 2: Data Structure Updates
- [ ] Add django_venue_url column to Google Sheets
- [ ] Update APPS_SCRIPT.js to return new field
- [ ] Update GOOGLE_SHEETS_TEMPLATE.md
- [ ] Populate venue URLs in spreadsheet

### Phase 3: Frontend Implementation
- [ ] Create config.js with Django URL configuration
- [ ] Implement auth.js (login state checking)
- [ ] Update collect button to check auth before opening venue URL
- [ ] Add hidden iframe for venue URL opening
- [ ] Implement login modal trigger
- [ ] Add postMessage listener (if using iframe)

### Phase 4: Testing
- [ ] Test login flow (modal → Django → back to app)
- [ ] Test collection (authenticated user clicks collect)
- [ ] Test cross-domain session persistence
- [ ] Test on mobile devices
- [ ] Test logout/re-login flow

### Phase 5: Documentation
- [ ] Document setup instructions for Django configuration
- [ ] Create example Django settings.py configuration
- [ ] Document Google Sheets column additions
- [ ] Update README.md with Django integration steps

---

## Questions for Django Developer

Before proceeding, we need answers to these questions:

1. **Authentication Method**: Does Django use session cookies, JWT tokens, or another method?

2. **CORS Configuration**: Is Django configured to allow requests from `buddila-samarakoon.github.io`?

3. **Cookie Settings**: What are the current `SESSION_COOKIE_SAMESITE` and `SESSION_COOKIE_SECURE` settings?

4. **Venue URL Format**: What is the exact URL pattern for venue collection?
   - Example: `https://your-app.com/venue/{slug}/`
   - Or: `https://your-app.com/collect/{venue_id}/`

5. **Iframe Support**: Does Django allow being embedded in iframes? (Check X-Frame-Options)

6. **Token Support**: Can Django accept authentication tokens via URL parameter or does it only support cookies?

7. **Custom Domain**: Will Django app use a custom domain or AWS subdomain?

---

## Files Modified in This Branch

### Created:
- `DJANGO_AUTH_INTEGRATION.md` (this file)

### Modified:
- `index.html` - Added authentication modal HTML
- `css/styles.css` - Added modal styles

### To Be Created:
- `js/config.js` - Django URL configuration
- `js/auth.js` - Authentication state management
- Updated `js/app.js` - Collect button with auth check

---

## Notes

- This integration maintains the lightweight, static-site nature of the discovery app
- All authentication logic happens via Django backend
- Discovery app just facilitates the connection
- No sensitive data stored in frontend code
- Works with GitHub Pages hosting

---

**Last Updated**: 2026-01-08
**Branch**: feature/django-auth-integration
**Status**: In Progress - Choose implementation path (Option A or B)

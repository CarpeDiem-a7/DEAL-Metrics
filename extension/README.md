# DealHub Chrome Extension

Price comparison extension for Indian e-commerce platforms.

## 📋 Quick Overview

Automatically detects products while browsing and shows you better prices across 10+ platforms.

- **Platforms**: Amazon India, Flipkart, Myntra, Ajio, Croma, Nykaa, Meesho, FirstCry, Tata Cliq, Reliance Digital
- **Features**: Price comparison, alerts, affiliate integration, wishlists
- **Tech**: Manifest V3, vanilla JS + TypeScript

## 📁 Project Structure

```
extension/
├── manifest.json           # Extension config
├── src/
│   ├── background.js      # Service worker
│   ├── contentScript.js   # Page content injection
│   ├── popup.html         # Popup UI
│   ├── popup.js          # Popup logic
│   └── styles/
│       └── popup.css     # Styling
├── images/
│   ├── icon-16.png       # 16x16 icon
│   ├── icon-48.png       # 48x48 icon
│   └── icon-128.png      # 128x128 icon
└── README.md             # This file
```

## 🚀 Development Setup

### Prerequisites

- Node.js 16+
- Chrome/Chromium browser

### Installation

```bash
# Clone repo
git clone <repo>
cd deal-hub/extension

# No npm dependencies for extension!
# Extension uses vanilla JS
```

### Local Testing

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Extension will appear in Chrome

### Making Changes

1. Edit files in `src/`
2. Save changes
3. Click refresh icon on extension tile
4. Test in a new tab

## 📝 File Descriptions

### manifest.json

- Extension metadata and permissions
- Content script matching rules
- Background service worker
- Popup UI configuration
- Icons and branding

### background.js

- Service worker running in background
- Listens to messages from content scripts
- Handles API calls to backend
- Context menu integration
- Periodic price checking
- Local storage management

### contentScript.js

- Injected into e-commerce pages
- Extracts product information
- Detects store (Amazon, Flipkart, etc)
- Injects comparison widget
- Tracks affiliate clicks
- Sends data to background worker

### popup.html/js

- User-facing popup UI
- Shows price comparisons
- Set price alerts
- Link to DealHub website
- Styled with inline CSS

## 🔌 API Integration

### Detect Product Endpoint

```
POST /api/extension/detect
Content-Type: application/json

{
  "extensionId": "ext_123",
  "currentUrl": "https://amazon.in/...",
  "productTitle": "Product Name",
  "productPrice": 5000,
  "storeName": "amazon"
}
```

Response:

```json
{
  "found": true,
  "product": {
    "id": "prod_123",
    "title": "Product Name",
    "image": "url",
    "brand": "Brand"
  },
  "bestPrice": 4500,
  "alternatives": [
    {
      "store": "Flipkart",
      "price": 4200,
      "discount": 16,
      "affiliateUrl": "https://..."
    }
  ],
  "bankOffers": [...]
}
```

## 🎨 UI Components

### Comparison Widget

Fixed position widget showing:

- Best price across platforms
- Store alternatives with prices
- Bank offer badges
- Price alert button

### Popup

Shows:

- Current product info
- Best price
- Top alternatives
- Bank offers
- Link to full comparison

## 🔐 Security

- ✅ Content Security Policy enabled
- ✅ No inline scripts
- ✅ Secure API communication over HTTPS
- ✅ Rate limiting on API calls
- ✅ Extension ID validation

## 📊 Tracking & Analytics

### Tracked Events

- `install`: Extension installed
- `uninstall`: Extension uninstalled
- `comparison_viewed`: User viewed comparison
- `price_checked`: Product price checked
- `click`: Affiliate link clicked
- `alert_set`: Price alert created

### Click Tracking

```
POST /api/affiliate/track-click
{
  "affiliateLinkId": "link_123",
  "userId": "user_123",
  "timestamp": "2026-02-05T12:00:00Z"
}
```

## 🎁 Affiliate Links

Extension automatically injects affiliate tags when redirecting to e-commerce sites.

- Amazon: `?tag=yourtag-20`
- Flipkart: `&affid=youraff`
- Others: `?affiliate=yourid`

## 🐛 Debugging

### Check Console Errors

1. Open `chrome://extensions/`
2. Click extension name
3. Errors appear in DevTools

### Enable Debugging

Add to background.js:

```javascript
console.debug("Debug message", data);
```

View in:

- Extension popup: DevTools (Ctrl+Shift+I)
- Content script: Page DevTools (F12)
- Background: `chrome://extensions/` → Service Worker

### Test Locally

```javascript
// In popup.js console
chrome.runtime.sendMessage(
  {
    action: "getComparison",
    data: {
      productTitle: "Test Product",
      productPrice: 5000,
    },
  },
  (response) => console.log(response),
);
```

## 📦 Publishing to Chrome Web Store

### Step 1: Prepare

```bash
# Update version in manifest.json
# Ensure all files are included
# Test thoroughly locally
```

### Step 2: Create Package

```bash
# Zip extension files
zip -r dealhub-extension.zip . -x "node_modules/*" ".git/*" "README.md"
```

### Step 3: Upload

1. Go to [Chrome Web Store Developer Console](https://chromewebstore.google.com/devconsole/)
2. Create new item
3. Upload ZIP file
4. Fill in store listing:
   - Detailed description
   - Screenshots (1280x800)
   - Icon (128x128)
   - Category: Shopping
   - Language: English
   - Regions: India

### Step 4: Review

- Google reviews submission
- Usually approved within 1-3 days

### Step 5: Publish

- Click "Publish"
- Users can now install

## 🔄 Updates

When you update the extension:

1. Increment version in manifest.json
2. Update DEPLOYMENT.md with changes
3. Zip and upload to Web Store
4. Chrome auto-updates for all users within hours

## 📱 Supported Sites

Currently working on:

- ✅ Amazon India
- ✅ Flipkart
- ✅ Myntra
- ✅ Ajio
- ✅ Croma
- 🚀 More coming soon

## ⚙️ Configuration

### Backend URL

Change in background.js:

```javascript
const apiUrl = "https://dealhub.in/api"; // Production
// or
const apiUrl = "http://localhost:3000/api"; // Development
```

### API Secret

Set in environment:

```
EXTENSION_API_SECRET=your-secret
```

## 🚨 Known Issues

1. **Widget overlapping**: May overlap with page elements
   - Solution: Drag widget to different position
2. **Slow initial load**: First price check takes 2-3 seconds
   - Solution: Cache results in Redis
3. **Some products not found**: Database might not have product
   - Solution: Add to database via dashboard

## 📞 Support

- Report bugs: GitHub issues
- Feature requests: dealhub.in/feedback
- Email: support@dealhub.in

## 📄 License

Proprietary - DealHub India 2026

---

**Happy price hunting! 🎉**

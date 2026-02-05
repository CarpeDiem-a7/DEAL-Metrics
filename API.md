# DealHub API Documentation

Complete API reference for the DealHub India platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://dealhub.in/api
```

## Authentication

### NextAuth Session

Most endpoints use NextAuth session tokens automatically. No additional auth headers required.

### Extension API Key

Extension requests include:

```
Headers: {
  "X-Extension-ID": "ext_123",
  "Authorization": "Bearer {apiKey}"
}
```

### Rate Limiting

- General endpoints: 100 requests/hour
- Comparison: 20 requests/minute
- Auth: 5 requests/15 minutes

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1612137600
```

---

## Products API

### Compare Prices

Compare prices for a product across platforms.

```
POST /api/products/compare
Content-Type: application/json

{
  "productId": "prod_123",        // Optional: Product ID
  "productTitle": "iPhone 15 Pro", // Required: Product name
  "storeName": "amazon"            // Optional: Current store
}
```

**Response 200:**

```json
{
  "product": {
    "id": "prod_123",
    "title": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "Latest iPhone...",
    "image": "https://...",
    "brand": "Apple",
    "rating": 4.5,
    "reviewCount": 1234
  },
  "prices": [
    {
      "store": "Amazon",
      "storeName": "amazon",
      "logo": "https://...",
      "price": 129999,
      "originalPrice": 139999,
      "discount": 7,
      "inStock": true,
      "url": "https://amazon.in/...",
      "affiliateUrl": "https://...",
      "recordedAt": "2026-02-05T12:00:00Z"
    },
    {
      "store": "Flipkart",
      "price": 125999,
      "discount": 10,
      ...
    }
  ],
  "offers": [
    {
      "title": "Flat 10% off on HDFC Cards",
      "description": "Additional 10% cashback",
      "store": "Amazon",
      "validTill": "2026-02-28T23:59:59Z"
    }
  ],
  "bestPrice": 125999,
  "priceDropPercentage": -5
}
```

**Response 404:**

```json
{
  "error": "Product not found",
  "similar": [],
  "message": "Add product to DealHub database"
}
```

**Error Codes:**

- 400: Missing required fields
- 429: Rate limited
- 500: Server error

---

## Extension API

### Detect Product

Used by extension to fetch comparison data for current page.

```
POST /api/extension/detect
Content-Type: application/json
X-Extension-ID: ext_123

{
  "extensionId": "ext_123",
  "userId": "user_123",        // Optional
  "currentUrl": "https://amazon.in/dp/B123",
  "pageTitle": "Product Name - Amazon.in",
  "productTitle": "Samsung Galaxy S24",
  "productPrice": 79999,
  "storeName": "amazon"
}
```

**Response 200:**

```json
{
  "found": true,
  "product": {
    "id": "prod_456",
    "title": "Samsung Galaxy S24",
    "image": "https://...",
    "brand": "Samsung"
  },
  "bestPrice": 74999,
  "alternatives": [
    {
      "store": "Flipkart",
      "logo": "https://...",
      "price": 72999,
      "discount": 9,
      "affiliateUrl": "https://..."
    },
    {
      "store": "Croma",
      "price": 75999,
      "discount": 5
    }
  ],
  "bankOffers": [
    {
      "title": "HDFC 12% Instant Cashback",
      "offerType": "cashback",
      "maxDiscount": 10000
    }
  ],
  "priceDropAlert": {
    "enabled": false,
    "message": "Set alert to track price"
  }
}
```

**Response 404:**

```json
{
  "found": false,
  "message": "Product not in database",
  "comparison": null
}
```

---

## Price Alerts API

### Create Alert

Create a price alert for a product.

```
POST /api/alerts/create
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "productTitle": "Samsung Galaxy S24",
  "targetPrice": 70000,
  "alertType": "below",        // "below" | "drop_percentage" | "price_match"
  "dropPercentage": 10,        // For drop_percentage type
  "sourceUrl": "https://..."   // Optional
}
```

**Response 200:**

```json
{
  "success": true,
  "alertId": "alert_789",
  "message": "Alert set for ₹70,000",
  "product": {
    "id": "prod_456",
    "title": "Samsung Galaxy S24"
  }
}
```

**Error Responses:**

```json
{
  "error": "Unauthorized", // Status 401
  "message": "Please login to set alerts"
}
```

### Get User Alerts

Fetch all alerts for logged-in user.

```
GET /api/alerts/user
Authorization: Bearer {session_token}
```

**Response 200:**

```json
[
  {
    "id": "alert_789",
    "product": {
      "id": "prod_456",
      "title": "Samsung Galaxy S24",
      "currentPrice": 74999
    },
    "targetPrice": 70000,
    "alertType": "below",
    "isActive": true,
    "notified": false,
    "createdAt": "2026-02-05T10:00:00Z",
    "updatedAt": "2026-02-05T10:00:00Z"
  }
]
```

### Delete Alert

```
DELETE /api/alerts/:alertId
Authorization: Bearer {session_token}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Alert deleted"
}
```

---

## Bank Offers API

### Get All Offers

Fetch active bank and card offers.

```
GET /api/offers/bank?store=amazon&category=electronics
```

**Query Parameters:**

- `store`: Filter by store (optional)
- `category`: Filter by category (optional)
- `limit`: Max results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response 200:**

```json
{
  "total": 45,
  "offers": [
    {
      "id": "offer_123",
      "title": "HDFC Bank 12% Cashback",
      "description": "12% instant cashback on purchases",
      "offerType": "cashback",
      "discountPercent": null,
      "discountAmount": null,
      "maxDiscount": 10000,
      "banks": ["HDFC", "HDFC Plus"],
      "cardTypes": ["credit", "debit"],
      "paymentMethods": ["card", "emi"],
      "stores": ["amazon", "flipkart"],
      "categories": ["electronics", "fashion"],
      "validFrom": "2026-02-01T00:00:00Z",
      "validTill": "2026-02-28T23:59:59Z",
      "active": true,
      "priority": 1,
      "termsUrl": "https://..."
    }
  ]
}
```

---

## Affiliate API

### Track Click

Track when user clicks on affiliate link.

```
POST /api/affiliate/track-click
Content-Type: application/json

{
  "affiliateLinkId": "link_123",
  "productId": "prod_456",
  "storeId": "store_789",
  "userId": "user_123",          // Optional
  "timestamp": "2026-02-05T12:00:00Z"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Click tracked",
  "clickId": "click_999"
}
```

### Get Affiliate Stats

Get earning stats for logged-in user.

```
GET /api/affiliate/stats
Authorization: Bearer {session_token}
```

**Response 200:**

```json
{
  "totalClicks": 1234,
  "uniqueProducts": 456,
  "earnings": 15750, // In ₹
  "paid": 5000,
  "pending": 10750,
  "conversionRate": 2.5,
  "topProducts": [
    {
      "productId": "prod_123",
      "title": "Product Name",
      "clicks": 120,
      "earnings": 2500
    }
  ]
}
```

---

## Cron Jobs API

### Trigger Price Update

Called by cron service to update all prices.

```
GET /api/cron/update-prices
Authorization: Bearer {CRON_SECRET}
```

**Response 200:**

```json
{
  "success": true,
  "timestamp": "2026-02-05T12:00:00Z",
  "prices": {
    "successful": 1250,
    "failed": 5,
    "total": 1255
  },
  "alerts": {
    "processed": 340,
    "triggered": 45
  }
}
```

### Trigger Alert Checks

Called by cron to check and send price alerts.

```
GET /api/cron/check-alerts
Authorization: Bearer {CRON_SECRET}
```

**Response 200:**

```json
{
  "success": true,
  "alertsChecked": 2500,
  "alertsTriggered": 85,
  "notificationsSent": {
    "email": 85,
    "push": 45,
    "whatsapp": 20
  }
}
```

---

## User API

### Get Profile

Get logged-in user profile.

```
GET /api/user/profile
Authorization: Bearer {session_token}
```

**Response 200:**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+91-9876543210",
  "subscriptionPlan": "pro",
  "subscriptionStatus": "active",
  "subscriptionEndDate": "2026-03-05T00:00:00Z",
  "extensionInstalled": true,
  "affiliateId": "aff_123",
  "affiliateBalance": 15750,
  "preferredLanguage": "en",
  "darkMode": false,
  "notificationEmail": true,
  "notificationPush": true
}
```

### Update Profile

```
PUT /api/user/profile
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+91-9876543210",
  "preferredLanguage": "hi",
  "darkMode": true
}
```

**Response 200:**

```json
{
  "success": true,
  "user": { ... }
}
```

---

## Search API

### Search Products

Full-text search for products.

```
GET /api/search?q=samsung&category=electronics&limit=20&offset=0
```

**Query Parameters:**

- `q`: Search query (required)
- `category`: Filter by category (optional)
- `minPrice`: Minimum price (optional)
- `maxPrice`: Maximum price (optional)
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset (default: 0)

**Response 200:**

```json
{
  "total": 456,
  "results": [
    {
      "id": "prod_123",
      "title": "Samsung Galaxy S24",
      "slug": "samsung-galaxy-s24",
      "image": "https://...",
      "brand": "Samsung",
      "rating": 4.7,
      "minPrice": 72999,
      "maxPrice": 79999,
      "discount": 10
    }
  ]
}
```

---

## Categories API

### List Categories

```
GET /api/categories?limit=50
```

**Response 200:**

```json
{
  "categories": [
    {
      "id": "cat_1",
      "name": "Electronics",
      "slug": "electronics",
      "description": "All electronics",
      "icon": "📱",
      "image": "https://...",
      "productCount": 5000,
      "subcategories": [
        {
          "id": "cat_2",
          "name": "Smartphones",
          "slug": "smartphones"
        }
      ]
    }
  ]
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable message",
  "code": "ERROR_CODE",
  "details": { ... }  // Optional
}
```

### Common Error Codes

| Status | Code          | Meaning                    |
| ------ | ------------- | -------------------------- |
| 400    | INVALID_INPUT | Missing/invalid parameters |
| 401    | UNAUTHORIZED  | Not authenticated          |
| 403    | FORBIDDEN     | Insufficient permissions   |
| 404    | NOT_FOUND     | Resource not found         |
| 409    | CONFLICT      | Resource already exists    |
| 429    | RATE_LIMITED  | Too many requests          |
| 500    | SERVER_ERROR  | Server error               |

---

## Response Headers

All responses include:

```
Content-Type: application/json; charset=utf-8
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1612137600
X-Request-ID: req_abc123xyz
Cache-Control: no-store
```

---

## Webhooks

Webhooks for external integrations:

### Price Alert Triggered

```json
POST {webhook_url}

{
  "event": "price_alert_triggered",
  "timestamp": "2026-02-05T12:00:00Z",
  "data": {
    "alertId": "alert_123",
    "userId": "user_123",
    "productId": "prod_123",
    "currentPrice": 69999,
    "targetPrice": 70000
  }
}
```

---

**Last Updated**: February 5, 2026

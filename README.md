# DealHub India - Affiliate Price Comparison Platform

Complete India-focused affiliate SaaS platform with web app and Chrome extension. Compare prices across Amazon India, Flipkart, Myntra, and 7+ more platforms.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local

# Initialize database
npx prisma migrate dev

# Run dev server
npm run dev
```

Visit http://localhost:3000

## 🏗️ Architecture

**Web App** → Next.js (React, Tailwind CSS)
**API** → Node.js + Prisma + PostgreSQL
**Cache** → Redis (prices, alerts, sessions)
**Extension** → Chrome Manifest V3
**Payment** → Razorpay
**Auth** → NextAuth (Google + Email)

## ✨ Key Features

### Web Application

- 🔍 Real-time price comparison (10+ platforms)
- 🔔 Customizable price drop alerts
- 💳 Bank & card offers aggregation
- 📊 Historical price tracking
- 👤 User dashboard & preferences
- 💰 Affiliate reward system
- 📝 SEO-optimized blog

### Chrome Extension

- Auto-detect products on supported sites
- Inline price comparison widget
- One-click price alerts
- Affiliate link integration
- Wishlist synchronization
- Non-intrusive UI

### Admin Panel

- Product moderation
- Offer rule engine
- Affiliate management
- Revenue analytics
- Usage analytics

## 📦 Supported Platforms

- Amazon India
- Flipkart
- Myntra
- Ajio
- Meesho
- Tata Cliq
- Croma
- Reliance Digital
- Nykaa
- FirstCry

## 💾 Database Models

18+ Prisma models including:

- User (auth, preferences, subscription)
- Product, Store, Price (time-series)
- PriceAlert, Notification
- BankOffer, Coupon, AffiliateLink
- ClickLog (analytics)
- ExtensionEvent (tracking)
- BlogPost (SEO content)
- AdminLog (audit trail)

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost/dealhub_india

# Auth
NEXTAUTH_SECRET=generate-me
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret

# Payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_SECRET_KEY=xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@gmail.com
SMTP_PASS=app-password

# Redis
REDIS_URL=redis://localhost:6379

# Affiliate APIs
AMAZON_AFFILIATE_TAG=tag-20
FLIPKART_AFFILIATE_API_KEY=key

# Extension
NEXT_PUBLIC_EXTENSION_ID=your-ext-id
EXTENSION_API_SECRET=secret
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel
# Set env vars in dashboard
vercel --prod
```

### Docker

```bash
docker build -t dealhub .
docker run -p 3000:3000 --env-file .env.local dealhub
```

### Manual (AWS/DigitalOcean)

```bash
npm install
npm run build
npm start
```

## 📚 API Routes

```
POST /api/products/compare        - Compare prices
POST /api/extension/detect        - Extension product detection
POST /api/alerts/create           - Create price alert
POST /api/alerts/trigger          - Trigger alert checks
POST /api/affiliate/track-click    - Track affiliate clicks
```

## 🎨 Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Node.js, Express (via Next.js API)
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Auth**: NextAuth.js
- **Payments**: Razorpay API
- **Email**: SMTP/Nodemailer
- **Extension**: Vanilla JS + TypeScript (Manifest V3)
- **Deployment**: Vercel, Docker, AWS/DO

## 📊 Analytics

Track key metrics:

- DAU/MAU (via NextAuth)
- Price comparisons/day
- Affiliate revenue
- Extension installs
- Alert triggers
- Conversion rates

## 🔒 Security

- Rate limiting on APIs
- JWT authentication
- Secure cookies (SameSite)
- CSRF protection
- SQL injection prevention (Prisma)
- XSS protection
- Content Security Policy
- Environment secrets management

## 📱 Extension Publishing

1. Update `extension/manifest.json`
2. Zip extension folder
3. Submit to [Chrome Web Store Developer](https://chromewebstore.google.com/devconsole/)
4. Fill metadata & screenshots
5. Publish

Users get auto-updates!

## 🧪 Development

```bash
# Format code
npm run lint

# Type checking
npx tsc --noEmit

# Database
npx prisma studio    # GUI
npx prisma generate  # Generate client
npx prisma migrate dev --name feature
```

## 📄 Project Structure

```
deal-hub/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes
│   │   └── (pages)/     # Web pages
│   ├── lib/             # Utilities
│   ├── components/      # React components
│   └── styles/          # CSS
├── prisma/
│   └── schema.prisma    # Database schema
├── extension/           # Chrome extension
│   ├── manifest.json
│   └── src/
│       ├── background.js
│       ├── contentScript.js
│       └── popup.html
├── public/              # Static assets
└── .env.local          # Environment config
```

## 💡 Key Implementation Details

### Rate Limiting

Uses Redis to track requests per IP/user endpoint

### Price Caching

Aggressive Redis caching (1-24h TTL) for performance

### Affiliate System

Secure tracking with click logs and conversion attribution

### SEO

- Dynamic meta tags
- Structured data (schema.org)
- Sitemap generation
- Open Graph support

### Notifications

Multi-channel: Email, Push, WhatsApp

## 🐛 Troubleshooting

**Extension not loading?**

- Check manifest.json syntax
- Verify permissions
- Enable "Developer mode" in Chrome

**Price API timeout?**

- Check Redis connection
- Verify e-commerce API keys
- Check rate limits

**Database errors?**

- Run migrations: `npx prisma migrate dev`
- Check DATABASE_URL
- Verify PostgreSQL is running

## 📞 Support

- Email: support@dealhub.in
- Issues: GitHub issues
- Docs: Full API documentation in `/docs`

---

**Made with ❤️ for Indian shoppers | © 2026 DealHub**

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

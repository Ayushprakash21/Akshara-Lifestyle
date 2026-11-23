# AKSHARA LIFESTYLE

> **Everyday, Elevated.**
> Contemporary Indian accessible luxury across apparel, heirloom jewellery, botanical beauty, architectural home sanctuaries, and curated carry.

---

## Architecture Overview

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion
- **Primary Backend**: **Google Cloud Firebase** (Authentication, Cloud Firestore, Cloud Storage, Security Rules)
- **Database Rules**: Granular role-based security (`super_admin`, `admin`, `product_manager`, `order_manager`, `customer`)
- **Payments**: Modular payment abstraction layer (Razorpay staged & deferred with `PAYMENTS_ENABLED=false`)
- **Backend Standard**: **Firebase ONLY**. Supabase is permanently discontinued.

---

## Quick Start

### 1. Installation
```bash
npm install --legacy-peer-deps
```

### 2. Environment Setup
Copy [.env.example](file:///.env.example) to `.env`:
```bash
cp .env.example .env
```
Populate your Firebase credentials if connecting to a live project:
```env
VITE_APP_MODE=production
VITE_BACKEND_PROVIDER=firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
PAYMENTS_ENABLED=false
```

*Note: The application runs gracefully in Demo Mode even if environment variables are left blank.*

### 3. Local Development
```bash
npm run dev
```

### 4. Verification & Production Build
```bash
npm run lint    # TypeScript type-checking (tsc --noEmit)
npm run build   # Production Vite bundle
```

---

## Documentation
- [Firestore Schema Documentation](file:///docs/FIRESTORE_SCHEMA.md)
- [Environment & Deployment Guide](file:///docs/ENVIRONMENT_AND_DEPLOYMENT.md)
- [Firestore Security Rules](file:///firestore.rules)
- [Cloud Storage Security Rules](file:///storage.rules)

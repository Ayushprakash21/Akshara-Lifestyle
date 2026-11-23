# AKSHARA LIFESTYLE — Environment & Deployment Specification

## Architectural Backend Standard: Firebase Only

**AKSHARA LIFESTYLE** operates with **Google Cloud Firebase** as its single, authoritative backend provider across Authentication, Cloud Firestore, and Cloud Storage.

> **CRITICAL ARCHITECTURAL DIRECTIVE:**
> - **Supabase is permanently discontinued.** All legacy Supabase imports, clients, and environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) have been permanently excised from the application.
> - **Razorpay is deferred.** Payments remain in honest verification mode (`PAYMENTS_ENABLED=false`). No private payment credentials are required or exposed.
> - **Optional Third-Party Services** (Shiprocket, Delhivery, Resend, MSG91, GA4) are fully decoupleable. The application executes completely and gracefully without them. Ordinary storefront customers are never presented with missing-integration warnings.

---

## Environment Variables Breakdown

### Category 1: Active & Required (Core Application)
These parameters govern runtime environment resolution.

| Variable | Type | Client-Exposed (`VITE_`) | Purpose | Default / Production Value |
|---|---|---|---|---|
| `VITE_APP_MODE` | String | Yes | Application execution mode | `production` |
| `VITE_BACKEND_PROVIDER` | String | Yes | Authoritative backend provider | `firebase` |

---

### Category 2: Active (Firebase Architecture)
Required when running against live cloud services. When absent, the application boots into a safe, client-persisted Demo Mode without throwing uncaught exceptions.

| Variable | Client-Exposed (`VITE_`) | Service | Validation Rule |
|---|---|---|---|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Auth & Firestore | Required for live cloud connection |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth | Required for live authentication |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Cloud Firestore & Rules | Required for live database ops |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase Core SDK | Required for app telemetry |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Cloud Storage | Optional (needed only for file uploads) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Yes | Cloud Messaging | Optional |

---

### Category 3: Deferred Integration (Razorpay Payment Gateway)
Razorpay is decoupled from the current release. The storefront operates in full demo checkout mode without requiring real banking credentials.

| Variable | Client-Exposed (`VITE_`) | Environment | Status / Notes |
|---|---|---|---|
| `PAYMENTS_ENABLED` | **No** | Server / Build | **Must remain `false`**. Staged for future phase. |
| `RAZORPAY_KEY_ID` | **No** | Server | Staged; public key for future live checkout. |
| `RAZORPAY_KEY_SECRET` | **No (STRICT)** | Server-side ONLY | Private secret. **Never** prefix with `VITE_`. |
| `RAZORPAY_WEBHOOK_SECRET` | **No (STRICT)** | Server-side ONLY | Private secret for webhook HMAC validation. |

---

### Category 4: Optional Third-Party Services
The application provides graceful fallbacks for logistics and notification providers. Missing variables in this tier will **never** interrupt customer checkout, catalog browsing, or bag operations.

| Variable | Service | Client-Exposed | Fallback Behavior When Missing |
|---|---|---|---|
| `SHIPROCKET_API_EMAIL` | Shiprocket Logistics | No | Native internal PIN code serviceability table |
| `SHIPROCKET_API_PASSWORD` | Shiprocket Logistics | No | Native internal PIN code serviceability table |
| `DELHIVERY_API_TOKEN` | Delhivery Express | No | Internal tracking timeline simulator |
| `RESEND_API_KEY` | Resend Transactional Email | No | Demo log / client confirmation screen |
| `MSG91_AUTH_KEY` | MSG91 Indian SMS / OTP | No | In-memory demo OTP flow |
| `MSG91_TEMPLATE_ID` | MSG91 DLT Template | No | Standard client notification |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 | Yes | Demo local telemetry (no external network call) |

---

## Security & Deployment Principles

1. **Zero Secret Leakage**:
   - Only configuration items requiring browser access use the `VITE_` prefix.
   - Private API keys (`RAZORPAY_KEY_SECRET`, `SHIPROCKET_API_PASSWORD`, etc.) reside strictly on protected backend servers or environment secret stores.
2. **Customer Experience Protection**:
   - Missing configuration notifications are restricted to developer consoles (`import.meta.env.DEV`) and authenticated Admin diagnostic panels.
   - Ordinary customers browsing `/`, `/shop`, `/product/*`, `/cart`, `/checkout`, and `/account` never encounter disruptive "Configuration Missing" banners.
3. **Graceful Degradation**:
   - Every service is guarded by abstraction layers (`productService`, `customerService`, `orderService`, `inventoryService`, `paymentService`). If Firebase or third-party networks are temporarily unreachable, the store gracefully persists local state without crashing.

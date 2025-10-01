# Playwright Testing Guide

## Setup
The app now has Playwright testing configured with comprehensive test coverage.

## Running Tests

### Prerequisites
1. Make sure the dev server is running: `npm run dev`
2. The server should be accessible at `http://localhost:5173`

### Test Commands
```bash
# Run all tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/basic.spec.ts

# Debug tests
npx playwright test --debug
```

## Test Coverage

### 1. Basic Tests (`tests/basic.spec.ts`)
- App loads successfully
- Landing page renders core elements
- Navigation to auth page works
- 404 page handles unknown routes

### 2. Landing Page Tests (`tests/landing.spec.ts`)
- Landing page displays for unauthenticated users
- Get started button navigation

### 3. Authentication Tests (`tests/auth.spec.ts`)
- Auth page displays correctly
- Redirects work properly

### 4. Navigation Tests (`tests/navigation.spec.ts`)
- 404 page handling
- Mobile hamburger menu display

### 5. Responsive Design Tests (`tests/responsive.spec.ts`)
- Tests across Mobile, Tablet, and Desktop viewports
- Takes screenshots for visual regression testing

### 6. Expense Tracking Tests (`tests/expense-tracking.spec.ts`)
- Main app functionality (when authenticated)
- Expense management features

## Configuration
- Base URL: `http://localhost:5173`
- Global setup validates dev server availability
- Timeouts configured for slow 3D components
- Multiple browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing included

## Troubleshooting
- Ensure dev server is running before running tests
- 3D components may take longer to load - timeouts are configured accordingly
- Some tests skip when user is not authenticated (expected behavior)

---

# Mobile (Capacitor) Quick Start

1) Install native platforms locally
- npm install
- npx cap add ios (and/or) npx cap add android
- npx cap sync

2) Configure live reload
- capacitor.config.ts already points server.url to your preview for hot reload on device

3) Run on device/emulator
- npm run build
- npx cap run ios  (or)  npx cap run android

4) Push notifications
- Create Firebase project; add iOS/Android app configs
- iOS: enable Push + Background Modes in Xcode; Android: ensure FCM dependency in Gradle
- In Supabase, set FCM_SERVICE_ACCOUNT_JSON secret
- Test registration in app: route /mobile → "Register for Push"

5) Biometrics
- iOS/Android: ensure capabilities/permissions are enabled by platform
- Test in app: route /mobile → Biometrics → Verify

For physical device guidance, refer to the Capacitor documentation.

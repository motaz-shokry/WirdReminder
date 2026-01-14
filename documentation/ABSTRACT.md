# Multi-Platform Abstraction & Code Sync Architecture

This document explains the architecture of the **Wird Reminder** project, focusing on how it maintains a unified codebase across four platforms: **Chrome Extension**, **Firefox Extension**, **PWA (Web)**, and **Android (Capacitor/Native)**.

## Core Principle: "Write Once, Sync Everywhere"

The project minimizes platform-specific code by centralizing all business logic, UI assets, and data in a root `core/` directory. This directory is then "synchronized" (copied) into each platform's source folder during development or build time.

---

## 1. Directory Structure

```text
WirdReminder/
├── core/                # SINGLE SOURCE OF TRUTH (Originals)
│   ├── assets/          # Fonts, Icons
│   ├── css/             # Shared Design System
│   ├── data/            # Presets, Metadata
│   └── js/              # Shared logic (Adapters, API, Parser, Logic)
├── chrome/              # Chrome Extension Wrapper
│   └── src/core/        # SYNCED COPY (Do not edit directly)
├── firefox/             # Firefox Extension Wrapper
│   └── src/core/        # SYNCED COPY (Do not edit directly)
├── www/                 # PWA & Capacitor Host
│   └── core/            # SYNCED COPY (Do not edit directly)
├── android/             # Android/Capacitor Native Shell
└── scripts/             # The Synchronization Engine
```

---

## 2. Synchronization Mechanism

### `scripts/sync.js`
This script is the heart of the "Write Once" philosophy. It recursively copies the contents of the root `core/` directory into:
- `chrome/src/core/`
- `firefox/src/core/`
- `www/core/`

**Key Command:** `npm run sync`

### `scripts/build.js`
The master orchestrator that:
1.  Runs `sync.js` to ensure every platform has the latest core code.
2.  Packages browser extensions into `.zip` artifacts.
3.  Syncs Capacitor for Android and triggers the Gradle build.
4.  Collects all final artifacts (ZIPs, APK, AAB) into a root `build/` folder.

**Key Command:** `npm run build`

---

## 3. The Abstraction Layer (Adapters)

To handle differences in platform APIs (e.g., how to schedule a notification or store data), the project uses a **Unified Adapter Pattern** located in `core/js/adapter/`.

### Unified Storage (`storage.js`)
Instead of calling `chrome.storage` or `localStorage` directly, the code calls `storage.get()` or `storage.set()`.
- **Extensions**: Uses `chrome.storage.local` (asynchronous).
- **Web/Mobile**: Uses `localStorage` (wrapped in a Promise for consistency).

### Unified Notifications & Alarms (`notifications.js`)
Handles the complex differences in background scheduling:
- **Extensions**: Uses `chrome.alarms` and `chrome.notifications`.
- **Mobile (Android)**: Uses `Capacitor Local Notifications`.
- **Web**: Uses `setInterval` and `Desktop Notifications` for active sessions.

### Environment Context (`env.js`)
A simple utility to detect the current platform:
```javascript
export const env = {
    isExtension: typeof chrome !== 'undefined' && !!chrome.runtime,
    isMobile: window.Capacitor?.isNative,
    isWeb: !window.Capacitor?.isNative && !isExtension,
};
```

---

## 4. Minimal Platform-Specific Editing

### Extension Cross-Browser Bridge
Firefox and Chrome share 99% of their code. To handle the `browser` vs `chrome` prefix difference without code duplication, we use a global `api` constant:

```javascript
// In platform-specific popup.js or background.js
const api = typeof browser !== 'undefined' ? browser : chrome;

// Now use api.* globally
api.runtime.onInstalled.addListener(...);
api.alarms.create(...);
```

### Manifest Versioning
Manifest files (`manifest.json` for extensions, `package.json` for web) are kept in sync automatically via `scripts/version-sync.js` so that the version number only needs to be updated once in the root `package.json`.

---

## 5. Summary of Development Workflow

1.  **Modify Shared Logic**: Edit files in `core/`.
2.  **Sync**: Run `npm run sync`.
3.  **Validate**: Test the Web version (`www/`) or load the Extension from the `chrome/src/` or `firefox/src/` folder.
4.  **Build**: Run `npm run build` to generate all production-ready packages.
5.  **Minimal Native Tweaks**: Only touch `/chrome`, `/firefox`, or `/android` for platform-specific configurations (like permissions or native UI hooks).

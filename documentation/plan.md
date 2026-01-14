# Multi-Platform Implementation Plan: Wird Reminder

This document outlines the phased approach to transforming Wird Reminder into a truly universal web application that powers a PWA, browser extensions, and mobile platforms from a single source of truth.

## Phase 1: Unified Core Reconstruction
**Goal**: Consolidate all shared logic into a root-level core structure.

1.  **Directroy Reorganization**:
    *   Create `/core/js`, `/core/css`, and `/core/assets`.
    *   Move `api.js`, `parser.js`, `renderer.js` to `/core/js`.
    *   Extract the business logic from `app.js` and `popup.js` into modular files in `/core/js` (e.g., `reminders.js`, `ui-handlers.js`).
2.  **Shared Styling**:
    *   Move `styles.css` and any component-specific CSS to `/core/css`.
    *   Ensure all assets (fonts, icons) are in `/core/assets`.

## Phase 2: The Abstraction Layer (The Adapter)
**Goal**: Create a unified API for platform-specific capabilities.

1.  **StorageAdapter**:
    *   Create `/core/js/adapter.js`.
    *   Implement an `async` API that detects if `chrome.storage` is available.
    *   Fallback to `localStorage` for Web/PWA.
2.  **Notification & Alarm Adapter**:
    *   Define a contract for `setAlarm(id, time, frequency)` and `showNotification(title, body)`.
    *   **Extension implementation**: Map to `chrome.alarms` and `chrome.notifications`.
    *   **Web implementation**: Map to `ServiceWorker` + `pushManager` or local `Notification` API.
    *   **Android implementation**: Map to `Capacitor native plugins`.

## Phase 3: Platform Wrappers (The Deployables)
**Goal**: Minimal, thin shells for each platform.

1.  **Browser Extensions (`/chrome`, `/firefox`)**:
    *   Manifest files pointing to `/src/popup.html`.
    *   `popup.html` should be a skeleton that imports core JS/CSS.
    *   Background service worker that imports the Core Notification Logic.
2.  **PWA/Web (`/www`)**:
    *   `index.html` (Landing page + App).
    *   `sw.js` (Service Worker) for offline support and notifications.
3.  **Android (`/android`)**:
    *   Capacitor/Cordova wrapper pointing to the web assets.

## Phase 4: Notification & Alarm Strategy (Detailed)
**Goal**: Reliable scheduling across all environments.

| Platform | Scheduling Mechanism | Notification Trigger |
| :--- | :--- | :--- |
| **Extensions** | `chrome.alarms` (Persistent) | `chrome.notifications` via Background Script |
| **Web / PWA** | Service Worker `periodicSync` (Limited) or Client-side Alarms | `self.registration.showNotification` |
| **Android** | `LocalNotifications` Plugin (Native) | Native system notifications |

## Phase 5: Automation & Synchronization
**Goal**: Ensure the "Single Source of Truth" is propagated.

1.  **The Sync Script (`sync.sh`)**:
    *   A script that copies `/core` contents into `platform/assets` or equivalent.
    *   Handles path adjustments (e.g., extensions might need relative paths starting from the extension root).
2.  **Build Pipeline**:
    *   Script to generate `.zip` for stores and `.apk` for Android.

## Phase 6: Testing & Validation
1.  Verify storage persistence across popup closed/opened.
2.  Verify alarms fire even when the browser popup is closed (via background scripts).
3.  Test PWA "Add to Home Screen" and offline reading.

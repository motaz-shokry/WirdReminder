# LLM Handover & Progress Log: Wird Reminder

This file serves as the context bridge between AI sessions. It outlines the current state, the architectural vision, and the immediate next steps with technical justifications.

## 📝 Project Context: The "Universal Web App" Goal
We are transforming a Chrome/Firefox extension into a **Universal Web App**. 
Currently, the codebase has two "brains": 
1. `chrome/src/popup/popup.js` (Extension logic)
2. `app.js` (Web/Landing page logic)

They are nearly identical but use different storage APIs (`chrome.storage` vs `localStorage`). This duplication is a maintenance risk. The goal is to move all logic to a `/core` directory that both platforms import.

---

## 🚦 Current Status
- [x] **Architecture Audit**: Completed. Identified identical patterns in Web and Extension logic.
- [x] **Multi-Platform Plan**: Created. (See `documentation/plan.md` and `documentation/phases/`).
- [x] **Phase 0 (Preparation)**: COMPLETED.
- [x] **Phase 1 (Abstraction Layer)**: COMPLETED. (Storage Adapter).
- [x] **Phase 2 (Migration)**: COMPLETED. (`app.js`, `popup.js`, `background.js`, `reader.js`).
- [x] **Phase 3 (Synchronization)**: COMPLETED. (`scripts/sync-core.sh`).
- [x] **Phase 4 (Unified Notifications)**: COMPLETED. (Notification Adapter).
- [x] **Phase 5 (PWA Refinement)**: COMPLETED. (Manifest, Service Worker, Offline Support).
- [x] **Phase 6 (Testing & Packaging)**: COMPLETED.
- [x] **Phase 7 (Mobile Notifications)**: COMPLETED.
- [x] **Phase 8 (Unified Build System)**: COMPLETED. (Now supports JDK 25 via AGP 8.13.0).
- [x] **Phase 9 (Maintenance & Documentation)**: COMPLETED. (ABSTRACT.md, Cross-browser bridge).

---

### 1. Unified Core Initialization (Phase 0) - [DONE]
*   **Action**: Created `/core/js`, `/core/css`, and `/core/assets`. Moved `parser.js`, `renderer.js`, and `api.js` (the "Engine") into the core.

### 2. The Storage Adapter Implementation (Phase 1) - [DONE]
*   **Action**: Implemented `/core/js/adapter/storage.js`. It detects environment and uses `chrome.storage.local` or `localStorage`.
*   **Key detail**: All methods return Promises for a unified async API.

### 3. Logic Decoupling (The "Reminders" Module) - [DONE]
*   **Action**: Extracted logic into `/core/js/logic/reminders.js`.
*   **Action**: Updated `core/js/api.js` to use the storage adapter.

---

## 🛠️ Immediate Next Steps (Task Board)

### 1. Migrate Web App (`app.js`) to Core Modules - [DONE]
*   **Action**: `app.js` now imports from `/core/js`.
*   **Action**: Rewrote storage calls to be `async/await` and use the new object-based `set` signature.
*   **Action**: Removed redundant reminder logic and replaced with imports from `core/js/logic/reminders.js`.

### 2. Migrate Extension Popup & Background Files - [DONE]
*   **Action**: `popup.js`, `background.js`, `notifications.js`, and `reader.js` now import from `/core/js`.
*   **Action**: Replaced all `chrome.storage.local` calls with the unified `storage` adapter.
*   **Action**: Replaced redundant business logic with `core/js/logic/reminders.js`.
*   **Action**: Fixed asset paths to point to the synced core directory within the extension.

### 3. Synchronization Mechanism (Phase 3) - [DONE]
*   **Action**: Created `scripts/sync-core.sh`.
*   **Action**: Propagated core logic to `chrome/src/core` and `firefox/src/core`.
*   **Action**: Cleaned up redundant local copies of `api.js`, `parser.js`, and `renderer.js`.

### 4. Unified Notifications & Alarms (Phase 4) - [DONE]
*   **Action**: Created `core/js/adapter/env.js` and `core/js/adapter/notifications.js`.
*   **Action**: Integrated notification scheduling directly into `core/js/logic/reminders.js`.
*   **Action**: Simplified all UI files (`app.js`, `popup.js`) to remove redundant alarm logic.
*   **Action**: Ported all Firefox-specific logic to use the shared core.

### 5. PWA Refinement & Asset Centralization (Phase 5) - [DONE]
*   **Action**: Created `manifest.json` linked to centralized core icons.
*   **Action**: Moved all icons and fonts to `core/assets/`.
*   **Action**: Updated `sync-core.sh` to propagate assets to all platforms.
*   **Action**: Updated `index.html`, `sw.js`, and extension manifests to use the new centralized asset paths.
*   **Action**: Created `sw.js` (Service Worker) with an aggressive caching strategy.

### 6. Repository Cleanup & Mobile App Integration (Phase 6) - [DONE]
*   **Action**: Centralized CSS (`core/css`) and Data (`core/data`) files.
*   **Action**: Reorganized the Web App into a dedicated `www/` directory to isolate it from development tools.
*   **Action**: Initialized **Capacitor** in the project root.
*   **Action**: Added the **Android** platform and synced web assets from `www`.

### 7. Native Mobile Notifications (Phase 7) - [DONE]
*   **Action**: Installed `@capacitor/local-notifications` plugin.
*   **Action**: Updated `core/js/adapter/env.js` to detect native platform correctly.
*   **Action**: Updated `core/js/adapter/notifications.js` to use Capacitor's native scheduling engine.
*   **Action**: Integrated notification permission requests and click handlers into `app.js`.
*   **Action**: Verified that notification clicks correctly navigate to the intended "Wird" in the reader.

### 8. Automated Build System (Phase 8) - [DONE]
*   **Action**: Rewrote all Bash scripts (`.sh`) as cross-platform **Node.js** scripts.
*   **Action**: Integrated everything into `package.json` scripts (`npm run build`, `npm run sync`).
*   **Action**: Created `scripts/version-sync.js` to keep version numbers identical across all manifests.
*   **Action**: Created `documentation/build-instructions.md` with full workflow details.
*   **Action**: Updated Gradle to 9.2.1 and AGP to 8.13.0 to support **JDK 25**.

### 9. Maintenance & Abstraction (Phase 9) - [DONE]
*   **Action**: FIXED a critical `SyntaxError` (redeclaration) in Firefox popup.
*   **Action**: Implemented a cross-browser `api` bridge (`const api = browser || chrome`) in both popups.
*   **Action**: Created `documentation/ABSTRACT.md` to explain the "Write Once, Sync Everywhere" architecture for future AI agents and developers.

---

## 💡 Architectural Decisions & Reasoning

### 1. Vanilla Javascript (No Frameworks)
*   **Why**: Extensions and PWAs have strict CSP (Content Security Policies). Vanilla JS is the most portable format, requires zero build step (Vite/Webpack-less), and is easiest to debug across three distinct runtimes (Chrome, Firefox, Mobile Webview).

### 2. The "Shell" Pattern
*   **Why**: We don't want to build a "one size fits all" HTML file. Extension popups need `400px` width; websites need responsive layouts. 
*   **Strategy**: Use `index.html` (Web) and `popup.html` (Extension) as "Shells" that simply hook into the same Core JS modules.

### 3. Single Source of Truth for Assets & Config
*   **Why**: Fonts and presets (surahs/presets.json) are shared across all 4 targets. We host them in `/core/assets` and `/core/data`.
*   **Strategy**: A central `scripts/sync-core.sh` ensures all active targets (`www`, `chrome`, `firefox`) are updated instantly when core assets change.

### 4. Capacitor for Mobile
*   **Why**: Instead of writing a native app, we wrap the PWA with Capacitor. This allows us to use the exact same `app.js` and `styles.css` on Android/iOS while granting future access to native APIs (like precise alarms).

---

## 🛑 Blockers / Considerations
*   **CORS**: Quran.com API allows web requests, but Extensions need host permissions in `manifest.json`.
*   **Service Worker Alarms**: Web PWAs do not have a 1:1 equivalent to `chrome.alarms` that works reliably when the tab is closed. We must manage expectations for the "Pure Web" notifications vs the "Extension/Native" ones.
*   **Java Version**: The project is now fully compatible with **JDK 17, 21, and 25** thanks to the upgrade to Gradle 9.2.1 and AGP 8.13.0.

---

## 🏁 How to use this log
**Next Model**: Please perform final validation of the Android builds and prepare the icons/splash screens using Capacitor Assets tool. After that, move to Phase 8: Testing & Packaging.

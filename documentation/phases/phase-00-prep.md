# Phase 0: Preparation & Cleanup

Before building the multi-platform abstraction, we must decouple the existing code from its "Extension-first" or "Web-first" assumptions.

## 1. Audit Current Codebase
*   **Identified Issue**: `app.js` is a modified copy of `popup.js`. 
    *   *Correction*: Extract common logic into `core/js/reminders.js`.
*   **Identified Issue**: Hardcoded `chrome.storage.local` calls in `popup.js`.
    *   *Correction*: Replace with `import { storage } from '../core/storage.js'`.
*   **Identified Issue**: `api.js` has a hardcoded `localStorage` wrapper.
    *   *Correction*: Move to the unified `StorageAdapter`.

## 2. Setting up the Core Structure
Create the following directories:
```text
/core
  /js
    /api        # Quran.com API client
    /logic      # Business logic (Reminders, Calendar, History)
    /adapter    # Storage and Platform abstraction
    /ui         # Shared UI handlers and templates
  /css
    /base       # CSS Variables and Resets
    /components # Buttons, Cards, Modals
  /assets
    /fonts
    /icons
```

## 3. Modularizing `app.js` and `popup.js`
The goal is to reduce these files to less than 50 lines of code each. They should only:
1.  Import the `CoreUI` module.
2.  Pass platform-specific configurations (e.g., `theme`, `dimensions`).
3.  Execute `CoreUI.init()`.

## 4. The "Single Source" Manifest
Instead of maintaining multiple `manifest.json` files by hand:
1.  Create `manifest.base.json` with shared fields (name, version, permissions).
2.  Use a script to generate the Chrome and Firefox versions (e.g., swapping `action` for `browser_action` if needed, although V3 is unified).

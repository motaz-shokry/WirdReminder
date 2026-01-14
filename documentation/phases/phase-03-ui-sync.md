# Phase 3: UI Architecture & Synchronization

To maintain a single codebase, we must separate the **UI State Logic** from the **UI Rendering**.

## 1. Modular Logic (`core/js/logic/`)
Create pure JS modules that handle the "Brain" of the app:
*   `reminder-engine.js`: Validation, CRUD, frequency calculation.
*   `calendar-logic.js`: Grid generation, completion checking logic.
*   `data-portability.js`: Export/Import logic (JSON handling).

## 2. Shared Templates vs Platform Shells

Instead of duplicating `index.html` to `popup.html`, we use a core template.

### The Shell Pattern:
*   **Web Shell (`/www/index.html`)**: Includes landing page SEO, navigation, and a full-screen app container.
*   **Extension Shell (`/chrome/popup.html`)**: Includes only the app container with fixed dimensions.

### Shared CSS:
The core CSS handles the components (buttons, cards, inputs). 
A platform override file (`popup.css` or `mobile.css`) handles layout constraints:

```css
/* popup.css - Extension Specific */
body {
    width: 380px;
    height: 600px;
    overflow-x: hidden;
}
.nav { display: none; } /* Hide landing page nav in popup */
```

## 3. The Synchronization Strategy

Since we aren't using a heavy build tool (like Vite/Webpack), we use a simple filesystem sync script.

### `scripts/sync.js` (or `.sh`):
This script runs whenever a core file changes:

```bash
#!/bin/bash
# Sync Core to Platforms
cp -r core/js/* chrome/src/lib/
cp -r core/js/* firefox/src/lib/
cp -r core/js/* www/js/
cp -r core/css/* chrome/src/styles/
# ... and so on
```

## 4. Handling Assets (Fonts & Icons)
Fonts are heavy. They should reside in `core/assets/fonts`.
The sync script should symlink them (for dev) or copy them (for production) to each platform's assets folder to comply with Extension security policies (which forbid loading local files from outside the extension root).

## 5. Security (Content Security Policy)
*   Extensions forbid inline JS. **Rule**: Always use `<script src="...">`.
*   Extensions forbid external fonts. **Rule**: Always host fonts locally in the package.
*   Web allows both, but for the sake of the Extension, we follow the stricter rule for the entire Universal App.

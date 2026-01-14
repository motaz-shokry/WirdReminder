# Phase 1: Storage & Platform Abstraction Layer

The core of the multi-platform architecture is the **Unified Adapter**. This layer masks the differences between browser extension APIs and standard Web APIs.

## 1. The Storage Adapter (`core/js/storage.js`)

Most logic in the app depends on saving/loading reminders. Extensions use `chrome.storage.local` (async, persistent), while web uses `localStorage` (sync, but we should wrap it in async for consistency).

### Implementation Logic:
```javascript
export const storage = {
    async get(key) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            const result = await chrome.storage.local.get(key);
            return key === null ? result : result[key];
        } else {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
    },

    async set(key, value) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            return await chrome.storage.local.set({ [key]: value });
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
};
```

## 2. Environment Detection

The app needs to know if it's running in a **Popup**, a **Full Page**, or a **Mobile Webview**.

```javascript
export const env = {
    isExtension: typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id,
    isPopup: typeof chrome !== 'undefined' && !!chrome.extension && 
              chrome.extension.getViews({ type: 'popup' }).length > 0,
    isMobile: /Android|iPhone/i.test(navigator.userAgent),
    getBaseURL: () => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            return chrome.runtime.getURL('');
        }
        return window.location.origin + '/';
    }
};
```

## 3. Platform-Specific Features Needed

| Platform | Special Requirement | Solution |
| :--- | :--- | :--- |
| **Extension** | Cross-origin API calls | Handle in `manifest.json` host permissions. |
| **Web/PWA** | Service Worker Reg | Root `index.html` logic to register `sw.js`. |
| **Mobile** | Status Bar / Safe Area | Use CSS constants `env(safe-area-inset-top)`. |
| **Firefox** | `browser` vs `chrome` | Use the `webextension-polyfill` library. |

## 4. Why Async Everywhere?
Extension storage is natively asynchronous. If we start with a synchronous `localStorage` approach and later port to extensions, we will have to refactor the entire UI logic to handle Promises. Starting with `async` ensures the core logic is future-proof.

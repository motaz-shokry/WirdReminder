# Publishing Guide

This guide details the steps required to publish the Wird Reminder extension to the Chrome Web Store and Firefox Add-ons (AMO).

---

## 1. Preparation

Before publishing, ensure the following are updated in both the root `manifest.json` and `firefox/manifest.json`:

1.  **Version Number**: Increment the `"version"` string (e.g., `1.0.0` -> `1.0.1`).
2.  **Icons**: Ensure all icons in `src/assets/icons/` are correct.
3.  **Testing**: Run the full testing checklist in the [Maintenance Guide](maintenance.md).

---

## 2. Publishing to Chrome Web Store

### Requirements
- A Google Developer Account ($5 one-time fee).
- Promotional images (see [Store Listing Guide](store.md)).

### Steps
1.  **Bundle the Extension**:
    - Zip the following files/folders from the project root:
        - `manifest.json`
        - `src/`
    - Exclude `.git`, `documentation/`, `firefox/`, and any other development files.
2.  **Upload to Dashboard**:
    - Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
    - Click **"Add new item"** and upload your zip file.
3.  **Fill Store Details**:
    - Use the content provided in [store.md](store.md).
    - Upload the promotional screenshots and icons.
4.  **Privacy & Permissions**:
    - Explain why you need `alarms` (for timing reminders), `storage` (for user data), and `notifications` (to alert users).
    - Provide a privacy policy URL (if required).
5.  **Submit for Review**:
    - Click **"Submit for review"**. Review typically takes 1-3 business days.

---

## 3. Publishing to Firefox Add-ons (AMO)

### Requirements
- A Firefox Add-ons (AMO) account.

### Steps
1.  **Bundle the Extension**:
    - Go to the `firefox/` directory.
    - Zip everything *inside* the `firefox/` folder:
        - `manifest.json` (the Firefox version)
        - `src/`
    - **Note**: Ensure `src/lib/browser-polyfill.js` is included in the zip.
2.  **Submit to AMO**:
    - Go to the [AMO Developer Hub](https://addons.mozilla.org/developers/).
    - Click **"Submit a New Add-on"**.
3.  **Upload & Versioning**:
    - Upload the zip file from the `firefox/` folder.
    - Choose if you want Mozilla to host the version or if you want to self-distribute.
4.  **Validation**:
    - AMO will run an automated validator. Address any warnings if they appear.
5.  **Submit**:
    - Complete the listing details (can mirror the Chrome listing).
    - Submit for review.

---

## 4. Maintenance of the Firefox Port

The Firefox version resides in `/firefox`. When making code changes to the core `src/`:

1.  Apply changes to the root `src/`.
2.  Mirror those changes to `firefox/src/`.
3.  **Crucial**: In `firefox/src/`, all `chrome.*` calls must be replaced with `browser.*` and the `browser-polyfill.js` must be included in the HTML files.

### Automation Tip
You can use a simple script to refresh the Firefox folder:
```bash
# Example update command
cp -r src/* firefox/src/
find firefox/src -name "*.js" -exec sed -i 's/chrome\./browser\./g' {} +
```
*Note: Be careful not to overwrite the `firefox/src/lib/` folder if you manually manage it.*

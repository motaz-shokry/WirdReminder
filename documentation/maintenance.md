# Maintenance & Contribution Guide

This guide provides comprehensive instructions for maintaining the extension, adding new content, and contributing to the codebase.

---

## Development Setup

### Prerequisites
- Node.js (for any future build tooling)
- Chrome browser with Developer mode enabled
- Code editor with Arabic language support

### Loading the Extension

#### Chrome / Edge (Chromium)
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `WirdReminder` root directory

#### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on..."**
3. Select the `manifest.json` inside the `firefox/` directory

### Hot Reload
- **Popup changes**: Close and reopen the popup
- **Background changes**: Click the "Reload" button on the extension card
- **Reader changes**: Refresh the reader tab

---

## Adding New Presets

To add a new Sunnah reminder preset:

1. Open `src/data/presets.json`
2. Add a new object following this structure:

```json
{
  "id": "unique_preset_id",
  "name": "الاسم بالعربية",
  "description": "وصف للتذكير بالعربية",
  "type": "surah | ayah_range | juz",
  "target": {
    "surahId": 18,
    "startAyah": 1,
    "endAyah": 10,
    "juzId": 1
  },
  "timing": {
    "frequency": "daily | weekly",
    "day": 5,
    "time": "10:00"
  },
  "defaultEnabled": false
}
```

### Field Guidelines:

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Use snake_case, must be unique across all presets |
| `name` | Yes | Arabic name displayed in the list |
| `description` | Yes | Arabic description, brief |
| `type` | Yes | One of: `surah`, `ayah_range`, `juz` |
| `target.surahId` | For surah/ayah_range | 1-114 |
| `target.startAyah` | For ayah_range | Starting verse number |
| `target.endAyah` | For ayah_range | Ending verse number |
| `target.juzId` | For juz | 1-30 |
| `timing.frequency` | Yes | `daily` or `weekly` |
| `timing.day` | For weekly | 0=Sunday, 5=Friday, 6=Saturday |
| `timing.time` | Yes | 24-hour format "HH:MM" |
| `defaultEnabled` | Yes | Always set to `false` |

---

## UI Modifications

### Styling System

The extension uses a modular CSS system in `src/styles/`:

| File | Purpose |
|------|---------|
| `base.css` | CSS variables (colors, spacing), resets, root font |
| `components.css` | UI components (buttons, cards, modals, forms) |
| `layout.css` | App container, tabs, layout utilities |

### Color Palette (Shadcn-inspired)

All colors use HSL format via CSS variables:

```css
/* Primary (Blue) */
--primary: 221.2 83.2% 53.3%;

/* Quran Theme (Green) */
--quran-green: 142.1 76.2% 36.3%;

/* Destructive (Red) */
--destructive: 0 84.2% 60.2%;

/* Neutral */
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
```

### Adding New Components

1. Define styles in `components.css`
2. Use existing CSS variables for colors
3. Follow the BEM-like naming convention:
   ```css
   .component-name { }
   .component-name .subpart { }
   .component-name.modifier { }
   ```

### Modal System

Use the custom modal patterns instead of browser defaults:

```javascript
// Alert Modal
showAlert('العنوان', 'الرسالة');

// Delete Confirmation Modal
showDeleteModal(reminderId);

// Calendar Modal
showCalendarModal(reminder);
```

---

## Reader Customization

### Fonts

The reader uses two custom fonts:

| Font | Purpose | Location |
|------|---------|----------|
| UthmanicHafs | Quranic text (verses) | `src/assets/fonts/UthmanicHafs.woff2` |
| SurahNames | Surah header ornaments | `src/assets/fonts/SurahNames.woff2` |

### Reader CSS Variables

Embedded in `reader.html`:

```css
:root {
  --primary-color: #059669;    /* Interactive elements */
  --bg-color: #fcfbf9;         /* Page background */
  --text-color: #1F2937;       /* Main text */
  --mushaf-width: 600px;       /* Content width */
  --mushaf-line-height: 55px;  /* Line spacing */
}
```

### Adding a New Render Type

1. Add the type to `renderByType()` in `reader.js`
2. Create a fetch function in `api.js`
3. Ensure parser handles the new verse structure
4. Test with various verse counts

---

## Alarm Management

### Creating Alarms

Alarms are created in `popup.js` via `createAlarm()`:

```javascript
function createAlarm(reminder) {
  const [hours, minutes] = reminder.timing.time.split(':').map(Number);
  let when = new Date();
  when.setHours(hours, minutes, 0, 0);

  if (when < Date.now()) {
    when.setDate(when.getDate() + 1);
  }

  // Weekly adjustment
  if (reminder.timing.frequency === 'weekly') {
    let diff = (reminder.timing.day - when.getDay() + 7) % 7;
    if (diff === 0 && when < Date.now()) diff = 7;
    when.setDate(when.getDate() + diff);
  }

  chrome.alarms.create(`reminder_${reminder.id}`, {
    when: when.getTime(),
    periodInMinutes: reminder.timing.frequency === 'daily' ? 1440 : 10080
  });
}
```

### Clearing Alarms

Always clear alarms when disabling or deleting reminders:

```javascript
chrome.alarms.clear(`reminder_${id}`);
```

---

## Debugging

### Service Worker (Background)

1. Go to `chrome://extensions/`
2. Find "Wird Reminder"
3. Click "Service Worker" link under "Inspect views"
4. View console logs and network requests

### Popup

1. Click the extension icon to open popup
2. Right-click inside the popup
3. Select "Inspect"
4. Debug as a normal web page

### Reader

Standard browser DevTools (F12) work directly on reader tabs.

### Common Debug Points

```javascript
// background.js
console.log('Alarm fired:', alarm.name);

// popup.js
console.log('Creating alarm for:', reminder.name);
console.log('Editing reminder:', reminder);

// reader.js
console.error('Error loading content:', e);
```

---

## Testing Checklist

Before submitting changes:

- [ ] All reminder types work (surah, ayah_range, juz)
- [ ] Daily and weekly scheduling work correctly
- [ ] Notifications appear at scheduled times
- [ ] "اقرأ الآن" button opens correct content
- [ ] Mark as read toggles correctly
- [ ] Calendar shows correct completion status
- [ ] Bookmarks persist across sessions
- [ ] Export/Import preserves all data
- [ ] UI is fully RTL and renders correctly
- [ ] No console errors in any view

---

## Code Style Guidelines

### JavaScript

- Use `async/await` for all storage operations
- Destructure Chrome storage results: `const { user_reminders } = await chrome.storage.local.get(...)`
- Use JSDoc comments for all exported functions
- Keep functions focused and under 50 lines when possible

### CSS

- Use CSS variables for all colors
- Use semantic spacing variables from `base.css`
- Mobile-first responsive approach
- Keep animations subtle (200-300ms)

### HTML

- Use semantic elements (`<section>`, `<header>`, `<main>`)
- Include `lang="ar"` and `dir="rtl"` on root elements
- Add ARIA attributes for accessibility

---

## Maintaining the Firefox Port

The Firefox port is located in the `/firefox` directory. It is a standalone version that uses the `browser.*` namespace and the Mozilla polyfill.

### Relationship with Root `src`
- **Source of Truth**: The root `src/` directory is the primary development area.
- **Syncing Changes**: When a feature is completed in root `src/`, copy the files to `firefox/src/`.
- **Conversion**: Any file moved to `firefox/src/` must have `chrome.` replaced with `browser.`.

### Firefox-Specific Files
- `firefox/manifest.json`: Contains Gecko-specific settings and ID.
- `firefox/src/lib/browser-polyfill.js`: Must be present for API compatibility.

### Updating the Port
To quickly update the Firefox port after making changes to the main `src/`:

```bash
# From the project root
cp -r src/* firefox/src/
find firefox/src -name "*.js" -exec sed -i 's/chrome\./browser\./g' {} +
```
*Note: After running this, ensure your HTML files in `firefox/src/` still correctly include the `<script src="../lib/browser-polyfill.js"></script>` tag.*

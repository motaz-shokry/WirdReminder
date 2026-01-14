# Refactoring Opportunities

This document identifies areas of the codebase that could benefit from refactoring to improve maintainability, performance, and code quality.

---

## 🔴 High Priority

### 1. Split `popup.js` Into Modules

**Current State**: `popup.js` is ~1000 lines handling tabs, forms, modals, calendar, storage, alarms, and API calls all in one file.

**Problem**: This monolithic structure makes the code hard to navigate, test, and maintain.

**Suggested Structure**:
```
src/popup/
├── popup.js           # Entry point, initialization
├── modules/
│   ├── tabs.js        # Tab navigation logic
│   ├── reminders.js   # CRUD operations for reminders
│   ├── calendar.js    # Calendar modal rendering
│   ├── forms.js       # Form handling and validation
│   ├── modals.js      # Modal management (alert, delete, calendar)
│   └── storage.js     # Chrome storage abstraction
└── popup.html
```

**Benefits**:
- Easier to locate and modify specific features
- Enables unit testing of individual modules
- Reduces merge conflicts in team development

---

### 2. Create a Storage Abstraction Layer

**Current State**: Direct `chrome.storage.local.get/set` calls scattered throughout `popup.js`, `reader.js`, and `background.js`.

**Problem**: 
- Duplicate code for storage operations
- No central validation or error handling
- Hard to mock for testing

**Suggested Implementation**:
```javascript
// src/shared/storage.js
export const storage = {
  async getReminders() {
    const { user_reminders } = await chrome.storage.local.get('user_reminders');
    return user_reminders || [];
  },
  
  async saveReminders(reminders) {
    await chrome.storage.local.set({ user_reminders: reminders });
  },
  
  async addReminder(reminder) {
    const reminders = await this.getReminders();
    if (!reminders.find(r => r.id === reminder.id)) {
      reminders.push(reminder);
      await this.saveReminders(reminders);
    }
  },
  
  async getHistory() { /* ... */ },
  async getBookmarks() { /* ... */ },
  // etc.
};
```

---

### 3. Consolidate Duplicate Code in Reader and Popup

**Current State**: Both `popup.js` and `reader.js` contain nearly identical implementations of:
- `isReadInCurrentPeriod()` function (~50 lines each)
- `addReadMark()`/`removeReadMark()` and `logReadAction()`/`removeReadAction()`

**Problem**: Bug fixes or changes must be applied in multiple places.

**Solution**: Extract shared logic to a common module:
```
src/shared/
├── storage.js       # Storage operations
├── readStatus.js    # Read status calculations
└── utils.js         # Date/time utilities
```

---

## 🟡 Medium Priority

### 4. Extract Inline Styles to CSS

**Current State**: `popup.html` contains many inline styles:
```html
<div style="display: flex; gap: 0.75rem;" class="form-item">
<div style="flex: 1;">
<button style="display:none; margin-top:0.5rem;">
```

**Problem**: 
- Hard to maintain consistency
- Can't leverage CSS features like media queries
- Increases HTML file size

**Solution**: Move all styling to `components.css` with semantic class names:
```css
.form-row { display: flex; gap: 0.75rem; }
.form-col { flex: 1; }
.btn-hidden { display: none; }
```

---

### 5. Implement Event Delegation for Reminder Cards

**Current State**: Each reminder card attaches multiple event listeners individually:
```javascript
div.querySelector('.read-btn').addEventListener('click', () => {...});
div.querySelector('.edit-btn').addEventListener('click', () => {...});
div.querySelector('.delete-btn').addEventListener('click', () => {...});
```

**Problem**: Many listeners on dynamic content can impact performance with large lists.

**Solution**: Use event delegation on the container:
```javascript
document.getElementById('my-reminders-list').addEventListener('click', (e) => {
  const card = e.target.closest('.reminder-card');
  if (!card) return;
  
  const id = card.dataset.reminderId;
  
  if (e.target.matches('.read-btn')) { /* ... */ }
  if (e.target.matches('.edit-btn')) { /* ... */ }
  if (e.target.matches('.delete-btn')) { /* ... */ }
});
```

---

### 6. Add TypeScript Support

**Current State**: Pure JavaScript with JSDoc comments for type hints.

**Problem**:
- No compile-time type checking
- IDE support is limited
- Refactoring is riskier without type safety

**Suggested Approach**:
1. Add `tsconfig.json` with `allowJs: true`
2. Gradually convert files starting with `shared/` modules
3. Use strict mode for new code

---

### 7. Move Reader Styles to External CSS

**Current State**: `reader.html` has ~200 lines of embedded `<style>` content.

**Problem**:
- Can't share styles with other views
- Harder to maintain color consistency
- Larger HTML file

**Solution**: Create `src/reader/reader.css` and import it.

---

## 🟢 Low Priority (Nice to Have)

### 8. Implement State Management Pattern

**Current State**: UI state is implicitly managed through DOM queries and storage reads.

**Potential Pattern**: Implement a simple observable state:
```javascript
const state = createState({
  reminders: [],
  activeTab: 'reminders-tab',
  editingId: null
});

state.subscribe('reminders', (newValue) => {
  renderActiveList(newValue);
});
```

---

### 9. Add Build System for CSS

**Current State**: Plain CSS files without processing.

**Potential Improvements**:
- CSS minification for production
- Autoprefixer for browser compatibility
- CSS nesting via PostCSS

---

### 10. Lazy Load Reader Modules

**Current State**: All reader modules are loaded immediately via ES imports.

**Optimization**: Dynamic imports for parser and renderer:
```javascript
async function renderSurah(surahId, container) {
  const { parseVersesToPages } = await import('./parser.js');
  const { renderPages } = await import('./renderer.js');
  // ...
}
```

---

### 11. Add Loading States and Error Boundaries

**Current State**: Loading indicators are minimal; errors show basic text.

**Improvements**:
- Skeleton loaders during API fetch
- Retry buttons on failures
- Graceful degradation for cached content

---

### 12. Centralize Icon/Asset Management

**Current State**: Icons are referenced with full paths in multiple places.

**Solution**: Create an icon constants file:
```javascript
// src/shared/icons.js
export const ICONS = {
  edit: '<svg>...</svg>',
  delete: '<svg>...</svg>',
  calendar: '<svg>...</svg>'
};
```

---

## Refactoring Priority Matrix

| Refactor | Impact | Effort | Priority |
|----------|--------|--------|----------|
| Split popup.js | High | High | 🔴 Do First |
| Storage abstraction | High | Medium | 🔴 Do First |
| Remove duplicate code | High | Low | 🔴 Do First |
| Extract inline styles | Medium | Low | 🟡 Soon |
| Event delegation | Medium | Medium | 🟡 Soon |
| TypeScript | Medium | High | 🟡 When Time Allows |
| Reader CSS extraction | Low | Low | 🟢 Nice to Have |
| State management | Medium | High | 🟢 Future |
| Build system | Low | Medium | 🟢 Future |
| Lazy loading | Low | Low | 🟢 Future |

---

## Implementation Notes

When refactoring:

1. **Test thoroughly** after each change - the extension has no automated tests
2. **Keep backwards compatibility** with existing storage schema
3. **Use ES Modules** - the manifest already supports `type: "module"`
4. **Update documentation** as architecture changes
5. **Consider creating a `CHANGELOG.md`** to track significant changes

# Future Roadmap

This document outlines potential features, improvements, and long-term goals for the Wird Reminder extension.

---

## 🚀 Version 1.1 - Quality of Life Improvements

**Target**: Next minor release

### Completed Features ✅
- [x] Frequency-based read status reset
- [x] Calendar view for completion tracking
- [x] Bookmark/last-read position
- [x] Export/Import data functionality
- [x] Ayah range validation
- [x] Custom modal system (replaced browser alerts)
- [x] Modular background script

### Planned Features

#### 1. Streak Tracking
**Description**: Track consecutive days/weeks of completing a wird.

**Implementation**:
- Add `streaks` object to storage schema
- Calculate current streak from `read_history`
- Display streak badge on reminder cards
- Optional streak reminders ("Don't break your 7-day streak!")

**UI Mockup**:
```
┌─────────────────────────────────────┐
│ 🔥 7 يوم متتالي                      │
│ سورة الكهف                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
└─────────────────────────────────────┘
```

---

#### 2. Reading Statistics Dashboard

**Description**: Visual overview of reading habits and progress.

**Features**:
- Total pages read this week/month
- Most completed reminders
- Reading time distribution (heat map)
- Progress towards goals

**Implementation**:
- Add new "الإحصائيات" tab
- Aggregate data from `read_history`
- Use simple bar/pie charts (pure SVG or lightweight library)

---

#### 3. Widget/New Tab Integration

**Description**: Display daily wird on new tab page or as a Chrome widget.

**Options**:
- Override new tab with Today's Wird view
- Show "Wird of the Day" as a collapsible sidebar
- Quick-access bookmark to current reading position

---

## 🎯 Version 1.2 - Enhanced Reading Experience

### 1. Audio Recitation Support

**Description**: Stream Quranic audio alongside the text.

**API**: Quran.com provides audio URLs per verse:
```
https://audio.qurancdn.com/Mishary_Alafasy/mp3/001001.mp3
```

**Features**:
- Play/pause button in reader
- Auto-scroll to current verse
- Choice of reciters
- Background playback

**Technical Considerations**:
- Service worker can't play audio directly
- May need offscreen document for background playback
- Consider audio caching for offline use

---

### 2. Translation Display

**Description**: Show verse translations alongside Arabic text.

**API**: Quran.com `/translations` endpoint

**Options**:
- Toggle translation visibility
- Multiple translation choices
- Side-by-side or inline display

---

### 3. Tafsir Integration

**Description**: Tap a verse to see its interpretation.

**API**: Quran.com `/tafsirs` endpoint

**UI**: Modal or expandable section below the verse

---

### 4. Dark Mode

**Description**: Reader and popup dark theme.

**Implementation**:
- CSS variables already use HSL - easy to switch
- Respect system preference (`prefers-color-scheme`)
- Manual toggle in settings

**Color Palette (Dark)**:
```css
--background: 222 84% 4.9%;
--foreground: 210 40% 98%;
--card: 217 32% 17%;
```

---

## 🌐 Version 1.3 - Social & Cloud Features

### 1. Cloud Sync (Firebase/Supabase)

**Description**: Sync reminders and history across devices.

**Requirements**:
- User authentication (Google Sign-In)
- Secure cloud storage
- Conflict resolution strategy

**Privacy Considerations**:
- Reading history is personal data
- Clear privacy policy required
- Opt-in only

---

### 2. Share Reminder Templates

**Description**: Export a single reminder as a shareable link or QR code.

**Format**: Encoded URL with reminder configuration
```
werd://kahf?surah=18&freq=weekly&day=5&time=10:00
```

---

### 3. Family/Group Challenges

**Description**: Create shared goals with friends or family.

**Features**:
- Create a group
- Set collective reading goals
- See group members' progress (opt-in)
- Leaderboard for gamification

---

## 📱 Version 2.0 - Multi-Platform

### 1. Firefox Extension

**Description**: Port to Firefox using WebExtensions API.

**Compatibility Notes**:
- Manifest V2 may still be preferred on Firefox
- Most Chrome APIs have Firefox equivalents
- Test notification behavior

---

### 2. Mobile Companion App

**Description**: React Native or Flutter app syncing with extension.

**Features**:
- All extension features on mobile
- Push notifications via Firebase
- Offline Quran text cache
- Apple Watch / Wear OS complications

---

### 3. Desktop Notification App

**Description**: Electron wrapper for macOS/Windows/Linux.

**Use Case**: Users who don't have Chrome open all day

---

## 💡 Feature Ideas (Backlog)

| Feature | Description | Complexity |
|---------|-------------|------------|
| Khatma Tracker | Progress through complete Quran | Medium |
| Adhkar Integration | Morning/evening adhkar reminders | Medium |
| Tajweed Highlighting | Color-code tajweed rules in reader | High |
| Memorization Mode | Hide words for hifdh practice | Medium |
| Smart Scheduling | Suggest optimal times based on habits | High |
| Voice Commands | "Hey Google, open my wird" | Low |
| Prayer Time Integration | Sync with local prayer times | Medium |
| Offline Mode | Cache Quran text locally | Medium |
| Multiple Profiles | Separate wirds for family members | Medium |
| Accessibility | Screen reader support, high contrast | Medium |

---

## Technical Debt to Address

Before major features:

1. **Testing Infrastructure**
   - Add Jest or Vitest for unit tests
   - Playwright for E2E testing
   - CI pipeline for automated testing

2. **Performance Monitoring**
   - Track popup load time
   - Monitor storage usage
   - Alert on API failures

3. **Error Tracking**
   - Integrate Sentry or similar
   - Report anonymous crash data

4. **Documentation**
   - API documentation with examples
   - User guide with screenshots
   - Video tutorials

---

## Release Process

### Version Numbering

`MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes or complete rewrites
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes only

### Pre-Release Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in `manifest.json` and `package.json`
- [ ] Tested on Chrome stable, Beta, and Canary
- [ ] Screenshots updated for store listing

---

## Community Involvement

### How Users Can Contribute

1. **Report Bugs**: GitHub Issues with reproduction steps
2. **Suggest Features**: Open discussion threads
3. **Translate**: Help with non-Arabic/English locales
4. **Test**: Join beta testing program
5. **Spread the Word**: Share with friends and family

### Contributor Recognition

- Contributors listed in README
- Special mention in release notes
- Contributor badge in community

---

## Long-Term Vision

> *"To become the most beloved Quranic companion for Muslims worldwide, helping them build consistent and meaningful relationships with the Quran through intelligent reminders, beautiful reading experiences, and community support."*

### Success Metrics

- 10,000+ active users
- 4.5+ star rating on Chrome Web Store
- <5% churn rate on weekly active users
- 70%+ reminder completion rate
- Community contributions from 20+ countries

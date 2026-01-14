# API Reference & Storage Schema

This document details the external APIs used by the extension and the structure of all data stored in `chrome.storage.local`.

---

## External APIs

### Quran.com API (v4)

The extension uses the public [Quran.com API](https://api.quran.com/api/v4) for all Quranic text data. No authentication is required.

#### Base URL
```
https://api.quran.com/api/v4
```

#### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chapters` | GET | List all 114 surahs with metadata |
| `/verses/by_chapter/{id}` | GET | Fetch verses for a complete surah |
| `/verses/by_juz/{id}` | GET | Fetch verses for a specific juz |

---

### List Surahs

**Endpoint**: `GET /chapters`

**Purpose**: Fetch all 114 chapters with Arabic names and verse counts.

**Used In**:
- `background.js` → Cache surah metadata on install
- `popup.js` → Populate surah dropdown in add form
- `api.js` → Fallback for surah name lookup

**Response Structure**:
```json
{
  "chapters": [
    {
      "id": 1,
      "name_arabic": "الفاتحة",
      "verses_count": 7,
      "revelation_place": "makkah"
    }
  ]
}
```

---

### Fetch Verses by Chapter

**Endpoint**: `GET /verses/by_chapter/{chapter_id}`

**Parameters**:

| Parameter | Value | Description |
|-----------|-------|-------------|
| `words` | `true` | Include word-level data |
| `word_fields` | `text_qpc_hafs,text_uthmani,line_number,page_number` | Specific word fields to fetch |
| `per_page` | `1000` | Fetch all verses in one request |

**Used In**: `api.js` → `fetchSurahVerses()`, `fetchAyahRange()`

**Example Request**:
```
GET /verses/by_chapter/18?words=true&word_fields=text_qpc_hafs,text_uthmani,line_number,page_number&per_page=1000
```

**Response Structure**:
```json
{
  "verses": [
    {
      "verse_key": "18:1",
      "page_number": 293,
      "words": [
        {
          "text_qpc_hafs": "ٱلْحَمْدُ",
          "text_uthmani": "الْحَمْدُ",
          "line_number": 1,
          "page_number": 293,
          "char_type_name": "word",
          "position": 1
        }
      ]
    }
  ]
}
```

---

### Fetch Verses by Juz

**Endpoint**: `GET /verses/by_juz/{juz_id}`

**Parameters**: Same as chapter endpoint

**Used In**: `api.js` → `fetchJuzVerses()`

**Example Request**:
```
GET /verses/by_juz/15?words=true&word_fields=text_qpc_hafs,text_uthmani,line_number,page_number&per_page=1000
```

---

## Chrome APIs Used

| API | Permission | Purpose |
|-----|------------|---------|
| `chrome.alarms` | `alarms` | Schedule reminder notifications |
| `chrome.storage.local` | `storage` | Persist user data locally |
| `chrome.notifications` | `notifications` | Display system notifications |
| `chrome.runtime` | (default) | Extension lifecycle events |
| `chrome.tabs` | (default) | Open reader in new tab |

---

## Storage Schema (`chrome.storage.local`)

### Overview

```
chrome.storage.local
├── user_reminders      # Array of active reminders
├── read_history        # Array of read action logs
├── bookmarks           # Object mapping reminder IDs to bookmark data
└── surah_metadata      # Object mapping surah IDs to Arabic names
```

---

### `user_reminders` (Array)

Stores all active reminders, including both custom user-created reminders and enabled preset reminders.

**Structure**:
```typescript
interface Reminder {
  id: string;              // Unique ID (e.g., "custom_1703920000000" or "kahf_friday")
  name: string;            // Arabic display name
  description?: string;    // Optional description (for presets)
  type: "surah" | "ayah_range" | "juz";
  target: Target;
  timing: Timing;
  enabled: boolean;
}

interface Target {
  surahId?: number;        // 1-114 for surah or ayah_range
  juzId?: number;          // 1-30 for juz type
  startAyah?: number;      // For ayah_range type
  endAyah?: number;        // For ayah_range type
}

interface Timing {
  frequency: "daily" | "weekly";
  time: string;            // "HH:MM" format (e.g., "05:00")
  day?: number;            // 0-6 (Sunday-Saturday) for weekly
}
```

**Example**:
```json
[
  {
    "id": "custom_1703920000000",
    "name": "ورد الفجر",
    "type": "surah",
    "target": { "surahId": 18 },
    "timing": {
      "frequency": "daily",
      "time": "05:00"
    },
    "enabled": true
  },
  {
    "id": "kahf_friday",
    "name": "سورة الكهف",
    "description": "قراءة سورة الكهف كل يوم جمعة",
    "type": "surah",
    "target": { "surahId": 18 },
    "timing": {
      "frequency": "weekly",
      "day": 5,
      "time": "10:00"
    },
    "enabled": true
  },
  {
    "id": "custom_1703925000000",
    "name": "آية الكرسي",
    "type": "ayah_range",
    "target": {
      "surahId": 2,
      "startAyah": 255,
      "endAyah": 257
    },
    "timing": {
      "frequency": "daily",
      "time": "22:00"
    },
    "enabled": true
  }
]
```

---

### `read_history` (Array)

A chronological log of every read action. Limited to the most recent 1000 entries to prevent storage bloat.

**Structure**:
```typescript
interface ReadEntry {
  reminderId: string;     // Links to reminder
  reminderName: string;   // Snapshot of name at read time
  timestamp: number;      // Unix timestamp in milliseconds
}
```

**Example**:
```json
[
  {
    "reminderId": "custom_1703920000000",
    "reminderName": "ورد الفجر",
    "timestamp": 1703930000000
  },
  {
    "reminderId": "kahf_friday",
    "reminderName": "سورة الكهف",
    "timestamp": 1703935000000
  }
]
```

**Usage**:
- Calendar view shows completion history
- Read status checkbox uses frequency-based reset logic
- Read marks can be toggled on/off

---

### `bookmarks` (Object)

Stores the last-read position for each reminder. Keyed by reminder ID.

**Structure**:
```typescript
interface Bookmarks {
  [reminderId: string]: {
    verseKey: string;       // e.g., "18:10"
    wordPosition: string;   // Position within the verse
    timestamp: number;      // When bookmark was created
  }
}
```

**Example**:
```json
{
  "custom_1703920000000": {
    "verseKey": "18:10",
    "wordPosition": "3",
    "timestamp": 1703940000000
  },
  "kahf_friday": {
    "verseKey": "18:45",
    "wordPosition": "1",
    "timestamp": 1703945000000
  }
}
```

**Behavior**:
- Click any word in the reader to set a bookmark
- Click a bookmarked word again to remove the bookmark
- Bookmarked words are highlighted and auto-scrolled on page load

---

### `surah_metadata` (Object)

A cached mapping of Surah IDs to their Arabic names. Populated on extension install to reduce API calls.

**Structure**:
```typescript
interface SurahMetadata {
  [surahId: string]: string;  // Arabic name
}
```

**Example**:
```json
{
  "1": "الفاتحة",
  "2": "البقرة",
  "3": "آل عمران",
  "18": "الكهف",
  "67": "الملك",
  "114": "الناس"
}
```

**Initialization**: Fetched from `/chapters` endpoint during `chrome.runtime.onInstalled`.

**Fallback**: If cache miss occurs, `api.js` re-fetches and updates the cache.

---

## Presets Data (`src/data/presets.json`)

Static JSON file containing predefined Sunnah reminder templates.

**Structure**: Same as `Reminder` interface but with additional fields:

```typescript
interface Preset extends Reminder {
  defaultEnabled: boolean;  // Whether enabled by default (always false)
}
```

**Current Presets**:

| ID | Name | Type | Frequency |
|----|------|------|-----------|
| `kahf_friday` | سورة الكهف | surah | Weekly (Friday) |
| `mulk_night` | سورة الملك | surah | Daily (21:00) |
| `baqarah_ends` | خواتيم البقرة | ayah_range (285-286) | Daily (22:00) |

---

## Alarm Naming Convention

Alarms are named with a `reminder_` prefix followed by the reminder ID:

```
reminder_{reminderId}
```

**Examples**:
- `reminder_custom_1703920000000`
- `reminder_kahf_friday`

This naming allows the alarm listener to extract the reminder ID and look up the associated data.

---

## Export/Import Schema

The export functionality creates a JSON backup file with this structure:

```json
{
  "version": "1.0",
  "exportDate": "2024-12-31T15:00:00.000Z",
  "data": {
    "user_reminders": [...],
    "read_history": [...],
    "bookmarks": {...}
  }
}
```

**Note**: `surah_metadata` is not exported as it can be regenerated from the API.

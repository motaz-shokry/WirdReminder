# Wird Reminder - A Simple Explanation

*For those who just want to understand what this thing does!*

---

## What Is This?

**Wird Reminder** is a small program (called a "browser extension") that lives inside your Google Chrome browser. Its job is simple:

> **It reminds you to read your daily Quran portions and helps you track your progress.**

Think of it like a helpful friend who taps you on the shoulder and says "Hey, it's time to read Surah Al-Kahf!" every Friday at 10 AM.

---

## What Can It Do?

### 📋 Keep a List of Your Reading Goals

You tell it what you want to read:
- A complete **Surah** (like Al-Mulk every night)
- Specific **verses** (like the last two verses of Al-Baqarah)
- An entire **Juz** (like Juz Amma)

### ⏰ Remind You at the Right Time

Set it to remind you:
- **Daily** at a specific time (like Fajr time every day)
- **Weekly** on a specific day (like Friday morning)

When the time comes, you'll see a notification pop up on your computer.

### 📖 Read in a Beautiful Format

Click "Read Now" and the Quran text appears in a clean, mushaf-style layout - just like reading from a real Quran. The text is displayed in the traditional Uthmani script that Muslims are familiar with.

### ✅ Track What You've Read

Check off your readings when you finish. The app remembers:
- Which days you completed your wird
- Where you left off reading (like a bookmark)
- Your reading history in a calendar view

### 💾 Backup Your Data

If you get a new computer or want to share your setup with family, you can export all your reminders and import them elsewhere.

---

## How Does It Work?

Imagine the extension as a small office with different workers:

### The Receptionist (Popup)
When you click the extension icon, you see a small window. This is like the front desk where you can:
- See all your reminders
- Add new ones
- Change settings

### The Scheduler (Background Worker)
There's an invisible assistant working behind the scenes 24/7. It:
- Watches the clock
- Sends you notifications at the right times
- Doesn't need the browser window to be open

### The Reader (Reading View)
When you click "Read Now", a new page opens with the Quran text. It:
- Fetches the verses from the internet (from Quran.com)
- Displays them beautifully
- Remembers your bookmark

### The Memory (Storage)
All your reminders, reading history, and bookmarks are saved on your computer. They stay there even if you close Chrome.

---

## The Journey of a Reminder

Let's follow what happens when you create a reminder:

```
1. YOU: "Remind me to read Surah Al-Kahf every Friday at 10 AM"
   ↓
2. POPUP: Saves this to your computer's storage
   ↓
3. POPUP: Sets an alarm for Friday 10 AM
   ↓
   ... time passes ...
   ↓
4. ALARM: *rings* "It's Friday 10 AM!"
   ↓
5. BACKGROUND: Gets the reminder details
   ↓
6. BACKGROUND: Shows a notification on screen
   ↓
7. YOU: Click "Read Now" on the notification
   ↓
8. READER: Opens with Surah Al-Kahf
   ↓
9. READER: Gets verses from Quran.com
   ↓
10. READER: Displays beautiful Arabic text
   ↓
11. YOU: Read and click "Mark as Read"
   ↓
12. STORAGE: Records that you completed it today
```

---

## What Makes This Different?

Unlike phone apps that need internet constantly, this extension:

- **Works offline** (once the Quran text is loaded)
- **Runs quietly** in the background
- **Respects your privacy** (everything stays on your computer)
- **Is free** and doesn't show ads

---

## The Tech Stuff (Simplified)

For the curious (but non-technical) reader:

| Part | What It's Made Of |
|------|-------------------|
| The "brain" | JavaScript (a programming language) |
| The "looks" | HTML + CSS (web design languages) |
| The "memory" | Chrome's built-in storage |
| The "Quran text" | Comes from Quran.com's free service |

---

## Common Questions

### "Do I need to be connected to the internet?"
Yes, but only when you open the reader to load the Quran text. The reminders work offline.

### "Can I use this on my phone?"
Not yet - it only works in the Chrome browser on a computer. A mobile version might come in the future!

### "Is my reading history shared with anyone?"
No! Everything stays on your computer. We don't collect any data.

### "What if I lose my computer?"
Use the Export feature to save a backup file. You can then import it on a new computer.

### "Can I add my own reminders?"
Absolutely! You can add any Surah, any verse range, or any Juz with any schedule you like.

### "What are the 'Sunnah Reminders'?"
These are pre-made reminders based on what the Prophet ﷺ recommended, like:
- Reading Surah Al-Kahf on Friday
- Reading Surah Al-Mulk every night
- Reading the last two verses of Al-Baqarah before sleep

---

## A Final Word

This extension was built with love to help Muslims maintain a consistent, meaningful relationship with the Quran. Whether you're trying to build a new habit or maintain an existing one, we hope this small tool makes it a little easier.

بارك الله فيكم وجعلنا وإياكم من أهل القرآن 📖✨

---

*If you have any questions or suggestions, we'd love to hear from you!*

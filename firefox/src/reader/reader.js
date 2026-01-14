import { fetchSurahVerses, fetchAyahRange, fetchJuzVerses, getSurahName } from '../core/js/api.js';
import { parseVersesToPages } from '../core/js/parser.js';
import { renderPages, showError } from '../core/js/renderer.js';
import { storage } from '../core/js/adapter/storage.js';
import * as reminderLogic from '../core/js/logic/reminders.js';

let currentReminderId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    currentReminderId = params.get('reminderId');
    const container = document.getElementById('content-area');

    if (!currentReminderId) {
        showError('لم يتم تحديد الورد', container);
        return;
    }

    await loadReminderContent(currentReminderId, container);
});

/**
 * Loads and renders reminder content based on type
 * @param {string} id - Reminder ID
 * @param {HTMLElement} container - Container element
 */
async function loadReminderContent(id, container) {
    try {
        const reminder = await findReminder(id);

        if (!reminder) {
            showError('لم يتم العثور على الورد', container);
            return;
        }

        await renderByType(reminder, container);

        // Only show mark read buttons if the reminder has notifications enabled
        if (reminder.enabled !== false && reminder.timing) {
            await renderMarkReadButtons(container, reminder);
        }

        setupBookmarkHandlers(container);
        await restoreBookmark(container);
        // Note: logReadAction is now triggered manually via button

    } catch (e) {
        console.error(e);
        showError('حدث خطأ أثناء تحميل المحتوى', container);
    }
}

async function findReminder(id) {
    const user_reminders = await storage.get('user_reminders');
    const url = browser.runtime.getURL('src/core/data/presets.json');
    const presetsRes = await fetch(url);
    const presets = await presetsRes.json();

    let reminder = user_reminders?.find(r => r.id === id);
    if (!reminder) {
        reminder = presets.find(r => r.id === id);
    }

    return reminder || null;
}

/**
 * Routes to appropriate render function based on reminder type
 * @param {Object} reminder - Reminder object
 * @param {HTMLElement} container - Container element
 */
async function renderByType(reminder, container) {
    const { type, target } = reminder;

    switch (type) {
        case 'surah':
            await renderSurah(target.surahId, container);
            break;
        case 'ayah_range':
            await renderAyahRange(target.surahId, target.startAyah, target.endAyah, container);
            break;
        case 'juz':
            await renderJuz(target.juzId, container);
            break;
        default:
            showError('نوع الورد غير مدعوم', container);
    }
}

/**
 * Fetch, parse, and render a complete surah
 */
async function renderSurah(surahId, container) {
    const verses = await fetchSurahVerses(surahId);
    const pages = parseVersesToPages(verses);
    const surahName = await getSurahName(surahId);
    renderPages(pages, surahName, container);
}

/**
 * Fetch, parse, and render an ayah range
 */
async function renderAyahRange(surahId, start, end, container) {
    const verses = await fetchAyahRange(surahId, start, end);
    const pages = parseVersesToPages(verses);
    const surahName = await getSurahName(surahId);
    renderPages(pages, `${surahName} (${start}-${end})`, container);
}

/**
 * Fetch, parse, and render a juz
 */
async function renderJuz(juzId, container) {
    const verses = await fetchJuzVerses(juzId);
    const pages = parseVersesToPages(verses);
    renderPages(pages, `الجزء ${juzId}`, container);
}

async function logReadAction(reminderId, reminderName) {
    await reminderLogic.addReadMark(reminderId, reminderName);
}

async function removeReadAction(reminderId) {
    await reminderLogic.removeReadMark(reminderId);
}

async function isReadInCurrentPeriod(reminder) {
    const history = await storage.get('read_history') || [];
    const attempts = history.filter(h => h.reminderId === reminder.id);
    if (attempts.length === 0) return false;
    const lastReadTs = attempts[attempts.length - 1].timestamp;
    return reminderLogic.isReadInCurrentPeriod(reminder, lastReadTs);
}

/**
 * Creates and renders mark read/unread buttons at start and end of content
 * @param {HTMLElement} container - Container element
 * @param {Object} reminder - Full reminder object with timing info
 */
async function renderMarkReadButtons(container, reminder) {
    const isRead = await isReadInCurrentPeriod(reminder);
    const reminderId = reminder.id;
    const reminderName = reminder.name;

    const createButton = () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'mark-read-wrapper';

        const btn = document.createElement('button');
        btn.className = isRead ? 'mark-read-btn marked' : 'mark-read-btn';
        if (isRead) {
            btn.textContent = '✓ تمت القراءة';
            btn.classList.add('marked');
            const hint = document.createElement('span');
            hint.className = 'btn-hint';
            hint.textContent = ' (انقر لإلغاء)';
            btn.appendChild(hint);
        } else {
            btn.textContent = '☐ تحديد كمقروء';
            btn.classList.remove('marked');
        }

        btn.addEventListener('click', async () => {
            const currentlyRead = btn.classList.contains('marked');

            if (currentlyRead) {
                await removeReadAction(reminderId);
            } else {
                await logReadAction(reminderId, reminderName);
            }

            // Update all buttons on page
            updateAllMarkButtons(!currentlyRead);
        });

        wrapper.appendChild(btn);
        return wrapper;
    };

    const updateAllMarkButtons = (isNowRead) => {
        container.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.classList.toggle('marked', isNowRead);
            btn.classList.toggle('marked', isNowRead);
            if (isNowRead) {
                btn.textContent = '✓ تمت القراءة';
                const hint = document.createElement('span');
                hint.className = 'btn-hint';
                hint.textContent = ' (انقر لإلغاء)';
                btn.appendChild(hint);
            } else {
                btn.textContent = '☐ تحديد كمقروء';
            }
        });
    };

    // Insert button at the beginning (after title)
    const title = container.querySelector('h1');
    if (title) {
        title.after(createButton());
    }

    // Insert button at the end
    container.appendChild(createButton());
}

// ===============================
// Bookmark Management
// ===============================

/**
 * Sets up click handlers for all mushaf words to enable bookmarking
 * @param {HTMLElement} container - Container element
 */
function setupBookmarkHandlers(container) {
    const words = container.querySelectorAll('.mushaf-word');

    words.forEach(word => {
        word.addEventListener('click', async () => {
            const verseKey = word.dataset.verseKey;
            const wordPosition = word.dataset.wordPosition;

            // Check if this word is already bookmarked
            const isCurrentlyBookmarked = word.classList.contains('bookmarked');

            // Remove any existing bookmark
            container.querySelectorAll('.mushaf-word.bookmarked').forEach(el => {
                el.classList.remove('bookmarked');
            });

            if (isCurrentlyBookmarked) {
                // Toggle off - remove bookmark
                await removeBookmark();
            } else {
                // Toggle on - add bookmark
                word.classList.add('bookmarked');
                await saveBookmark(verseKey, wordPosition);
            }
        });
    });
}

async function saveBookmark(verseKey, wordPosition) {
    const bookmarks = await storage.get('bookmarks') || {};
    bookmarks[currentReminderId] = { verseKey, wordPosition, timestamp: Date.now() };
    await storage.set({ bookmarks });
}

async function removeBookmark() {
    const bookmarks = await storage.get('bookmarks') || {};
    delete bookmarks[currentReminderId];
    await storage.set({ bookmarks });
}

async function restoreBookmark(container) {
    const bookmarks = await storage.get('bookmarks') || {};
    const bookmark = bookmarks[currentReminderId];
    if (!bookmark) return;

    const { verseKey, wordPosition } = bookmark;

    // Find the bookmarked word
    const word = container.querySelector(
        `.mushaf-word[data-verse-key="${verseKey}"][data-word-position="${wordPosition}"]`
    );

    if (word) {
        word.classList.add('bookmarked');

        // Scroll to the bookmarked word after a brief delay for DOM stability
        setTimeout(() => {
            word.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}


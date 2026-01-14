import { showNotification } from './notifications.js';
import { storage } from '../core/js/adapter/storage.js';
import { fetchAllSurahs } from '../core/js/api.js';

// --- Initialization ---

chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed. Initializing...');

    // Initialize storage if empty
    const user_reminders = await storage.get('user_reminders');
    if (!user_reminders) {
        await storage.set({ user_reminders: [] });
    }

    // Fetch and store Surah metadata using core API
    await fetchAllSurahs();
});

// fetchAndStoreSurahMetadata removed, handled by fetchAllSurahs()

// --- Alarm Listener ---

chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log('Alarm fired:', alarm.name);

    if (alarm.name.startsWith('reminder_')) {
        const reminderId = alarm.name.replace('reminder_', '');
        await showNotification(reminderId, alarm.name);
    }
});

// --- Notification Click Listener ---

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
    if (buttonIndex === 0) { // 'Read Now' clicked
        if (notificationId.startsWith('reminder_')) {
            const reminderId = notificationId.replace('reminder_', '');

            // Open Reader in new tab
            const url = chrome.runtime.getURL(`src/reader/reader.html?reminderId=${reminderId}`);
            chrome.tabs.create({ url });
        }
    }
});

/**
 * reminders.js - Core Logic for Reminder Management
 * Handles CRUD operations, status checking, and timing calculations.
 */

import { storage } from '../adapter/storage.js';
import { notificationManager } from '../adapter/notifications.js';

/**
 * Checks if a reminder was read in the current period based on frequency
 * @param {Object} reminder - Reminder with timing info
 * @param {Number} lastReadTs - Last read timestamp
 * @returns {Boolean} True if read in current period
 */
export function isReadInCurrentPeriod(reminder, lastReadTs) {
    if (!lastReadTs || !reminder.timing) return false;

    const now = new Date();
    const lastRead = new Date(lastReadTs);
    const freq = reminder.timing.frequency;
    const [hours, minutes] = (reminder.timing.time || '00:00').split(':').map(Number);

    if (freq === 'daily') {
        const resetTime = new Date(now);
        resetTime.setHours(hours, minutes, 0, 0);
        if (now < resetTime) {
            resetTime.setDate(resetTime.getDate() - 1);
        }
        return lastRead >= resetTime;
    } else if (freq === 'weekly') {
        const scheduledDay = reminder.timing.day ?? 5; // default Friday
        const resetTime = new Date(now);
        resetTime.setHours(hours, minutes, 0, 0);

        const currentDay = now.getDay();
        let daysDiff = currentDay - scheduledDay;
        if (daysDiff < 0) daysDiff += 7;

        if (daysDiff === 0 && now < resetTime) {
            daysDiff = 7;
        }
        resetTime.setDate(resetTime.getDate() - daysDiff);
        return lastRead >= resetTime;
    }

    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return lastRead >= oneDayAgo;
}

/**
 * Returns localized label for frequency
 * @param {Object} timing 
 * @returns {string}
 */
export function getFrequencyLabel(timing) {
    if (!timing) return 'مسبق الضبط';
    if (timing.frequency === 'daily') return 'يومياً';
    if (timing.frequency === 'weekly') {
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return `أسبوعياً (${days[timing.day]})`;
    }
    return '';
}

/**
 * Adds a new reminder or enables a preset
 * @param {Object} reminder 
 */
export async function addReminder(reminder) {
    const list = await storage.get('user_reminders') || [];
    if (!list.find(r => r.id === reminder.id)) {
        list.push({ ...reminder, enabled: true });
        await storage.set({ user_reminders: list });
        await notificationManager.schedule(reminder);
        return true;
    }
    return false;
}

/**
 * Updates an existing reminder
 * @param {string|number} id 
 * @param {Object} data 
 */
export async function updateReminder(id, data) {
    const list = await storage.get('user_reminders') || [];
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
        list[index] = { ...list[index], ...data };
        await storage.set({ user_reminders: list });
        const updated = list[index];
        if (updated.enabled !== false) {
            await notificationManager.schedule(updated);
        } else {
            await notificationManager.cancel(id);
        }
        return true;
    }
    return false;
}

/**
 * Removes a reminder from the list
 * @param {string|number} id 
 */
export async function removeReminder(id) {
    const list = await storage.get('user_reminders') || [];
    const newList = list.filter(r => r.id !== id);
    await storage.set({ user_reminders: newList });
    await notificationManager.cancel(id);
    return true;
}

/**
 * Toggles the enabled state of a reminder
 * @param {string|number} id 
 * @param {boolean} enabled 
 */
export async function toggleReminder(id, enabled) {
    const list = await storage.get('user_reminders') || [];
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
        list[index].enabled = enabled;
        await storage.set({ user_reminders: list });
        if (enabled) {
            await notificationManager.schedule(list[index]);
        } else {
            await notificationManager.cancel(id);
        }
        return true;
    }
    return false;
}

/**
 * Marks a reminder as read
 * @param {string|number} reminderId 
 * @param {string} reminderName 
 */
export async function addReadMark(reminderId, reminderName) {
    const history = await storage.get('read_history') || [];
    history.push({ reminderId, reminderName, timestamp: Date.now() });
    await storage.set({ read_history: history.slice(-1000) });
}

/**
 * Removes the most recent read mark
 * @param {string|number} reminderId 
 */
export async function removeReadMark(reminderId) {
    const history = await storage.get('read_history') || [];
    const lastIndex = history.map(h => h.reminderId).lastIndexOf(reminderId);
    if (lastIndex !== -1) {
        history.splice(lastIndex, 1);
        await storage.set({ read_history: history });
    }
}

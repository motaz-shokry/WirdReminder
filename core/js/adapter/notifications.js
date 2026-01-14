/**
 * notifications.js - Unified Notification & Alarm Adapter
 * Abstracts background scheduling across platforms.
 */

import { env } from './env.js';

let webAlarms = [];
let webAlarmsInterval = null;

export const notificationManager = {
    /**
     * Schedules a background alarm for a reminder.
     * @param {Object} reminder - Reminder object with timing info.
     */
    async schedule(reminder) {
        if (!reminder.timing || reminder.enabled === false) return;

        const nextTime = this.calculateNextTime(reminder);
        const period = reminder.timing.frequency === 'daily' ? 1440 : 10080;
        const alarmName = `reminder_${reminder.id}`;

        if (env.isMobile) {
            // Mobile: Use Capacitor Local Notifications
            const { LocalNotifications } = window.Capacitor.Plugins;
            try {
                await LocalNotifications.requestPermissions();

                // Convert ID to number (Capacitor requires numeric IDs)
                const numericId = typeof reminder.id === 'number' ? reminder.id : Math.floor(Math.random() * 1000000);

                await LocalNotifications.schedule({
                    notifications: [{
                        id: numericId,
                        title: "مُذكِّر الوِرد اليومي",
                        body: `حان وقت قراءة: ${reminder.name}`,
                        schedule: {
                            at: new Date(nextTime),
                            repeats: true,
                            every: reminder.timing.frequency === 'daily' ? 'day' : 'week'
                        },
                        sound: 'default',
                        actionTypeId: 'OPEN_APP',
                        extra: { reminderId: reminder.id }
                    }]
                });
                console.log(`[NotificationAdapter] Scheduled mobile notification: ${reminder.name} at ${new Date(nextTime)}`);
            } catch (e) {
                console.error('[NotificationAdapter] Mobile notification failed:', e);
            }
        } else if (env.isExtension) {
            // Extension: Use chrome.alarms (Works in Chrome & Firefox)
            const api = typeof browser !== 'undefined' ? browser : chrome;
            await api.alarms.create(alarmName, {
                when: nextTime,
                periodInMinutes: period
            });
            console.log(`[NotificationAdapter] Scheduled extension alarm: ${alarmName} at ${new Date(nextTime)}`);
        } else if (env.isWeb) {
            // Web: Local queue for active sessions
            this.webCancel(reminder.id);
            webAlarms.push({
                id: reminder.id,
                name: reminder.name,
                nextTime: nextTime,
                period: period
            });
            this.startWebCheck();
            console.log(`[NotificationAdapter] Scheduled web alarm: ${reminder.name} at ${new Date(nextTime)}`);
        }
    },

    /**
     * Cancels a scheduled alarm.
     * @param {string|number} id - Reminder ID.
     */
    async cancel(id) {
        const alarmName = `reminder_${id}`;
        if (env.isMobile) {
            const { LocalNotifications } = window.Capacitor.Plugins;
            const numericId = typeof id === 'number' ? id : null;
            if (numericId) {
                await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
            }
            console.log(`[NotificationAdapter] Cancelled mobile notification: ${id}`);
        } else if (env.isExtension) {
            const api = typeof browser !== 'undefined' ? browser : chrome;
            await api.alarms.clear(alarmName);
            console.log(`[NotificationAdapter] Cancelled extension alarm: ${alarmName}`);
        } else if (env.isWeb) {
            this.webCancel(id);
        }
    },

    webCancel(id) {
        webAlarms = webAlarms.filter(a => a.id !== id);
    },

    startWebCheck() {
        if (webAlarmsInterval) return;
        webAlarmsInterval = setInterval(() => {
            const now = Date.now();
            webAlarms.forEach(alarm => {
                if (now >= alarm.nextTime) {
                    this.triggerWebNotification(alarm);
                    // Reschedule for next period
                    alarm.nextTime += alarm.period * 60 * 1000;
                }
            });
        }, 30000); // Check every 30 seconds
    },

    triggerWebNotification(alarm) {
        if (!("Notification" in window)) {
            alert(`حان وقت وردك: ${alarm.name}`);
            return;
        }

        if (Notification.permission === "granted") {
            new Notification("مُذكِّر الوِرد اليومي", {
                body: `حان وقت قراءة: ${alarm.name}`,
                icon: 'core/assets/icons/icon128.png'
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.triggerWebNotification(alarm);
                }
            });
        }
    },

    /**
     * Calculates the next occurrence timestamp for a reminder.
     * @param {Object} reminder 
     * @returns {number} Timestamp in ms
     */
    calculateNextTime(reminder) {
        if (!reminder.timing.time) return Date.now();

        const [hours, minutes] = reminder.timing.time.split(':').map(Number);
        let next = new Date();
        next.setHours(hours, minutes, 0, 0);

        if (next < Date.now()) {
            next.setDate(next.getDate() + 1);
        }

        if (reminder.timing.frequency === 'weekly' && reminder.timing.day !== undefined) {
            let diff = (reminder.timing.day - next.getDay() + 7) % 7;
            if (diff === 0 && next < Date.now()) diff = 7;
            next.setDate(next.getDate() + diff);
        }

        return next.getTime();
    }
};

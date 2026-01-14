# Phase 2: Unified Notifications & Alarms

Scheduling "Wird" reminders is the marquee feature. Each platform handles background scheduling differently.

## 1. The Strategy: Delegated Scheduling

Instead of the UI trying to schedule an alarm, it calls the `NotificationAdapter`. This adapter delegates the work to the platform-specific "Worker".

### The Contract (`core/js/notifications.js`)
```javascript
export const notificationManager = {
    async schedule(reminder) {
        if (env.isExtension) {
            // Extension: Use chrome.alarms (Reliable when browser is open)
            return chrome.alarms.create(`reminder_${reminder.id}`, {
                when: calculateNextTime(reminder),
                periodInMinutes: getPeriod(reminder)
            });
        } else if (env.isMobile) {
            // Android: Use Capacitor Local Notifications (Reliable background)
            return LocalNotifications.schedule({
                notifications: [{
                    id: reminder.id,
                    title: reminder.name,
                    schedule: { at: new Date(calculateNextTime(reminder)) }
                }]
            });
        } else {
            // Web: Use a Service Worker + Client Alarms
            // Note: Web is the most restricted for persistent background alarms
            saveToLocalQueue(reminder);
        }
    }
};
```

## 2. Platform-Specific Background Workers

### A. Extensions: The Service Worker (`background.js`)
*   **Listener**: `chrome.alarms.onAlarm`.
*   **Action**: `chrome.notifications.create`.
*   **Behavior**: Runs even if the popup is closed. Stops if the browser is closed.
*   **Universal Link**: Clicking the notification calls `chrome.tabs.create` pointing to the shared `reader.html`.

### B. Mobile: Native scheduling
*   Handled by the OS. It is highly reliable.
*   Clicking the notification resumes the app and navigates to the reader state.

### C. Web/PWA: The Service Worker (`sw.js`)
*   **Challenge**: PWAs cannot strictly schedule code to run in the background (except for `periodicSync` which is not precise).
*   **Solution 1 (Ideal)**: Server-side push. (Requires a backend).
*   **Solution 2 (Local)**: When the user opens the PWA, it checks if any reminders were "missed" and shows a local notification immediately.
*   **Solution 3**: Use the `Notification` API if the tab is open in the background.

## 3. The "Reader" Hand-off

Regardless of the platform, the notification click should lead to the **Universal Reader**.
The reader should accept a `reminderId` parameter:
`reader.html?reminderId=123`

The reader logic will:
1.  Read `reminderId` from URL.
2.  Use the `StorageAdapter` to fetch the reminder details.
3.  Use the `API Client` to fetch the Quran text.
4.  Render the Mushaf view.

## 4. Feature Parity Matrix

| Feature | Extension | PWA | Android |
| :--- | :--- | :--- | :--- |
| **Scheduling** | Very High (`chrome.alarms`) | Medium (Tab must be open/active) | High (Native) |
| **Persistence** | Permanent | Permanent (unless cache cleared) | Permanent |
| **Notification Sound** | Default OS | Default OS | Custom capable |
| **Offline Action** | Supported | Supported (via SW Cache) | Supported |

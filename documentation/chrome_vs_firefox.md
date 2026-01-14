# الفروقات بين إضافة كروم وفايرفوكس

يوضح هذا الملف الفروقات الأساسية بين نسخة كروم ونسخة فايرفوكس من إضافة مُذكِّر الوِرد اليومي.

---

## 1. الفروقات في ملف `manifest.json`

### الخلفية (Background)

**كروم** يستخدم `service_worker`:
```json
"background": {
    "service_worker": "src/background/background.js",
    "type": "module"
}
```

**فايرفوكس** يستخدم `scripts` (مصفوفة):
```json
"background": {
    "scripts": [
        "src/lib/browser-polyfill.js",
        "src/background/background.js"
    ],
    "type": "module"
}
```

> [!IMPORTANT]
> فايرفوكس لا يدعم `service_worker` بشكل كامل، لذا نستخدم `scripts` بدلاً منه. كما نقوم بتحميل `browser-polyfill.js` أولاً لتوفير التوافق مع واجهة `browser.*`.

---

### إعدادات خاصة بالمتصفح

**فايرفوكس** يتطلب قسم `browser_specific_settings`:
```json
"browser_specific_settings": {
    "gecko": {
        "id": "wird-reminder@hadealahmad.com",
        "strict_min_version": "142.0",
        "data_collection_permissions": {
            "required": ["none"]
        }
    }
}
```

> [!NOTE]
> - `id`: معرف فريد للإضافة (مطلوب لفايرفوكس)
> - `strict_min_version`: أدنى إصدار مدعوم من فايرفوكس
> - `data_collection_permissions`: إعلان عدم جمع البيانات

**كروم** لا يحتاج هذا القسم.

---

## 2. الفروقات في الكود

### استبدال `chrome` بـ `browser`

**كروم** يستخدم كائن `chrome`:
```javascript
chrome.storage.local.get('user_reminders');
chrome.runtime.getURL('src/data/presets.json');
chrome.tabs.create({ url });
chrome.alarms.create('reminder_id', { when: time });
```

**فايرفوكس** يستخدم كائن `browser`:
```javascript
browser.storage.local.get('user_reminders');
browser.runtime.getURL('src/data/presets.json');
browser.tabs.create({ url });
browser.alarms.create('reminder_id', { when: time });
```

---

### الإشعارات (Notifications)

**كروم** يدعم الأزرار في الإشعارات:
```javascript
const notificationOptions = {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('src/assets/icons/icon128.png'),
    title: 'مُذكِّر الوِرد اليومي',
    message: 'حان وقت وردك اليومي!',
    priority: 2,
    requireInteraction: true,
    buttons: [{ title: 'اقرأ الآن' }]
};

// الاستماع لنقر الزر
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
    if (buttonIndex === 0) {
        // فتح القارئ
    }
});
```

**فايرفوكس** لا يدعم `buttons` و`requireInteraction`:
```javascript
const notificationOptions = {
    type: 'basic',
    iconUrl: browser.runtime.getURL('src/assets/icons/icon128.png'),
    title: 'مُذكِّر الوِرد اليومي',
    message: 'حان وقت وردك اليومي!'
};

// الاستماع لنقر الإشعار نفسه (وليس زر)
browser.notifications.onClicked.addListener(async (notificationId) => {
    // فتح القارئ
    browser.notifications.clear(notificationId);
});
```

> [!WARNING]
> فايرفوكس لا يدعم:
> - `buttons` في الإشعارات
> - `requireInteraction`
> - `onButtonClicked` (استخدم `onClicked` بدلاً منه)

---

### عدم استخدام `innerHTML` (فايرفوكس)

**كروم** يسمح باستخدام `innerHTML`:
```javascript
myRemindersList.innerHTML = `
    <div class="empty-state">
        <div class="empty-state-icon">📖</div>
        <p class="empty-state-text">لا توجد تذكيرات نشطة حالياً.</p>
    </div>`;
```

**فايرفوكس** يتطلب استخدام DOM APIs آمنة:
```javascript
const emptyDiv = document.createElement('div');
emptyDiv.className = 'empty-state';

const icon = document.createElement('div');
icon.className = 'empty-state-icon';
icon.textContent = '📖';

const text = document.createElement('p');
text.className = 'empty-state-text';
text.textContent = 'لا توجد تذكيرات نشطة حالياً.';

emptyDiv.appendChild(icon);
emptyDiv.appendChild(text);
myRemindersList.appendChild(emptyDiv);
```

> [!CAUTION]
> Mozilla يرفض الإضافات التي تستخدم `innerHTML` مع محتوى ديناميكي لأسباب أمنية. استخدم `textContent` و`appendChild` و`setAttribute` بدلاً من ذلك.

---

## 3. ملف `browser-polyfill.js`

يوجد في `firefox/src/lib/browser-polyfill.js` وهو ضروري لتوفير التوافق بين واجهات `chrome.*` و`browser.*`.

> [!TIP]
> يمكنك تحميل أحدث نسخة من [webextension-polyfill](https://github.com/nicothin/webextension-cross-browser-polyfill).

---

## 4. هيكل المجلدات

```
WirdReminder/
├── chrome/                    # نسخة كروم
│   ├── manifest.json          # بدون browser_specific_settings
│   └── src/
│       ├── background/
│       │   ├── background.js  # يستخدم chrome.*
│       │   └── notifications.js
│       ├── popup/
│       │   └── popup.js       # يستخدم innerHTML
│       └── ...
│
├── firefox/                   # نسخة فايرفوكس
│   ├── manifest.json          # مع browser_specific_settings
│   └── src/
│       ├── lib/
│       │   └── browser-polyfill.js  # مكتبة التوافق
│       ├── background/
│       │   ├── background.js  # يستخدم browser.*
│       │   └── notifications.js
│       ├── popup/
│       │   └── popup.js       # يستخدم DOM APIs آمنة
│       └── ...
```

---

## 5. عملية النشر

### نشر على Chrome Web Store

1. **المتطلبات**:
   - حساب مطور Google (رسوم لمرة واحدة $5)
   - صور ترويجية

2. **الخطوات**:
   - ضغط محتويات مجلد `chrome/` في ملف ZIP
   - رفع الملف على [لوحة تحكم مطوري كروم](https://chrome.google.com/webstore/devconsole/)
   - ملء تفاصيل المتجر
   - تقديم للمراجعة (1-3 أيام عمل)

3. **شرح الأذونات**:
   - `alarms`: لتوقيت التذكيرات
   - `storage`: لحفظ بيانات المستخدم
   - `notifications`: لإرسال الإشعارات

---

### نشر على Firefox Add-ons (AMO)

1. **المتطلبات**:
   - حساب Firefox Add-ons

2. **الخطوات**:
   - ضغط محتويات مجلد `firefox/` في ملف ZIP
   - رفع الملف على [مركز مطوري AMO](https://addons.mozilla.org/developers/)
   - اختيار نوع التوزيع (استضافة Mozilla أو توزيع ذاتي)
   - انتظار التحقق التلقائي
   - تقديم للمراجعة

3. **التحقق التلقائي**:
   - AMO يفحص الكود تلقائياً
   - يجب معالجة أي تحذيرات قبل النشر

> [!IMPORTANT]
> فايرفوكس أكثر صرامة في مراجعة الكود. تأكد من:
> - عدم استخدام `innerHTML` مع محتوى ديناميكي
> - عدم استخدام `eval()` أو `new Function()`
> - توضيح سبب أي أذونات مطلوبة

---

## 6. مقارنة سريعة

| الميزة | كروم | فايرفوكس |
|--------|------|----------|
| كائن API | `chrome.*` | `browser.*` |
| خلفية | `service_worker` | `scripts` |
| أزرار الإشعارات | ✅ مدعوم | ❌ غير مدعوم |
| `requireInteraction` | ✅ مدعوم | ❌ غير مدعوم |
| `innerHTML` | ✅ مسموح | ⚠️ غير موصى به |
| معرف الإضافة | اختياري | مطلوب |
| `browser_specific_settings` | غير مطلوب | مطلوب |
| Polyfill | غير مطلوب | مطلوب |

---

## 7. نصائح للصيانة

عند تحديث الكود:

1. طبّق التغييرات على مجلد `chrome/src/` أولاً
2. انسخ التغييرات إلى `firefox/src/`
3. استبدل `chrome.` بـ `browser.`
4. أزل أي استخدام لـ `innerHTML` واستبدله بـ DOM APIs

**سكريبت مساعد:**
```bash
# نسخ الملفات
cp -r chrome/src/* firefox/src/

# استبدال chrome بـ browser
find firefox/src -name "*.js" -exec sed -i 's/chrome\./browser\./g' {} +
```

> [!WARNING]
> لا تنسَ عدم الكتابة فوق مجلد `firefox/src/lib/` عند النسخ!

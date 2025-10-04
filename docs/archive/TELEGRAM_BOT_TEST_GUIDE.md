# 🧪 دليل اختبار بوت التليجرام - Telegram Bot Testing Guide

## 📋 الحالة الحالية - Current Status

❌ **البوت مش شغال حالياً** - Bot is not currently running  
✅ **الكود جاهز ومحدث** - Code is ready and updated  
✅ **كل الميزات الجديدة موجودة** - All new features are implemented

---

## 🚀 كيف تشغل البوت - How to Start the Bot

### الخطوة 1: تأكد من الإعدادات - Step 1: Configure Settings

أنشئ ملف `.env` في مجلد `services/telegram/`:

```bash
cd services/telegram
cp .env.example .env
```

عدل الملف `.env` وحط:
```env
TELEGRAM_BOT_TOKEN=8310343758:AAFLtyqdQ5PE8YtyChwJ4uGfAgy4s5qMYi0
TELEGRAM_CHAT_ID=1259666822
ADMIN_USER_IDS=1259666822
BOT_NAME=AuraOS Bot
```

### الخطوة 2: نزل المكتبات - Step 2: Install Dependencies

```bash
npm install
```

### الخطوة 3: شغل البوت - Step 3: Start the Bot

```bash
npm start
```

أو للتطوير (مع إعادة التشغيل التلقائي):
```bash
npm run dev
```

---

## 🧪 خطة الاختبار - Test Plan

### 1️⃣ اختبار الأوامر الأساسية - Basic Commands Test

افتح التليجرام وجرب الأوامر دي:

#### أ. أمر البداية - Start Command
```
/start
```
**المتوقع:**
- رسالة ترحيب
- أزرار تفاعلية (Inline Keyboard)
- قائمة بالأوامر المتاحة

#### ب. قائمة المساعدة - Help Command
```
/help
```
**المتوقع:**
- قائمة كاملة بكل الأوامر
- شرح لكل أمر
- أمثلة للاستخدام

#### ج. حالة النظام - Status Command
```
/status
```
**المتوقع:**
- حالة النظام
- وقت التشغيل
- استخدام الذاكرة
- عدد المستخدمين النشطين

#### د. معلومات البوت - Info Command
```
/info
```
**المتوقع:**
- اسم البوت
- الإصدار
- المنصة
- الميزات المتاحة

#### هـ. اختبار السرعة - Ping Command
```
/ping
```
**المتوقع:**
- رد "Pong!"
- وقت الاستجابة بالميلي ثانية

---

### 2️⃣ اختبار القائمة التفاعلية - Interactive Menu Test

#### أ. عرض القائمة - Show Menu
```
/menu
```
**المتوقع:**
- أزرار تفاعلية:
  - 📊 Status
  - ℹ️ Info
  - 🏓 Ping
  - ⏱️ Uptime
  - 💾 Memory
  - 🔖 Version
  - 📚 Help

#### ب. اختبار الأزرار - Button Testing
اضغط على كل زر وتأكد من:
- الزر يشتغل
- الرد صحيح
- الأزرار تظهر تاني

---

### 3️⃣ اختبار أوامر الأدمن - Admin Commands Test

#### أ. لوحة الأدمن - Admin Panel
```
/admin
```
**المتوقع:**
- لوحة تحكم الأدمن
- أزرار خاصة:
  - 📊 Stats
  - 👥 Users
  - 📈 Analytics
  - 🔄 Refresh

#### ب. الإحصائيات - Statistics
```
/stats
```
**المتوقع:**
- عدد المستخدمين النشطين
- استخدام الذاكرة
- وقت التشغيل
- معلومات النظام

#### ج. قائمة المستخدمين - Users List
```
/users
```
**المتوقع:**
- قائمة بكل المستخدمين النشطين
- معلومات كل مستخدم
- مدة الجلسة
- عدد الرسائل

#### د. التحليلات - Analytics
```
/analytics
```
**المتوقع:**
- إجمالي الرسائل
- إجمالي الأوامر
- أكثر الأوامر استخداماً
- إحصائيات الأداء

#### هـ. البث للجميع - Broadcast
```
/broadcast مرحباً! هذه رسالة تجريبية
```
**المتوقع:**
- إرسال الرسالة لكل المستخدمين
- تأكيد عدد المستخدمين المستلمين

---

### 4️⃣ اختبار Cursor CLI - Cursor CLI Test

#### أ. تحليل الكود - Code Analysis
```
/code services/telegram/src/index.js
```
**المتوقع:**
- عدد الأسطر
- عدد الدوال
- عدد الكلاسات
- الـ Imports والـ Exports
- التعليقات والـ TODOs
- معاينة الكود

#### ب. عرض الملفات - List Files
```
/files
/files src
/files services/telegram
```
**المتوقع:**
- قائمة بالملفات والمجلدات
- معلومات كل ملف

#### ج. البحث في الملفات - Search in Files
```
/search "TODO"
/search "import"
/search "function"
```
**المتوقع:**
- نتائج البحث
- أسماء الملفات
- أرقام الأسطر

#### د. حالة Git - Git Status
```
/git
```
**المتوقع:**
- الملفات المعدلة
- الملفات الجديدة
- حالة الـ Branch

#### هـ. سجل Git - Git Log
```
/gitlog
```
**المتوقع:**
- آخر 5 Commits
- رسائل الـ Commits
- التواريخ

#### و. هيكل المشروع - Project Structure
```
/tree
```
**المتوقع:**
- شجرة المجلدات
- بدون node_modules و .git

#### ز. قراءة ملف - Read File
```
/read package.json
/read services/telegram/README.md
```
**المتوقع:**
- محتوى الملف
- عدد الأسطر الكلي
- تنبيه إذا كان الملف مقطوع

#### ح. معلومات Package - Package Info
```
/pkg
```
**المتوقع:**
- اسم المشروع
- الإصدار
- الوصف
- عدد الـ Dependencies
- الـ Scripts المتاحة

#### ط. البحث عن ملفات - Find Files
```
/find "*.tsx"
/find "package.json"
/find "*test*"
```
**المتوقع:**
- قائمة بالملفات المطابقة
- المسارات الكاملة

#### ي. معلومات النظام - System Info
```
/sysinfo
```
**المتوقع:**
- استخدام القرص
- استخدام الذاكرة
- معلومات الـ CPU

#### ك. عد أسطر الكود - Lines of Code
```
/loc
```
**المتوقع:**
- إجمالي أسطر الكود
- عدد ملفات JS/TS

#### ل. أوامر AI - AI Commands
```
/ai show files
/ai git status
/ai project structure
/ai package info
```
**المتوقع:**
- تنفيذ الأمر بلغة طبيعية
- نتائج صحيحة

---

### 5️⃣ اختبار Rate Limiting - Rate Limiting Test

أرسل أكثر من 20 رسالة في دقيقة واحدة:

```
/ping
/ping
/ping
... (أكثر من 20 مرة)
```

**المتوقع:**
- بعد 20 طلب: رسالة "Rate limit exceeded"
- الانتظار دقيقة واحدة
- العودة للعمل بشكل طبيعي

---

### 6️⃣ اختبار الرسائل النصية - Text Messages Test

أرسل رسائل نصية عادية:

```
hello
hi
how are you
thank you
help
```

**المتوقع:**
- ردود ذكية مناسبة
- اقتراحات للأوامر
- أزرار تفاعلية

---

### 7️⃣ اختبار الأخطاء - Error Handling Test

#### أ. أمر غير موجود
```
/nonexistent
```
**المتوقع:**
- رسالة خطأ واضحة
- اقتراح أوامر بديلة

#### ب. ملف غير موجود
```
/read nonexistent.txt
/code fake-file.js
```
**المتوقع:**
- رسالة خطأ واضحة
- عدم توقف البوت

#### ج. أمر أدمن من مستخدم عادي
```
/admin
/stats
/users
```
(من حساب غير الأدمن)

**المتوقع:**
- رسالة "Access denied"
- عدم تنفيذ الأمر

---

## ✅ قائمة التحقق - Checklist

### الميزات الأساسية - Basic Features
- [ ] `/start` يعمل ويعرض أزرار
- [ ] `/help` يعرض كل الأوامر
- [ ] `/status` يعرض حالة النظام
- [ ] `/info` يعرض معلومات البوت
- [ ] `/ping` يرد بسرعة

### القائمة التفاعلية - Interactive Menu
- [ ] `/menu` يعرض الأزرار
- [ ] كل الأزرار تشتغل
- [ ] الأزرار تظهر في كل رد

### أوامر الأدمن - Admin Commands
- [ ] `/admin` يعرض لوحة التحكم
- [ ] `/stats` يعرض الإحصائيات
- [ ] `/users` يعرض المستخدمين
- [ ] `/analytics` يعرض التحليلات
- [ ] `/broadcast` يرسل للجميع

### Cursor CLI
- [ ] `/code` يحلل الكود
- [ ] `/files` يعرض الملفات
- [ ] `/search` يبحث في الملفات
- [ ] `/git` يعرض حالة Git
- [ ] `/gitlog` يعرض السجل
- [ ] `/tree` يعرض الهيكل
- [ ] `/read` يقرأ الملفات
- [ ] `/pkg` يعرض معلومات Package
- [ ] `/find` يبحث عن ملفات
- [ ] `/sysinfo` يعرض معلومات النظام
- [ ] `/loc` يعد الأسطر
- [ ] `/ai` ينفذ أوامر طبيعية

### الحماية والأمان - Security
- [ ] Rate limiting يشتغل
- [ ] أوامر الأدمن محمية
- [ ] الأخطاء تتعامل معها بشكل صحيح
- [ ] لا توجد تسريبات معلومات

### تجربة المستخدم - User Experience
- [ ] الردود سريعة
- [ ] الرسائل واضحة
- [ ] الأزرار سهلة الاستخدام
- [ ] الأخطاء مفهومة

---

## 📊 نتائج الاختبار المتوقعة - Expected Test Results

### ✅ النجاح - Success Criteria
- كل الأوامر تشتغل
- الأزرار التفاعلية تعمل
- Cursor CLI يحلل الكود
- Rate limiting يحمي من الـ Spam
- الأخطاء تتعامل معها بشكل صحيح

### ❌ الفشل - Failure Indicators
- البوت لا يرد
- الأزرار لا تعمل
- أوامر Cursor تفشل
- Rate limiting لا يعمل
- الأخطاء تتسبب في توقف البوت

---

## 🐛 المشاكل المحتملة - Potential Issues

### 1. البوت لا يرد
**الحل:**
- تأكد من الـ Token صحيح
- تأكد من الإنترنت متصل
- شوف الـ Logs للأخطاء

### 2. الأزرار لا تعمل
**الحل:**
- تأكد من الـ Callback handlers موجودة
- شوف الـ Console للأخطاء

### 3. أوامر Cursor تفشل
**الحل:**
- تأكد من المسارات صحيحة
- تأكد من الصلاحيات موجودة
- تأكد من الأدوات متوفرة (git, tree, etc.)

### 4. Rate Limiting مش شغال
**الحل:**
- تأكد من الكود محدث
- شوف الـ rateLimits Map

---

## 📝 تسجيل النتائج - Recording Results

استخدم هذا الجدول لتسجيل نتائج الاختبار:

| الميزة | الحالة | ملاحظات |
|--------|---------|----------|
| Basic Commands | ⬜ | |
| Interactive Keyboards | ⬜ | |
| Admin Panel | ⬜ | |
| Cursor CLI | ⬜ | |
| Rate Limiting | ⬜ | |
| Error Handling | ⬜ | |
| Analytics | ⬜ | |

الحالة: ✅ نجح | ❌ فشل | ⚠️ جزئي

---

## 🎯 الخطوات التالية - Next Steps

بعد الاختبار:

1. **سجل النتائج** - Document results
2. **أصلح المشاكل** - Fix any issues
3. **حدث الوثائق** - Update documentation
4. **شارك النتائج** - Share results
5. **خطط للتحسينات** - Plan improvements

---

## 📞 الدعم - Support

إذا واجهت مشاكل:
1. شوف الـ Logs: `npm start`
2. اقرأ الوثائق: `CURSOR_CLI_GUIDE.md`
3. راجع الكود: `services/telegram/src/index.js`

---

**جاهز للاختبار؟ شغل البوت وابدأ!** 🚀

```bash
cd services/telegram
npm install
npm start
```

**بالتوفيق!** 🎉

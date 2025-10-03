# 🔐 Firebase Security Setup Guide

## تأمين API Keys والـ Service Accounts

---

## ⚠️ المشكلة

عند استخدام Firebase في الـ frontend، الـ API Key بيكون ظاهر في الكود. ده طبيعي لكن **لازم تأمنه صح**.

---

## ✅ الحل الصحيح

### 1. **تقييد الـ API Key بالـ Domain**

#### الخطوات:

1. **افتح Google Cloud Console:**
   - روح على: https://console.cloud.google.com/
   - اختار المشروع: `adept-student-469614-k2`

2. **روح على APIs & Services → Credentials:**
   ```
   Navigation: ☰ Menu → APIs & Services → Credentials
   ```

3. **اختار الـ API Key:**
   - هتلاقي API Key اسمه "Browser key (auto created by Firebase)"
   - اضغط عليه للتعديل

4. **قيّد الـ Key:**
   
   **Application restrictions:**
   - اختار: `HTTP referrers (web sites)`
   - أضف الـ domains المسموح بيها:
     ```
     https://adept-student-469614-k2.web.app/*
     https://adept-student-469614-k2.firebaseapp.com/*
     http://localhost:3000/*
     http://localhost:5173/*
     ```

   **API restrictions:**
   - اختار: `Restrict key`
   - فعّل فقط الـ APIs المطلوبة:
     - ✅ Cloud Firestore API
     - ✅ Firebase Authentication API
     - ✅ Firebase Storage API
     - ✅ Firebase Hosting API
     - ✅ Identity Toolkit API
     - ❌ باقي الـ APIs (غير مطلوبة)

5. **احفظ التغييرات:**
   - اضغط `Save`

---

### 2. **Firestore Security Rules**

الـ API Key لوحده **مش كافي** للوصول للبيانات. لازم Firestore Rules محكمة:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // ❌ ممنوع: allow read, write: if true;
    // ✅ صح: require authentication
    
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    match /user_rewards/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
    
    // System collections (read-only for users)
    match /autopilot_rewards/{rewardId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only backend
    }
  }
}
```

---

### 3. **Environment Variables**

#### في الـ Development:

**ملف `.env`:**
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=adept-student-469614-k2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=adept-student-469614-k2
VITE_FIREBASE_STORAGE_BUCKET=adept-student-469614-k2.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123

# Firebase Admin (Backend only - never expose)
FIREBASE_PROJECT_ID=adept-student-469614-k2
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@adept-student-469614-k2.iam.gserviceaccount.com
```

#### في الـ Production (Firebase Hosting):

**لا تحتاج environment variables!**

Firebase Hosting بيحقن الـ config تلقائيًا:
```javascript
// Firebase auto-injects config in production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ... rest of config
};
```

---

### 4. **Service Account (للـ Backend فقط)**

#### متى تستخدم Service Account:

- ✅ Cloud Functions
- ✅ Backend APIs
- ✅ Admin operations
- ❌ **أبدًا** في الـ Frontend

#### كيفية الحصول على Service Account:

1. **Firebase Console:**
   ```
   Project Settings → Service Accounts → Generate New Private Key
   ```

2. **احفظ الملف بأمان:**
   ```bash
   # ❌ لا تضيفه للـ Git
   echo "serviceAccountKey.json" >> .gitignore
   
   # ✅ استخدمه في الـ Backend فقط
   export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
   ```

3. **استخدام في Cloud Functions:**
   ```typescript
   import * as admin from 'firebase-admin';
   
   admin.initializeApp({
     credential: admin.credential.applicationDefault(),
   });
   ```

---

## 🛡️ Security Best Practices

### ✅ افعل:

1. **قيّد الـ API Key بالـ domains:**
   ```
   https://your-domain.com/*
   http://localhost:3000/* (للتطوير فقط)
   ```

2. **استخدم Firestore Rules محكمة:**
   ```javascript
   // ✅ Good
   allow read: if request.auth != null;
   allow write: if request.auth.uid == userId;
   
   // ❌ Bad
   allow read, write: if true;
   ```

3. **فعّل Firebase App Check:**
   ```typescript
   import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
   
   const appCheck = initializeAppCheck(app, {
     provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
     isTokenAutoRefreshEnabled: true
   });
   ```

4. **استخدم Environment Variables:**
   ```typescript
   // ✅ Good
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY
   
   // ❌ Bad
   apiKey: "AIzaSyC..."
   ```

5. **راقب الاستخدام:**
   - Firebase Console → Usage
   - تابع الـ quotas والـ billing
   - فعّل alerts للاستخدام الزائد

### ❌ لا تفعل:

1. **لا تضع Service Account في Frontend:**
   ```typescript
   // ❌ NEVER DO THIS
   const serviceAccount = require('./serviceAccountKey.json');
   ```

2. **لا تعطل الـ Security Rules:**
   ```javascript
   // ❌ DANGEROUS
   allow read, write: if true;
   ```

3. **لا تشارك الـ Private Keys:**
   - ❌ في Git
   - ❌ في Chat/Email
   - ❌ في Screenshots
   - ❌ في Public repos

4. **لا تستخدم نفس الـ Keys للـ Dev والـ Production:**
   ```bash
   # ✅ Good: Different projects
   Dev: auraos-dev
   Prod: auraos-prod
   ```

---

## 🔍 كيف تتحقق من الأمان

### 1. **اختبر الـ API Key Restrictions:**

```bash
# Try to use API key from unauthorized domain
curl -X POST \
  'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"test123"}'

# Should return: API key not valid
```

### 2. **اختبر Firestore Rules:**

```javascript
// Try to read without authentication
const db = getFirestore();
const docRef = doc(db, 'users', 'some-user-id');

try {
  await getDoc(docRef);
  console.log('❌ Security issue: Can read without auth');
} catch (error) {
  console.log('✅ Security working: Access denied');
}
```

### 3. **راجع Security Rules:**

```bash
# Test rules locally
firebase emulators:start --only firestore

# Run security tests
npm run test:security
```

---

## 📊 Monitoring & Alerts

### 1. **فعّل Firebase Alerts:**

Firebase Console → Project Settings → Integrations → Cloud Monitoring

**Alerts to enable:**
- ✅ Unusual authentication activity
- ✅ High read/write operations
- ✅ Quota exceeded
- ✅ Security rules violations

### 2. **راقب الـ Logs:**

```bash
# View Firebase logs
firebase functions:log

# View Firestore audit logs
gcloud logging read "resource.type=firestore_database"
```

### 3. **استخدم Firebase App Check:**

يمنع الـ bots والـ abuse:
```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcX...'),
  isTokenAutoRefreshEnabled: true
});
```

---

## 🚨 في حالة تسريب الـ Key

### إذا تسرب الـ API Key:

1. **غيّر الـ Key فورًا:**
   ```
   Google Cloud Console → Credentials → Create New Key
   ```

2. **احذف الـ Key القديم:**
   ```
   Delete the compromised key
   ```

3. **حدّث الـ Environment Variables:**
   ```bash
   # Update .env
   VITE_FIREBASE_API_KEY=NEW_KEY_HERE
   
   # Redeploy
   npm run auto-deploy
   ```

4. **راجع الـ Logs:**
   ```bash
   # Check for suspicious activity
   firebase functions:log --only auth
   ```

5. **أبلغ الفريق:**
   - Document the incident
   - Review security practices
   - Update procedures

---

## ✅ Checklist للأمان

### قبل الـ Deployment:

- [ ] API Key مقيّد بالـ domains
- [ ] Firestore Rules محكمة
- [ ] لا توجد hardcoded keys
- [ ] `.env` في `.gitignore`
- [ ] Service Account آمن (backend only)
- [ ] Firebase App Check مفعّل
- [ ] Alerts مفعّلة
- [ ] Security tests passed

### بعد الـ Deployment:

- [ ] اختبر الـ API restrictions
- [ ] اختبر Firestore rules
- [ ] راجع الـ usage
- [ ] فعّل monitoring
- [ ] وثّق الـ configuration

---

## 📚 Resources

### Official Documentation:
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [API Key Restrictions](https://cloud.google.com/docs/authentication/api-keys)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Security Best Practices](https://firebase.google.com/docs/rules/security)

### Tools:
- [Firebase Emulator](https://firebase.google.com/docs/emulator-suite)
- [Security Rules Simulator](https://firebase.google.com/docs/rules/simulator)
- [Firebase CLI](https://firebase.google.com/docs/cli)

---

## 💡 ملخص سريع

### الـ API Key في Frontend **آمن** إذا:

1. ✅ مقيّد بالـ domains
2. ✅ Firestore Rules محكمة
3. ✅ Firebase App Check مفعّل
4. ✅ Monitoring active

### الـ API Key **غير آمن** إذا:

1. ❌ مش مقيّد (يشتغل من أي domain)
2. ❌ Firestore Rules: `allow read, write: if true`
3. ❌ لا يوجد monitoring
4. ❌ Service Account في Frontend

---

**تذكر:** الـ API Key في Frontend **مش مشكلة** طالما عندك:
- ✅ Domain restrictions
- ✅ Firestore security rules
- ✅ Proper authentication

**المشكلة الحقيقية:** لو حد قدر يوصل للبيانات بدون authentication!

---

**Last Updated:** October 3, 2025  
**Security Level:** 🛡️ Enterprise Grade  
**Status:** ✅ Production Ready

# 🐛 Debug Login Issue - Troubleshooting Guide

**Issue:** Problems after logging in  
**Status:** 🔍 Investigating

---

## 🔍 Common Login Issues

### Issue 1: Redirect Loop

**Symptoms:**
- Page keeps redirecting between `/auth` and `/desktop`
- Infinite loading state
- Console shows repeated navigation

**Causes:**
1. `onAuthStateChanged` not properly handling user state
2. `ProtectedRoute` checking auth before it's loaded
3. Firebase not initialized correctly

**Fix:**
```typescript
// In AuthContext.tsx - ensure loading state is properly managed
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setUser(user);
    
    if (user) {
      await loadUserProfile(user);
    } else {
      setUserProfile(null);
    }
    
    setLoading(false); // ✅ CRITICAL: Set loading to false
  });

  return unsubscribe;
}, []);
```

---

### Issue 2: Firebase Not Initialized

**Symptoms:**
- Error: "Firebase: No Firebase App '[DEFAULT]' has been created"
- Login button does nothing
- Console shows Firebase errors

**Causes:**
1. Missing environment variables
2. Firebase config not loaded
3. Import order issues

**Fix:**

1. **Check environment variables:**
```bash
# Verify .env file exists
cat packages/ui/.env

# Should contain:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

2. **Verify Firebase initialization:**
```typescript
// packages/firebase/src/config/firebase.ts
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ... other config
};

// ✅ Initialize immediately
const app = initializeApp(firebaseConfig);
```

3. **Restart dev server:**
```bash
cd packages/ui
pnpm dev
```

---

### Issue 3: User Profile Not Loading

**Symptoms:**
- Login succeeds but user data is null
- Desktop page shows loading forever
- Console shows Firestore errors

**Causes:**
1. Firestore rules blocking read
2. User document doesn't exist
3. Network error

**Fix:**

1. **Check Firestore rules:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // ✅ Allow users to read their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

2. **Verify user profile creation:**
```typescript
// In AuthContext.tsx
const createUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // ✅ Create profile if doesn't exist
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'User',
      createdAt: serverTimestamp(),
    });
  }
};
```

---

### Issue 4: Navigation Not Working

**Symptoms:**
- Login succeeds but stays on auth page
- URL doesn't change
- No redirect happens

**Causes:**
1. `useNavigate` not working
2. Router not properly configured
3. Navigation called before auth completes

**Fix:**

1. **Ensure navigation happens after auth:**
```typescript
// In AuthPage.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    await signIn(email, password);
    // ✅ Navigate AFTER successful sign in
    navigate('/desktop');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

2. **Check router setup:**
```typescript
// In App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route
      path="/desktop"
      element={
        <ProtectedRoute>
          <DesktopOS />
        </ProtectedRoute>
      }
    />
    <Route path="/" element={<Navigate to="/desktop" replace />} />
  </Routes>
</BrowserRouter>
```

---

### Issue 5: CORS Errors

**Symptoms:**
- Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
- Google Sign-In popup blocked
- Network requests fail

**Causes:**
1. Firebase domain not authorized
2. Popup blocker
3. Incorrect Firebase config

**Fix:**

1. **Add authorized domains in Firebase Console:**
   - Go to: https://console.firebase.google.com
   - Select project
   - Authentication → Settings → Authorized domains
   - Add: `localhost`, `127.0.0.1`, your Gitpod URL

2. **Check popup blocker:**
   - Allow popups for your domain
   - Try in incognito mode

---

## 🔧 Debugging Steps

### Step 1: Check Console Errors

```bash
# Open browser console (F12)
# Look for errors related to:
# - Firebase
# - Authentication
# - Navigation
# - Network requests
```

### Step 2: Verify Firebase Connection

```typescript
// Add to AuthContext.tsx temporarily
useEffect(() => {
  console.log('🔥 Firebase Auth:', auth);
  console.log('🔥 Firebase DB:', db);
  console.log('🔥 User:', user);
  console.log('🔥 Loading:', loading);
}, [user, loading]);
```

### Step 3: Test Authentication Flow

```typescript
// Add logging to each auth function
const signIn = async (email: string, password: string) => {
  console.log('📝 Attempting sign in:', email);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Sign in successful:', result.user.uid);
    await loadUserProfile(result.user);
    console.log('✅ Profile loaded');
  } catch (error) {
    console.error('❌ Sign in failed:', error);
    throw error;
  }
};
```

### Step 4: Check Network Tab

```bash
# Open browser DevTools → Network tab
# Filter by: Firestore, Auth
# Look for:
# - Failed requests (red)
# - 401/403 errors
# - Slow requests
```

### Step 5: Verify Firestore Data

```bash
# Go to Firebase Console
# Firestore Database
# Check if user document exists after login
# Path: users/{userId}
```

---

## 🧪 Test Login Flow

### Manual Test

1. **Clear browser data:**
```bash
# Chrome: Ctrl+Shift+Delete
# Clear: Cookies, Cache, Local Storage
```

2. **Open app:**
```bash
cd packages/ui
pnpm dev
# Open: http://localhost:5173
```

3. **Test each login method:**
   - ✅ Email/Password
   - ✅ Google Sign-In
   - ✅ Guest Mode

4. **Verify after login:**
   - ✅ Redirects to `/desktop`
   - ✅ Desktop OS loads
   - ✅ User data available
   - ✅ No console errors

### Automated Test

```bash
# Run authentication tests
cd packages/ui
pnpm test AuthFlow.test.tsx
```

---

## 🔍 Common Error Messages

### "Firebase: Error (auth/invalid-email)"
**Fix:** Check email format is valid

### "Firebase: Error (auth/user-not-found)"
**Fix:** User doesn't exist, try signing up first

### "Firebase: Error (auth/wrong-password)"
**Fix:** Incorrect password

### "Firebase: Error (auth/too-many-requests)"
**Fix:** Too many failed attempts, wait or reset password

### "Firebase: Error (auth/popup-blocked)"
**Fix:** Allow popups in browser settings

### "Firebase: Error (auth/popup-closed-by-user)"
**Fix:** User closed popup, try again

### "Firebase: Missing or insufficient permissions"
**Fix:** Check Firestore security rules

---

## 🛠️ Quick Fixes

### Fix 1: Reset Firebase Auth State

```typescript
// Add to AuthContext.tsx
const resetAuth = async () => {
  await signOut(auth);
  setUser(null);
  setUserProfile(null);
  setLoading(false);
};
```

### Fix 2: Force Reload User Profile

```typescript
// Add to AuthContext.tsx
const reloadProfile = async () => {
  if (user) {
    await loadUserProfile(user);
  }
};
```

### Fix 3: Clear Local Storage

```typescript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 📊 Monitoring

### Add Analytics

```typescript
// Track login events
const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // ✅ Track successful login
    console.log('Login successful', {
      uid: result.user.uid,
      method: 'email',
      timestamp: new Date().toISOString(),
    });
    
    await loadUserProfile(result.user);
  } catch (error) {
    // ✅ Track failed login
    console.error('Login failed', {
      method: 'email',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};
```

---

## ✅ Verification Checklist

After fixing, verify:

- [ ] Login with email/password works
- [ ] Login with Google works
- [ ] Guest mode works
- [ ] Redirects to `/desktop` after login
- [ ] Desktop OS loads correctly
- [ ] User data is available
- [ ] No console errors
- [ ] No infinite redirects
- [ ] Logout works
- [ ] Can login again after logout

---

## 🆘 Still Having Issues?

1. **Check browser console** for specific errors
2. **Check Firebase Console** for auth logs
3. **Run tests** to identify failing components
4. **Clear all data** and try fresh install
5. **Check environment variables** are correct
6. **Verify Firebase project** is active

---

## 📞 Support Resources

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [React Router Docs](https://reactrouter.com)
- [Authentication Tests](./packages/ui/src/__tests__/AuthFlow.test.tsx)

---

**Last Updated:** October 3, 2025  
**Status:** Ready for testing

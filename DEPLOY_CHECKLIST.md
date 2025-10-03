# ✅ Deployment Checklist - GitHub Actions Method

Follow these steps in order. Check off each one as you complete it.

---

## 🎯 Step 1: Get Service Account Key

### What to do:

1. [ ] Open this link: [Firebase Service Accounts](https://console.firebase.google.com/project/selfos-62f70/settings/serviceaccounts/adminsdk)

2. [ ] Click **"Generate New Private Key"** button

3. [ ] Click **"Generate Key"** in the popup

4. [ ] A JSON file downloads (keep it safe!)

5. [ ] Open the JSON file with any text editor

6. [ ] Copy ALL the text (from `{` to `}`)

### What it looks like:
```json
{
  "type": "service_account",
  "project_id": "selfos-62f70",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-...@selfos-62f70.iam.gserviceaccount.com",
  ...
}
```

**✅ Done? Move to Step 2**

---

## 🔐 Step 2: Add Secret to GitHub

### What to do:

1. [ ] Open this link: [GitHub Secrets](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/secrets/actions)

2. [ ] Click **"New repository secret"** (green button)

3. [ ] In the **Name** field, type exactly: `FIREBASE_SERVICE_ACCOUNT`

4. [ ] In the **Value** field, paste the JSON from Step 1

5. [ ] Click **"Add secret"**

6. [ ] Verify it appears in the secrets list

### Important:
- Name must be EXACTLY: `FIREBASE_SERVICE_ACCOUNT` (case-sensitive)
- Value must be the ENTIRE JSON contents
- Don't add quotes or modify the JSON

**✅ Done? Move to Step 3**

---

## 💳 Step 3: Fix GitHub Billing

### What to do:

1. [ ] Open this link: [GitHub Billing](https://github.com/settings/billing)

2. [ ] Check if there are any warnings or errors

3. [ ] If there are issues:
   - [ ] Add payment method
   - [ ] Resolve outstanding charges
   - [ ] Verify account status

4. [ ] Ensure Actions are enabled:
   - [ ] Go to: [Actions Settings](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/actions)
   - [ ] Select "Allow all actions and reusable workflows"

**✅ Done? Move to Step 4**

---

## 🚀 Step 4: Deploy!

### Method A: Manual Trigger (Recommended)

1. [ ] Open this link: [Deploy Workflow](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions/workflows/deploy.yml)

2. [ ] Click **"Run workflow"** button (on the right side)

3. [ ] Make sure **"main"** branch is selected

4. [ ] Click **"Run workflow"** (green button)

5. [ ] Wait 2-3 minutes for completion

6. [ ] Click on the workflow run to see logs

### Method B: Push to Main

```bash
git commit --allow-empty -m "Deploy AuraOS"
git push origin main
```

**✅ Deployment started? Move to Step 5**

---

## 🎉 Step 5: Verify Deployment

### What to do:

1. [ ] Wait for workflow to complete (green checkmark)

2. [ ] Open your app: [https://selfos-62f70.web.app](https://selfos-62f70.web.app)

3. [ ] Verify it loads correctly

4. [ ] Check Firebase Console: [Hosting](https://console.firebase.google.com/project/selfos-62f70/hosting)

### Success indicators:
- ✅ Workflow shows green checkmark
- ✅ Website loads at selfos-62f70.web.app
- ✅ Firebase Console shows new deployment

**✅ All done! Your app is live! 🎊**

---

## ❌ Troubleshooting

### If Step 1 fails:
- **Can't access Firebase Console?** → You need Owner/Editor role
- **No "Generate Key" button?** → Check your permissions

### If Step 2 fails:
- **Can't access GitHub Secrets?** → You need admin access to the repo
- **Secret not saving?** → Make sure you copied the entire JSON

### If Step 3 fails:
- **Billing issues?** → Contact GitHub support
- **Actions disabled?** → Enable in repository settings

### If Step 4 fails:
- **Workflow doesn't start?** → Check Actions are enabled
- **Workflow fails?** → Check the logs for specific error
- **"Secret not found"?** → Verify secret name is exactly `FIREBASE_SERVICE_ACCOUNT`

### If Step 5 fails:
- **Site not loading?** → Wait a few minutes, DNS can take time
- **404 error?** → Check workflow logs for deployment errors
- **Old version showing?** → Clear browser cache (Ctrl+Shift+R)

---

## 📞 Quick Links

- **Firebase Console:** https://console.firebase.google.com/project/selfos-62f70
- **GitHub Actions:** https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions
- **GitHub Secrets:** https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/secrets/actions
- **Your Live App:** https://selfos-62f70.web.app

---

## 🔄 Future Deployments

After initial setup, deploying is easy:

**Option 1:** Push to main
```bash
git push origin main
```

**Option 2:** Manual trigger
1. Go to [Deploy Workflow](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions/workflows/deploy.yml)
2. Click "Run workflow"
3. Done!

---

## 📝 Summary

1. ✅ Get service account key from Firebase
2. ✅ Add it to GitHub Secrets
3. ✅ Fix any billing issues
4. ✅ Trigger deployment
5. ✅ Verify it's live

**Total time: ~10 minutes**

Good luck! 🚀

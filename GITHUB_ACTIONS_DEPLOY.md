# 🚀 Deploy via GitHub Actions (Service Account Method)

This guide will help you deploy AuraOS using GitHub Actions without needing a local machine.

---

## 📋 Step-by-Step Instructions

### Step 1: Create Firebase Service Account Key

1. **Open Firebase Console:**
   
   Go to: [https://console.firebase.google.com/project/selfos-62f70/settings/serviceaccounts/adminsdk](https://console.firebase.google.com/project/selfos-62f70/settings/serviceaccounts/adminsdk)

2. **Generate Key:**
   
   - Click the **"Generate New Private Key"** button
   - A dialog will appear warning you to keep it secure
   - Click **"Generate Key"**
   
3. **Download JSON File:**
   
   - A file named `selfos-62f70-firebase-adminsdk-xxxxx.json` will download
   - **Keep this file secure!** It's like a password

4. **Open the JSON File:**
   
   - Open it with a text editor (Notepad, TextEdit, VS Code, etc.)
   - You'll see something like:
   
   ```json
   {
     "type": "service_account",
     "project_id": "selfos-62f70",
     "private_key_id": "xxxxx",
     "private_key": "-----BEGIN PRIVATE KEY-----\nxxxxx\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@selfos-62f70.iam.gserviceaccount.com",
     ...
   }
   ```

5. **Copy the ENTIRE contents** (all the JSON text)

---

### Step 2: Add Service Account to GitHub Secrets

1. **Go to GitHub Secrets:**
   
   Open: [https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/secrets/actions](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/secrets/actions)
   
   (You need to be signed in to GitHub)

2. **Create New Secret:**
   
   - Click **"New repository secret"** button (green button on the right)

3. **Fill in the form:**
   
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
     (Must be exactly this - case sensitive!)
   
   - **Value:** Paste the entire JSON contents from Step 1
     (Everything from `{` to `}`)

4. **Save:**
   
   - Click **"Add secret"**
   - You should see it in the list (the value will be hidden)

---

### Step 3: Fix GitHub Billing (If Needed)

The previous deployment failed due to a billing issue. You need to:

1. **Check Billing Status:**
   
   Go to: [https://github.com/settings/billing](https://github.com/settings/billing)

2. **Resolve Any Issues:**
   
   - Add payment method if needed
   - Resolve any outstanding charges
   - Verify account is in good standing

3. **Verify Actions are Enabled:**
   
   Go to: [https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/actions](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/actions)
   
   - Ensure "Allow all actions and reusable workflows" is selected

---

### Step 4: Trigger Deployment

You have two options:

#### Option A: Push to Main Branch (Automatic)

Any push to the `main` branch will trigger deployment:

```bash
# Make a small change (or use existing changes)
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

#### Option B: Manual Trigger (Recommended)

1. **Go to Actions:**
   
   [https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions/workflows/deploy.yml](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions/workflows/deploy.yml)

2. **Run Workflow:**
   
   - Click **"Run workflow"** button (on the right)
   - Select branch: **main**
   - Click **"Run workflow"** (green button)

3. **Watch Progress:**
   
   - The workflow will appear in the list
   - Click on it to see real-time logs
   - Takes about 2-3 minutes

---

### Step 5: Verify Deployment

Once the workflow completes successfully:

1. **Check the workflow logs** for the deployment URL

2. **Visit your app:**
   
   - Primary: [https://selfos-62f70.web.app](https://selfos-62f70.web.app)
   - Alternative: [https://selfos-62f70.firebaseapp.com](https://selfos-62f70.firebaseapp.com)

3. **View in Firebase Console:**
   
   [https://console.firebase.google.com/project/selfos-62f70/hosting](https://console.firebase.google.com/project/selfos-62f70/hosting)

---

## 🔍 Troubleshooting

### "Secret not found" Error

**Problem:** The secret name is incorrect or not set

**Solution:**
- Verify secret name is exactly: `FIREBASE_SERVICE_ACCOUNT`
- Check it exists at: [GitHub Secrets](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/secrets/actions)

### "Permission denied" Error

**Problem:** Service account doesn't have proper permissions

**Solution:**
1. Go to: [Firebase IAM](https://console.firebase.google.com/project/selfos-62f70/settings/iam)
2. Find the service account email (ends with `@selfos-62f70.iam.gserviceaccount.com`)
3. Ensure it has "Firebase Hosting Admin" role

### "Billing issue" Error

**Problem:** GitHub account has billing problems

**Solution:**
1. Go to: [GitHub Billing](https://github.com/settings/billing)
2. Resolve any outstanding issues
3. Add payment method if needed

### Workflow Doesn't Start

**Problem:** Actions might be disabled

**Solution:**
1. Go to: [Actions Settings](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/actions)
2. Enable "Allow all actions and reusable workflows"

---

## 📊 What the Workflow Does

The GitHub Actions workflow will:

1. ✅ Checkout your code
2. ✅ Install pnpm and dependencies
3. ✅ Build the UI (`pnpm run build`)
4. ✅ Deploy to Firebase Hosting
5. ✅ Show deployment URL

Total time: ~2-3 minutes

---

## 🔒 Security Notes

1. **Never commit the service account JSON file** to git
2. **Keep the JSON file secure** - it's like a password
3. **Rotate keys periodically** for security
4. **Only share with trusted team members**
5. **GitHub Secrets are encrypted** and safe to use

---

## ✅ Checklist

Before triggering deployment, ensure:

- [ ] Service account key generated from Firebase Console
- [ ] Secret `FIREBASE_SERVICE_ACCOUNT` added to GitHub
- [ ] GitHub billing issues resolved
- [ ] Actions enabled in repository settings
- [ ] You're ready to trigger the workflow

---

## 🆘 Still Having Issues?

If you're stuck:

1. Check the workflow logs for specific errors
2. Verify all secrets are set correctly
3. Ensure billing is resolved
4. Try the manual trigger option

---

## 🎉 Success!

Once deployed, your app will be live at:
- https://selfos-62f70.web.app
- https://selfos-62f70.firebaseapp.com

You can deploy anytime by pushing to `main` or manually triggering the workflow!

# Firebase Web App Registration - Complete Guide

## 🎯 Quick Start (Recommended Method)

Since Firebase CLI requires interactive browser login, here's the **fastest way** to get your web appId:

### Method 1: Firebase Console (5 minutes)

1. **Open Firebase Console**  
   Click here: https://console.firebase.google.com/project/trust-market-platform/settings/general

2. **Navigate to Your Apps**
   - Scroll down to the "Your apps" section
   - Look for existing apps

3. **Check for Existing Web App**
   - Look for an app with the `</>` icon (Web platform)
   - If you see one, click on it to view the configuration
   - **Copy the appId** (format: `1:516223323976:web:XXXXXXXXXXXXX`)

4. **If No Web App Exists, Create One**
   - Click the "Add app" button
   - Select "Web" platform (the `</>` icon)
   - Enter app nickname: `MP Shop Web`
   - **Do NOT check** "Also set up Firebase Hosting"
   - Click "Register app"
   - **Copy the appId** from the configuration shown

5. **Update Your Configuration**
   ```bash
   node update-firebase-config.js YOUR_WEB_APP_ID
   ```
   
   Replace `YOUR_WEB_APP_ID` with the actual appId you copied.

---

## Method 2: Using Firebase CLI (Alternative)

If you prefer using the CLI, follow these steps:

### Step 1: Login to Firebase

```bash
firebase login
```

This will open your browser for authentication.

### Step 2: List Existing Apps

```bash
firebase apps:list --project trust-market-platform
```

Look for a web app in the output. If one exists, note its App ID.

### Step 3: Create Web App (if needed)

```bash
firebase apps:create WEB "MP Shop Web" --project trust-market-platform
```

This will output the web app configuration including the appId.

### Step 4: Get App Config

```bash
firebase apps:sdkconfig WEB --project trust-market-platform
```

This will display the full Firebase configuration including the appId.

---

## Method 3: Manual Update (If You Already Have the AppId)

If you already know your web appId, you can manually update the configuration:

1. **Open the file**: `src/core/config/firebase.ts`

2. **Find line 21** (the one with `YOUR_WEB_APP_ID`)

3. **Replace** this:
   ```typescript
   appId: Platform.OS === 'web' 
       ? "1:516223323976:web:YOUR_WEB_APP_ID"
       : "1:516223323976:android:f5323f2b8589c91c0b2d7d"
   ```

4. **With** your actual appId:
   ```typescript
   appId: Platform.OS === 'web' 
       ? "1:516223323976:web:abc123def456ghi789"  // Your actual appId
       : "1:516223323976:android:f5323f2b8589c91c0b2d7d"
   ```

5. **Save the file**

---

## 🧪 Testing After Update

### Test on Web Platform

```bash
# Stop the current dev server (Ctrl+C)
npm run web
```

1. Open the browser to the provided URL
2. Navigate to the Register screen
3. Try creating a new user account
4. Check browser console for any errors
5. Verify the user appears in Firebase Console → Authentication

### Test on Mobile Platform

```bash
npm start
```

1. Scan the QR code with Expo Go app
2. Navigate to the Register screen
3. Try creating a new user account
4. Check for any errors
5. Verify the user appears in Firebase Console → Authentication

---

## ✅ Verification Checklist

After updating the configuration and testing:

- [ ] Web appId is added to `src/core/config/firebase.ts`
- [ ] No TypeScript compilation errors
- [ ] Dev server restarts successfully
- [ ] User registration works on web
- [ ] User registration works on mobile
- [ ] New users appear in Firebase Console → Authentication
- [ ] No Firebase errors in browser/app console

---

## 🔍 Troubleshooting

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Double-check that you copied the correct appId. It should start with `1:516223323976:web:`

### Issue: "Firebase App named '[DEFAULT]' already exists"
**Solution**: 
1. Clear browser cache
2. Restart the development server
3. Refresh the page

### Issue: Registration works but users don't appear in Firebase Console
**Solution**:
1. Check Firebase Console → Authentication → Sign-in method
2. Ensure "Email/Password" provider is enabled
3. Check the "Users" tab (it may take a few seconds to update)

### Issue: "Network request failed"
**Solution**:
1. Check your internet connection
2. Verify Firebase project is active
3. Check if Firebase services are down: https://status.firebase.google.com/

---

## 📁 Helper Scripts Created

1. **`register-web-app.js`** - Displays instructions for getting web appId
2. **`update-firebase-config.js`** - Automatically updates the configuration file

### Using the Helper Scripts

```bash
# View instructions
node register-web-app.js

# Update configuration (after getting appId)
node update-firebase-config.js 1:516223323976:web:YOUR_ACTUAL_APP_ID
```

---

## 🔗 Quick Links

- **Firebase Console**: https://console.firebase.google.com/project/trust-market-platform
- **Project Settings**: https://console.firebase.google.com/project/trust-market-platform/settings/general
- **Authentication**: https://console.firebase.google.com/project/trust-market-platform/authentication
- **Firebase Status**: https://status.firebase.google.com/

---

## 📞 Need Help?

If you encounter issues:

1. Check the browser console for detailed error messages
2. Review Firebase Console for any error logs
3. Ensure all Firebase services (Auth, Firestore, Storage) are enabled
4. Verify your Firebase project is on the correct billing plan

---

**Last Updated**: 2026-01-16  
**Firebase Project**: trust-market-platform  
**Configuration File**: `src/core/config/firebase.ts`

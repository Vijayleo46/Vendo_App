# Firebase Web App Configuration Guide

## Current Status
✅ Firebase configuration file has been updated with platform-specific appId support  
⚠️ **ACTION REQUIRED**: You need to add the Web App ID from Firebase Console

## What Was Fixed

### 1. **Platform-Specific App IDs**
- Added conditional logic to use different `appId` for web vs mobile platforms
- Android appId is already configured: `1:516223323976:android:f5323f2b8589c91c0b2d7d`
- Web appId placeholder added: `YOUR_WEB_APP_ID` (needs to be replaced)

### 2. **Auth Initialization**
- Simplified auth initialization for both web and React Native
- Firebase JS SDK v12+ handles persistence automatically
- Web uses browser's localStorage
- React Native uses AsyncStorage (when available)

### 3. **Removed Errors**
- Fixed TypeScript import errors
- Removed duplicate export statements
- Cleaned up configuration structure

## How to Get Your Web App ID

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **trust-market-platform**

### Step 2: Register a Web App
1. Click on the **Settings gear icon** (⚙️) next to "Project Overview"
2. Select **Project settings**
3. Scroll down to the **"Your apps"** section
4. Look for existing apps or click **"Add app"** button
5. Select the **Web platform** (</> icon)

### Step 3: Configure the Web App
1. Enter an app nickname (e.g., "MP Shop Web")
2. **Optional**: Check "Also set up Firebase Hosting" if you plan to deploy
3. Click **"Register app"**

### Step 4: Copy the Web App ID
After registration, you'll see your Firebase configuration. Look for the `appId` field:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAmKU3nYzH5UX3Dgcwo7EqZnEaAd-KS0YQ",
  authDomain: "trust-market-platform.firebaseapp.com",
  projectId: "trust-market-platform",
  storageBucket: "trust-market-platform.firebasestorage.app",
  messagingSenderId: "516223323976",
  appId: "1:516223323976:web:XXXXXXXXXXXXXXXXXX",  // ← Copy this value
  measurementId: "G-XXXXXXXXXX"  // Optional
};
```

### Step 5: Update Your Configuration
1. Open `src/core/config/firebase.ts`
2. Find line 21 where it says `YOUR_WEB_APP_ID`
3. Replace it with your actual web appId
4. Save the file

**Example:**
```typescript
appId: Platform.OS === 'web' 
    ? "1:516223323976:web:abc123def456ghi789"  // Your actual web appId
    : "1:516223323976:android:f5323f2b8589c91c0b2d7d"
```

## Verification

After updating the web appId, test your application:

### For Web:
```bash
npm run web
```

### For Mobile (Expo Go):
```bash
npm start
```

Then scan the QR code with Expo Go app.

## Common Issues & Solutions

### Issue 1: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Double-check that you copied the correct `appId` from Firebase Console

### Issue 2: Registration not working on web
**Solution**: 
1. Ensure you've added the web appId
2. Check Firebase Console → Authentication → Sign-in method
3. Enable Email/Password authentication if not already enabled

### Issue 3: "Firebase App named '[DEFAULT]' already exists"
**Solution**: This usually means Firebase is being initialized multiple times. The current configuration should prevent this, but if you see it:
1. Clear your browser cache
2. Restart the development server
3. Check for multiple Firebase initialization calls in your code

## Firebase Console Quick Links

- **Project Overview**: https://console.firebase.google.com/project/trust-market-platform
- **Authentication**: https://console.firebase.google.com/project/trust-market-platform/authentication
- **Firestore Database**: https://console.firebase.google.com/project/trust-market-platform/firestore
- **Storage**: https://console.firebase.google.com/project/trust-market-platform/storage
- **Project Settings**: https://console.firebase.google.com/project/trust-market-platform/settings/general

## Next Steps

1. ✅ Get the web appId from Firebase Console (follow steps above)
2. ✅ Update `src/core/config/firebase.ts` with the actual web appId
3. ✅ Test registration on web platform
4. ✅ Verify user data appears in Firebase Console → Authentication
5. ✅ Test on mobile platform (Android/iOS via Expo Go)

## File Location
**Firebase Configuration**: `src/core/config/firebase.ts`

## Support
If you encounter any issues:
1. Check the Firebase Console for error messages
2. Review the browser console for detailed error logs
3. Ensure all Firebase services (Auth, Firestore, Storage) are enabled in your project

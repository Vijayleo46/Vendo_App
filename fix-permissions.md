# Firebase Permission Fix Guide

## The Problem
You're getting "Missing or insufficient permissions" errors because:
1. Firestore security rules are too restrictive for some operations
2. Authentication state might not be properly established before Firestore operations
3. Some operations are happening before user login

## IMMEDIATE SOLUTION

### Step 1: Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### Step 2: Login and Deploy Rules
```bash
# Login to Firebase
firebase login

# Set the correct project
firebase use trust-market-platform

# Deploy the updated rules (from the trust_market-main directory)
firebase deploy --only firestore:rules
```

### Step 3: Verify the Fix
After deploying the rules, restart your app and test creating products/jobs.

## ALTERNATIVE: Temporary Development Rules

If you can't deploy immediately, you can use these temporary rules in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `trust-market-platform`
3. Go to Firestore Database → Rules
4. Replace with these temporary rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary permissive rules for development
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click "Publish"

⚠️ **WARNING**: These rules are very permissive. Use only for development and replace with proper rules later.

## What Was Fixed in Your Code

### 1. Updated Firestore Rules (`firestore.rules`)
- Made user profile reading more permissive
- Added support for coin transactions
- Added services collection support
- Better permission handling

### 2. Added Authentication Utilities (`src/utils/authUtils.ts`)
- `waitForAuth()` - Wait for authentication to be ready
- `requireAuth()` - Ensure user is authenticated
- `getCurrentUserOrThrow()` - Get current user or throw error
- `isAuthenticated()` - Check authentication status

### 3. Updated Services
- `listingService.ts` - Added authentication checks before operations
- `userService.ts` - Better authentication handling

## Testing Steps

1. **Deploy the rules** (most important step)
2. **Restart your app**: `npm start`
3. **Login with a test account**
4. **Try creating a product/job**
5. **Check console logs** - should see authentication confirmations

## Expected Console Output After Fix
```
[SERVICE] 📝 Creating product: "Your Product Name"
[SERVICE] 🔐 User authenticated: abc123...
[SERVICE] 📂 Target Collection: products
[SERVICE] ✅ Document saved! ID: xyz789...
```

## If Problems Still Persist

### Check Authentication Status
Add this to your app to debug auth:
```javascript
import { auth } from './src/core/config/firebase';

// Add this somewhere in your app
console.log('Current user:', auth.currentUser?.uid || 'Not logged in');
```

### Check Firebase Console
1. **Authentication → Users**: Verify users exist
2. **Firestore → Data**: Check if collections exist
3. **Firestore → Rules**: Verify rules are deployed

### Enable Debug Logging
Add to your app:
```javascript
import { connectFirestoreEmulator } from 'firebase/firestore';
// Only for debugging - remove in production
```

## Production-Ready Rules
Once everything works, replace with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if true;
      allow create, update: if isAuthenticated();
    }

    match /products/{productId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && resource.data.sellerId == request.auth.uid;
    }

    match /jobs/{jobId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && resource.data.sellerId == request.auth.uid;
    }
  }
}
```
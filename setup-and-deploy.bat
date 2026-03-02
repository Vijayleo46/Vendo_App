@echo off
echo 🚀 Firebase Setup and Deployment Script
echo.

echo 📦 Installing Firebase CLI globally...
npm install -g firebase-tools
if %errorlevel% neq 0 (
    echo ❌ Failed to install Firebase CLI
    echo Please run: npm install -g firebase-tools
    pause
    exit /b 1
)

echo.
echo 🔐 Logging into Firebase...
firebase login
if %errorlevel% neq 0 (
    echo ❌ Firebase login failed
    pause
    exit /b 1
)

echo.
echo 🎯 Setting Firebase project...
firebase use trust-market-platform
if %errorlevel% neq 0 (
    echo ❌ Failed to set Firebase project
    echo Please check your project ID
    pause
    exit /b 1
)

echo.
echo 📋 Deploying Firestore rules...
firebase deploy --only firestore:rules
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy Firestore rules
    pause
    exit /b 1
)

echo.
echo ✅ All done! Your Firestore rules have been deployed.
echo 🎉 You can now test your app - the permission errors should be fixed.
echo.
pause
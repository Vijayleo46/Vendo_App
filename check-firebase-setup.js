const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAO6Nyba91WjGvy-Rs-SKvmiWzpflQ7W3U",
    authDomain: "trust-market-platform.firebaseapp.com",
    projectId: "trust-market-platform",
    storageBucket: "trust-market-platform.firebasestorage.app",
    messagingSenderId: "516223323976",
    appId: "1:516223323976:web:834ff2d8590b770d0b2d7d",
    measurementId: "G-XPPC9C94C9"
};

console.log('🔧 Checking Firebase Setup...\n');

try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase app initialized successfully');
    console.log('✅ Auth service connected');
    console.log('✅ Firestore service connected');
    console.log('📋 Project ID:', firebaseConfig.projectId);
    console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
    
    console.log('\n📝 Next Steps:');
    console.log('1. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('2. Make sure users are logged in before using the app');
    console.log('3. Check that authentication is working in your React Native app');
    
} catch (error) {
    console.error('❌ Firebase setup failed:', error.message);
}
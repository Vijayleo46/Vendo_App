import { initializeApp } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-specific configuration
// Note: Firebase JS SDK v12+ handles persistence automatically for both web and React Native
let auth: Auth;
if (Platform.OS === 'web') {
    // Web uses browser's built-in persistence (localStorage by default)
    auth = getAuth(app);
} else {
    // React Native - Config with AsyncStorage persistence
    const { getReactNativePersistence } = require('firebase/auth');
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { auth, db, storage };


const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAO6Nyba91WjGvy-Rs-SKvmiWzpflQ7W3U",
    authDomain: "trust-market-platform.firebaseapp.com",
    projectId: "trust-market-platform",
    storageBucket: "trust-market-platform.firebasestorage.app",
    messagingSenderId: "516223323976",
    appId: "1:516223323976:web:1c2391510b766fe90b2d7d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Mock a file for upload
const testFileName = 'test-upload.txt';
const testFilePath = path.join(__dirname, testFileName);
fs.writeFileSync(testFilePath, 'This is a test file for Firebase Storage upload verification.');

async function uploadTestFile() {
    console.log('🚀 Starting test upload...');

    try {
        const fileContent = fs.readFileSync(testFilePath);
        const folder = 'jobs'; // Using 'jobs' folder as it was the one missing permissions
        const remotePath = `${folder}/test-${Date.now()}.txt`;
        const storageRef = ref(storage, remotePath);

        const metadata = {
            contentType: 'text/plain',
        };

        console.log(`📤 Uploading to: ${remotePath}`);

        // In Node.js environment, we can pass Buffer directly to uploadBytes
        const snapshot = await uploadBytes(storageRef, fileContent, metadata);
        console.log('✅ Upload successful!');

        const url = await getDownloadURL(snapshot.ref);
        console.log('🔗 File available at:', url);

        console.log('🎉 Verification PASSED: Storage rules are working for "jobs" folder.');

    } catch (error) {
        console.error('❌ Upload FAILED:', error.code, error.message);
        if (error.code === 'storage/unauthorized') {
            console.error('⚠️  Reason: Permission denied. Please check your storage rules in the Firebase Console.');
        } else {
            console.error('⚠️  Reason: Unknown error. Check your network or configuration.');
        }
    } finally {
        // Cleanup
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    }
}

uploadTestFile();

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously, onAuthStateChanged } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

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
const auth = getAuth(app);
const db = getFirestore(app);

async function testAuthAndFirestore() {
    console.log('🧪 Testing Authentication and Firestore...\n');

    try {
        // Test 1: Anonymous Authentication
        console.log('1️⃣ Testing Anonymous Authentication...');
        const userCredential = await signInAnonymously(auth);
        console.log('✅ Anonymous auth successful!');
        console.log('   User ID:', userCredential.user.uid);

        // Test 2: Wait for auth state
        console.log('\n2️⃣ Waiting for auth state...');
        await new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log('✅ Auth state confirmed!');
                    console.log('   Current user:', user.uid);
                    unsubscribe();
                    resolve();
                }
            });
        });

        // Test 3: Try to read from products collection
        console.log('\n3️⃣ Testing Firestore read (products)...');
        const productsSnapshot = await getDocs(collection(db, 'products'));
        console.log('✅ Products read successful!');
        console.log('   Products count:', productsSnapshot.size);

        // Test 4: Try to create a test document
        console.log('\n4️⃣ Testing Firestore write (products)...');
        const testProduct = {
            title: 'Test Product',
            description: 'This is a test product',
            price: '100',
            category: 'Electronics',
            images: [],
            sellerId: userCredential.user.uid,
            sellerName: 'Test User',
            type: 'product',
            createdAt: new Date()
        };

        const docRef = await addDoc(collection(db, 'products'), testProduct);
        console.log('✅ Product creation successful!');
        console.log('   Document ID:', docRef.id);

        console.log('\n🎉 All tests passed! Authentication and Firestore are working correctly.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Error code:', error.code);
        
        if (error.code === 'permission-denied') {
            console.log('\n🔧 Troubleshooting steps:');
            console.log('1. Deploy the updated Firestore rules: firebase deploy --only firestore:rules');
            console.log('2. Make sure you\'re using the correct Firebase project');
            console.log('3. Check that Firestore is enabled in your Firebase console');
        }
    }
}

testAuthAndFirestore();
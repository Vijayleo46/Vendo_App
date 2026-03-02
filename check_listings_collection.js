const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAO6Nyba91WjGvy-Rs-SKvmiWzpflQ7W3U",
    authDomain: "trust-market-platform.firebaseapp.com",
    projectId: "trust-market-platform",
    storageBucket: "trust-market-platform.firebasestorage.app",
    messagingSenderId: "516223323976",
    appId: "1:516223323976:web:834ff2d8590b770d0b2d7d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkListings() {
    console.log('--- Checking "listings" collection ---');
    try {
        const snap = await getDocs(collection(db, 'listings'));
        console.log(`Found ${snap.size} documents in "listings"`);
        snap.docs.forEach(doc => {
            const data = doc.data();
            console.log(`[${doc.id}] Title: ${data.title}, Type: ${data.type}, Seller: ${data.sellerId || data.ownerId}`);
        });

        console.log('\n--- Checking "products" collection ---');
        const pSnap = await getDocs(collection(db, 'products'));
        console.log(`Found ${pSnap.size} documents in "products"`);

        console.log('\n--- Checking "jobs" collection ---');
        const jSnap = await getDocs(collection(db, 'jobs'));
        console.log(`Found ${jSnap.size} documents in "jobs"`);

    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkListings();

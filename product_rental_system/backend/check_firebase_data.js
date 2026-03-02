const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    getDocs,
    query,
    limit
} = require('firebase/firestore');

const db = getFirestore(app);

async function checkData() {
    console.log('=== Firestore Client SDK Audit ===');

    try {
        // 1. Audit Users
        console.log('\n--- USERS ---');
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(5)));
        usersSnap.docs.forEach(doc => {
            const data = doc.data();
            console.log(`[UID: ${doc.id}] Email: ${data.email}, Name: ${data.displayName}`);
        });

        // 2. Audit Products
        console.log('\n--- PRODUCTS ---');
        const productsSnap = await getDocs(query(collection(db, 'products'), limit(5)));
        productsSnap.docs.forEach(doc => {
            const data = doc.data();
            console.log(`[ID: ${doc.id}] Title: "${data.title}", Cat: ${data.category}`);
        });

    } catch (error) {
        console.error('Audit failed:', error);
    }

    process.exit();
}

checkData();

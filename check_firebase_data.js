const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

async function checkData() {
    console.log('--- Firebase Data Check ---');

    try {
        const usersSnap = await db.collection('users').get();
        console.log(`Total Users: ${usersSnap.size}`);

        const admins = usersSnap.docs.filter(doc => doc.data().isAdmin === true);
        console.log(`Admin Users: ${admins.length}`);
        admins.forEach(doc => {
            console.log(` - Admin Email: ${doc.data().email}, UID: ${doc.id}`);
        });

        const productsSnap = await db.collection('products').get();
        console.log(`Total Products: ${productsSnap.size}`);

        const jobsSnap = await db.collection('jobs').get();
        console.log(`Total Jobs: ${jobsSnap.size}`);

        if (productsSnap.size === 0 && jobsSnap.size === 0) {
            console.log('WARNING: Both products and jobs collections are EMPTY.');
        }

    } catch (error) {
        console.error('Error checking Firebase data:', error.message);
    }
    process.exit();
}

checkData();

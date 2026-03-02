const admin = require('firebase-admin');

// IMPORTANT: This script uses the environment's default credentials.
// On a local machine, you should set the GOOGLE_APPLICATION_CREDENTIALS environment variable 
// to the path of your service account key JSON file.

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

// REPLACE WITH THE EMAIL YOU WANT TO MAKE ADMIN
const USER_EMAIL = 'vijay@example.com'; // User, please update this or I will prompt you if I can't find it.

async function makeAdmin(email) {
    console.log(`--- Granting Admin Privileges to: ${email} ---`);

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();

        if (snapshot.empty) {
            console.error('❌ No user found with that email address.');
            process.exit(1);
        }

        const userDoc = snapshot.docs[0];
        const userId = userDoc.id;

        await usersRef.doc(userId).update({
            isAdmin: true,
            kycStatus: 'verified' // Also verify them so they can login based on existing logic
        });

        console.log(`✅ Success! User ${email} (UID: ${userId}) is now an ADMIN.`);

    } catch (error) {
        console.error('❌ Error updating user:', error.message);
    }
    process.exit();
}

makeAdmin(USER_EMAIL);

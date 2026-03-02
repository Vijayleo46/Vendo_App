const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');

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
const db = getFirestore(app);

// നിന്റെ email ഇവിടെ കൊടുക്കുക
const USER_EMAIL = 'vijay@example.com'; // ഇത് നിന്റെ actual email ആക്കുക

async function makeAdmin(email) {
    console.log(`🔧 Making ${email} an admin...`);

    try {
        // Find user by email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.error('❌ No user found with that email address.');
            console.log('💡 Make sure you:');
            console.log('   1. Have registered in the app with this email');
            console.log('   2. Updated the USER_EMAIL in this script');
            return;
        }

        const userDoc = snapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        console.log('👤 Found user:', userData.displayName || 'No name');
        console.log('📧 Email:', userData.email);
        console.log('🆔 UID:', userId);

        // Update user to admin
        await updateDoc(doc(db, 'users', userId), {
            isAdmin: true,
            kycStatus: 'verified'
        });

        console.log('✅ Success! You are now an ADMIN!');
        console.log('🎉 You can now access the Admin Dashboard in your app');
        console.log('📱 Go to Profile → Admin Dashboard');

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 'permission-denied') {
            console.log('\n🔧 Fix needed:');
            console.log('1. Deploy Firebase rules first');
            console.log('2. Make sure you are logged into the app');
            console.log('3. Try again after fixing permissions');
        }
    }
}

// Check if email is updated
if (USER_EMAIL === 'your-email@gmail.com') {
    console.log('⚠️  Please update USER_EMAIL in this script with your actual email!');
    console.log('📝 Edit line 15: const USER_EMAIL = "your-actual-email@gmail.com";');
} else {
    makeAdmin(USER_EMAIL);
}
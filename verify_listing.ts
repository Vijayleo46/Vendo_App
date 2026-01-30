import { db } from './src/core/config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

async function verifyLatestListing() {
    console.log('=== VERIFYING LATEST LISTING ===');
    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('❌ No listings found in "products" collection.');
            return;
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();
        console.log('✅ Found Listing!');
        console.log('ID:', doc.id);
        console.log('Title:', data.title);
        console.log('Price:', data.price);
        console.log('Images:', data.images?.length || 0);
        console.log('Images URLs:', data.images);
        console.log('Created At:', data.createdAt?.toDate().toLocaleString());
    } catch (error) {
        console.error('❌ Error during verification:', error);
    }
}

verifyLatestListing();

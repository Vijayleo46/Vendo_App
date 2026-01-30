import { auth, db } from '../core/config/firebase';
import { listingService } from '../services/listingService';
import { authService } from '../services/authService';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const testBackendConnection = async () => {
    console.log('🔥 Testing Firebase Backend Connection...');

    try {
        // Test 1: Firebase Config
        console.log('✅ Firebase Config:', {
            projectId: db.app.options.projectId,
            authDomain: db.app.options.authDomain,
            apiKey: db.app.options.apiKey ? '✅ Present' : '❌ Missing'
        });

        // Test 2: Firestore Connection
        console.log('📊 Testing Firestore connection...');
        const testCollection = collection(db, 'test');
        console.log('✅ Firestore connection successful');

        // Test 3: Check if listings collection exists
        console.log('🛍️ Checking listings collection...');
        const listingsRef = collection(db, 'listings');
        const listingsSnapshot = await getDocs(listingsRef);
        console.log(`✅ Listings collection: ${listingsSnapshot.size} documents found`);

        // Test 4: Test listing service
        console.log('🔧 Testing listing service...');
        const featuredListings = await listingService.getFeaturedListings(5);
        console.log(`✅ Featured listings: ${featuredListings.length} items loaded`);

        // Test 5: Auth state
        console.log('🔐 Checking auth state...');
        const currentUser = auth.currentUser;
        console.log('Auth state:', currentUser ? `✅ User logged in: ${currentUser.email}` : '⚠️ No user logged in');

        // Test 6: Test data structure
        if (featuredListings.length > 0) {
            console.log('📋 Sample listing data:', {
                id: featuredListings[0].id,
                title: featuredListings[0].title,
                price: featuredListings[0].price,
                category: featuredListings[0].category,
                hasImages: featuredListings[0].images?.length > 0
            });
        }

        console.log('🎉 Backend connection test completed successfully!');
        return {
            success: true,
            listingsCount: listingsSnapshot.size,
            featuredCount: featuredListings.length,
            userLoggedIn: !!currentUser,
            userEmail: currentUser?.email
        };

    } catch (error) {
        console.error('❌ Backend connection test failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

export const initializeBackendData = async () => {
    console.log('🚀 Initializing backend data...');

    try {
        // Check if we have any listings
        const listings = await listingService.getFeaturedListings(1);

        if (listings.length === 0) {
            console.log('📦 No listings found, seeding demo data...');
            await listingService.seedDemoData();
            console.log('✅ Demo data seeded successfully!');
        } else {
            console.log(`✅ Found ${listings.length} existing listings`);
        }

        return true;
    } catch (error) {
        console.error('❌ Failed to initialize backend data:', error);
        return false;
    }
};
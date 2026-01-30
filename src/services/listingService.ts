import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '../core/config/firebase';
import { userService } from './userService';
import { coinTransactionService } from './coinTransactionService';

export interface Listing {
    id?: string;
    title: string;
    description: string;
    price: string;
    category: string;
    images: string[];
    sellerId: string;
    sellerName: string;
    location?: string;
    createdAt?: Timestamp;
    rating: number;
    type: 'product' | 'job' | 'service';
    condition?: 'New' | 'Used' | 'Refurbished';
    enableChat?: boolean;
    showPhone?: boolean;
    isBoosted?: boolean;
    boostExpiresAt?: Timestamp;
    sellerTrustScore?: number;

    // Job specific fields
    salaryRange?: string;
    jobType?: string;
    skills?: string[];
    experienceLevel?: string;
    companyName?: string;
    companyLogo?: string;
    deadline?: Timestamp;
    applicationUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    workMode?: 'Onsite' | 'Remote' | 'Hybrid';
    status?: 'active' | 'sold' | 'expired' | 'pending' | 'closed';
    views?: number;
    chatsCount?: number;
    applicantsCount?: number;
    oldPrice?: string;
}

export const listingService = {
    // Helper to get collection name based on type
    getCollectionName: (type: Listing['type']) => {
        if (type === 'job') return 'jobs';
        return 'products'; // services and products go to products for now or add 'services'
    },

    // Create a new listing
    createListing: async (listing: Omit<Listing, 'id' | 'createdAt'>) => {
        console.log(`[SERVICE] 📝 Creating ${listing.type}: "${listing.title}"`);
        try {
            const collectionName = listingService.getCollectionName(listing.type);
            console.log(`[SERVICE] 📂 Target Collection: ${collectionName}`);

            const dataToSave = {
                ...listing,
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, collectionName), dataToSave);
            const newId = docRef.id;
            console.log(`[SERVICE] ✅ Document saved! ID: ${newId}`);

            // Award coins and set trust score in the background - don't block the UI
            (async () => {
                try {
                    console.log(`[SERVICE] 🪙 Starting post-listing rewards for ${listing.sellerId}...`);
                    await userService.updateCoins(listing.sellerId, 3, 'New Listing Reward', {
                        type: listing.type,
                        listingId: newId
                    });

                    const sellerProfile = await userService.getProfile(listing.sellerId);
                    if (sellerProfile?.trustScore) {
                        await updateDoc(docRef, { sellerTrustScore: sellerProfile.trustScore });
                        console.log(`[SERVICE] 📈 Initial Trust Score set: ${sellerProfile.trustScore}`);
                    }
                } catch (e: any) {
                    console.error('[SERVICE] ⚠️ Minor error in background post-listing logic:', e.message);
                }
            })();

            return newId;
        } catch (error: any) {
            console.error(`[SERVICE] ❌ FATAL ERROR adding ${listing.type}: `, error.message);
            throw error;
        }
    },

    // Get featured listings (Combined from products and jobs)
    getFeaturedListings: async (listingLimit = 10) => {
        try {
            const productQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(listingLimit));
            const jobQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(listingLimit));

            const [productSnap, jobSnap] = await Promise.all([getDocs(productQuery), getDocs(jobQuery)]);

            const products = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
            const jobs = jobSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));

            // Merge and sort: Boosted first, then by createdAt
            return [...products, ...jobs]
                .sort((a, b) => {
                    // Boosted items first
                    if (a.isBoosted && !b.isBoosted) return -1;
                    if (!a.isBoosted && b.isBoosted) return 1;

                    // Then by createdAt
                    const timeA = a.createdAt?.toMillis() || 0;
                    const timeB = b.createdAt?.toMillis() || 0;
                    return timeB - timeA;
                })
                .slice(0, listingLimit);
        } catch (error) {
            console.error("Error fetching featured listings: ", error);
            return [];
        }
    },

    // Get listings by category
    getListingsByCategory: async (category: string) => {
        try {
            const collectionName = category === 'Jobs' ? 'jobs' : 'products';
            const q = query(
                collection(db, collectionName),
                where('category', '==', category),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        } catch (error) {
            console.error("Error fetching category listings: ", error);
            throw error;
        }
    },

    // Get listing by ID (Now needs to check both collections if type is unknown)
    getListingById: async (id: string, type?: Listing['type']) => {
        try {
            if (type) {
                const docRef = doc(db, listingService.getCollectionName(type), id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Listing;
            } else {
                // Try products first
                const pRef = doc(db, 'products', id);
                const pSnap = await getDoc(pRef);
                if (pSnap.exists()) return { id: pSnap.id, ...pSnap.data() } as Listing;

                // Then jobs
                const jRef = doc(db, 'jobs', id);
                const jSnap = await getDoc(jRef);
                if (jSnap.exists()) return { id: jSnap.id, ...jSnap.data() } as Listing;
            }
            return null;
        } catch (error) {
            console.error("Error fetching listing by ID: ", error);
            throw error;
        }
    },

    // Search listings
    searchListings: async (searchQuery: string, location?: string) => {
        try {
            const productSnap = await getDocs(query(collection(db, 'products'), limit(50)));
            const jobSnap = await getDocs(query(collection(db, 'jobs'), limit(50)));

            const all = [
                ...productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing)),
                ...jobSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing))
            ];

            let results = all;

            if (searchQuery) {
                const queryLower = searchQuery.toLowerCase();
                results = results.filter(l => l.title.toLowerCase().includes(queryLower));
            }

            if (location) {
                const locationLower = location.toLowerCase();
                results = results.filter(l => l.location?.toLowerCase().includes(locationLower));
            }

            // Sort: Boosted first, then by trust score, then by date
            results.sort((a, b) => {
                if (a.isBoosted && !b.isBoosted) return -1;
                if (!a.isBoosted && b.isBoosted) return 1;

                const trustA = a.sellerTrustScore || 0;
                const trustB = b.sellerTrustScore || 0;
                if (trustA !== trustB) return trustB - trustA;

                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeB - timeA;
            });

            return results;
        } catch (error) {
            console.error("Error searching listings: ", error);
            throw error;
        }
    },

    // Get listings by user
    getListingsByUser: async (userId: string) => {
        try {
            const pQuery = query(collection(db, 'products'), where('sellerId', '==', userId));
            const jQuery = query(collection(db, 'jobs'), where('sellerId', '==', userId));

            const [pSnap, jSnap] = await Promise.all([getDocs(pQuery), getDocs(jQuery)]);

            return [
                ...pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing)),
                ...jSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing))
            ];
        } catch (error) {
            console.error("Error fetching user listings: ", error);
            throw error;
        }
    },

    // Get total listing count
    getListingCount: async () => {
        try {
            const [pSnap, jSnap] = await Promise.all([
                getDocs(collection(db, 'products')),
                getDocs(collection(db, 'jobs'))
            ]);
            return pSnap.size + jSnap.size;
        } catch (error) {
            console.error("Error getting listing count: ", error);
            return 0;
        }
    },

    // Get trending listings (high rating)
    getTrendingListings: async (listingLimit = 4) => {
        try {
            const pQuery = query(collection(db, 'products'), orderBy('rating', 'desc'), limit(listingLimit));
            const jQuery = query(collection(db, 'jobs'), orderBy('rating', 'desc'), limit(listingLimit));

            const [pSnap, jSnap] = await Promise.all([getDocs(pQuery), getDocs(jQuery)]);

            return [
                ...pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing)),
                ...jSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing))
            ].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, listingLimit);
        } catch (error) {
            console.error("Error fetching trending listings: ", error);
            return listingService.getFeaturedListings(listingLimit);
        }
    },

    // Get similar listings by category
    getSimilarListings: async (category: string, currentId?: string, listingLimit = 4) => {
        try {
            const collectionName = category === 'Jobs' ? 'jobs' : 'products';
            const q = query(
                collection(db, collectionName),
                where('category', '==', category),
                limit(listingLimit + 1)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Listing))
                .filter(item => item.id !== currentId)
                .slice(0, listingLimit);
        } catch (error) {
            console.error("Error fetching similar listings: ", error);
            return [];
        }
    },

    // Seed demo data
    seedDemoData: async () => {
        try {
            const user = auth.currentUser;
            const sellerId = user?.uid || 'demo_user';
            const sellerName = user?.displayName || 'Demo User';

            const demoListings: Omit<Listing, 'id' | 'createdAt'>[] = [
                // User Request Specific Items
                {
                    title: 'Ultimate Gaming Build',
                    description: 'Full custom gaming setup. RTX 4090, i9-14900K, 64GB DDR5. Perfect for content creation and 4K gaming.',
                    price: '3500',
                    category: 'Electronics',
                    images: [
                        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=1000'
                    ],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 5.0,
                    type: 'product',
                    location: 'San Francisco, CA',
                    condition: 'New',
                    enableChat: true,
                    status: 'active',
                    views: 150,
                    chatsCount: 2
                },
                {
                    title: 'Senior Mobile Architect',
                    description: 'We are looking for a visionary Mobile Architect to lead our engineering team. You will be responsible for defining the technical roadmap and mentoring senior developers.',
                    price: '45L - 60L',
                    category: 'Jobs',
                    images: ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000'],
                    sellerId: 'admin',
                    sellerName: user?.displayName || 'Leo',
                    rating: 5,
                    type: 'job',
                    location: 'Bangalore, India',
                    condition: 'New',
                    jobType: 'Full Time',
                    salaryRange: '45L - 60L',
                    skills: ['React Native', 'Swift', 'Kotlin', 'System Design', 'Team Leadership'],
                    experienceLevel: 'Senior (8+ years)',
                    companyName: user?.displayName || 'Leo',
                    workMode: 'Hybrid',
                    enableChat: true,
                    status: 'active',
                    views: 320,
                    chatsCount: 15
                },
                {
                    title: 'UX/UI Designer',
                    description: 'We need a creative designer for our new startup. Remote friendly.',
                    price: '80k/yr',
                    category: 'Jobs',
                    images: ['https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 0,
                    type: 'job',
                    location: 'New York, NY',
                    condition: 'New',
                    enableChat: true,
                    status: 'active',
                    views: 1200,
                    chatsCount: 5
                },
                {
                    title: 'Senior React Native Developer',
                    description: 'Looking for an expert to build a marketplace app. Must know Expo and Firebase.',
                    price: 'Remote',
                    category: 'Jobs',
                    images: ['https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 0,
                    type: 'job',
                    location: 'Remote',
                    condition: 'New',
                    enableChat: true,
                    status: 'active',
                    views: 3500,
                    chatsCount: 15
                },
                {
                    title: 'Professional Home Cleaning',
                    description: 'Top rated cleaning service in Seattle. We use eco-friendly products.',
                    price: '50/hr',
                    category: 'Services',
                    images: ['https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 4.8,
                    type: 'service',
                    location: 'Seattle, WA',
                    enableChat: true,
                    status: 'active',
                    views: 890,
                    chatsCount: 20
                },
                {
                    title: 'Modern Downtown Loft',
                    description: 'Beautiful loft in the heart of Chicago. Close to all amenities.',
                    price: '2800/mo',
                    category: 'Real Estate',
                    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 4.9,
                    type: 'product',
                    location: 'Chicago, IL',
                    enableChat: true,
                    status: 'active',
                    views: 5000,
                    chatsCount: 45
                }
            ];

            const promises = demoListings.map(item => listingService.createListing(item));
            await Promise.all(promises);
            console.log('Demo data seeded successfully');
        } catch (error) {
            console.error("Error seeding demo data: ", error);
            throw error;
        }
    },

    // Delete a listing and award SuperCoins
    deleteListing: async (id: string, type: Listing['type']) => {
        try {
            const collectionName = listingService.getCollectionName(type);
            const docRef = doc(db, collectionName, id);

            // 1. Fetch listing details to get sellerId
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as Listing;
                if (data.sellerId) {
                    console.log(`[SERVICE] 🪙 Awarding coins for removing listing: ${id}`);
                    // Award 5 coins for "Listing Removal"
                    await userService.updateCoins(data.sellerId, 5, 'Listing Removal Reward', { listingId: id, type });
                }
            }

            // 2. Delete the document
            await deleteDoc(docRef);
            console.log(`[SERVICE] 🗑️ Listing ${id} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting listing: ", error);
            throw error;
        }
    },

    // Update listing status
    updateListingStatus: async (id: string, type: Listing['type'], status: string) => {
        try {
            const collectionName = listingService.getCollectionName(type);
            const listingRef = doc(db, collectionName, id);

            // Get listing to find sellerId if status is 'sold'
            if (status === 'sold') {
                const listingSnap = await getDoc(listingRef);
                if (listingSnap.exists()) {
                    const data = listingSnap.data() as Listing;
                    if (data.sellerId && data.status !== 'sold') {
                        // Award 10 coins to seller (Increased reward as per design)
                        await userService.updateCoins(data.sellerId, 10, 'Sale Completion Reward', { listingId: id });

                        // Update sale stats for trust score
                        const userRef = doc(db, 'users', data.sellerId);
                        const userSnap = await getDoc(userRef);
                        const currentStats = userSnap.exists() ? (userSnap.data()?.stats || {}) : {};
                        await updateDoc(userRef, {
                            'stats.totalSales': (currentStats.totalSales || 0) + 1
                        });

                        // Recalculate trust score
                        await userService.recalculateTrustScore(data.sellerId);
                    }
                }
            }

            await updateDoc(listingRef, { status });
        } catch (error) {
            console.error("Error updating listing status: ", error);
            throw error;
        }
    },

    // Boost a listing
    boostListing: async (id: string, type: Listing['type'], userId: string) => {
        try {
            // 1. Check if user has enough coins (20 SC as per design)
            const profile = await userService.getProfile(userId);
            if (!profile || (profile.coins || 0) < 20) {
                throw new Error('Insufficient SuperCoins to boost this listing.');
            }

            // 2. Deduct coins
            await userService.updateCoins(userId, -20, 'Listing Boost', { listingId: id });

            // 3. Update listing with boost fields (Expires in 24h)
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 24);

            await updateDoc(doc(db, listingService.getCollectionName(type), id), {
                isBoosted: true,
                boostExpiresAt: Timestamp.fromDate(expiryDate)
            });

            return true;
        } catch (error) {
            console.error("Error boosting listing: ", error);
            throw error;
        }
    },

    // --- Wishlist Methods ---

    // Add to wishlist
    addToWishlist: async (userId: string, listingId: string) => {
        console.log('=== ADD TO WISHLIST SERVICE ===');
        console.log('User ID:', userId);
        console.log('Listing ID:', listingId);

        try {
            const wishlistRef = doc(db, 'users', userId, 'wishlist', listingId);
            await setDoc(wishlistRef, {
                listingId,
                addedAt: serverTimestamp()
            });
            console.log('✅ Added to wishlist in Firebase');
        } catch (error: any) {
            console.error('=== ADD TO WISHLIST ERROR ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    // Remove from wishlist
    removeFromWishlist: async (userId: string, listingId: string) => {
        console.log('=== REMOVE FROM WISHLIST SERVICE ===');
        console.log('User ID:', userId);
        console.log('Listing ID:', listingId);

        try {
            const wishlistRef = doc(db, 'users', userId, 'wishlist', listingId);
            await deleteDoc(wishlistRef);
            console.log('✅ Removed from wishlist in Firebase');
        } catch (error: any) {
            console.error('=== REMOVE FROM WISHLIST ERROR ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    // Check if item is in wishlist
    isInWishlist: async (userId: string, listingId: string) => {
        console.log('=== CHECK WISHLIST SERVICE ===');
        console.log('User ID:', userId);
        console.log('Listing ID:', listingId);

        try {
            const wishlistRef = doc(db, 'users', userId, 'wishlist', listingId);
            const docSnap = await getDoc(wishlistRef);
            const exists = docSnap.exists();
            console.log('Is in wishlist:', exists);
            return exists;
        } catch (error: any) {
            console.error('=== CHECK WISHLIST ERROR ===');
            console.error('Error:', error);
            return false;
        }
    },

    // Get user's wishlist items (including listing data)
    getWishlistItems: async (userId: string) => {
        console.log('=== GET WISHLIST ITEMS SERVICE ===');
        console.log('User ID:', userId);

        try {
            const wishlistRef = collection(db, 'users', userId, 'wishlist');
            const querySnapshot = await getDocs(wishlistRef);
            console.log('Wishlist documents found:', querySnapshot.size);

            const itemPromises = querySnapshot.docs.map(async (wishlistDoc) => {
                const listingId = wishlistDoc.data().listingId;
                console.log('Fetching listing:', listingId);

                const listing = await listingService.getListingById(listingId);

                if (listing) {
                    console.log('✅ Listing found:', listingId);
                    return listing;
                } else {
                    console.log('❌ Listing not found:', listingId);
                }
                return null;
            });

            const results = await Promise.all(itemPromises);
            const validItems = results.filter(item => item !== null) as Listing[];
            console.log('✅ Total valid wishlist items:', validItems.length);
            return validItems;
        } catch (error: any) {
            console.error('=== GET WISHLIST ITEMS ERROR ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    }
};

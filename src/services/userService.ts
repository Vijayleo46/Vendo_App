import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../core/config/firebase';
import { coinTransactionService } from './coinTransactionService';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phone?: string;
    bio?: string;
    location?: string;
    createdAt: any;
    updatedAt?: any;
    coins?: number;
    trustScore?: number;
    kycStatus: 'pending' | 'verified' | 'unverified';
    stats?: {
        totalSales: number;
        positiveReviews: number;
        reportsReceived: number;
    };
    settings?: {
        notifications: boolean;
        marketing: boolean;
        biometric: boolean;
    };
    isAdmin?: boolean;
}

export const userService = {
    // Get total user count
    getUserCount: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            return querySnapshot.size;
        } catch (error) {
            console.error("Error getting user count: ", error);
            return 0;
        }
    },

    // Get user profile
    getUserProfile: async (uid: string) => {
        console.log('=== GET USER PROFILE ===');
        console.log('User ID:', uid);
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log('✅ Profile found:', docSnap.data());
                return docSnap.data() as UserProfile;
            }
            console.log('❌ Profile not found');
            return null;
        } catch (error: any) {
            console.error("=== GET PROFILE ERROR ===");
            console.error("Error:", error);
            throw error;
        }
    },

    // Alias for getUserProfile
    getProfile: async (uid: string) => {
        return userService.getUserProfile(uid);
    },

    // Update user profile (creates if doesn't exist)
    updateProfile: async (uid: string, data: Partial<UserProfile>) => {
        console.log('=== UPDATE USER PROFILE ===');
        console.log('User ID:', uid);
        console.log('Data:', data);
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, data, { merge: true });
            console.log('✅ Profile updated in Firestore');
        } catch (error: any) {
            console.error("=== UPDATE PROFILE ERROR ===");
            console.error("Error:", error);
            throw error;
        }
    },

    // Update user settings
    updateSettings: async (uid: string, settings: UserProfile['settings']) => {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, { settings }, { merge: true });
            console.log('✅ Settings saved to backend');
        } catch (error) {
            console.error("Error updating settings: ", error);
            throw error;
        }
    },

    // Add/Deduct coins and record transaction
    updateCoins: async (uid: string, amount: number, reason: string, metadata?: any) => {
        try {
            const userRef = doc(db, 'users', uid);
            const type = amount >= 0 ? 'earn' : 'spend';

            await setDoc(userRef, {
                coins: increment(amount),
                updatedAt: new Date()
            }, { merge: true });

            await coinTransactionService.addTransaction(uid, Math.abs(amount), type, reason, metadata);

            // Re-calculate trust score after coin change
            await userService.recalculateTrustScore(uid);

            return true;
        } catch (error) {
            console.error('Error updating coins:', error);
            throw error;
        }
    },

    // Recalculate trust score based on behavior
    recalculateTrustScore: async (uid: string) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return;

            const data = userSnap.data() as UserProfile;
            let score = 50; // Base score

            // KYC boost
            if (data.kycStatus === 'verified') score += 20;

            // Sales boost
            const sales = data.stats?.totalSales || 0;
            score += Math.min(sales * 2, 20); // Max 20 points for sales

            // Coin weight (proxy for engagement)
            const coins = data.coins || 0;
            score += Math.min(Math.floor(coins / 10), 10); // Max 10 points

            // Penalties
            const reports = data.stats?.reportsReceived || 0;
            score -= (reports * 15);

            // Clamp to 0-100
            const finalScore = Math.max(0, Math.min(100, score));

            await updateDoc(userRef, { trustScore: finalScore });
            console.log(`✅ Trust score for ${uid} updated to ${finalScore}`);
            return finalScore;
        } catch (error) {
            console.error('Error recalculating trust score:', error);
        }
    }
};

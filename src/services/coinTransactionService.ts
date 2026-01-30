import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../core/config/firebase';

export interface CoinTransaction {
    id?: string;
    userId: string;
    amount: number;
    type: 'earn' | 'spend';
    reason: string;
    metadata?: any;
    timestamp: Timestamp;
}

export const coinTransactionService = {
    // Add a new transaction record
    addTransaction: async (userId: string, amount: number, type: 'earn' | 'spend', reason: string, metadata?: any) => {
        try {
            await addDoc(collection(db, 'coin_transactions'), {
                userId,
                amount,
                type,
                reason,
                metadata: metadata || {},
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('Error recording coin transaction:', error);
        }
    },

    // Get user's transaction history
    getUserTransactions: async (userId: string, txLimit = 20) => {
        try {
            const q = query(
                collection(db, 'coin_transactions'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(txLimit)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoinTransaction));
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    }
};

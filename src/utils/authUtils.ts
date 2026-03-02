import { auth } from '../core/config/firebase';
import { User } from 'firebase/auth';

/**
 * Wait for authentication to be ready
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise<User | null>
 */
export const waitForAuth = (timeout: number = 5000): Promise<User | null> => {
    return new Promise((resolve, reject) => {
        // If already authenticated, return immediately
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }

        const timeoutId = setTimeout(() => {
            unsubscribe();
            reject(new Error('Authentication timeout'));
        }, timeout);

        const unsubscribe = auth.onAuthStateChanged((user) => {
            clearTimeout(timeoutId);
            unsubscribe();
            resolve(user);
        });
    });
};

/**
 * Ensure user is authenticated before proceeding
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise<User>
 * @throws Error if not authenticated
 */
export const requireAuth = async (timeout: number = 5000): Promise<User> => {
    const user = await waitForAuth(timeout);
    if (!user) {
        throw new Error('User must be authenticated to perform this action');
    }
    return user;
};

/**
 * Get current user or throw error
 * @returns User
 * @throws Error if not authenticated
 */
export const getCurrentUserOrThrow = (): User => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User must be authenticated to perform this action');
    }
    return user;
};

/**
 * Check if user is currently authenticated
 * @returns boolean
 */
export const isAuthenticated = (): boolean => {
    return auth.currentUser !== null;
};
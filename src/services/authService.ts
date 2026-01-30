import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail,
    User
} from 'firebase/auth';
import { auth } from '../core/config/firebase';

export const authService = {
    // Sign up new user
    register: async (email: string, password: string, displayName?: string) => {
        console.log('=== REGISTER ATTEMPT ===');
        console.log('Email:', email);
        console.log('Display Name:', displayName);

        try {
            console.log('Creating user with Firebase...');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ User created:', userCredential.user.uid);

            // Update display name if provided
            if (displayName) {
                console.log('Updating display name...');
                await updateProfile(userCredential.user, {
                    displayName: displayName
                });
                console.log('✅ Display name updated');
            }

            return userCredential.user;
        } catch (error: any) {
            console.error('=== REGISTER ERROR ===');
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    // Login user
    login: async (email: string, password: string) => {
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Email:', email);
        console.log('Password length:', password.length);

        try {
            console.log('Calling Firebase signInWithEmailAndPassword...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ Login successful!');
            console.log('User ID:', userCredential.user.uid);
            console.log('User Email:', userCredential.user.email);
            return userCredential.user;
        } catch (error: any) {
            console.error('=== LOGIN ERROR ===');
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    // Logout user
    logout: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            throw error;
        }
    },

    // Subscribe to auth state changes
    subscribeToAuthChanges: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, callback);
    },

    // Get current user
    getCurrentUser: () => {
        return auth.currentUser;
    },

    // Send verification email
    sendVerificationEmail: async (user: User) => {
        console.log('Sending verification email to:', user.email);
        try {
            await sendEmailVerification(user);
            console.log('✅ Verification email sent');
        } catch (error: any) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    },

    // Send password reset email
    sendPasswordReset: async (email: string) => {
        console.log('Sending password reset email to:', email);
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('✅ Password reset email sent');
        } catch (error: any) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
    }
};

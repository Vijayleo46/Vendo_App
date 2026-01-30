import { db, storage } from '../core/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface KycData {
    documentType: string;
    documentNumber: string;
    userId: string;
}

export const submitKyc = async (userId: string, data: Omit<KycData, 'userId'>, imageUri: string) => {
    try {
        // 1. Upload Image
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const filename = `doc_${Date.now()}.jpg`;
        const storageRef = ref(storage, `kyc/${userId}/${filename}`);

        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);

        // 2. Create Firestore Record
        const kycRef = collection(db, 'kyc_requests');
        await addDoc(kycRef, {
            userId,
            ...data,
            documentImageUrl: imageUrl,
            status: 'pending',
            submittedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error submitting KYC:', error);
        throw error;
    }
};

import { Platform } from 'react-native';

// FREE API KEY for ImgBB - This can be moved to a config file later
const IMGBB_API_KEY = '8172ec2c41610b00ab4219898e25c2b2'; // User's personal key

export const imgbbService = {
    /**
     * Uploads an image to ImgBB using their public API
     * @param uri The local URI of the image (blob or base64)
     * @param onProgress Feedback for the UI
     * @returns The direct URL to the image
     */
    uploadImage: async (uri: string, onProgress?: (msg: string) => void): Promise<string> => {
        try {
            if (onProgress) onProgress('Processing photo...');
            console.log('[IMGBB] 🚀 Starting upload for:', uri.substring(0, 30));

            let blob: Blob;

            // Step 1: Convert to Blob
            if (uri.startsWith('data:')) {
                const response = await fetch(uri);
                blob = await response.blob();
            } else if (uri.startsWith('blob:')) {
                const response = await fetch(uri);
                blob = await response.blob();
            } else if (Platform.OS === 'web') {
                const response = await fetch(uri);
                blob = await response.blob();
            } else {
                const response = await fetch(uri);
                blob = await response.blob();
            }

            const formData = new FormData();
            formData.append('image', blob);

            if (onProgress) onProgress('Uploading to cloud...');

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                console.log('[IMGBB] ✅ Success! URL:', result.data.url);
                if (onProgress) onProgress('Upload successful!');
                return result.data.url;
            } else {
                const errorMsg = result.error?.message || 'ImgBB upload failed';
                if (errorMsg.includes('v1 key')) {
                    throw new Error('API Key Expired/Invalid. Please get your own free key from api.imgbb.com and update imgbbService.ts');
                }
                throw new Error(errorMsg);
            }
        } catch (error: any) {
            console.error('[IMGBB] ❌ Error:', error.message);
            throw error;
        }
    }
};

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../core/config/firebase';
import { Platform } from 'react-native';
import { imgbbService } from './imgbbService';

export const storageService = {
    /**
     * Uploads an image from a local URI to Firebase Storage
     * FALLBACK: Switches to ImgBB if Firebase fails (common for CORS on web)
     */
    uploadImage: async (uri: string, path: string, onProgress?: (msg: string) => void): Promise<string> => {
        console.log(`[STORAGE] 📸 Phase: Processing URI=${uri.substring(0, 50)}...`);

        const isRemoteMatch = uri.startsWith('http') && !uri.includes('localhost') && !uri.includes('127.0.0.1') && !uri.startsWith('blob:') && !uri.startsWith('data:');

        if (isRemoteMatch) {
            console.log('[STORAGE] ℹ️ Remote URL detected, skipping upload.');
            return uri;
        }

        try {
            // Helper for timeouts
            const withTimeout = (promise: Promise<any>, ms: number, msg: string) =>
                Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms))]);

            let blob: Blob;

            // Step 1: Convert to Blob
            const msg1 = `Preparing photo...`;
            if (onProgress) onProgress(msg1);

            if (uri.startsWith('data:') || uri.startsWith('blob:')) {
                const response = await fetch(uri);
                blob = await response.blob();
            } else if (Platform.OS === 'web') {
                const response = await fetch(uri);
                blob = await response.blob();
            } else {
                blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = () => resolve(xhr.response);
                    xhr.onerror = () => reject(new Error("XHR request failed"));
                    xhr.ontimeout = () => reject(new Error("XHR timeout"));
                    xhr.responseType = "blob";
                    xhr.open("GET", uri, true);
                    xhr.timeout = 20000;
                    xhr.send(null);
                });
            }

            if (!blob) throw new Error("Failed to create blob from URI");

            // CRITICAL: On Web/Localhost, Firebase Storage always blocks with CORS.
            // We go STRAIGHT to ImgBB to keep the console clean and the upload fast.
            if (Platform.OS === 'web') {
                console.log('[STORAGE] 🌐 Web environment: Using Direct Reliable Upload.');
                if (onProgress) onProgress('Using reliable cloud storage...');
                return await imgbbService.uploadImage(uri, onProgress);
            }

            // NATIVE PATH (Mobile)
            const msg2 = `Uploading to cloud (${(blob.size / 1024).toFixed(1)} KB)...`;
            if (onProgress) onProgress(msg2);

            try {
                const storageRef = ref(storage, path);
                const metadata = { contentType: blob.type || 'image/jpeg' };
                await withTimeout(uploadBytes(storageRef, blob, metadata), 15000, "Firebase timeout");

                const url = await getDownloadURL(storageRef);
                console.log('[STORAGE] ✅ Firebase Success');
                return url;
            } catch (firebaseError: any) {
                console.warn('[STORAGE] ⚠️ Firebase failed, using ImgBB fallback...');
                return await imgbbService.uploadImage(uri, onProgress);
            }
        } catch (error: any) {
            console.error("[STORAGE] ❌ UPLOAD FAILED:", error.message);
            throw new Error(`Upload failed: ${error.message}`);
        }
    },

    /**
     * Uploads multiple images sequentially and supports progress feedback
     */
    uploadMultipleImages: async (uris: string[], folder: string, onProgress?: (msg: string) => void): Promise<string[]> => {
        console.log(`[STORAGE] 📂 Batch Upload Started: ${uris.length} items.`);
        const urls: string[] = [];

        for (let i = 0; i < uris.length; i++) {
            const uri = uris[i];
            let extension = 'jpg';
            const parts = uri.split(/[#?]/)[0].split('.');
            if (parts.length > 1) extension = parts.pop() || 'jpg';

            const filename = `${Date.now()}_${i}.${extension}`;
            const path = `${folder}/${filename}`;

            try {
                const url = await storageService.uploadImage(uri, path, (detail) => {
                    if (onProgress) {
                        onProgress(`Image ${i + 1}/${uris.length}: ${detail}`);
                    }
                });
                urls.push(url);
            } catch (err: any) {
                console.error(`[STORAGE] Failed at image ${i + 1}:`, err.message);
                throw new Error(`Photo #${i + 1} failed: ${err.message}`);
            }
        }
        return urls;
    }
};

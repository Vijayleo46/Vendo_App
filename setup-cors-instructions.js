/**
 * This script provides a command to set CORS for your Firebase Storage bucket.
 * 
 * Instructions:
 * 1. Create a file named 'cors.json' with this content:
 * [
 *   {
 *     "origin": ["*"],
 *     "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
 *     "responseHeader": ["Content-Type", "x-goog-resumable"],
 *     "maxAgeSeconds": 3600
 *   }
 * ]
 * 
 * 2. Run this command (requires Google Cloud SDK / gsutil):
 * gsutil cors set cors.json gs://trust-market-platform.firebasestorage.app
 * 
 * NOTE: Replace the bucket URL with yours if different.
 */

console.log('--- FIREBASE STORAGE CORS SETUP ---');
console.log('To fix CORS issues on Web, follow these steps:');
console.log('');
console.log('1. Create a file named cors.json with contents:');
console.log('[{"origin": ["*"], "method": ["GET", "PUT", "POST", "DELETE", "HEAD"], "responseHeader": ["Content-Type", "x-goog-resumable"], "maxAgeSeconds": 3600}]');
console.log('');
console.log('2. Run this command in your terminal:');
console.log('gsutil cors set cors.json gs://trust-market-platform.firebasestorage.app');
console.log('');
console.log('If you don\'t have gsutil, you can also set this in the Google Cloud Console for your project.');

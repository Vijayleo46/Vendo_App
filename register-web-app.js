#!/usr/bin/env node

/**
 * Firebase Web App Registration Helper
 * 
 * This script helps you register a web app in your Firebase project
 * and retrieve the web appId needed for your configuration.
 * 
 * Since Firebase CLI requires interactive login, please follow these steps:
 */

console.log('\n🔥 Firebase Web App Registration Helper\n');
console.log('='.repeat(60));
console.log('\n📋 MANUAL STEPS TO GET YOUR WEB APP ID:\n');

console.log('Step 1: Open Firebase Console');
console.log('   👉 https://console.firebase.google.com/project/trust-market-platform/settings/general\n');

console.log('Step 2: Scroll to "Your apps" section\n');

console.log('Step 3: Check if a Web app already exists');
console.log('   - Look for apps with the </> icon');
console.log('   - If you see one, click on it to view configuration\n');

console.log('Step 4: If NO web app exists, create one:');
console.log('   a) Click "Add app" button');
console.log('   b) Select "Web" platform (</>)');
console.log('   c) Enter nickname: "MP Shop Web"');
console.log('   d) Click "Register app"\n');

console.log('Step 5: Copy the appId from the configuration');
console.log('   Look for this in the firebaseConfig object:');
console.log('   appId: "1:516223323976:web:XXXXXXXXXXXXX"\n');

console.log('Step 6: Run the update script:');
console.log('   node update-firebase-config.js YOUR_WEB_APP_ID\n');

console.log('='.repeat(60));
console.log('\n💡 TIP: The appId format is: 1:516223323976:web:[random-string]\n');

// If an appId is provided as argument, update the config
if (process.argv[2]) {
    const webAppId = process.argv[2];

    if (!webAppId.startsWith('1:516223323976:web:')) {
        console.error('❌ Error: Invalid appId format');
        console.error('   Expected format: 1:516223323976:web:XXXXXXXXXXXXX');
        console.error(`   Received: ${webAppId}`);
        process.exit(1);
    }

    console.log(`✅ Valid appId detected: ${webAppId}`);
    console.log('\n📝 To update your configuration, run:');
    console.log(`   node update-firebase-config.js ${webAppId}\n`);
} else {
    console.log('⏳ Waiting for you to get the web appId...\n');
    console.log('Once you have it, run:');
    console.log('   node register-web-app.js YOUR_WEB_APP_ID\n');
}

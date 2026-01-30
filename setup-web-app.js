#!/usr/bin/env node

/**
 * Interactive Firebase Web App ID Setup
 * Guides you through the process of adding your web appId
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🔥 Firebase Web App ID Setup Wizard\n');
console.log('='.repeat(60));

console.log('\n📋 This wizard will help you configure your Firebase web app.\n');

// Check if Firebase Console is accessible
console.log('Step 1: Opening Firebase Console...\n');

try {
    // Open Firebase Console in browser
    if (process.platform === 'win32') {
        execSync('start https://console.firebase.google.com/project/trust-market-platform/settings/general', { stdio: 'ignore' });
    } else if (process.platform === 'darwin') {
        execSync('open https://console.firebase.google.com/project/trust-market-platform/settings/general', { stdio: 'ignore' });
    } else {
        execSync('xdg-open https://console.firebase.google.com/project/trust-market-platform/settings/general', { stdio: 'ignore' });
    }
    console.log('✅ Firebase Console opened in your browser\n');
} catch (error) {
    console.log('⚠️  Could not open browser automatically');
    console.log('   Please manually open:');
    console.log('   https://console.firebase.google.com/project/trust-market-platform/settings/general\n');
}

console.log('Step 2: In the Firebase Console:\n');
console.log('   a) Scroll to the "Your apps" section');
console.log('   b) Look for a Web app (</> icon)');
console.log('   c) If no web app exists:');
console.log('      - Click "Add app"');
console.log('      - Select Web (</>)');
console.log('      - Enter nickname: "MP Shop Web"');
console.log('      - Click "Register app"');
console.log('   d) Copy the appId from the configuration\n');

console.log('The appId format looks like:');
console.log('   1:516223323976:web:abc123def456ghi789\n');

console.log('='.repeat(60));

rl.question('\n📝 Paste your web appId here: ', (webAppId) => {
    const trimmedAppId = webAppId.trim();

    // Validate the appId
    if (!trimmedAppId) {
        console.log('\n❌ Error: No appId provided');
        rl.close();
        process.exit(1);
    }

    if (!trimmedAppId.startsWith('1:516223323976:web:')) {
        console.log('\n❌ Error: Invalid appId format');
        console.log(`   Expected: 1:516223323976:web:XXXXXXXXXXXXX`);
        console.log(`   Received: ${trimmedAppId}`);
        rl.close();
        process.exit(1);
    }

    console.log('\n✅ Valid appId format detected!');
    console.log(`   App ID: ${trimmedAppId}\n`);

    // Update the configuration
    const configPath = path.join(__dirname, 'src', 'core', 'config', 'firebase.ts');

    try {
        let configContent = fs.readFileSync(configPath, 'utf8');

        // Replace the placeholder
        configContent = configContent.replace(
            '"1:516223323976:web:YOUR_WEB_APP_ID"',
            `"${trimmedAppId}"`
        );

        // Remove TODO comment
        configContent = configContent.replace(
            ' // TODO: Replace with actual web appId from Firebase Console',
            ''
        );

        fs.writeFileSync(configPath, configContent, 'utf8');

        console.log('✅ Configuration updated successfully!\n');
        console.log('📝 Updated file: src/core/config/firebase.ts\n');

        console.log('🎯 Next steps:\n');
        console.log('   1. Restart your dev server:');
        console.log('      - Press Ctrl+C in the terminal running "npm start"');
        console.log('      - Run: npm start\n');
        console.log('   2. Test on web:');
        console.log('      - Run: npm run web');
        console.log('      - Try registering a new user\n');
        console.log('   3. Verify in Firebase Console:');
        console.log('      - Go to Authentication → Users');
        console.log('      - Check if new users appear\n');

        console.log('✨ Setup complete!\n');

    } catch (error) {
        console.error('\n❌ Error updating configuration:');
        console.error(error.message);
        console.error('\nPlease update manually:');
        console.error(`   File: ${configPath}`);
        console.error(`   Replace: YOUR_WEB_APP_ID`);
        console.error(`   With: ${trimmedAppId}\n`);
    }

    rl.close();
});

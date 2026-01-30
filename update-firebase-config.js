#!/usr/bin/env node

/**
 * Update Firebase Configuration with Web App ID
 * 
 * Usage: node update-firebase-config.js YOUR_WEB_APP_ID
 */

const fs = require('fs');
const path = require('path');

// Get the web appId from command line argument
const webAppId = process.argv[2];

if (!webAppId) {
    console.error('\n❌ Error: No web appId provided\n');
    console.log('Usage: node update-firebase-config.js YOUR_WEB_APP_ID\n');
    console.log('Example: node update-firebase-config.js 1:516223323976:web:abc123def456\n');
    process.exit(1);
}

// Validate the appId format
if (!webAppId.startsWith('1:516223323976:web:')) {
    console.error('\n❌ Error: Invalid appId format\n');
    console.error('Expected format: 1:516223323976:web:XXXXXXXXXXXXX');
    console.error(`Received: ${webAppId}\n`);
    process.exit(1);
}

// Path to the Firebase configuration file
const configPath = path.join(__dirname, 'src', 'core', 'config', 'firebase.ts');

console.log('\n🔥 Updating Firebase Configuration...\n');
console.log(`📁 Config file: ${configPath}`);
console.log(`🆔 Web App ID: ${webAppId}\n`);

try {
    // Read the current configuration
    let configContent = fs.readFileSync(configPath, 'utf8');

    // Check if the file contains the placeholder
    if (!configContent.includes('YOUR_WEB_APP_ID')) {
        console.warn('⚠️  Warning: Placeholder "YOUR_WEB_APP_ID" not found');
        console.log('   The configuration may have already been updated.\n');

        // Check if the provided appId already exists
        if (configContent.includes(webAppId)) {
            console.log('✅ Configuration already contains this web appId\n');
            process.exit(0);
        }
    }

    // Replace the placeholder with the actual web appId
    const updatedContent = configContent.replace(
        '"1:516223323976:web:YOUR_WEB_APP_ID"',
        `"${webAppId}"`
    );

    // Also remove the TODO comment
    const finalContent = updatedContent.replace(
        ' // TODO: Replace with actual web appId from Firebase Console',
        ''
    );

    // Write the updated configuration back to the file
    fs.writeFileSync(configPath, finalContent, 'utf8');

    console.log('✅ Firebase configuration updated successfully!\n');
    console.log('📝 Changes made:');
    console.log(`   - Replaced placeholder with: ${webAppId}`);
    console.log('   - Removed TODO comment\n');

    console.log('🎯 Next steps:');
    console.log('   1. Restart your development server (Ctrl+C then npm start)');
    console.log('   2. Test user registration on web platform');
    console.log('   3. Verify users appear in Firebase Console\n');

    console.log('🧪 To test:');
    console.log('   Web:    npm run web');
    console.log('   Mobile: npm start\n');

} catch (error) {
    console.error('\n❌ Error updating configuration:\n');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('   - File exists: src/core/config/firebase.ts');
    console.error('   - You have write permissions');
    console.error('   - The file is not open in another program\n');
    process.exit(1);
}

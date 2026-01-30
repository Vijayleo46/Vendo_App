#!/usr/bin/env node

/**
 * Firebase Configuration Tester
 * Tests the Firebase configuration and provides diagnostics
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔥 Firebase Configuration Diagnostic Tool\n');
console.log('='.repeat(60));

// Check if firebase config file exists
const configPath = path.join(__dirname, 'src', 'core', 'config', 'firebase.ts');

console.log('\n📋 Checking Firebase Configuration...\n');

try {
    if (!fs.existsSync(configPath)) {
        console.error('❌ Firebase config file not found!');
        console.error(`   Expected location: ${configPath}`);
        process.exit(1);
    }

    console.log('✅ Config file exists');

    // Read the configuration
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Check for required fields
    const checks = [
        { name: 'API Key', pattern: /apiKey:\s*"AIzaSy[^"]+"/, status: false },
        { name: 'Auth Domain', pattern: /authDomain:\s*"[^"]+\.firebaseapp\.com"/, status: false },
        { name: 'Project ID', pattern: /projectId:\s*"trust-market-platform"/, status: false },
        { name: 'Storage Bucket', pattern: /storageBucket:\s*"[^"]+\.firebasestorage\.app"/, status: false },
        { name: 'Messaging Sender ID', pattern: /messagingSenderId:\s*"\d+"/, status: false },
        { name: 'Android App ID', pattern: /1:516223323976:android:[a-f0-9]+/, status: false },
        { name: 'Web App ID', pattern: /1:516223323976:web:[a-zA-Z0-9]+/, status: false },
    ];

    console.log('\n📊 Configuration Status:\n');

    let allPassed = true;
    checks.forEach(check => {
        check.status = check.pattern.test(configContent);
        const icon = check.status ? '✅' : '❌';
        console.log(`   ${icon} ${check.name}`);
        if (!check.status) allPassed = false;
    });

    // Check for placeholder
    const hasPlaceholder = configContent.includes('YOUR_WEB_APP_ID');

    if (hasPlaceholder) {
        console.log('\n⚠️  WARNING: Web App ID placeholder detected!');
        console.log('   The configuration still contains "YOUR_WEB_APP_ID"');
        console.log('   You need to replace it with your actual web appId\n');
        console.log('   Steps to fix:');
        console.log('   1. Get your web appId from Firebase Console');
        console.log('   2. Run: node update-firebase-config.js YOUR_WEB_APP_ID\n');
        allPassed = false;
    }

    console.log('\n' + '='.repeat(60));

    if (allPassed && !hasPlaceholder) {
        console.log('\n✅ Configuration is complete and ready to use!\n');
        console.log('🎯 Next steps:');
        console.log('   1. Restart your dev server: npm start');
        console.log('   2. Test registration on web: npm run web');
        console.log('   3. Verify users in Firebase Console\n');
    } else {
        console.log('\n⚠️  Configuration needs attention\n');
        console.log('📖 See WEB_APP_REGISTRATION_GUIDE.md for detailed instructions\n');
    }

    // Show current configuration (sanitized)
    console.log('📄 Current Configuration Summary:\n');

    const apiKeyMatch = configContent.match(/apiKey:\s*"([^"]+)"/);
    const projectIdMatch = configContent.match(/projectId:\s*"([^"]+)"/);
    const androidAppIdMatch = configContent.match(/(1:516223323976:android:[a-f0-9]+)/);
    const webAppIdMatch = configContent.match(/(1:516223323976:web:[a-zA-Z0-9]+)/);

    if (apiKeyMatch) {
        const apiKey = apiKeyMatch[1];
        console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    }

    if (projectIdMatch) {
        console.log(`   Project ID: ${projectIdMatch[1]}`);
    }

    if (androidAppIdMatch) {
        console.log(`   Android App ID: ${androidAppIdMatch[1]}`);
    }

    if (webAppIdMatch) {
        console.log(`   Web App ID: ${webAppIdMatch[1]}`);
    } else if (hasPlaceholder) {
        console.log(`   Web App ID: ⚠️  NOT SET (placeholder detected)`);
    }

    console.log('\n' + '='.repeat(60) + '\n');

} catch (error) {
    console.error('\n❌ Error reading configuration:\n');
    console.error(error.message);
    console.error('\n');
    process.exit(1);
}

const { execSync } = require('child_process');

console.log('🚀 Deploying Firestore rules...');

try {
    // Deploy only Firestore rules
    execSync('firebase deploy --only firestore:rules', { 
        stdio: 'inherit',
        cwd: __dirname 
    });
    console.log('✅ Firestore rules deployed successfully!');
} catch (error) {
    console.error('❌ Failed to deploy Firestore rules:', error.message);
    console.log('\n📝 Manual deployment steps:');
    console.log('1. Run: firebase login');
    console.log('2. Run: firebase use trust-market-platform');
    console.log('3. Run: firebase deploy --only firestore:rules');
}
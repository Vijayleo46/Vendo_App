
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAO6Nyba91WjGvy-Rs-SKvmiWzpflQ7W3U",
    authDomain: "trust-market-platform.firebaseapp.com",
    projectId: "trust-market-platform",
    storageBucket: "trust-market-platform.firebasestorage.app",
    messagingSenderId: "516223323976",
    appId: "1:516223323976:web:834ff2d8590b770d0b2d7d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const jobData = {
    title: 'Full Stack Developer',
    description: 'We are hiring a talented Full Stack Developer to join our growing team. Must have experience with React, Node.js, and MongoDB.',
    price: '₹ 8L - 12L',
    category: 'Jobs',
    images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000'],
    sellerId: 'test_employer_123',
    sellerName: 'TechCorp Solutions',
    rating: 5,
    type: 'job',
    location: 'Bangalore, Karnataka',
    jobType: 'Full Time',
    salaryRange: '₹ 8L - 12L',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'REST APIs'],
    experienceLevel: 'Mid Level',
    companyName: 'TechCorp Solutions',
    workMode: 'Hybrid',
    enableChat: true,
    status: 'active',
    views: 0,
    chatsCount: 0,
    applicantsCount: 0,
    createdAt: new Date()
};

async function postJob() {
    try {
        console.log('⏳ Posting JOB to Firestore...');
        console.log('Job Title:', jobData.title);
        console.log('Company:', jobData.companyName);
        console.log('Location:', jobData.location);

        const docRef = await addDoc(collection(db, 'jobs'), jobData);

        console.log('✅ Job posted successfully!');
        console.log('📋 Document ID:', docRef.id);
        console.log('🔗 Job can be found in Firestore under: jobs/' + docRef.id);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error posting job:', error);
        process.exit(1);
    }
}

postJob();

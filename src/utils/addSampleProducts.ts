import { listingService } from '../services/listingService';

export const addSampleProducts = async () => {
    try {
        console.log('Adding sample products to database...');
        
        // Call the existing seed function
        await listingService.seedDemoData();
        
        console.log('✅ Sample products added successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error adding sample products:', error);
        return false;
    }
};

// Additional products to add more variety
export const addMoreProducts = async () => {
    try {
        const moreProducts = [
            {
                title: 'iPhone 15 Pro Max',
                description: 'Natural Titanium, 256GB. Brand new, sealed box. Latest model with USB-C.',
                price: '1199',
                category: 'Electronics',
                images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=1000'],
                sellerId: 'demo_user',
                sellerName: 'Tech Store',
                rating: 4.9,
                type: 'product' as const,
                location: 'Mumbai, India',
                condition: 'New' as const,
                enableChat: true,
                isBoosted: true,
                status: 'active' as const,
                views: 890,
                chatsCount: 23
            },
            {
                title: 'Gaming Setup - RTX 4080',
                description: 'Complete gaming rig: RTX 4080, i7-13700K, 32GB RAM, 1TB NVMe. Ready to dominate!',
                price: '2800',
                category: 'Electronics',
                images: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=1000'],
                sellerId: 'demo_user',
                sellerName: 'Gaming Pro',
                rating: 5,
                type: 'product' as const,
                location: 'Bangalore, India',
                condition: 'New' as const,
                enableChat: true,
                status: 'active' as const,
                views: 1250,
                chatsCount: 45
            },
            {
                title: 'Royal Enfield Classic 350',
                description: 'Black color, 2023 model. Only 2000km driven. Perfect condition with all papers.',
                price: '1,85,000',
                category: 'Vehicles',
                images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000'],
                sellerId: 'demo_user',
                sellerName: 'Bike Lover',
                rating: 4.8,
                type: 'product' as const,
                location: 'Chennai, India',
                condition: 'Used' as const,
                enableChat: true,
                status: 'active' as const,
                views: 670,
                chatsCount: 18
            },
            {
                title: 'Wooden Dining Table Set',
                description: '6-seater teak wood dining table with chairs. Handcrafted, excellent quality.',
                price: '45,000',
                category: 'Furniture',
                images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000'],
                sellerId: 'demo_user',
                sellerName: 'Furniture Mart',
                rating: 4.7,
                type: 'product' as const,
                location: 'Delhi, India',
                condition: 'New' as const,
                enableChat: true,
                status: 'active' as const,
                views: 340,
                chatsCount: 8
            },
            {
                title: 'Designer Saree Collection',
                description: 'Silk sarees with intricate embroidery. Perfect for weddings and festivals.',
                price: '8,500',
                category: 'Fashion',
                images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000'],
                sellerId: 'demo_user',
                sellerName: 'Fashion House',
                rating: 4.6,
                type: 'product' as const,
                location: 'Hyderabad, India',
                condition: 'New' as const,
                enableChat: true,
                status: 'active' as const,
                views: 230,
                chatsCount: 5
            },
            {
                title: 'Full Stack Developer',
                description: 'Looking for MERN stack developer for startup. Equity + salary package available.',
                price: '₹8L - ₹15L',
                category: 'Jobs',
                images: ['https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&q=80&w=1000'],
                sellerId: 'demo_user',
                sellerName: 'StartupHub',
                rating: 0,
                type: 'job' as const,
                location: 'Pune, India',
                jobType: 'Full Time',
                salaryRange: '₹8L - ₹15L',
                skills: ['React', 'Node.js', 'MongoDB'],
                experienceLevel: 'Mid Level',
                companyName: 'StartupHub',
                workMode: 'Hybrid' as const,
                contactEmail: 'hr@startuphub.in',
                enableChat: true,
                status: 'active' as const,
                views: 1890,
                applicantsCount: 67
            },
            {
                title: 'Home Tutoring Service',
                description: 'Mathematics and Science tuition for classes 8-12. 10+ years experience.',
                price: '₹500/hour',
                category: 'Services',
                images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000'],
                sellerId: 'demo_user',
                sellerName: 'EduMaster',
                rating: 4.9,
                type: 'service' as const,
                location: 'Kochi, India',
                enableChat: true,
                status: 'active' as const,
                views: 450,
                chatsCount: 12
            },
            {
                title: '2BHK Apartment for Rent',
                description: 'Fully furnished apartment in prime location. Gym, parking, 24/7 security.',
                price: '₹25,000/month',
                category: 'Real Estate',
                images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000'],
                sellerId: 'demo_user',
                sellerName: 'Property Plus',
                rating: 4.5,
                type: 'product' as const,
                location: 'Gurgaon, India',
                enableChat: true,
                status: 'active' as const,
                views: 780,
                chatsCount: 25
            }
        ];

        console.log('Adding more Indian products...');
        
        for (const product of moreProducts) {
            await listingService.createListing(product);
        }
        
        console.log('✅ Additional products added successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error adding additional products:', error);
        return false;
    }
};
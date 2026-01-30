import { listingService, Listing } from './src/services/listingService';
import { auth } from './src/core/config/firebase';

async function publishTestProduct() {
    console.log('=== PUBLISHING TEST PRODUCT ===');

    // Simulate a logged in user if possible, or use demo_user
    const sellerId = 'demo_user_123';
    const sellerName = 'Vijay Leo';

    const newProduct: Omit<Listing, 'id' | 'createdAt'> = {
        title: 'iPhone 15 Pro - Titanium Blue',
        description: 'Brand new iPhone 15 Pro with 256GB storage. Titanium Blue finish, factory unlocked. Comes with original box and accessories.',
        price: '₹ 1,19,900',
        category: 'Electronics',
        images: [
            'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1696446702183-cbd13d78905e?auto=format&fit=crop&q=80&w=1000'
        ],
        sellerId,
        sellerName,
        rating: 4.9,
        type: 'product',
        location: 'Hyderabad, India',
        condition: 'New',
        enableChat: true,
        status: 'active',
        views: 0,
        chatsCount: 0,
        isBoosted: true
    };

    try {
        console.log('Publishing product:', newProduct.title);
        const productId = await listingService.createListing(newProduct);
        console.log('✅ Success! Product published with ID:', productId);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error publishing product:', error);
        process.exit(1);
    }
}

publishTestProduct();

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
// Note: In production, use service account credentials
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

// --- PRODUCT ROUTES ---

// Create Product for Rent
app.post('/api/products/create', async (req, res) => {
    try {
        const { title, description, category, rentPricePerDay, securityDeposit, minimumRentalDays, location, images, ownerId } = req.body;

        if (!title || !rentPricePerDay || !ownerId) {
            return res.status(400).send({ error: 'Title, Rent Price, and OwnerId are required' });
        }

        const newProduct = {
            title,
            description,
            category,
            rentPricePerDay: Number(rentPricePerDay),
            securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
            minimumRentalDays: Number(minimumRentalDays) || 1,
            ownerId,
            images: images || [],
            location,
            availabilityStatus: 'available',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            totalViews: 0,
            rating: 0
        };

        const docRef = await db.collection('products').add(newProduct);
        res.status(201).send({ productId: docRef.id, ...newProduct });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get All Products (with filters)
app.get('/api/products', async (req, res) => {
    try {
        let query = db.collection('products');

        const { category, minPrice, maxPrice, sortBy } = req.query;

        if (category) query = query.where('category', '==', category);
        if (minPrice) query = query.where('rentPricePerDay', '>=', Number(minPrice));
        if (maxPrice) query = query.where('rentPricePerDay', '<=', Number(maxPrice));

        if (sortBy === 'price_asc') query = query.orderBy('rentPricePerDay', 'asc');
        else if (sortBy === 'price_desc') query = query.orderBy('rentPricePerDay', 'desc');
        else query = query.orderBy('createdAt', 'desc');

        const snapshot = await query.get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.send(products);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update Product
app.put('/api/products/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await db.collection('products').doc(id).update(updates);
        res.send({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Delete Product
app.delete('/api/products/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('products').doc(id).delete();
        res.send({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// --- RENTAL BOOKING ROUTES ---

// Book a Product (with conflict validation)
app.post('/api/rent/book', async (req, res) => {
    try {
        const { productId, renterId, startDate, endDate } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            return res.status(400).send({ error: 'Start date must be before end date' });
        }

        // 1. Check for conflicting bookings
        const conflictsSnapshot = await db.collection('rent_orders')
            .where('productId', '==', productId)
            .where('status', 'in', ['approved', 'active'])
            .get();

        const hasConflict = conflictsSnapshot.docs.some(doc => {
            const booking = doc.data();
            const bStart = booking.startDate.toDate();
            const bEnd = booking.endDate.toDate();
            // Conflict logic: (StartA < EndB) && (EndA > StartB)
            return (start < bEnd) && (end > bStart);
        });

        if (hasConflict) {
            return res.status(409).send({ error: 'Product is already booked for these dates' });
        }

        // 2. Get product details to calculate cost
        const productSnap = await db.collection('products').doc(productId).get();
        if (!productSnap.exists) {
            return res.status(404).send({ error: 'Product not found' });
        }
        const product = productSnap.data();

        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalAmount = totalDays * product.rentPricePerDay;

        const newOrder = {
            productId,
            ownerId: product.ownerId,
            renterId,
            startDate: admin.firestore.Timestamp.fromDate(start),
            endDate: admin.firestore.Timestamp.fromDate(end),
            totalDays,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const orderRef = await db.collection('rent_orders').add(newOrder);
        res.status(201).send({ orderId: orderRef.id, ...newOrder });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get My Bookings
app.get('/api/rent/my-bookings', async (req, res) => {
    try {
        const { userId, role } = req.query; // role: 'renter' or 'owner'

        let query = db.collection('rent_orders');
        if (role === 'owner') {
            query = query.where('ownerId', '==', userId);
        } else {
            query = query.where('renterId', '==', userId);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.send(bookings);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update Booking Status
app.put('/api/rent/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body; // 'approved', 'active', 'completed', 'cancelled'

        if (!['approved', 'active', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).send({ error: 'Invalid status' });
        }

        await db.collection('rent_orders').doc(orderId).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.send({ message: `Booking ${status} successfully` });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

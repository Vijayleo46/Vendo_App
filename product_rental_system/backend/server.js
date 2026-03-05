const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    getDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp
} = require('firebase/firestore');

const app = express();
app.use(cors());
app.use(express.json());

// Firebase configuration (from frontend config)
const firebaseConfig = {
    apiKey: "AIzaSyAO6Nyba91WjGvy-Rs-SKvmiWzpflQ7W3U",
    authDomain: "trust-market-platform.firebaseapp.com",
    projectId: "trust-market-platform",
    storageBucket: "trust-market-platform.firebasestorage.app",
    messagingSenderId: "516223323976",
    appId: "1:516223323976:web:834ff2d8590b770d0b2d7d",
    measurementId: "G-XPPC9C94C9"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

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
            type: 'rent',
            availabilityStatus: 'available',
            createdAt: serverTimestamp(),
            totalViews: 0,
            rating: 0
        };

        const docRef = await addDoc(collection(db, 'rentals'), newProduct);
        res.status(201).send({ productId: docRef.id, ...newProduct });
    } catch (error) {
        console.error('SERVER ERROR (POST /api/products/create):', error);
        res.status(500).send({ error: error.message });
    }
});

// Get All Products (with filters)
app.get('/api/products', async (req, res) => {
    try {
        let q = collection(db, 'rentals');
        const constraints = [];

        const { category, minPrice, maxPrice, sortBy } = req.query;

        if (category) constraints.push(where('category', '==', category));
        if (minPrice) constraints.push(where('rentPricePerDay', '>=', Number(minPrice)));
        if (maxPrice) constraints.push(where('rentPricePerDay', '<=', Number(maxPrice)));

        if (sortBy === 'price_asc') constraints.push(orderBy('rentPricePerDay', 'asc'));
        else if (sortBy === 'price_desc') constraints.push(orderBy('rentPricePerDay', 'desc'));
        else constraints.push(orderBy('createdAt', 'desc'));

        const finalQuery = query(q, ...constraints);
        const snapshot = await getDocs(finalQuery);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.send(products);
    } catch (error) {
        console.error('SERVER ERROR (GET /api/products):', error);
        res.status(500).send({ error: error.message });
    }
});

// Update Product
app.put('/api/products/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await updateDoc(doc(db, 'rentals', id), updates);
        res.send({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Delete Product
app.delete('/api/products/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteDoc(doc(db, 'rentals', id));
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
        const q = query(
            collection(db, 'rent_orders'),
            where('productId', '==', productId),
            where('status', 'in', ['approved', 'active'])
        );
        const conflictsSnapshot = await getDocs(q);

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
        const productSnap = await getDoc(doc(db, 'rentals', productId));
        if (!productSnap.exists()) {
            return res.status(404).send({ error: 'Product not found' });
        }
        const product = productSnap.data();

        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalAmount = totalDays * product.rentPricePerDay;

        const newOrder = {
            productId,
            ownerId: product.ownerId,
            renterId,
            startDate: Timestamp.fromDate(start),
            endDate: Timestamp.fromDate(end),
            totalDays,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: serverTimestamp()
        };

        const orderRef = await addDoc(collection(db, 'rent_orders'), newOrder);
        res.status(201).send({ orderId: orderRef.id, ...newOrder });
    } catch (error) {
        console.error('SERVER ERROR (POST /api/rent/book):', error);
        res.status(500).send({ error: error.message });
    }
});

// Get My Bookings
app.get('/api/rent/my-bookings', async (req, res) => {
    try {
        const { userId, role } = req.query; // role: 'renter' or 'owner'

        let q = collection(db, 'rent_orders');
        const constraints = [];

        if (role === 'owner') {
            constraints.push(where('ownerId', '==', userId));
        } else {
            constraints.push(where('renterId', '==', userId));
        }
        constraints.push(orderBy('createdAt', 'desc'));

        const finalQuery = query(q, ...constraints);
        const snapshot = await getDocs(finalQuery);
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.send(bookings);
    } catch (error) {
        console.error('SERVER ERROR (GET /api/rent/my-bookings):', error);
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

        await updateDoc(doc(db, 'rent_orders', orderId), {
            status,
            updatedAt: serverTimestamp()
        });

        res.send({ message: `Booking ${status} successfully` });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


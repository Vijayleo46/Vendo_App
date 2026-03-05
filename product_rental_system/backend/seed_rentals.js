const http = require('http');

const sampleProduct = JSON.stringify({
    title: 'Professional Camera for Rent',
    description: 'High-end DSLR for professional photography.',
    category: 'Electronics',
    rentPricePerDay: 500,
    securityDeposit: 2000,
    minimumRentalDays: 1,
    location: 'Kochi, Kerala',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000'],
    ownerId: 'demo_owner_123'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/products/create',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': sampleProduct.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(sampleProduct);
req.end();

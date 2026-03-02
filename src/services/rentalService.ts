import axios from 'axios';
import { Platform } from 'react-native';

// Use local IP for real device testing, or 10.0.2.2 for Android emulator
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export interface RentalProduct {
    id?: string;
    title: string;
    description: string;
    category: string;
    rentPricePerDay: number;
    securityDeposit: number;
    minimumRentalDays: number;
    ownerId: string;
    images: string[];
    location: string;
    availabilityStatus: 'available' | 'rented';
}

export interface RentalOrder {
    id?: string;
    productId: string;
    ownerId: string;
    renterId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    totalAmount: number;
    status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
}

export const rentalService = {
    // Create product
    createProduct: async (product: RentalProduct) => {
        try {
            const response = await axios.post(`${BASE_URL}/products/create`, product);
            return response.data;
        } catch (error) {
            console.error('Error creating rental product:', error);
            throw error;
        }
    },

    // Get all products
    getProducts: async (filters?: { category?: string; minPrice?: number; maxPrice?: number }) => {
        try {
            const response = await axios.get(`${BASE_URL}/products`, { params: filters });
            return response.data as RentalProduct[];
        } catch (error) {
            console.error('Error fetching rental products:', error);
            throw error;
        }
    },

    // Book a product
    bookProduct: async (booking: { productId: string; renterId: string; startDate: Date; endDate: Date }) => {
        try {
            const response = await axios.post(`${BASE_URL}/rent/book`, {
                ...booking,
                startDate: booking.startDate.toISOString(),
                endDate: booking.endDate.toISOString(),
            });
            return response.data as RentalOrder;
        } catch (error) {
            console.error('Error booking product:', error);
            throw error;
        }
    },

    // Get my bookings
    getMyBookings: async (userId: string, role: 'renter' | 'owner') => {
        try {
            const response = await axios.get(`${BASE_URL}/rent/my-bookings`, { params: { userId, role } });
            return response.data as RentalOrder[];
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    // Update status
    updateBookingStatus: async (orderId: string, status: RentalOrder['status']) => {
        try {
            const response = await axios.put(`${BASE_URL}/rent/status/${orderId}`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }
};
阻
阻
阻
阻

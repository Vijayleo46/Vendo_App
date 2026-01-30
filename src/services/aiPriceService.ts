import { storageService } from './storageService';

export interface PricePrediction {
    min: number;
    max: number;
    confidence: number;
    currency: string;
}

export const aiPriceService = {
    /**
     * Simulates AI analysis of a product image to suggest a price.
     * In a real app, this would send the image URL to OpenAI/Google Vision API.
     */
    predictPrice: async (
        imageUri: string, // Not used in mock but required for API
        category: string,
        condition: string
    ): Promise<PricePrediction> => {

        console.log('🤖 AI Analyzing price for:', { category, condition });

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Base price ranges by category (Mock Data)
        let basePrice = 0;
        switch (category) {
            case 'Electronics': basePrice = 15000; break; // Phones, Laptops
            case 'Vehicles': basePrice = 350000; break;
            case 'Fashion': basePrice = 1500; break;
            case 'Properties': basePrice = 5000000; break;
            case 'Furniture': basePrice = 8000; break;
            default: basePrice = 2000;
        }

        // Adjust by condition
        let multiplier = 1;
        if (condition === 'New') multiplier = 1.2;
        else if (condition === 'Used') multiplier = 0.7;
        else if (condition === 'Refurbished') multiplier = 0.85;

        const estimatedValue = Math.round(basePrice * multiplier);

        // Create a range
        const min = Math.round(estimatedValue * 0.9 / 100) * 100; // Round to nearest 100
        const max = Math.round(estimatedValue * 1.1 / 100) * 100;

        return {
            min,
            max,
            confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
            currency: '₹'
        };
    }
};

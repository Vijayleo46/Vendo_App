import React from 'react';
import { MotiView } from 'moti';
import { ProductCard } from '../ProductCard';
import { CompactProductCard } from '../CompactProductCard';
import { Listing } from '../../services/listingService';
import { Timestamp } from 'firebase/firestore';

interface AnimatedProductCardProps {
    index: number;
    onPress: () => void;
    title: string;
    price: string | number;
    images: string[];
    location?: string;
    type?: string;
    isAd?: boolean;
    compact?: boolean;
    createdAt?: Timestamp | Date | number;
}

export const AnimatedProductCard = ({
    index,
    onPress,
    title,
    price,
    images,
    location,
    type,
    isAd,
    compact,
    createdAt
}: AnimatedProductCardProps) => {
    return (
        <MotiView
            from={{
                opacity: 0,
                translateY: 50,
                scale: 0.9,
            }}
            animate={{
                opacity: 1,
                translateY: 0,
                scale: 1,
            }}
            transition={{
                type: 'timing',
                duration: 500,
                delay: index * 100,
            }}
        >
            {compact ? (
                <CompactProductCard
                    title={title}
                    price={price}
                    image={images[0]}
                    location={location}
                    type={type}
                    onPress={onPress}
                    createdAt={createdAt}
                />
            ) : (
                <ProductCard
                    title={title}
                    price={price}
                    image={images[0]}
                    location={location}
                    type={type}
                    onPress={onPress}
                    isAd={isAd}
                    createdAt={createdAt}
                />
            )}
        </MotiView>
    );
};

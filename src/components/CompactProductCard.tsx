import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Typography } from './common/Typography';
import { MapPin, Clock } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatTimeAgo } from '../utils/dateUtils';
import { Timestamp } from 'firebase/firestore';

interface CompactProductCardProps {
    title: string;
    price: string | number;
    image: string;
    location?: string;
    onPress: () => void;
    type?: string;
    createdAt?: Timestamp | Date | number;
}

export const CompactProductCard = ({ title, price, image, location, onPress, type, createdAt }: CompactProductCardProps) => {
    const { theme } = useTheme();
    const displayPrice = typeof price === 'number' ? price.toLocaleString() : price;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={{
                backgroundColor: theme.card,
                borderRadius: 24,
                width: 160,
                borderWidth: 1,
                borderColor: theme.border,
                overflow: 'hidden',
                marginRight: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 5,
            }}
        >
            <View style={{ width: '100%', height: 100, overflow: 'hidden' }}>
                <Image
                    source={{ uri: image || 'https://via.placeholder.com/150' }}
                    style={{ width: '100%', height: 100, backgroundColor: theme.surface }}
                    resizeMode="cover"
                />
            </View>
            <View style={{ padding: 12 }}>
                <Typography
                    style={{ color: theme.primary, fontSize: 15, fontWeight: '900', marginBottom: 2 }}
                    numberOfLines={1}
                >
                    {type === 'job' ? price : `₹ ${displayPrice}`}
                </Typography>
                <Typography
                    style={{ color: theme.text, fontSize: 12, fontWeight: '600', marginBottom: 8, height: 32 }}
                    numberOfLines={2}
                >
                    {title}
                </Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.7, flex: 1 }}>
                        <MapPin size={10} color={theme.textTertiary} />
                        <Typography style={{ color: theme.textTertiary, fontSize: 9, fontWeight: '700' }} numberOfLines={1}>
                            {location?.split(',')[0] || 'Kochi'}
                        </Typography>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: theme.surface }}>
                        <Clock size={8} color={theme.textTertiary} />
                        <Typography style={{ color: theme.textTertiary, fontSize: 8, fontWeight: '800', opacity: 0.6 }}>
                            {formatTimeAgo(createdAt)}
                        </Typography>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

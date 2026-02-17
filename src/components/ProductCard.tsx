import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Typography } from './common/Typography';
import { Heart, MapPin, Zap, Clock } from 'lucide-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { formatTimeAgo } from '../utils/dateUtils';
import { Timestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

interface ProductCardProps {
    title: string;
    price: string | number;
    image: string;
    location?: string;
    type?: string;
    seller?: string;
    rating?: number;
    description?: string;
    onPress: () => void;
    isAd?: boolean;
    createdAt?: Timestamp | Date | number;
}

export const ProductCard = ({ title, price, image, location, type, onPress, isAd, createdAt }: ProductCardProps) => {
    const { theme, isDark } = useTheme();
    const displayPrice = typeof price === 'number' ? price.toLocaleString() : price;

    return (
        <View style={{ width: '100%' }}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={{
                    backgroundColor: theme.card,
                    borderRadius: 28,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: isAd ? theme.primary : theme.border,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: isDark ? 0.3 : 0.08,
                    shadowRadius: 16,
                    elevation: 8
                }}
            >
                <View style={{ position: 'relative' }}>
                    <Image
                        source={{ uri: image || 'https://via.placeholder.com/400x300?text=No+Image' }}
                        style={{ width: '100%', height: 180, backgroundColor: theme.surface }}
                        resizeMode="cover"
                    />

                    <LinearGradient
                        colors={['transparent', isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)']}
                        style={StyleSheet.absoluteFill}
                    />

                    {isAd && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                backgroundColor: isDark ? theme.surface : '#FFF',
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                            }}
                        >
                            <Zap size={12} color="#F59E0B" fill="#F59E0B" />
                            <Typography style={{ fontSize: 10, fontWeight: '900', color: theme.text, letterSpacing: 0.5 }}>SPONSORED</Typography>
                        </View>
                    )}

                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                            elevation: 4
                        }}
                    >
                        <Heart size={18} color={isDark ? '#FFF' : theme.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <Typography
                            style={{ color: theme.primary, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}
                            numberOfLines={1}
                        >
                            {type === 'job' ? price : `₹ ${displayPrice}`}
                        </Typography>
                        {type === 'job' && (
                            <View style={{ backgroundColor: theme.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: theme.primary + '30' }}>
                                <Typography style={{ fontSize: 10, fontWeight: '900', color: theme.primary, letterSpacing: 0.5 }}>HIRING</Typography>
                            </View>
                        )}
                    </View>

                    <Typography
                        style={{ color: theme.text, fontSize: 15, fontWeight: '700', marginBottom: 16, lineHeight: 22 }}
                        numberOfLines={2}
                    >
                        {title}
                    </Typography>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}>
                                <MapPin size={12} color={theme.primary} />
                            </View>
                            <Typography style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
                                {location?.split(',')[0] || 'Kochi'}
                            </Typography>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                            <Clock size={10} color={theme.textTertiary} />
                            <Typography style={{ color: theme.textTertiary, fontSize: 9, fontWeight: '800', letterSpacing: 0.3 }}>
                                {formatTimeAgo(createdAt)}
                            </Typography>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

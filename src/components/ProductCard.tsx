import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Typography } from './common/Typography';
import { Heart, MapPin, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

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
}

export const ProductCard = ({ title, price, image, location, type, onPress, isAd }: ProductCardProps) => {
    const displayPrice = typeof price === 'number' ? price.toLocaleString() : price;

    return (
        <View style={{ width: '100%' }}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: isAd ? '#FEF08A' : '#F1F5F9',
                    overflow: 'hidden',
                    shadowColor: '#002f34',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.08,
                    shadowRadius: 15,
                    elevation: 5
                }}
            >
                <View style={{ position: 'relative' }}>
                    <Image
                        source={{ uri: image || 'https://via.placeholder.com/300x200?text=No+Image' }}
                        style={{ width: '100%', height: 160 }}
                        className="bg-[#F9FAFB]"
                        resizeMode="cover"
                    />

                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.1)']}
                        style={StyleSheet.absoluteFill}
                    />

                    {isAd && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                backgroundColor: '#FFF',
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
                            <Typography style={{ fontSize: 10, fontWeight: '900', color: '#002f34', letterSpacing: 0.5 }}>SPONSORED</Typography>
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
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                            elevation: 4
                        }}
                    >
                        <Heart size={18} color="#002f34" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <Typography
                            style={{ color: '#002f34', fontSize: 18, fontWeight: '900' }}
                            numberOfLines={1}
                        >
                            {type === 'job' ? price : `₹ ${displayPrice}`}
                        </Typography>
                        {type === 'job' && (
                            <View style={{ backgroundColor: '#F0F9FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Typography style={{ fontSize: 9, fontWeight: '800', color: '#0369A1' }}>HIRING</Typography>
                            </View>
                        )}
                    </View>

                    <Typography
                        style={{ color: '#475569', fontSize: 14, fontWeight: '500', marginBottom: 12, lineHeight: 20 }}
                        numberOfLines={1}
                    >
                        {title}
                    </Typography>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} color="#94A3B8" />
                            <Typography style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }} numberOfLines={1}>
                                {location?.split(',')[0] || 'Kochi'}
                            </Typography>
                        </View>
                        <Typography style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700' }}>
                            JUST NOW
                        </Typography>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

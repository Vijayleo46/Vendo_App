import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, TouchableOpacity, Dimensions, ScrollView, Alert, StatusBar, Platform, ActivityIndicator, StyleSheet, Share, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Typography } from '../components/common/Typography';
import {
    Heart,
    Share2,
    MapPin,
    ArrowLeft,
    Star,
    Calendar,
    ShieldCheck,
    Flag,
    MessageCircle,
    ChevronRight,
    Zap,
} from 'lucide-react-native';
import { listingService } from '../services/listingService';
import { chatService } from '../services/chatService';
import { auth, db } from '../core/config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { collection, getDocs } from 'firebase/firestore';
import { userService } from '../services/userService';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');
const IMG_HEIGHT = height * 0.45;

export const ProductDetailsScreen = ({ route, navigation }: any) => {
    const { theme, isDark } = useTheme();
    const { product } = route.params || {};
    const [item, setItem] = useState<any>(product);
    const sellerDisplayName = item.sellerName === 'Antigravity Test' ? 'Leo' : (item.sellerName || 'Leo');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [loading, setLoading] = useState(!product);
    const [chatLoading, setChatLoading] = useState(false);
    const [userCoins, setUserCoins] = useState(0);

    // Fetch fresh data from backend
    useEffect(() => {
        const fetchListing = async () => {
            if (!item?.id) return;
            try {
                const freshData = await listingService.getListingById(item.id);
                if (freshData) {
                    setItem(freshData);
                }
            } catch (error) {
                console.error('Error fetching fresh listing data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [item?.id]);

    // Check wishlist status
    const checkWishlist = useCallback(async () => {
        const user = auth.currentUser;
        if (user && item?.id) {
            try {
                const inWishlist = await listingService.isInWishlist(user.uid, item.id);
                setIsInWishlist(inWishlist);
            } catch (error) {
                console.error('Error checking wishlist:', error);
            }
        }
    }, [item?.id]);

    useEffect(() => {
        checkWishlist();

        // Fetch User Coins
        const fetchCoins = async () => {
            const user = auth.currentUser;
            if (user) {
                const profile = await userService.getProfile(user.uid);
                if (profile) setUserCoins(profile.coins || 0);
            }
        };
        fetchCoins();
    }, [checkWishlist]);

    const toggleWishlist = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Login Required', 'Please login to save favorites.');
            return;
        }

        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }

        setWishlistLoading(true);
        try {
            if (isInWishlist) {
                await listingService.removeFromWishlist(user.uid, item.id);
                setIsInWishlist(false);
            } else {
                await listingService.addToWishlist(user.uid, item.id);
                setIsInWishlist(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleChatWithSeller = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Login Required', 'Please login to chat with the seller');
            navigation.navigate('Login');
            return;
        }

        setChatLoading(true);

        try {
            const sellerName = item.sellerName || 'Seller';
            const sellerAvatar = item.sellerAvatar || 'https://i.pravatar.cc/150?u=' + item.sellerId;

            const chatId = await chatService.getOrCreateChat(
                user.uid,
                item.sellerId,
                user.displayName || 'Buyer',
                sellerName,
                item.type || 'product',
                item.id,
                item.title
            );

            navigation.navigate('ChatRoom', {
                chatId,
                otherName: sellerName,
                otherAvatar: sellerAvatar,
                productImage: item.images?.[0],
                productPrice: item.price,
                productTitle: item.title,
                productId: item.id
            });

            // Prepare potential background message check
            (async () => {
                try {
                    const messagesRef = collection(db, 'chats', chatId, 'messages');
                    const snapshot = await getDocs(messagesRef);
                    if (snapshot.empty) {
                        await chatService.sendMessage(
                            chatId,
                            user.uid,
                            `Hi ${sellerName}, I'm interested in "${item.title}". Is it still available?`
                        );
                    }
                } catch (e) { }
            })();

        } catch (error: any) {
            Alert.alert('Connection Error', 'Could not start chat. Please check your internet.');
        } finally {
            setChatLoading(false);
        }
    };

    const handleReportListing = () => {
        Alert.alert(
            "Report Listing",
            "Are you sure you want to report this listing? Our team will review it.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Report", style: "destructive", onPress: () => Alert.alert("Reported", "Thank you for helping us keep the community safe.") }
            ]
        );
    };

    const getTimeAgo = () => {
        if (!item?.createdAt) return 'Just now';
        const createdAt = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    if (loading || !item) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    // Precise Kochi Map Image for a realistic look
    const MAP_PLACEHOLDER = "https://images.unsplash.com/photo-1569336415962-a4bd9f6dfc0f?auto=format&fit=crop&q=80&w=1000";

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

            {/* Header / Image Slider */}
            <View style={styles.imageContainer}>
                <FlatList
                    data={item.images || []}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e: any) => {
                        const x = e.nativeEvent.contentOffset.x;
                        const index = Math.round(x / width);
                        if (index !== activeImageIndex) {
                            setActiveImageIndex(index);
                        }
                    }}
                    scrollEventThrottle={16}
                    renderItem={({ item: imgUri, index }: any) => (
                        <TouchableOpacity
                            activeOpacity={0.95}
                            onPress={() => {
                                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
                                navigation.navigate('ImageViewer', {
                                    images: item.images,
                                    initialIndex: index
                                });
                            }}
                            style={{ width, height: IMG_HEIGHT }}
                        >
                            <Image
                                source={{ uri: imgUri }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(_: any, index: number) => index.toString()}
                />

                {/* Pagination Dots */}
                {(item.images?.length > 1) && (
                    <View style={styles.pagination}>
                        {item.images.map((_: any, i: number) => (
                            <View
                                key={i}
                                style={[
                                    styles.paginationDot,
                                    { backgroundColor: activeImageIndex === i ? '#FFF' : 'rgba(255,255,255,0.5)', width: activeImageIndex === i ? 24 : 6 }
                                ]}
                            />
                        ))}
                    </View>
                )}

                {/* Header Actions */}
                <SafeAreaView style={styles.headerOverlay} edges={['top']}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' }]}>
                        <ArrowLeft size={24} color={isDark ? '#FFF' : '#002f34'} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' }]}
                            onPress={() => Share.share({ message: `Check this out: ${item.title} - ${item.price}` })}
                        >
                            <Share2 size={24} color={isDark ? '#FFF' : '#002f34'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' }]} onPress={toggleWishlist}>
                            <Heart size={24} color={isInWishlist ? "#EF4444" : (isDark ? '#FFF' : "#002f34")} fill={isInWishlist ? "#EF4444" : "transparent"} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            {/* Content Body */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={[styles.sheetContainer, { backgroundColor: theme.background }]}
            >
                {/* 1. Primary Info (OLX Style: Price -> Title -> Location) */}
                <View style={styles.section}>
                    <View style={styles.priceRow}>
                        <View>
                            <Typography style={[styles.priceText, { color: theme.text }]}>{item.price}</Typography>
                            <Typography style={{ fontSize: 13, color: theme.textSecondary, fontWeight: '600', marginTop: 4 }}>Negotiable • Local Pickup</Typography>
                        </View>
                        {item.isBoosted && (
                            <LinearGradient
                                colors={['#F59E0B', '#D97706']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.featuredBadge}
                            >
                                <Zap size={10} color="#FFF" fill="#FFF" />
                                <Typography style={styles.featuredBadgeText}>FEATURED AD</Typography>
                            </LinearGradient>
                        )}
                    </View>

                    <Typography style={[styles.titleText, { color: theme.text }]}>{item.title}</Typography>

                    {/* Redeem Coins Offer */}
                    {userCoins > 0 && (
                        <View style={styles.discountCard}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                                    <Typography style={styles.discountTitle}>REDEEM COINS</Typography>
                                </View>
                                <Typography style={styles.discountDesc}>
                                    {userCoins >= 150
                                        ? "You can use 150 coins to get ₹50 OFF!"
                                        : `You have ${userCoins} coins. Earn more to get ₹50 OFF!`}
                                </Typography>
                            </View>
                            <TouchableOpacity
                                style={[styles.redeemBtn, userCoins < 150 && { opacity: 0.5 }]}
                                disabled={userCoins < 150}
                                onPress={() => {
                                    Alert.alert("Redeem Coins", "This will deduct 150 coins from your balance for a ₹50 discount. Confirm with seller in chat!", [
                                        { text: "Cancel", style: "cancel" },
                                        { text: "Confirm", onPress: () => Alert.alert("Success", "Offer sent to seller!") }
                                    ]);
                                }}
                            >
                                <Typography style={styles.redeemBtnText}>Redeem</Typography>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MapPin size={14} color={theme.textSecondary} />
                            <Typography style={[styles.metaText, { color: theme.textSecondary }]}>{item.location || 'Location N/A'}</Typography>
                        </View>
                        <View style={styles.metaItem}>
                            <Calendar size={14} color={theme.textSecondary} />
                            <Typography style={[styles.metaText, { color: theme.textSecondary }]}>{getTimeAgo()}</Typography>
                        </View>
                    </View>
                </View>

                {/* 2. Details Grid */}
                <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 20 }]}>
                    <Typography style={[styles.sectionLabel, { color: theme.text }]}>Quick Specs</Typography>
                    <View style={styles.grid}>
                        <View style={[styles.premiumChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Typography style={[styles.chipLabel, { color: theme.textSecondary }]}>Category</Typography>
                            <Typography style={[styles.chipValue, { color: theme.text }]}>{item.category}</Typography>
                        </View>
                        {item.condition && (
                            <View style={[styles.premiumChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Typography style={[styles.chipLabel, { color: theme.textSecondary }]}>Condition</Typography>
                                <Typography style={[styles.chipValue, { color: theme.text }]}>{item.condition}</Typography>
                            </View>
                        )}
                        {item.type === 'job' && (
                            <>
                                <View style={[styles.premiumChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <Typography style={[styles.chipLabel, { color: theme.textSecondary }]}>Job Type</Typography>
                                    <Typography style={[styles.chipValue, { color: theme.text }]}>{item.jobType || 'Full Time'}</Typography>
                                </View>
                                <View style={[styles.premiumChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <Typography style={[styles.chipLabel, { color: theme.textSecondary }]}>Exp.</Typography>
                                    <Typography style={[styles.chipValue, { color: theme.text }]}>{item.experienceLevel || 'Entry'}</Typography>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* 3. Description */}
                <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 16 }]}>
                    <Typography style={[styles.sectionLabel, { color: theme.text }]}>Description</Typography>
                    <Typography style={[styles.descriptionText, { color: theme.textSecondary }]}>{item.description}</Typography>
                </View>

                {/* 4. Premium Location Section */}
                <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 16 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Typography style={[styles.sectionLabel, { color: theme.text }]}>Location</Typography>
                        <TouchableOpacity
                            onPress={() => {
                                const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location || 'Kochi, Kerala')}`;
                                Platform.OS === 'web' ? window.open(url, '_blank') : Alert.alert("Opening Maps", "Redirecting...");
                            }}
                        >
                            <Typography style={{ color: theme.primary, fontSize: 13, fontWeight: '700', opacity: 0.6 }}>Show on map</Typography>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.premiumMapContainer, { borderColor: theme.border }]}>
                        <Image
                            source={{ uri: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000" }}
                            style={styles.premiumMapImage}
                        />
                        <LinearGradient
                            colors={['transparent', isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)']}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* Pulsating Marker */}
                        <View style={styles.pulsarContainer}>
                            <View style={[styles.pulsarRing, { backgroundColor: isDark ? theme.primary : '#002f34' }]} />
                            <View style={[styles.pulsarCore, { backgroundColor: isDark ? theme.primary : '#002f34' }]} />
                        </View>

                        {/* Glassmorphic Address Card */}
                        <View style={[styles.glassAddressCard, { backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.85)' }]}>
                            <View style={[styles.glassAddressIcon, { backgroundColor: theme.background }]}>
                                <MapPin size={18} color={theme.primary} strokeWidth={3} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography style={[styles.glassAddressTitle, { color: theme.text }]}>{item.location || 'Kochi, Kerala'}</Typography>
                                <Typography style={[styles.glassAddressSubtitle, { color: theme.textSecondary }]}>India • Verified Location</Typography>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.premiumMapsBtn, { backgroundColor: isDark ? theme.surface : '#002f34', shadowColor: isDark ? '#000' : '#002f34' }]}
                        onPress={() => {
                            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location || 'Kochi, Kerala')}`;
                            if (Platform.OS === 'web') window.open(url, '_blank');
                            else Alert.alert("Redirecting", "Opening Google Maps...");
                        }}
                    >
                        <Typography style={styles.premiumMapsBtnText}>DIRECT DIRECTIONS IN MAPS</Typography>
                        <View style={styles.tinyArrow}>
                            <ChevronRight size={14} color="#FFF" strokeWidth={3} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 5. Seller Profile (Enhanced) */}
                <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16 }]}>

                    {/* Earn Coins Reminder */}
                    <View style={styles.earnCoinsBanner}>
                        <View style={styles.earnCoinsIcon}>
                            <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        </View>
                        <Typography style={styles.earnCoinsText}>
                            Earn <Typography style={{ fontWeight: '700' }}>3 Vendo Coins</Typography> for every item you post for sale!
                        </Typography>
                    </View>

                    <Typography style={[styles.sectionLabel, { color: theme.text }]}>Sold By</Typography>
                    <TouchableOpacity style={[styles.sellerRow, { backgroundColor: theme.surface }]}>
                        {item.sellerAvatar ? (
                            <Image source={{ uri: item.sellerAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.placeholderAvatar}>
                                <Typography style={styles.avatarText}>{sellerDisplayName.charAt(0)}</Typography>
                            </View>
                        )}
                        <View style={styles.sellerInfo}>
                            <Typography style={[styles.sellerName, { color: theme.text }]}>{sellerDisplayName}</Typography>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                                <Typography style={styles.sellerRating}>{item.rating || 'New Seller'}</Typography>
                            </View>
                            <Typography style={[styles.memberSince, { color: theme.textSecondary }]}>Member since 2024</Typography>
                        </View>
                        <ChevronRight size={20} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {/* 6. Safety Tips (New Feature) */}
                <View style={[styles.section, {
                    backgroundColor: isDark ? 'rgba(22, 101, 52, 0.1)' : '#F0FDF4',
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(22, 101, 52, 0.3)' : '#BBF7D0'
                }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <ShieldCheck size={20} color={isDark ? '#4ade80' : "#166534"} />
                        <Typography style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#4ade80' : '#166534', marginLeft: 8 }}>Safety Tips</Typography>
                    </View>
                    <View style={{ gap: 8 }}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? '#4ade80' : '#166534', marginTop: 8 }} />
                            <Typography style={{ fontSize: 13, color: isDark ? '#bbf7d0' : '#14532D', flex: 1 }}>Meet in a safe and public place</Typography>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? '#4ade80' : '#166534', marginTop: 8 }} />
                            <Typography style={{ fontSize: 13, color: isDark ? '#bbf7d0' : '#14532D', flex: 1 }}>Don't pay in advance</Typography>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? '#4ade80' : '#166534', marginTop: 8 }} />
                            <Typography style={{ fontSize: 13, color: isDark ? '#bbf7d0' : '#14532D', flex: 1 }}>Check the item before you buy</Typography>
                        </View>
                    </View>
                </View>

                {/* 7. Report Button (New Feature) */}
                <TouchableOpacity
                    onPress={handleReportListing}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, marginBottom: 80, gap: 8 }}
                >
                    <Flag size={16} color="#EF4444" />
                    <Typography style={{ fontSize: 14, fontWeight: '600', color: '#EF4444' }}>Report this ad</Typography>
                </TouchableOpacity>

            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <View>
                    <TouchableOpacity
                        onPress={handleChatWithSeller}
                        disabled={chatLoading}
                        activeOpacity={0.8}
                        style={[styles.chatButton, { backgroundColor: isDark ? theme.surface : '#002f34', opacity: chatLoading ? 0.7 : 1 }]}
                    >
                        {chatLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <MessageCircle size={24} color="#FFFFFF" strokeWidth={2.5} />
                                <Typography style={styles.chatButtonText}>
                                    {item.type === 'job' ? 'Chat with Recruiter' : 'Chat with Seller'}
                                </Typography>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        height: IMG_HEIGHT,
        width: '100%',
        backgroundColor: '#F1F5F9',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    pagination: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    paginationDot: {
        height: 6,
        borderRadius: 3,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sheetContainer: {
        flex: 1,
        marginTop: -24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#002f34',
        letterSpacing: -0.5,
    },
    featuredTag: {
        backgroundColor: '#FEF08A',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    titleText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#002f34',
        marginBottom: 12,
        lineHeight: 28,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#64748B',
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002f34',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    premiumChip: {
        width: (width - 40 - 12) / 2,
        backgroundColor: '#F8FAFC',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    chipLabel: {
        fontSize: 10,
        color: '#94A3B8',
        marginBottom: 2,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chipValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#002f34',
    },
    featuredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        gap: 4,
    },
    featuredBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#334155',
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    placeholderAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#64748B',
    },
    sellerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#002f34',
        marginBottom: 2,
    },
    sellerRating: {
        fontSize: 13,
        color: '#FBBF24',
        fontWeight: '600',
        marginLeft: 4,
    },
    memberSince: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    visitButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    visitButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002f34',
    },
    premiumMapContainer: {
        height: 220,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    premiumMapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    pulsarContainer: {
        position: 'absolute',
        top: '40%',
        left: '50%',
        width: 10,
        height: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulsarRing: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#002f34',
        position: 'absolute',
    },
    pulsarCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#002f34',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    glassAddressCard: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    glassAddressIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    glassAddressTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#002f34',
    },
    glassAddressSubtitle: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    premiumMapsBtn: {
        backgroundColor: '#002f34',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 12,
        elevation: 5,
        shadowColor: '#002f34',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    premiumMapsBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    tinyArrow: {
        width: 20,
        height: 20,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomBar: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 20,
    },
    chatButton: {
        height: 64,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12,
    },
    earnCoinsBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    earnCoinsIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    earnCoinsText: {
        fontSize: 13,
        color: '#92400E',
        flex: 1,
    },
    discountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDFA',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#CCFBF1',
    },
    discountTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#0F766E',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    discountDesc: {
        fontSize: 12,
        color: '#134E48',
        fontWeight: '500',
    },
    redeemBtn: {
        backgroundColor: '#0F766E',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 12,
    },
    redeemBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
});

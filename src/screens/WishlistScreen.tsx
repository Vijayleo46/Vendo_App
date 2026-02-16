import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    RefreshControl,
    Dimensions,
    Alert,
    Pressable
} from 'react-native';
import Animated, {
    FadeInUp,
    FadeInRight,
    Layout,
    FadeOutRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Search,
    Filter,
    Heart,
    MessageCircle,
    ShoppingCart,
    Trash2,
    Package,
    Briefcase,
    Star,
    ChevronRight,
    ArrowRight,
    ChevronLeft
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { listingService, Listing } from '../services/listingService';
import { auth } from '../core/config/firebase';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type TabType = 'all' | 'products' | 'jobs';

export const WishlistScreen = ({ navigation }: any) => {
    const { theme, isDark } = useTheme();
    const isFocused = useIsFocused();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWishlist = useCallback(async () => {
        console.log('=== FETCHING WISHLIST ===');
        try {
            const user = auth.currentUser;
            if (!user) {
                console.log('❌ No user logged in');
                setLoading(false);
                setRefreshing(false);
                return;
            }

            console.log('User ID:', user.uid);
            console.log('Fetching wishlist items from Firebase...');

            const data = await listingService.getWishlistItems(user.uid);
            console.log('✅ Wishlist items fetched:', data.length);
            console.log('Items:', data.map(item => ({ id: item.id, title: item.title, type: item.type })));

            setListings(data);
        } catch (error: any) {
            console.error('=== WISHLIST FETCH ERROR ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchWishlist();
        }
    }, [isFocused, fetchWishlist]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWishlist();
    };

    const handleRemove = async (id: string) => {
        console.log('=== REMOVING FROM WISHLIST ===');
        console.log('Listing ID:', id);

        try {
            const user = auth.currentUser;
            if (!user) {
                console.log('❌ No user logged in');
                Alert.alert('Error', 'Please login to manage wishlist');
                return;
            }

            console.log('User ID:', user.uid);
            console.log('Removing from Firebase...');

            await listingService.removeFromWishlist(user.uid, id);
            console.log('✅ Removed from Firebase');

            setListings(prev => prev.filter(item => item.id !== id));
            console.log('✅ UI updated');

            Alert.alert('Success', 'Removed from wishlist');
        } catch (error: any) {
            console.error('=== REMOVE FROM WISHLIST ERROR ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            Alert.alert('Error', 'Failed to remove from wishlist');
        }
    };

    const filteredListings = listings.filter(item => {
        const matchesTab =
            activeTab === 'all' ? true :
                activeTab === 'products' ? item.type === 'product' :
                    item.type === 'job';

        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const HeartButton = ({ id }: { id: string }) => {
        const scale = useSharedValue(1);

        const springs = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }]
        }));

        const onPress = () => {
            scale.value = withSequence(
                withSpring(1.5),
                withSpring(1, {}, () => {
                    // Remove after animation
                })
            );
            setTimeout(() => handleRemove(id), 200);
        };

        return (
            <Animated.View style={springs}>
                <TouchableOpacity onPress={onPress} style={styles.heartBtn}>
                    <Heart size={20} fill="#EF4444" color="#EF4444" />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const ProductCard = ({ item }: { item: Listing }) => (
        <Animated.View
            entering={FadeInUp}
            exiting={FadeOutRight}
            layout={Layout.springify()}
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
            >
                <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Image
                        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
                        style={styles.cardImage}
                    />
                    <View style={styles.cardInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h3" style={{ flex: 1, marginRight: 8, color: '#002f34' }}>{item.title}</Typography>
                            <HeartButton id={item.id!} />
                        </View>

                        <View style={styles.ratingRow}>
                            <Star size={12} fill="#F59E0B" color="#F59E0B" />
                            <Typography variant="bodySmall" style={{ marginLeft: 4, fontWeight: '600', color: theme.text }}>
                                {item.rating || '4.5'}
                            </Typography>
                            <Typography variant="bodySmall" color="#6B7280" style={{ marginLeft: 8 }}>
                                {item.sellerName}
                            </Typography>
                        </View>

                        <Typography variant="h2" style={{ color: theme.text, marginTop: 4, fontWeight: '900' }}>₹{item.price}</Typography>

                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={[styles.chatBtn, { backgroundColor: theme.primary }]}
                                onPress={() => navigation.navigate('ChatRoom', {
                                    chatId: 'new', // chatService will handle actual ID
                                    otherName: item.sellerName,
                                    productImage: item.images?.[0],
                                    productPrice: item.price,
                                    productTitle: item.title
                                })}
                            >
                                <MessageCircle size={16} color="#FFF" />
                                <Typography style={{ color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>Chat</Typography>
                            </TouchableOpacity>
                            <View style={styles.compareRow}>
                                <View style={styles.checkboxUI} />
                                <Typography variant="bodySmall" color="#6B7280">Compare</Typography>
                            </View>
                        </View>
                    </View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );

    const JobCard = ({ item }: { item: Listing }) => (
        <Animated.View
            entering={FadeInUp}
            exiting={FadeOutRight}
            layout={Layout.springify()}
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
            >
                <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.jobIconContainer, { backgroundColor: theme.surface }]}>
                        <Briefcase size={24} color={theme.text} />
                    </View>
                    <View style={styles.cardInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h3" style={{ flex: 1, marginRight: 8, color: '#002f34' }}>{item.title}</Typography>
                            <HeartButton id={item.id!} />
                        </View>

                        <Typography variant="bodySmall" color="#6B7280" style={{ marginBottom: 4 }}>
                            {item.companyName || 'Tech Corp'}
                        </Typography>

                        <View style={styles.jobMeta}>
                            <View style={[styles.jobBadge, { backgroundColor: theme.surface }]}>
                                <Typography style={[styles.jobBadgeText, { color: theme.text }]}>{item.jobType || 'Full Time'}</Typography>
                            </View>
                            <View style={[styles.jobBadge, { backgroundColor: theme.surface }]}>
                                <Typography style={[styles.jobBadgeText, { color: theme.textSecondary }]}>{item.workMode || 'Remote'}</Typography>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <Typography variant="h3" style={{ color: '#10B981', fontWeight: '900' }}>{item.salaryRange || '₹8L - ₹12L'}</Typography>
                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => Alert.alert('Applied', 'Successfully applied to ' + item.title)}
                            >
                                <Typography style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Apply Now</Typography>
                                <ArrowRight size={14} color="#FFF" style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5087/5087847.png' }}
                style={[styles.emptyImage, { opacity: isDark ? 0.5 : 1 }]}
            />
            <Typography variant="h2" style={{ marginTop: 20, color: theme.text }}>Your wishlist is empty</Typography>
            <Typography variant="bodyMedium" color="#6B7280" style={{ textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
                Explore the marketplace and save items you love for later.
            </Typography>
            <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
            >
                <LinearGradient
                    colors={[theme.primary, theme.primary]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                <Typography style={{ color: '#FFF', fontWeight: '700' }}>Explore Now</Typography>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{
                                marginRight: 12,
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: theme.surface
                            }}
                        >
                            <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Typography variant="h1" style={{ fontSize: 24, fontWeight: '700', color: theme.text }}>Wishlist</Typography>
                    </View>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Filter size={20} color={theme.text} strokeWidth={2} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <Animated.View entering={FadeInRight.delay(200)} style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Search size={20} color={theme.textTertiary} strokeWidth={2} />
                    <TextInput
                        placeholder="Search your wishlist..."
                        style={[styles.searchInput, { color: theme.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={theme.textTertiary}
                    />
                </Animated.View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {(['all', 'products', 'jobs'] as TabType[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[styles.tab, activeTab === tab && [styles.activeTab, { backgroundColor: theme.primary }]]}
                    >
                        <Typography
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText
                            ]}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
            >
                {filteredListings.length === 0 ? (
                    <EmptyState />
                ) : (
                    filteredListings.map((item) => (
                        item.type === 'job' ?
                            <JobCard key={item.id} item={item} /> :
                            <ProductCard key={item.id} item={item} />
                    ))
                )}

                {listings.length > 0 && (
                    <View style={styles.suggestionHeader}>
                        <Typography variant="h2" style={{ color: theme.text }}>Recently Viewed</Typography>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 16,
        borderWidth: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 20,
        marginBottom: 10,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 10,
    },
    activeTab: {
        backgroundColor: '#002f34',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#FFF',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
        paddingTop: 10,
    },
    activeIconBtn: {
        backgroundColor: '#002f34',
    },
    bulkActionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginTop: 20,
        marginBottom: 10,
    },
    bulkDeleteBtn: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
    glassCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    selectedCard: {
    },
    imageContainer: {
        position: 'relative',
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 16,
    },
    priceDropBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: '#10B981',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priceDropText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '900',
    },
    jobIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    checkboxContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeCheckbox: {
    },
    checkboxInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFF',
    },
    heartBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    chatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F46E5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    compareRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxUI: {
        width: 14,
        height: 14,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        marginRight: 6,
    },
    jobMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    jobBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    jobBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6B7280',
    },
    applyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    exploreBtn: {
        marginTop: 30,
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 16,
        overflow: 'hidden',
    },
    suggestionHeader: {
        marginTop: 20,
        marginBottom: 16,
    },
});

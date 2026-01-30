import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, RefreshControl, Alert, Dimensions, Platform } from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import {
    Search, Filter, Eye, MessageCircle, Edit, Trash2, ChevronLeft,
    CheckCircle, TrendingUp, Briefcase, Package, X, Users, Calendar
} from 'lucide-react-native';
import { listingService, Listing } from '../services/listingService';
import { auth } from '../core/config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type TabType = 'all' | 'products' | 'jobs';

export const MyListingsScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const isFocused = useIsFocused();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchListings = async (uid?: string) => {
        const userId = uid || auth.currentUser?.uid;
        if (!userId) {
            setLoading(false);
            setRefreshing(false);
            return;
        }
        try {
            const data = await listingService.getListingsByUser(userId);

            // Sort client-side and handle potential null/undefined createdAt
            const sortedData = [...data].sort((a, b) => {
                const timeA = a.createdAt?.toMillis?.() || (a.createdAt as any)?.seconds * 1000 || Date.now();
                const timeB = b.createdAt?.toMillis?.() || (b.createdAt as any)?.seconds * 1000 || Date.now();
                return timeB - timeA;
            });

            console.log('✅ Sorted results:', sortedData.length);
            setListings(sortedData);
        } catch (error: any) {
            console.error('=== FETCH LISTINGS ERROR ===');
            console.error('Error:', error);
            Alert.alert('Database Error ❌', error.message || 'Failed to fetch listings.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        let unsubscribe: any;
        if (isFocused) {
            // Explicitly wait for Auth to initialize
            unsubscribe = auth.onAuthStateChanged((user) => {
                if (user) {
                    fetchListings(user.uid);
                } else {
                    setLoading(false);
                }
            });
        }
        return () => unsubscribe && unsubscribe();
    }, [isFocused]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = () => {
            return new Promise((resolve) => {
                if (Platform.OS === 'web') {
                    const result = window.confirm('Are you sure you want to delete this listing?');
                    resolve(result);
                } else {
                    Alert.alert(
                        'Delete Listing',
                        'Are you sure you want to delete this listing?',
                        [
                            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) }
                        ]
                    );
                }
            });
        };

        const confirmed = await confirmDelete();
        if (!confirmed) return;

        console.log('=== DELETING LISTING ===');
        console.log('Listing ID:', id);
        setLoading(true);

        try {
            const item = listings.find(l => l.id === id);
            if (item) {
                await listingService.deleteListing(id, item.type);
                console.log('✅ Listing deleted from Firebase');

                // Optimistically update local state or just refetch
                setListings(prev => prev.filter(l => l.id !== id));

                if (Platform.OS !== 'web') {
                    Alert.alert('Success', 'Listing deleted successfully');
                }
            } else {
                throw new Error('Listing not found in local state');
            }
        } catch (error: any) {
            console.error('=== DELETE ERROR ===');
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to delete listing: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
            // Full sync to be sure
            fetchListings();
        }
    };

    const handleMarkSold = async (id: string, type: Listing['type']) => {
        try {
            await listingService.updateListingStatus(id, type, 'sold');
            fetchListings();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleBoost = async (id: string, type: Listing['type']) => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Error', 'You must be logged in to boost listings');
            return;
        }

        Alert.alert(
            '🚀 Boost Listing',
            'Boost this listing for 24 hours?\n\nCost: 20 SuperCoins\nBenefit: Top of search results',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Boost Now',
                    onPress: async () => {
                        try {
                            await listingService.boostListing(id, type, user.uid);
                            Alert.alert('Success! 🎉', 'Your listing is now boosted for 24 hours!');
                            fetchListings();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to boost listing');
                        }
                    }
                }
            ]
        );
    };

    const filteredListings = listings.filter(item => {
        const matchesTab =
            activeTab === 'all' ? true :
                activeTab === 'products' ? item.type === 'product' :
                    item.type === 'job';

        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const ProductCard = ({ item }: { item: Listing }) => (
        <Animated.View entering={FadeInUp} style={styles.card}>
            <View style={styles.cardContent}>
                <Image
                    source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
                    style={styles.productImage}
                />
                <View style={styles.cardInfo}>
                    <Typography variant="h3" style={{ marginBottom: 4, color: '#002f34' }}>{item.title}</Typography>
                    <Typography variant="h2" style={{ color: '#002f34', marginBottom: 8, fontWeight: '900' }}>₹{item.price}</Typography>

                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Eye size={14} color="#6B7280" />
                            <Typography variant="bodySmall" color="#6B7280" style={{ marginLeft: 4 }}>{item.views || 0}</Typography>
                        </View>
                        <View style={styles.statItem}>
                            <MessageCircle size={14} color="#6B7280" />
                            <Typography variant="bodySmall" color="#6B7280" style={{ marginLeft: 4 }}>{item.chatsCount || 0}</Typography>
                        </View>
                    </View>

                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'sold' ? '#EF4444' : '#10B981' }
                    ]}>
                        <Typography style={styles.statusText}>{item.status?.toUpperCase() || 'ACTIVE'}</Typography>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('PostItem', { listing: item })}>
                    <Edit size={18} color="#002f34" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleMarkSold(item.id!, item.type)}>
                    <CheckCircle size={18} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleBoost(item.id!, item.type)}>
                    <TrendingUp size={18} color="#F59E0B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id!)}>
                    <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    const JobCard = ({ item }: { item: Listing }) => (
        <Animated.View entering={FadeInUp} style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.jobIcon}>
                    <Briefcase size={24} color="#002f34" />
                </View>
                <View style={styles.cardInfo}>
                    <Typography variant="h3" style={{ marginBottom: 4, color: '#002f34' }}>{item.title}</Typography>
                    <Typography variant="bodySmall" color="#6B7280" style={{ marginBottom: 8 }}>
                        {item.companyName || 'Company'}
                    </Typography>

                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Users size={14} color="#6B7280" />
                            <Typography variant="bodySmall" color="#6B7280" style={{ marginLeft: 4 }}>
                                {item.applicantsCount || 0} applicants
                            </Typography>
                        </View>
                        <View style={styles.statItem}>
                            <Calendar size={14} color="#6B7280" />
                            <Typography variant="bodySmall" color="#6B7280" style={{ marginLeft: 4 }}>
                                {item.deadline ? 'Active' : 'Ongoing'}
                            </Typography>
                        </View>
                    </View>

                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'closed' ? '#6B7280' : '#002f34' }
                    ]}>
                        <Typography style={styles.statusText}>{item.status?.toUpperCase() || 'ACTIVE'}</Typography>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('PostJob', { listing: item })}>
                    <Edit size={18} color="#002f34" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleMarkSold(item.id!, item.type)}>
                    <X size={18} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleBoost(item.id!, item.type)}>
                    <TrendingUp size={18} color="#F59E0B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id!)}>
                    <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <TouchableOpacity onPress={() => navigation.navigate('Main')} activeOpacity={0.7}>
                <Package size={80} color="#D1D5DB" />
            </TouchableOpacity>
            <Typography variant="h2" style={{ marginTop: 20, marginBottom: 8 }}>No Listings Yet</Typography>
            <Typography variant="bodyMedium" color="#6B7280" style={{ marginBottom: 24, textAlign: 'center' }}>
                Start selling products or posting jobs to see them here
            </Typography>

            <View style={{ gap: 12, width: '100%', alignItems: 'center' }}>
                <TouchableOpacity
                    style={[styles.createBtn, { width: width * 0.7 }]}
                    onPress={() => navigation.navigate('Main')}
                >
                    <LinearGradient
                        colors={['#002f34', '#004a52']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <Typography style={{ color: '#FFF', fontWeight: '800' }}>Post Something</Typography>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.createBtn, { width: width * 0.7, backgroundColor: '#f1f4f5' }]}
                    onPress={async () => {
                        try {
                            setLoading(true);
                            await listingService.seedDemoData();
                            fetchListings();
                            Alert.alert('Success! 🎉', 'Demo data seeded for your account.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to seed data');
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    <Typography style={{ color: '#002f34', fontWeight: '800' }}>Seed Demo Data</Typography>
                </TouchableOpacity>
            </View>
        </View>
    );
    return (
        <View style={styles.container}>
            {/* Header with Gradient Background */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
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
                                    backgroundColor: '#f1f4f5'
                                }}
                            >
                                <ChevronLeft size={24} color="#002f34" strokeWidth={2.5} />
                            </TouchableOpacity>
                            <Typography variant="h1" style={{ fontSize: 24, fontWeight: '700', color: '#002f34' }}>My Listings</Typography>
                        </View>
                        <TouchableOpacity style={styles.filterBtn}>
                            <Filter size={20} color="#002f34" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <Animated.View entering={FadeInRight.delay(200)} style={styles.searchBar}>
                        <Search size={20} color="#7f9799" strokeWidth={2} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search your listings..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#7f9799"
                        />
                    </Animated.View>
                </View>
            </View>

            {/* Segment Control */}
            <Animated.View entering={FadeInUp.delay(300)} style={styles.segmentControl}>
                <TouchableOpacity
                    style={[styles.segmentBtn, activeTab === 'all' && styles.activeSegment]}
                    onPress={() => setActiveTab('all')}
                >
                    <Typography style={[styles.segmentText, activeTab === 'all' && styles.activeSegmentText]}>
                        All
                    </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segmentBtn, activeTab === 'products' && styles.activeSegment]}
                    onPress={() => setActiveTab('products')}
                >
                    <Typography style={[styles.segmentText, activeTab === 'products' && styles.activeSegmentText]}>
                        Products
                    </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segmentBtn, activeTab === 'jobs' && styles.activeSegment]}
                    onPress={() => setActiveTab('jobs')}
                >
                    <Typography style={[styles.segmentText, activeTab === 'jobs' && styles.activeSegmentText]}>
                        Jobs
                    </Typography>
                </TouchableOpacity>
            </Animated.View>

            {/* Listings */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002f34" />}
            >
                {filteredListings.length === 0 ? (
                    <EmptyState />
                ) : (
                    filteredListings.map((item, index) => (
                        item.type === 'job' ?
                            <JobCard key={item.id || index} item={item} /> :
                            <ProductCard key={item.id || index} item={item} />
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerContainer: {
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#e8ebed',
        paddingBottom: 16,
    },
    headerContent: {
        paddingTop: 60,
        paddingHorizontal: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 16,
        borderWidth: 2,
        borderColor: '#002f34',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#1F2937',
    },
    segmentControl: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 4,
        marginTop: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeSegment: {
        backgroundColor: '#002f34',
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeSegmentText: {
        color: '#FFF',
    },
    filterBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    jobIcon: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: '#f1f4f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
    },
    stats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    actionBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    createBtn: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        overflow: 'hidden',
    },
});

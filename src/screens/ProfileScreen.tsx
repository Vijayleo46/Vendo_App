import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Dimensions, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import {
    Settings,
    ChevronRight,
    ShoppingBag,
    Heart,
    Bell,
    ShieldCheck,
    LogOut,
    Moon,
    User,
    Star,
    Grid,
    Wallet
} from 'lucide-react-native';
import { authService } from '../services/authService';
import { auth } from '../core/config/firebase';
import { listingService } from '../services/listingService';
import { userService } from '../services/userService';

const { width } = Dimensions.get('window');

export const ProfileScreen = ({ navigation }: any) => {
    const { theme, spacing, isDark, toggleTheme } = useTheme();
    const isFocused = useIsFocused();
    const user = auth.currentUser;
    const [userListingCount, setUserListingCount] = useState(0);
    const [salesCount, setSalesCount] = useState(0);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUserData = async () => {
        if (!user) return;
        try {
            console.log('=== SYNCING DATA WITH BACKEND ===');
            const [listings, profile] = await Promise.all([
                listingService.getListingsByUser(user.uid),
                userService.getProfile(user.uid)
            ]);

            setUserListingCount(listings.length);
            const soldCount = listings.filter(l => l.status === 'sold').length;
            setSalesCount(soldCount);

            if (profile) {
                setUserProfile(profile);
                console.log('✅ Local Cache Updated');
            }
        } catch (error) {
            console.error('❌ Sync Error:', error);
        }
    };

    // Use profile data from database if available, otherwise use Auth data
    const displayName = userProfile?.displayName || user?.displayName || 'User';
    const email = userProfile?.email || user?.email || '';
    const photoURL = userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop';
    const phone = userProfile?.phone || '';
    const location = userProfile?.location || '';
    const bio = userProfile?.bio || '';

    const handleSyncCoins = async () => {
        if (!user) return;
        try {
            const listings = await listingService.getListingsByUser(user.uid);
            const totalCount = listings.length;
            const soldCount = listings.filter(l => l.status === 'sold').length;

            // 3 coins for Posting + 3 coins for Selling
            const newCoins = (totalCount * 3) + (soldCount * 3);

            await userService.updateProfile(user.uid, { coins: newCoins });
            setUserProfile({ ...userProfile, coins: newCoins });
            setSalesCount(soldCount);
            setUserListingCount(totalCount);

            Alert.alert('Success ✅', `Coins synced! You earned ${totalCount * 3} coins for Posting and ${soldCount * 3} coins for Sales. Total: ${newCoins}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to sync coins.');
        }
    };

    const MenuItem = ({ icon, label, rightElement, onPress, index }: any) => (
        <Animated.View entering={FadeInRight.delay(500 + index * 100)}>
            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: '#FFF' }]}
                onPress={onPress}
            >
                <View style={styles.menuLeft}>
                    <View style={styles.iconBackground}>
                        {icon}
                    </View>
                    <Typography variant="bodyMedium" style={{ marginLeft: 16, fontWeight: '600' }}>{label}</Typography>
                </View>
                {rightElement || <ChevronRight size={20} {...{ color: "#9CA3AF" } as any} />}
            </TouchableOpacity>
        </Animated.View>
    );

    useEffect(() => {
        if (isFocused) fetchUserData();
    }, [isFocused]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserData();
        setRefreshing(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#002f34']} />
                }
            >
                {/* Premium Header */}
                <View style={[styles.header, { paddingTop: 60, paddingHorizontal: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#e8ebed' }]}>
                    <Typography variant="h1" style={{ fontSize: 28, fontWeight: '700', color: '#002f34' }}>Profile</Typography>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Settings size={22} color="#002f34" strokeWidth={2} />
                    </TouchableOpacity>
                </View>

                {/* Profile Identity */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.profileHero}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('EditProfile')}
                        style={styles.avatarGlow}
                    >
                        <Image
                            key={photoURL}
                            source={{
                                uri: photoURL.startsWith('http')
                                    ? `${photoURL}${photoURL.includes('?') ? '&' : '?'}t=${Date.now()}`
                                    : photoURL
                            }}
                            style={styles.avatar}
                        />
                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={14} {...{ color: "#FFF" } as any} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.userInfo}>
                        <Typography variant="h2" style={{ textAlign: 'center' }}>{displayName}</Typography>
                        <Typography variant="bodySmall" color="#9CA3AF" style={{ textAlign: 'center' }}>{email}</Typography>
                        {location && (
                            <Typography variant="bodySmall" color="#6366F1" style={{ textAlign: 'center', marginTop: 4 }}>
                                📍 {location}
                            </Typography>
                        )}
                        {bio && (
                            <Typography variant="bodySmall" color="#6B7280" style={{ textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
                                {bio}
                            </Typography>
                        )}
                    </View>
                </Animated.View>

                {/* Premium Stats bar */}
                <Animated.View entering={FadeInUp.delay(300)} style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Typography variant="h3">{userListingCount}</Typography>
                        <Typography variant="bodySmall" color="#9CA3AF">Listings</Typography>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Typography variant="h3">{userProfile?.coins || 0}</Typography>
                        <Typography variant="bodySmall" color="#F59E0B" style={{ fontWeight: '700' }}>Coins</Typography>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Typography variant="h3">{salesCount}</Typography>
                        <Typography variant="bodySmall" color="#9CA3AF">Sales</Typography>
                    </View>
                </Animated.View>

                {/* Vendo Coins Reward Card */}
                <Animated.View entering={FadeInUp.delay(400)} style={styles.coinsCard}>
                    <LinearGradient
                        colors={['#002f34', '#004d56']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.coinsGradient}
                    >
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Star size={18} color="#FFD700" fill="#FFD700" />
                                <Typography style={{ color: '#FFF', fontSize: 16, fontWeight: '800', marginLeft: 8 }}>Vendo Coins</Typography>
                            </View>
                            <Typography style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Use coins to get exclusive discounts!</Typography>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Typography style={{ color: '#FFD700', fontSize: 24, fontWeight: '900' }}>{userProfile?.coins || 0}</Typography>
                            <Typography style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700' }}>≈ ₹{Math.floor((userProfile?.coins || 0) * (50 / 150))}</Typography>
                            <TouchableOpacity
                                onPress={handleSyncCoins}
                                activeOpacity={0.7}
                                style={styles.syncBtnRefined}
                            >
                                <Typography style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>🔄 SYNC COINS</Typography>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                    <View style={styles.coinsTipRefined}>
                        <Typography style={{ color: '#002f34', fontSize: 11, fontWeight: '600' }}>💡 TIP: 150 Coins = ₹50 discount on any product you buy!</Typography>
                    </View>
                </Animated.View>

                {/* Menu Sections */}
                <View style={styles.menuSection}>
                    <Typography variant="label" color="#9CA3AF" style={styles.sectionTitle}>ACCOUNT</Typography>
                    <MenuItem
                        index={0}
                        icon={<User size={20} {...{ color: "#1F2937" } as any} />}
                        label="Edit Profile"
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <MenuItem
                        index={1}
                        icon={<ShoppingBag size={20} {...{ color: "#1F2937" } as any} />}
                        label="My Listings"
                        onPress={() => navigation.navigate('MyListings')}
                    />
                    <MenuItem
                        index={2}
                        icon={<Heart size={20} {...{ color: "#1F2937" } as any} />}
                        label="Saved Items"
                        onPress={() => navigation.navigate('Wishlist')}
                    />
                    <MenuItem
                        index={3}
                        icon={<Wallet size={20} {...{ color: "#F59E0B" } as any} />}
                        label="SuperCoin Wallet"
                        onPress={() => navigation.navigate('Wallet')}
                    />
                </View>

                <View style={[styles.menuSection, { marginTop: 24 }]}>
                    <Typography variant="label" color="#9CA3AF" style={styles.sectionTitle}>PREFERENCES</Typography>
                    <MenuItem
                        index={3}
                        icon={<Moon size={20} {...{ color: "#1F2937" } as any} />}
                        label="Dark Mode"
                        rightElement={
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#E5E7EB', true: '#1F2937' }}
                                thumbColor="#FFF"
                            />
                        }
                    />
                    <MenuItem
                        index={4}
                        icon={<ShieldCheck size={20} {...{ color: "#1F2937" } as any} />}
                        label="Get Verified (KYC)"
                        onPress={() => navigation.navigate('KYC')}
                        w />
                    {userProfile?.isAdmin && (
                        <MenuItem
                            index={5}
                            icon={<Grid size={20} {...{ color: "#1F2937" } as any} />}
                            label="Admin Dashboard"
                            onPress={() => navigation.navigate('AdminDashboard')}
                        />
                    )}
                    <MenuItem
                        index={6}
                        icon={<Star size={20} {...{ color: "#F59E0B" } as any} />}
                        label="Set Premium Portrait"
                        onPress={async () => {
                            const premiumUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop';
                            try {
                                if (user) {
                                    await userService.updateProfile(user.uid, { photoURL: premiumUrl, updatedAt: new Date() });
                                    Alert.alert('Success ✅', 'Premium portrait applied! Pull down to refresh or re-open the screen.');
                                }
                            } catch (e: any) {
                                Alert.alert('Error', e.message);
                            }
                        }}
                    />
                    <MenuItem
                        index={7}
                        icon={<Grid size={20} {...{ color: "#10B981" } as any} />}
                        label="Populate Demo Data"
                        onPress={async () => {
                            try {
                                await listingService.seedDemoData();
                                Alert.alert('Success ✅', 'Sample items added to database!');
                            } catch (e: any) {
                                Alert.alert('Error', e.message);
                            }
                        }}
                    />
                </View>

                <Animated.View entering={FadeInUp.delay(900)} style={{ paddingHorizontal: 24, marginTop: 40 }}>
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={async () => {
                            try {
                                await authService.logout();
                            } catch (error) {
                                console.error('Logout failed:', error);
                            }
                        }}
                    >
                        <LogOut size={20} {...{ color: "#EF4444" } as any} />
                        <Typography variant="bodyMedium" style={{ marginLeft: 12, fontWeight: '700', color: '#EF4444' }}>Sign Out</Typography>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    settingsBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    profileHero: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarGlow: {
        position: 'relative',
        padding: 4,
        borderRadius: 55,
        backgroundColor: '#FFF',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    userInfo: {
        marginTop: 16,
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        paddingVertical: 20,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        marginBottom: 30,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#F3F4F6',
    },
    menuSection: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1.5,
        fontSize: 11,
        fontWeight: '700',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBackground: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    coinsCard: {
        marginHorizontal: 24,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 30,
    },
    coinsGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        justifyContent: 'space-between',
    },
    syncBtnRefined: {
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    coinsTipRefined: {
        backgroundColor: '#F0FDFA',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Typography } from '../components/common/Typography';
import { Coins, TrendingUp, TrendingDown, Star, Gift, Zap, Award, ArrowLeft } from 'lucide-react-native';
import { auth } from '../core/config/firebase';
import { userService } from '../services/userService';
import { coinTransactionService, CoinTransaction } from '../services/coinTransactionService';

const { width } = Dimensions.get('window');

export const WalletScreen = ({ navigation }: any) => {
    const [userProfile, setUserProfile] = useState<any>(null);
    const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const [profile, txHistory] = await Promise.all([
                userService.getProfile(user.uid),
                coinTransactionService.getUserTransactions(user.uid)
            ]);

            setUserProfile(profile);
            setTransactions(txHistory);
        } catch (error) {
            console.error('Error loading wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionIcon = (reason: string, type: string) => {
        if (type === 'earn') {
            if (reason.includes('Sale')) return <Award size={20} color="#10B981" />;
            if (reason.includes('Listing')) return <Gift size={20} color="#3B82F6" />;
            return <TrendingUp size={20} color="#10B981" />;
        }
        return <TrendingDown size={20} color="#EF4444" />;
    };

    const renderTransaction = ({ item, index }: { item: CoinTransaction; index: number }) => (
        <Animated.View entering={FadeInRight.delay(index * 50)} style={styles.transactionCard}>
            <View style={styles.transactionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: item.type === 'earn' ? '#D1FAE5' : '#FEE2E2' }]}>
                    {getTransactionIcon(item.reason, item.type)}
                </View>
                <View style={{ marginLeft: 12 }}>
                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{item.reason}</Typography>
                    <Typography variant="bodySmall" color="#9CA3AF">
                        {item.timestamp?.toDate?.()?.toLocaleDateString() || 'Just now'}
                    </Typography>
                </View>
            </View>
            <Typography
                variant="bodyLarge"
                style={{
                    fontWeight: '800',
                    color: item.type === 'earn' ? '#10B981' : '#EF4444'
                }}
            >
                {item.type === 'earn' ? '+' : '-'}{item.amount} SC
            </Typography>
        </Animated.View>
    );

    const coins = userProfile?.coins || 0;
    const trustScore = userProfile?.trustScore || 50;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginLeft: -8, marginRight: 8 }}>
                    <ArrowLeft size={24} color="#002f34" />
                </TouchableOpacity>
                <Typography variant="h1" style={{ fontSize: 24, fontWeight: '700', color: '#002f34' }}>
                    SuperCoin Wallet
                </Typography>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Balance Card */}
                <Animated.View entering={FadeInUp.delay(100)} style={styles.balanceCard}>
                    <LinearGradient
                        colors={['#002f34', '#004d56', '#006d75']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.balanceGradient}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <View style={{ backgroundColor: 'rgba(255,215,0,0.2)', padding: 6, borderRadius: 20 }}>
                                <Coins size={20} color="#FFD700" />
                            </View>
                            <Typography style={{ color: '#FFF', fontSize: 14, marginLeft: 8, opacity: 0.9, fontWeight: '500' }}>
                                Total Balance
                            </Typography>
                        </View>

                        <View style={{ marginTop: 4, marginBottom: 8 }}>
                            <Typography style={{ color: '#FFD700', fontSize: 56, fontWeight: '900', lineHeight: 64 }}>
                                {coins}
                            </Typography>
                            <Typography style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: -4 }}>
                                SuperCoins Available
                            </Typography>
                        </View>

                        {/* Trust Score Badge */}
                        <View style={styles.trustBadge}>
                            <Star size={14} color="#FFD700" fill="#FFD700" />
                            <Typography style={{ color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                                Trust Score: {trustScore}/100
                            </Typography>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.actionsContainer}>
                    <Typography variant="label" color="#9CA3AF" style={styles.sectionTitle}>
                        QUICK ACTIONS
                    </Typography>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('MyListings')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Zap size={24} color="#3B82F6" />
                            </View>
                            <Typography variant="bodySmall" style={{ marginTop: 8, fontWeight: '600' }}>
                                Boost Ad
                            </Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Gift size={24} color="#F59E0B" />
                            </View>
                            <Typography variant="bodySmall" style={{ marginTop: 8, fontWeight: '600' }}>
                                Earn More
                            </Typography>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Transaction History */}
                <View style={styles.historySection}>
                    <Typography variant="label" color="#9CA3AF" style={styles.sectionTitle}>
                        TRANSACTION HISTORY
                    </Typography>
                    {transactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Coins size={48} color="#D1D5DB" />
                            <Typography variant="bodyMedium" color="#9CA3AF" style={{ marginTop: 12 }}>
                                No transactions yet
                            </Typography>
                        </View>
                    ) : (
                        <FlatList
                            data={transactions}
                            renderItem={renderTransaction}
                            keyExtractor={(item, index) => item.id || index.toString()}
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceCard: {
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    balanceGradient: {
        padding: 24,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 16,
        alignSelf: 'flex-start',
    },
    actionsContainer: {
        paddingHorizontal: 24,
        marginTop: 32,
    },
    sectionTitle: {
        marginBottom: 16,
        letterSpacing: 1.5,
        fontSize: 11,
        fontWeight: '700',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    actionBtn: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historySection: {
        paddingHorizontal: 24,
        marginTop: 32,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
});

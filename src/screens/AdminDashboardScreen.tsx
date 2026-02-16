import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Image
} from 'react-native';
import Animated, { FadeInUp, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import {
    Users,
    ShoppingBag,
    BarChart3,
    AlertCircle,
    ChevronRight,
    IndianRupee,
    TrendingUp,
    Shield,
    Bell,
    ArrowUpRight,
    Database,
    ChevronLeft,
    CheckCircle,
    XCircle,
    UserCircle,
    Home
} from 'lucide-react-native';

import { listingService } from '../services/listingService';
import { userService } from '../services/userService';

const { width } = Dimensions.get('window');

export const AdminDashboardScreen = ({ navigation }: any) => {
    const { theme, spacing, borderRadius, isDark } = useTheme();
    const [stats, setStats] = React.useState({
        users: 0,
        ads: 0,
        revenue: '₹ 12,480',
        reports: 14
    });
    const [users, setUsers] = React.useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = React.useState(false);

    const fetchData = async () => {
        setLoadingUsers(true);
        try {
            const userData = await userService.getAllUsers();
            const adCount = await listingService.getListingCount();
            setUsers(userData);
            setStats(prev => ({
                ...prev,
                users: userData.length,
                ads: adCount
            }));
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleToggleVerification = async (uid: string, currentStatus: string) => {
        const newStatus = currentStatus === 'verified' ? 'unverified' : 'verified';
        try {
            await userService.updateKycStatus(uid, newStatus as any);
            // Update local state
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, kycStatus: newStatus } : u));
        } catch (error) {
            alert('Failed to update verification status');
        }
    };

    const StatCard = ({ title, value, icon, color, trend, index }: any) => (
        <Animated.View entering={ZoomIn.delay(index * 100)} style={[styles.statCard, { width: (width - 60) / 2, backgroundColor: theme.card }]}>
            <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
                {icon}
            </View>
            <Typography variant="h2" style={{ marginTop: 16, fontSize: 24, fontWeight: '800', color: theme.text }}>{value}</Typography>
            <Typography variant="bodySmall" style={{ marginTop: 4, color: theme.textSecondary }}>{title}</Typography>
            {trend && (
                <View style={styles.trendRow}>
                    <ArrowUpRight size={14} color="#10B981" />
                    <Typography variant="bodySmall" style={{ color: '#10B981', marginLeft: 4, fontWeight: '700' }}>{trend}</Typography>
                </View>
            )}
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingHorizontal: 24, paddingTop: 30 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={[styles.backBtn, { backgroundColor: theme.surface }]}
                        >
                            <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
                            style={[styles.backBtn, { backgroundColor: theme.surface, marginLeft: 8 }]}
                        >
                            <Home size={20} color={theme.text} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Typography variant="h1" style={{ fontSize: 28, fontWeight: '800', color: theme.text }}>Admin Console</Typography>
                        <Typography variant="bodySmall" style={{ color: theme.textSecondary }}>System health & Overview</Typography>
                    </View>
                </View>
                <TouchableOpacity style={[styles.notifBtn, { backgroundColor: theme.surface }]}>
                    <Bell size={20} color={theme.text} />
                    <View style={styles.dot} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                <View style={styles.statsGrid}>
                    <StatCard
                        index={1}
                        title="Total Users"
                        value={stats.users.toLocaleString()}
                        icon={<Users size={20} {...{ color: "#3B82F6" } as any} />}
                        color="#3B82F6"
                        trend="+12.5%"
                    />
                    <StatCard
                        index={2}
                        title="Active Ads"
                        value={stats.ads.toLocaleString()}
                        icon={<ShoppingBag size={20} {...{ color: "#8B5CF6" } as any} />}
                        color="#8B5CF6"
                        trend="+5.2%"
                    />
                    <StatCard
                        index={3}
                        title="Revenue"
                        value={stats.revenue}
                        icon={<IndianRupee size={20} {...{ color: "#10B981" } as any} />}
                        color="#10B981"
                        trend="+18.4%"
                    />
                    <StatCard
                        index={4}
                        title="Reports"
                        value={stats.reports.toString()}
                        icon={<AlertCircle size={20} {...{ color: "#EF4444" } as any} />}
                        color="#EF4444"
                    />
                </View>

                {/* System Status Banner */}
                <Animated.View entering={FadeInUp.delay(500)} style={[styles.statusBanner, { backgroundColor: isDark ? theme.surface : '#1F2937' }]}>
                    <View style={styles.bannerLeft}>
                        <View style={styles.shieldCircle}>
                            <Shield size={24} color="#FFF" />
                        </View>
                        <View style={{ marginLeft: 16 }}>
                            <Typography variant="bodyLarge" style={{ color: '#FFF', fontWeight: '800' }}>System Status: Operational</Typography>
                            <Typography variant="bodySmall" style={{ color: 'rgba(255,255,255,0.7)' }}>All services running smoothly</Typography>
                        </View>
                    </View>
                </Animated.View>

                {/* User Management Section */}
                <Typography variant="h3" style={{ marginTop: 32, marginBottom: 16, fontWeight: '800', color: theme.text }}>User Verification</Typography>
                <View style={[styles.userListContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {users.length === 0 ? (
                        <Typography style={{ padding: 20, color: theme.textSecondary, textAlign: 'center' }}>No users found</Typography>
                    ) : (
                        users.map((item, idx) => (
                            <View key={item.uid} style={[styles.userItem, { borderBottomColor: theme.border, borderBottomWidth: idx === users.length - 1 ? 0 : 1 }]}>
                                <TouchableOpacity
                                    style={styles.userMain}
                                    onPress={() => navigation.navigate('UserProfile', { userId: item.uid })}
                                >
                                    <View style={[styles.userAvatar, { backgroundColor: theme.background }]}>
                                        <UserCircle size={24} color={theme.textSecondary} />
                                    </View>
                                    <View style={{ marginLeft: 12, flex: 1 }}>
                                        <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.text }}>{item.displayName || 'Anonymous User'}</Typography>
                                        <Typography variant="bodySmall" style={{ color: theme.textSecondary }}>{item.email}</Typography>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                            <View style={[styles.statusBadge, { backgroundColor: item.kycStatus === 'verified' ? '#10B98120' : '#F59E0B20' }]}>
                                                <Typography style={{ fontSize: 10, fontWeight: '800', color: item.kycStatus === 'verified' ? '#10B981' : '#F59E0B' }}>
                                                    {item.kycStatus?.toUpperCase() || 'UNVERIFIED'}
                                                </Typography>
                                            </View>
                                            {item.isAdmin && (
                                                <View style={[styles.statusBadge, { backgroundColor: '#3B82F620', marginLeft: 8 }]}>
                                                    <Typography style={{ fontSize: 10, fontWeight: '800', color: '#3B82F6' }}>ADMIN</Typography>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.actionColumn}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('UserProfile', { userId: item.uid })}
                                        style={[styles.actionBtn, { backgroundColor: theme.primary + '15', marginBottom: 8 }]}
                                    >
                                        <UserCircle size={16} color={theme.primary} />
                                        <Typography style={{ color: theme.primary, fontSize: 11, fontWeight: '700', marginLeft: 6 }}>
                                            View Profile
                                        </Typography>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleToggleVerification(item.uid, item.kycStatus)}
                                        style={[styles.verifyBtn, { backgroundColor: item.kycStatus === 'verified' ? '#EF4444' : '#10B981' }]}
                                    >
                                        {item.kycStatus === 'verified' ? (
                                            <XCircle size={16} color="#FFF" />
                                        ) : (
                                            <CheckCircle size={16} color="#FFF" />
                                        )}
                                        <Typography style={{ color: '#FFF', fontSize: 11, fontWeight: '700', marginLeft: 6 }}>
                                            {item.kycStatus === 'verified' ? 'Revoke' : 'Verify'}
                                        </Typography>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <Typography variant="h3" style={{ marginTop: 32, marginBottom: 16, fontWeight: '800', color: theme.text }}>Recent Activity</Typography>
                {[1, 2, 3].map((i, idx) => (
                    <Animated.View key={i} entering={FadeInRight.delay(600 + idx * 100)}>
                        <TouchableOpacity style={[styles.activityItem, { backgroundColor: theme.card }]}>
                            <View style={[styles.activityDot, { backgroundColor: i === 1 ? '#3B82F6' : i === 2 ? '#EF4444' : '#10B981' }]} />
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.text }}>
                                    {i === 1 ? 'New user registered' : i === 2 ? 'Ad reported for spam' : 'Product successfully sold'}
                                </Typography>
                                <Typography variant="bodySmall" style={{ color: theme.textSecondary }}>2 minutes ago</Typography>
                            </View>
                            <ChevronRight size={18} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                <TouchableOpacity
                    style={[styles.analyticsBtn, { marginTop: 12, borderColor: '#10B981', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}
                    onPress={async () => {
                        try {
                            await listingService.seedDemoData();
                            alert('Demo data seeded successfully!');
                            // Refresh ad count
                            const adCount = await listingService.getListingCount();
                            setStats(prev => ({ ...prev, ads: adCount }));
                        } catch (error) {
                            alert('Failed to seed data');
                        }
                    }}
                >
                    <Database size={20} color="#10B981" />
                    <Typography variant="bodyMedium" style={{ marginLeft: 12, fontWeight: '700', color: '#10B981' }}>Seed Database with Demo Data</Typography>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.analyticsBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <BarChart3 size={20} color={theme.text} />
                    <Typography variant="bodyMedium" style={{ marginLeft: 12, fontWeight: '700', color: theme.text }}>View Detailed Analytics</Typography>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
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
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    notifBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    dot: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 24,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    statusBanner: {
        backgroundColor: '#1F2937',
        borderRadius: 24,
        padding: 20,
        marginTop: 20,
        elevation: 4,
    },
    bannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shieldCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 8,
        elevation: 1,
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    analyticsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    userListContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    userMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    verifyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    actionColumn: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginLeft: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    }
});

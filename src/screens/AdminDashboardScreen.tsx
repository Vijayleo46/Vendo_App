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
    ChevronLeft
} from 'lucide-react-native';

import { listingService } from '../services/listingService';
import { userService } from '../services/userService';

const { width } = Dimensions.get('window');

export const AdminDashboardScreen = ({ navigation }: any) => {
    const { theme, spacing, borderRadius } = useTheme();
    const [stats, setStats] = React.useState({
        users: 0,
        ads: 0,
        revenue: '₹ 12,480',
        reports: 14
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            const userCount = await userService.getUserCount();
            const adCount = await listingService.getListingCount();
            setStats(prev => ({
                ...prev,
                users: userCount,
                ads: adCount
            }));
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, color, trend, index }: any) => (
        <Animated.View entering={ZoomIn.delay(index * 100)} style={[styles.statCard, { width: (width - 60) / 2 }]}>
            <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
                {icon}
            </View>
            <Typography variant="h2" style={{ marginTop: 16, fontSize: 24, fontWeight: '800' }}>{value}</Typography>
            <Typography variant="bodySmall" color="#9CA3AF" style={{ marginTop: 4 }}>{title}</Typography>
            {trend && (
                <View style={styles.trendRow}>
                    <ArrowUpRight size={14} {...{ color: "#10B981" } as any} />
                    <Typography variant="bodySmall" style={{ color: '#10B981', marginLeft: 4, fontWeight: '700' }}>{trend}</Typography>
                </View>
            )}
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
            <View style={[styles.header, { paddingHorizontal: 24, paddingTop: 30 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <ChevronLeft size={24} color="#002f34" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <View>
                        <Typography variant="h1" style={{ fontSize: 28, fontWeight: '800' }}>Admin Console</Typography>
                        <Typography variant="bodySmall" color="#9CA3AF">System health & Overview</Typography>
                    </View>
                </View>
                <TouchableOpacity style={styles.notifBtn}>
                    <Bell size={20} {...{ color: "#1F2937" } as any} />
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
                <Animated.View entering={FadeInUp.delay(500)} style={styles.statusBanner}>
                    <View style={styles.bannerLeft}>
                        <View style={styles.shieldCircle}>
                            <Shield size={24} {...{ color: "#FFF" } as any} />
                        </View>
                        <View style={{ marginLeft: 16 }}>
                            <Typography variant="bodyLarge" style={{ color: '#FFF', fontWeight: '800' }}>System Status: Operational</Typography>
                            <Typography variant="bodySmall" style={{ color: 'rgba(255,255,255,0.7)' }}>All services running smoothly</Typography>
                        </View>
                    </View>
                </Animated.View>

                <Typography variant="h3" style={{ marginTop: 32, marginBottom: 16, fontWeight: '800' }}>Recent Activity</Typography>
                {[1, 2, 3].map((i, idx) => (
                    <Animated.View key={i} entering={FadeInRight.delay(600 + idx * 100)}>
                        <TouchableOpacity style={styles.activityItem}>
                            <View style={[styles.activityDot, { backgroundColor: i === 1 ? '#3B82F6' : i === 2 ? '#EF4444' : '#10B981' }]} />
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                                    {i === 1 ? 'New user registered' : i === 2 ? 'Ad reported for spam' : 'Product successfully sold'}
                                </Typography>
                                <Typography variant="bodySmall" color="#9CA3AF">2 minutes ago</Typography>
                            </View>
                            <ChevronRight size={18} {...{ color: "#D1D5DB" } as any} />
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                <TouchableOpacity
                    style={[styles.analyticsBtn, { marginTop: 12, borderColor: '#10B981', backgroundColor: '#ECFDF5' }]}
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
                    <Database size={20} {...{ color: "#10B981" } as any} />
                    <Typography variant="bodyMedium" style={{ marginLeft: 12, fontWeight: '700', color: '#10B981' }}>Seed Database with Demo Data</Typography>
                </TouchableOpacity>

                <TouchableOpacity style={styles.analyticsBtn}>
                    <BarChart3 size={20} {...{ color: "#1F2937" } as any} />
                    <Typography variant="bodyMedium" style={{ marginLeft: 12, fontWeight: '700' }}>View Detailed Analytics</Typography>
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
    }
});

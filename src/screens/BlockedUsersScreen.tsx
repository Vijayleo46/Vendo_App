import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, UserX, UserMinus } from 'lucide-react-native';
import { Typography } from '../components/common/Typography';
import { auth } from '../core/config/firebase';
import { userService } from '../services/userService';
import { useTheme } from '../theme/ThemeContext';

export const BlockedUsersScreen = ({ navigation }: any) => {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadBlockedUsers = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            setLoading(true);
            const profile = await userService.getProfile(user.uid);
            const blockedIds = profile?.privacy?.blockedUsers || [];

            if (blockedIds.length === 0) {
                setBlockedUsers([]);
                return;
            }

            // Fetch details for each blocked user
            const usersData = await Promise.all(
                blockedIds.map(async (id: string) => {
                    const data = await userService.getProfile(id);
                    return data || { uid: id, displayName: 'Unknown User' };
                })
            );
            setBlockedUsers(usersData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlockedUsers();
    }, []);

    const handleUnblock = (targetUser: any) => {
        Alert.alert(
            'Unblock User',
            `Are you sure you want to unblock ${targetUser.displayName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        const user = auth.currentUser;
                        if (!user) return;
                        try {
                            await userService.unblockUser(user.uid, targetUser.uid);
                            setBlockedUsers(prev => prev.filter(u => u.uid !== targetUser.uid));
                        } catch (e) {
                            Alert.alert('Error', 'Failed to unblock user.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.userItem, { borderBottomColor: theme.border }]}>
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                    <Typography style={{ color: theme.primary, fontWeight: '700' }}>
                        {item.displayName?.charAt(0).toUpperCase()}
                    </Typography>
                </View>
                <Typography style={[styles.userName, { color: theme.text }]}>{item.displayName}</Typography>
            </View>
            <TouchableOpacity onPress={() => handleUnblock(item)} style={styles.unblockBtn}>
                <UserMinus size={20} color={theme.error || '#FF4B55'} />
                <Typography style={[styles.unblockText, { color: theme.error || '#FF4B55' }]}>
                    {t('privacy.unblock') || 'Unblock'}
                </Typography>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                    <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Typography variant="h1" style={[styles.title, { color: theme.text }]}>
                    {t('privacy.blocked_users')}
                </Typography>
            </SafeAreaView>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : blockedUsers.length === 0 ? (
                <View style={styles.center}>
                    <UserX size={64} color={theme.textTertiary} strokeWidth={1.5} />
                    <Typography style={[styles.emptyText, { color: theme.textSecondary }]}>
                        {t('privacy.no_blocked_users') || 'No blocked users yet'}
                    </Typography>
                </View>
            ) : (
                <FlatList
                    data={blockedUsers}
                    renderItem={renderItem}
                    keyExtractor={item => item.uid}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    title: { fontSize: 24, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyText: { marginTop: 16, fontSize: 16, textAlign: 'center' },
    list: { padding: 16 },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userName: { fontSize: 16, fontWeight: '600' },
    unblockBtn: { flexDirection: 'row', alignItems: 'center' },
    unblockText: { marginLeft: 4, fontWeight: '600', fontSize: 14 }
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Bell,
    Shield,
    Smartphone,
    HelpCircle,
    Info,
    Trash2,
    ChevronRight,
    Lock,
    Eye,
    LogOut,
    UserX,
    MessageSquare,
    Globe
} from 'lucide-react-native';
import { Typography } from '../components/common/Typography';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { auth } from '../core/config/firebase';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

export const SettingsScreen = ({ navigation }: any) => {
    const { theme, isDark } = useTheme();
    const isFocused = useIsFocused();
    const [notifications, setNotifications] = useState(true);
    const [marketing, setMarketing] = useState(false);
    const [biometric, setBiometric] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const user = auth.currentUser;
            if (user && isFocused) {
                try {
                    const profile = await userService.getProfile(user.uid);
                    if (profile?.settings) {
                        setNotifications(profile.settings.notifications);
                        setMarketing(profile.settings.marketing);
                        setBiometric(profile.settings.biometric);
                    }
                } catch (e) {
                    console.error("Error loading settings:", e);
                }
            }
        };
        loadSettings();
    }, [isFocused]);

    const handleToggle = async (type: string, value: boolean) => {
        const user = auth.currentUser;
        if (!user) return;

        // Update local state first for speed
        if (type === 'notifications') setNotifications(value);
        if (type === 'marketing') setMarketing(value);
        if (type === 'biometric') setBiometric(value);

        try {
            await userService.updateSettings(user.uid, {
                notifications: type === 'notifications' ? value : notifications,
                marketing: type === 'marketing' ? value : marketing,
                biometric: type === 'biometric' ? value : biometric
            });
        } catch (e) {
            Alert.alert('Sync Error', 'Failed to save settings to cloud.');
        }
    };

    const SettingItem = ({ icon: Icon, label, value, onValueChange, onPress, type = 'toggle' }: any) => (
        <TouchableOpacity
            activeOpacity={type === 'link' ? 0.7 : 1}
            onPress={onPress}
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F1F5F9' }]}>
                    <Icon size={20} color={isDark ? theme.primary : theme.text} strokeWidth={2} />
                </View>
                <Typography style={[styles.settingLabel, { color: theme.text }]}>{label}</Typography>
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#E2E8F0', true: theme.primary }}
                    thumbColor="#FFF"
                />
            ) : (
                <ChevronRight size={20} color={theme.textTertiary} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                    <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Typography variant="h1" style={[styles.title, { color: theme.text }]}>Settings</Typography>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>NOTIFICATIONS</Typography>
                <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={Bell}
                        label="Push Notifications"
                        value={notifications}
                        onValueChange={(v: boolean) => handleToggle('notifications', v)}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={Eye}
                        label="Marketing Emails"
                        value={marketing}
                        onValueChange={(v: boolean) => handleToggle('marketing', v)}
                    />
                </View>

                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>PRIVACY & SECURITY</Typography>
                <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={Shield}
                        label="Account Privacy"
                        type="link"
                        onPress={() => { }}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={Lock}
                        label="Biometric Login"
                        value={biometric}
                        onValueChange={(v: boolean) => handleToggle('biometric', v)}
                    />
                </View>

                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>SUPPORT</Typography>
                <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={HelpCircle}
                        label="Help Center"
                        type="link"
                        onPress={() => { }}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={Info}
                        label="About Vendo"
                        type="link"
                        onPress={() => { }}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={LogOut}
                        label="Sign Out"
                        type="link"
                        onPress={async () => {
                            try {
                                await authService.logout();
                            } catch (e) {
                                Alert.alert('Error', 'Failed to log out');
                            }
                        }}
                    />
                </View>

                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>ACCOUNT ACTIONS</Typography>
                <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: theme.card, borderColor: isDark ? theme.border : '#FEE2E2' }]}
                    onPress={() => {
                        Alert.alert(
                            "Delete Account",
                            "Are you sure you want to delete your account? This action is permanent.",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => { } }
                            ]
                        );
                    }}
                >
                    <Trash2 size={20} color="#EF4444" />
                    <Typography style={styles.deleteText}>Delete Account</Typography>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Typography style={[styles.versionText, { color: theme.textTertiary }]}>Version 1.0.4 (Beta)</Typography>
                    <Typography style={[styles.footerText, { color: theme.textTertiary, opacity: 0.6 }]}>Made with ❤️ for Vendo Users</Typography>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
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
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#002f34',
    },
    scrollContent: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginTop: 8,
    },
    sectionBox: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 16,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 20,
        marginTop: 8,
        borderWidth: 1,
    },
    deleteText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
        marginLeft: 12,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        paddingBottom: 40,
    },
    versionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
    },
    footerText: {
        fontSize: 12,
        color: '#CBD5E1',
        marginTop: 4,
    },
});

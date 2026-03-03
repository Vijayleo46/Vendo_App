import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_KEY } from '../core/i18n/i18n';
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
    const { t, i18n } = useTranslation();
    const isFocused = useIsFocused();
    const [notifications, setNotifications] = useState(true);
    const [marketing, setMarketing] = useState(false);
    const [biometric, setBiometric] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
        { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
        { code: 'es', name: 'Spanish', native: 'Español' },
        { code: 'fr', name: 'French', native: 'Français' },
        { code: 'ar', name: 'Arabic', native: 'العربية' },
        { code: 'zh', name: 'Chinese', native: '中文' },
        { code: 'ja', name: 'Japanese', native: '日本語' },
        { code: 'ru', name: 'Russian', native: 'Русский' }
    ];

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

    const changeLanguage = async (code: string) => {
        try {
            await i18n.changeLanguage(code);
            await AsyncStorage.setItem(LANGUAGE_KEY, code);
            setShowLanguageModal(false);
        } catch (error) {
            console.error('Error changing language:', error);
            Alert.alert('Error', 'Failed to change language');
        }
    };

    const SettingItem = ({ icon: Icon, label, value, onValueChange, onPress, type = 'toggle', rightText }: any) => (
        <TouchableOpacity
            activeOpacity={type === 'link' || type === 'select' ? 0.7 : 1}
            onPress={onPress}
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F1F5F9' }]}>
                    <Icon size={20} color={isDark ? theme.primary : theme.text} strokeWidth={2} />
                </View>
                <Typography style={[styles.settingLabel, { color: theme.text }]}>{label}</Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {rightText && (
                    <Typography style={[styles.rightText, { color: theme.textTertiary, marginRight: 8 }]}>
                        {rightText}
                    </Typography>
                )}
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
            </View>
        </TouchableOpacity>
    );

    const currentLanguageName = languages.find(l => l.code === i18n.language)?.native || 'English';

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                    <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Typography variant="h1" style={[styles.title, { color: theme.text }]}>
                    {t('settings.title')}
                </Typography>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.preferences')}</Typography>
                <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={Globe}
                        label={t('common.language')}
                        type="select"
                        rightText={currentLanguageName}
                        onPress={() => setShowLanguageModal(true)}
                    />
                </View>

                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.notifications')}</Typography>
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
                        onPress={() => navigation.navigate('PrivacySettings')}
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
                        label={t('settings.help')}
                        type="link"
                        onPress={() => navigation.navigate('HelpCenter')}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={Info}
                        label="About Vendo"
                        type="link"
                        onPress={() => navigation.navigate('About')}
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

            <Modal
                visible={showLanguageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Typography variant="h2" style={[styles.modalTitle, { color: theme.text }]}>
                            {t('settings.language_selection')}
                        </Typography>
                        <FlatList
                            data={languages}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.languageItem,
                                        { borderBottomColor: theme.border },
                                        i18n.language === item.code && { backgroundColor: theme.primary + '10' }
                                    ]}
                                    onPress={() => changeLanguage(item.code)}
                                >
                                    <View>
                                        <Typography style={[styles.languageNative, { color: theme.text }]}>
                                            {item.native}
                                        </Typography>
                                        <Typography style={[styles.languageName, { color: theme.textTertiary }]}>
                                            {item.name}
                                        </Typography>
                                    </View>
                                    {i18n.language === item.code && (
                                        <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={[styles.closeBtn, { backgroundColor: theme.primary }]}
                            onPress={() => setShowLanguageModal(false)}
                        >
                            <Typography style={styles.closeBtnText}>{t('common.cancel')}</Typography>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    rightText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    languageNative: {
        fontSize: 18,
        fontWeight: '600',
    },
    languageName: {
        fontSize: 12,
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    closeBtn: {
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    }
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft,
    Shield,
    Eye,
    MessageSquare,
    Clock,
    UserCheck,
    Smartphone,
    UserX,
    Info
} from 'lucide-react-native';
import { Typography } from '../components/common/Typography';
import { auth } from '../core/config/firebase';
import { userService } from '../services/userService';
import { useTheme } from '../theme/ThemeContext';
import { useIsFocused } from '@react-navigation/native';

export const PrivacySettingsScreen = ({ navigation }: any) => {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const isFocused = useIsFocused();

    const [profileVisible, setProfileVisible] = useState(true);
    const [showOnlineStatus, setShowOnlineStatus] = useState(true);
    const [showLastSeen, setShowLastSeen] = useState(true);
    const [allowMessages, setAllowMessages] = useState(true);
    const [readReceipts, setReadReceipts] = useState(true);
    const [showNumber, setShowNumber] = useState(false);
    const [twoStepEnabled, setTwoStepEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadPrivacySettings = async () => {
            const user = auth.currentUser;
            if (user && isFocused) {
                try {
                    const profile = await userService.getProfile(user.uid);
                    if (profile?.privacy) {
                        setProfileVisible(profile.privacy.profileVisible);
                        setShowOnlineStatus(profile.privacy.showOnlineStatus);
                        setShowLastSeen(profile.privacy.showLastSeen);
                        setAllowMessages(profile.privacy.allowMessagesFromNonFollowers);
                        setReadReceipts(profile.privacy.readReceipts ?? true);
                        setShowNumber(profile.privacy.showPhoneNumber ?? false);
                        setTwoStepEnabled(profile.privacy.twoStepEnabled ?? false);
                    }
                } catch (e) {
                    console.error("Error loading privacy settings:", e);
                }
            }
        };
        loadPrivacySettings();
    }, [isFocused]);

    const handleToggle = async (type: string, value: boolean) => {
        const user = auth.currentUser;
        if (!user) return;

        // Update local state first
        if (type === 'profileVisible') setProfileVisible(value);
        if (type === 'showOnlineStatus') setShowOnlineStatus(value);
        if (type === 'showLastSeen') setShowLastSeen(value);
        if (type === 'allowMessages') setAllowMessages(value);
        if (type === 'readReceipts') setReadReceipts(value);
        if (type === 'showNumber') setShowNumber(value);

        try {
            await userService.updatePrivacySettings(user.uid, {
                profileVisible: type === 'profileVisible' ? value : profileVisible,
                showOnlineStatus: type === 'showOnlineStatus' ? value : showOnlineStatus,
                showLastSeen: type === 'showLastSeen' ? value : showLastSeen,
                allowMessagesFromNonFollowers: type === 'allowMessages' ? value : allowMessages,
                readReceipts: type === 'readReceipts' ? value : readReceipts,
                showPhoneNumber: type === 'showNumber' ? value : showNumber,
                blockedUsers: [], // Existing logic would need list management
                twoStepEnabled: twoStepEnabled
            });
        } catch (e) {
            Alert.alert('Sync Error', 'Failed to save privacy settings.');
        }
    };

    const SettingItem = ({ icon: Icon, label, description, value, onValueChange, type = 'toggle', onPress }: any) => (
        <TouchableOpacity
            disabled={type === 'toggle'}
            onPress={onPress}
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F1F5F9' }]}>
                    <Icon size={20} color={isDark ? theme.primary : theme.text} strokeWidth={2} />
                </View>
                <View style={styles.textContainer}>
                    <Typography style={[styles.settingLabel, { color: theme.text }]}>{label}</Typography>
                    {description && (
                        <Typography style={[styles.settingDesc, { color: theme.textSecondary }]}>{description}</Typography>
                    )}
                </View>
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#E2E8F0', true: theme.primary }}
                    thumbColor="#FFF"
                />
            ) : (
                <ChevronLeft size={20} color={theme.textTertiary} style={{ transform: [{ rotate: '180deg' }] }} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                    <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Typography variant="h1" style={[styles.title, { color: theme.text }]}>
                    {t('privacy.title')}
                </Typography>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('privacy.visibility')}</Typography>
                <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={Eye}
                        label={t('privacy.profile_visible')}
                        description={t('privacy.profile_visible_desc')}
                        value={profileVisible}
                        onValueChange={(v: boolean) => handleToggle('profileVisible', v)}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={Clock}
                        label={t('privacy.show_last_seen')}
                        description={t('privacy.show_last_seen_desc')}
                        value={showLastSeen}
                        onValueChange={(v: boolean) => handleToggle('showLastSeen', v)}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={Smartphone}
                        label={t('privacy.show_phone')}
                        description={t('privacy.show_phone_desc')}
                        value={showNumber}
                        onValueChange={(v: boolean) => handleToggle('showNumber', v)}
                    />
                </View>

                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('privacy.interactions')}</Typography>
                <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={UserCheck}
                        label={t('privacy.show_online_status')}
                        description={t('privacy.show_online_status_desc')}
                        value={showOnlineStatus}
                        onValueChange={(v: boolean) => handleToggle('showOnlineStatus', v)}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={MessageSquare}
                        label={t('privacy.read_receipts')}
                        description={t('privacy.read_receipts_desc')}
                        value={readReceipts}
                        onValueChange={(v: boolean) => handleToggle('readReceipts', v)}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={MessageSquare}
                        label={t('privacy.allow_messages')}
                        description={t('privacy.allow_messages_desc')}
                        value={allowMessages}
                        onValueChange={(v: boolean) => handleToggle('allowMessages', v)}
                    />
                </View>

                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('privacy.security') || 'SECURITY'}</Typography>
                <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={UserX}
                        label={t('privacy.blocked_users') || 'Blocked Users'}
                        description={t('privacy.blocked_users_desc') || 'Manage accounts you have blocked.'}
                        type="link"
                        onPress={() => navigation.navigate('BlockedUsers')}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={Shield}
                        label={t('privacy.two_step') || 'Two-Step Verification'}
                        description={t('privacy.two_step_desc') || 'Add an extra layer of security to your account.'}
                        type="link"
                        onPress={() => navigation.navigate('TwoStepVerification')}
                    />
                </View>

                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('privacy.account') || 'ACCOUNT'}</Typography>
                <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={Info}
                        label={t('privacy.request_data') || 'Request Account Data'}
                        description={t('privacy.request_data_desc') || 'Get a copy of your personal discovery information.'}
                        type="link"
                        onPress={async () => {
                            const user = auth.currentUser;
                            if (!user) return;
                            try {
                                await userService.requestAccountData(user.uid, user.email || '');
                                Alert.alert(
                                    t('privacy.request_sent_title') || 'Request Sent',
                                    t('privacy.request_sent_desc') || 'Your request for account data has been received. We will notify you when it is ready.'
                                );
                            } catch (e) {
                                Alert.alert('Error', 'Failed to submit data request.');
                            }
                        }}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Shield size={20} color={theme.textTertiary} />
                    <Typography style={[styles.infoText, { color: theme.textTertiary }]}>
                        {t('privacy.footer_text')}
                    </Typography>
                </View>
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
    title: {
        fontSize: 24,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
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
        flex: 1,
        marginRight: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    settingDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingHorizontal: 16,
    },
    infoText: {
        fontSize: 12,
        textAlign: 'center',
        marginLeft: 8,
        lineHeight: 18,
    }
});

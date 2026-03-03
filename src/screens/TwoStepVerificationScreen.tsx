import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ShieldCheck, ShieldAlert, Fingerprint, Lock } from 'lucide-react-native';
import { Typography } from '../components/common/Typography';
import { auth } from '../core/config/firebase';
import { userService } from '../services/userService';
import { useTheme } from '../theme/ThemeContext';

export const TwoStepVerificationScreen = ({ navigation }: any) => {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStatus = async () => {
            const user = auth.currentUser;
            if (!user) return;
            try {
                const profile = await userService.getProfile(user.uid);
                setEnabled(profile?.privacy?.twoStepEnabled || false);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadStatus();
    }, []);

    const handleToggle = async (value: boolean) => {
        const user = auth.currentUser;
        if (!user) return;

        if (value) {
            Alert.alert(
                'Enable Two-Step Verification',
                'This will add an extra layer of security to your account. You will need a verification code when you log in from a new device.',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setEnabled(false) },
                    {
                        text: 'Enable',
                        onPress: async () => {
                            try {
                                await userService.updateTwoStepStatus(user.uid, true);
                                setEnabled(true);
                            } catch (e) {
                                Alert.alert('Error', 'Failed to update security settings.');
                                setEnabled(false);
                            }
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                'Disable Two-Step Verification',
                'Are you sure? This makes your account less secure.',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setEnabled(true) },
                    {
                        text: 'Disable',
                        onPress: async () => {
                            try {
                                await userService.updateTwoStepStatus(user.uid, false);
                                setEnabled(false);
                            } catch (e) {
                                Alert.alert('Error', 'Failed to update security settings.');
                                setEnabled(true);
                            }
                        }
                    }
                ]
            );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                    <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Typography variant="h1" style={[styles.title, { color: theme.text }]}>
                    {t('privacy.two_step')}
                </Typography>
            </SafeAreaView>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.iconContainer}>
                        {enabled ? (
                            <ShieldCheck size={80} color={theme.primary} strokeWidth={1.5} />
                        ) : (
                            <ShieldAlert size={80} color={theme.textTertiary} strokeWidth={1.5} />
                        )}
                    </View>

                    <Typography variant="h2" style={[styles.statusTitle, { color: theme.text }]}>
                        {enabled ? t('privacy.2fa_active') || 'Verification is Active' : t('privacy.2fa_inactive') || 'Verification is Off'}
                    </Typography>

                    <Typography style={[styles.statusDesc, { color: theme.textSecondary }]}>
                        {enabled
                            ? t('privacy.2fa_active_desc') || 'Your account is protected with an extra layer of security.'
                            : t('privacy.2fa_inactive_desc') || 'Enable two-step verification to protect your account from unauthorized access.'
                        }
                    </Typography>

                    <View style={[styles.settingBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Lock size={20} color={theme.text} />
                                <Typography style={[styles.settingLabel, { color: theme.text }]}>
                                    {t('privacy.enable_2fa') || 'Two-Step Verification'}
                                </Typography>
                            </View>
                            <Switch
                                value={enabled}
                                onValueChange={handleToggle}
                                trackColor={{ false: '#E2E8F0', true: theme.primary }}
                                thumbColor="#FFF"
                            />
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Fingerprint size={20} color={theme.textTertiary} />
                        <Typography style={[styles.infoText, { color: theme.textTertiary }]}>
                            {t('privacy.2fa_info') || 'When logging in from a new device, we will ask for a verification code sent to your registered email or phone.'}
                        </Typography>
                    </View>
                </ScrollView>
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
    content: { padding: 24, alignItems: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    iconContainer: { marginVertical: 32 },
    statusTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
    statusDesc: { fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
    settingBox: { width: '100%', borderRadius: 16, borderWidth: 1, padding: 4, marginBottom: 24 },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    settingLabel: { marginLeft: 12, fontSize: 16, fontWeight: '600' },
    infoBox: { flexDirection: 'row', paddingHorizontal: 16, alignItems: 'flex-start' },
    infoText: { marginLeft: 12, fontSize: 12, lineHeight: 18 }
});

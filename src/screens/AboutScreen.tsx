import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Github, Globe, Mail, Heart } from 'lucide-react-native';
import { Typography } from '../components/common/Typography';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

export const AboutScreen = ({ navigation }: any) => {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                    <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Typography variant="h1" style={[styles.title, { color: theme.text }]}>
                    {t('settings.about') || 'About Vendo'}
                </Typography>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoContainer}>
                    <View style={[styles.logoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Typography variant="h1" style={[styles.appName, { color: theme.text }]}>Vendo</Typography>
                    <Typography style={[styles.version, { color: theme.textTertiary }]}>Version 1.0.4 (Beta)</Typography>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Typography style={[styles.cardTitle, { color: theme.text }]}>Developer Info</Typography>
                    <View style={styles.divider} />
                    <View style={styles.devRow}>
                        <Typography style={[styles.devLabel, { color: theme.textSecondary }]}>Developed by</Typography>
                        <Typography style={[styles.devValue, { color: theme.primary }]}>vm</Typography>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Typography style={[styles.cardTitle, { color: theme.text }]}>Our Mission</Typography>
                    <View style={styles.divider} />
                    <Typography style={[styles.missionText, { color: theme.textSecondary }]}>
                        Vendo is a modern e-commerce platform designed to bring local communities closer together. We believe in safe, fast, and transparent peer-to-peer trading.
                    </Typography>
                </View>

                <View style={styles.contactSection}>
                    <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>CONNECT WITH US</Typography>
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Globe size={20} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Github size={20} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Mail size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.loveRow}>
                        <Typography style={[styles.loveText, { color: theme.textTertiary }]}>Made with </Typography>
                        <Heart size={14} color="#EF4444" fill="#EF4444" />
                        <Typography style={[styles.loveText, { color: theme.textTertiary }]}> in Kerala</Typography>
                    </View>
                    <Typography style={[styles.copyright, { color: theme.textTertiary }]}>© 2024 Vendo Inc. All rights reserved.</Typography>
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
    logoContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    logoBox: {
        width: 100,
        height: 100,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    logo: {
        width: 80,
        height: 80,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    version: {
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 20,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 16,
    },
    devRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    devLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    devValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    missionText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    contactSection: {
        marginTop: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 16,
    },
    socialBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginTop: 60,
        alignItems: 'center',
        paddingBottom: 40,
    },
    loveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    loveText: {
        fontSize: 14,
        fontWeight: '600',
    },
    copyright: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.6,
    },
});

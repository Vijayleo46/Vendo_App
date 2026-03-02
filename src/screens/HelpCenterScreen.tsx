import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, MessageCircle, Mail, Phone, ExternalLink, HelpCircle } from 'lucide-react-native';
import { Typography } from '../components/common/Typography';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export const HelpCenterScreen = ({ navigation }: any) => {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();

    const contactMethods = [
        {
            icon: MessageCircle,
            label: t('help.whatsapp'),
            value: '+91 1234567890',
            color: '#25D366',
            onPress: () => Linking.openURL('whatsapp://send?phone=+911234567890')
        },
        {
            icon: Mail,
            label: t('help.email'),
            value: 'support@vendo.com',
            color: '#EA4335',
            onPress: () => Linking.openURL('mailto:support@vendo.com')
        },
        {
            icon: Phone,
            label: t('help.call'),
            value: '+91 1234567890',
            color: '#34A853',
            onPress: () => Linking.openURL('tel:+911234567890')
        }
    ];

    const faqs = [
        { q: t('help.faq_1_q'), a: t('help.faq_1_a') },
        { q: t('help.faq_2_q'), a: t('help.faq_2_a') }
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                    <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Typography variant="h1" style={[styles.title, { color: theme.text }]}>
                    {t('help.title')}
                </Typography>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={isDark ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#F1F5F9']}
                    style={styles.heroSection}
                >
                    <HelpCircle size={48} color={theme.primary} strokeWidth={1.5} />
                    <Typography variant="h2" style={[styles.heroTitle, { color: theme.text }]}>
                        {t('help.subtitle')}
                    </Typography>
                    <Typography variant="bodyMedium" style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                        {t('help.support_text')}
                    </Typography>
                </LinearGradient>

                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    {t('help.contact_us')}
                </Typography>

                <View style={styles.contactContainer}>
                    {contactMethods.map((method, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={method.onPress}
                        >
                            <View style={[styles.iconBox, { backgroundColor: method.color + '15' }]}>
                                <method.icon size={24} color={method.color} />
                            </View>
                            <View style={styles.contactInfo}>
                                <Typography style={[styles.contactLabel, { color: theme.textSecondary }]}>
                                    {method.label}
                                </Typography>
                                <Typography style={[styles.contactValue, { color: theme.text }]}>
                                    {method.value}
                                </Typography>
                            </View>
                            <ExternalLink size={18} color={theme.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <Typography style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    {t('help.faq')}
                </Typography>

                <View style={[styles.faqContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {faqs.map((faq, index) => (
                        <View key={index} style={[styles.faqItem, index < faqs.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                            <Typography style={[styles.faqQuestion, { color: theme.text }]}>
                                {faq.q}
                            </Typography>
                            <Typography style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                                {faq.a}
                            </Typography>
                        </View>
                    ))}
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
    heroSection: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 24,
        marginBottom: 32,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 16,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    contactContainer: {
        gap: 16,
        marginBottom: 32,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    faqContainer: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    faqItem: {
        padding: 20,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 20,
    },
});

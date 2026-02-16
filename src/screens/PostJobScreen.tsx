import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, Switch, Platform, Dimensions } from 'react-native';
import Animated, { FadeInUp, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import {
    ArrowLeft, Check, Upload, Briefcase, MapPin, IndianRupee,
    Plus, X, Calendar, Mail, Phone, MessageCircle, Globe
} from 'lucide-react-native';
import { listingService } from '../services/listingService';
import { storageService } from '../services/storageService';
import { auth } from '../core/config/firebase';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const JOB_TYPES = ['Full Time', 'Part Time', 'Remote', 'Internship', 'Freelance'];
const WORK_MODES = ['Onsite', 'Remote', 'Hybrid'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'];

export const PostJobScreen = ({ navigation }: any) => {
    const { theme, isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [statusText, setStatusText] = useState('');

    // Form State
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState(auth.currentUser?.displayName || 'Leo');
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [jobType, setJobType] = useState('Full Time');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [experience, setExperience] = useState('Entry Level');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [workMode, setWorkMode] = useState('Onsite');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [enableChat, setEnableChat] = useState(true);

    const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
        try { Haptics.impactAsync(style); } catch (e) { }
    };

    const pickLogo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            triggerHaptic();
            setCompanyLogo(result.assets[0].uri);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            triggerHaptic();
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handlePreview = () => {
        triggerHaptic();
        const previewItem = {
            title: jobTitle || 'Job Title Preview',
            description: description || 'No description provided.',
            price: salaryMin && salaryMax ? `₹${salaryMin} - ₹${salaryMax}` : 'Negotiable',
            category: 'Jobs',
            images: companyLogo ? [companyLogo] : [],
            sellerId: auth.currentUser?.uid || 'preview',
            sellerName: companyName || 'Company Name',
            location: location || 'Location Preview',
            rating: 5,
            type: 'job',
            jobType,
            salaryRange: salaryMin && salaryMax ? `₹${salaryMin} - ₹${salaryMax}` : 'Negotiable',
            skills,
            experienceLevel: experience,
            companyName,
            companyLogo,
            workMode,
        };
        navigation.navigate('ProductDetails', { product: previewItem });
    };

    const handlePostJob = async () => {
        if (!jobTitle || !companyName || !description || !location) {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert('Missing Details', 'Please fill in all required fields.');
            return;
        }

        console.log('🚀 === POST JOB BUTTON CLICKED ===');
        console.log('Job Title:', jobTitle);
        console.log('Company:', companyName);
        console.log('Location:', location);

        setLoading(true);
        setStatusText('Starting upload...');
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const user = auth.currentUser;
            console.log('✅ User authenticated:', user?.uid);
            let logoUrl = '';

            if (companyLogo) {
                console.log('📸 Uploading company logo...');
                setStatusText('Uploading company logo...');
                const urls = await storageService.uploadMultipleImages([companyLogo], 'jobs');
                logoUrl = urls[0];
                console.log('✅ Logo uploaded:', logoUrl);
            }

            console.log('💾 Saving job to Firestore...');
            setStatusText('Saving job details...');
            const jobId = await listingService.createListing({
                title: jobTitle,
                description,
                price: salaryMin && salaryMax ? `₹${salaryMin} - ₹${salaryMax}` : 'Negotiable',
                category: 'Jobs',
                images: logoUrl ? [logoUrl] : [],
                sellerId: user?.uid || 'anonymous',
                sellerName: companyName,
                rating: 0,
                type: 'job',
                location,
                condition: 'New',
                jobType,
                salaryRange: salaryMin && salaryMax ? `₹${salaryMin} - ₹${salaryMax}` : 'Negotiable',
                skills,
                experienceLevel: experience,
                companyName,
                companyLogo: logoUrl,
                workMode: workMode as any,
                contactEmail: email,
                contactPhone: phone,
                showPhone: !!phone,
                enableChat,
                status: 'active',
                views: 0,
                chatsCount: 0,
            });

            console.log('✅ JOB POSTED SUCCESSFULLY! ID:', jobId);
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) { }
            setStatusText('Success!');
            setSuccess(true);
            Alert.alert('Success! 🎉', 'Job posted successfully!');
            setTimeout(() => {
                setSuccess(false);
                setStatusText('');
                navigation.navigate('HomeTab');
            }, 2000);

        } catch (error) {
            console.error('❌ === POST JOB ERROR ===');
            console.error('Error details:', error);
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (e) { }
            Alert.alert('Error', 'Failed to post job. Check console for details.');
        } finally {
            setLoading(false);
            setStatusText('');
        }
    };

    if (success) {
        return (
            <View style={styles.successContainer}>
                <Animated.View entering={ZoomIn} style={styles.successIcon}>
                    <Check size={60} color="#FFF" />
                </Animated.View>
                <Animated.View entering={FadeInUp.delay(300)} style={{ alignItems: 'center' }}>
                    <Typography variant="h1" style={{ color: '#FFF', marginTop: 20 }}>Job Posted!</Typography>
                    <Typography style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8 }}>Candidates can now apply.</Typography>

                    <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => navigation.navigate('MyListings')}
                    >
                        <Typography style={styles.doneBtnText}>Go to My Ads</Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backHomeBtn}
                        onPress={() => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Main', params: { screen: 'HomeTab' } }],
                            });
                        }}
                    >
                        <Typography style={styles.backHomeBtnText}>Back to Home</Typography>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
                    <ArrowLeft size={24} color={theme.text} strokeWidth={2} />
                </TouchableOpacity>
                <View>
                    <Typography variant="h2" style={{ color: theme.text, fontWeight: '700', fontSize: 20 }}>Post a Job</Typography>
                    <Typography variant="bodySmall" style={{ color: theme.textSecondary }}>Reach thousands of candidates</Typography>
                </View>
                <TouchableOpacity
                    style={[styles.textBtn, { backgroundColor: theme.surface }, loading && { opacity: 0.5 }]}
                    onPress={handlePostJob}
                    disabled={loading}
                >
                    <Typography style={{ color: theme.text, fontWeight: '700' }}>
                        {loading ? '...' : 'Save'}
                    </Typography>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Company Info */}
                <Animated.View entering={FadeInUp.delay(200)}>
                    <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.cardHeader}>
                            <Briefcase size={20} color={theme.text} />
                            <Typography variant="h3" style={{ marginLeft: 10, color: theme.text }}>Company Info</Typography>
                        </View>

                        <View style={styles.logoRow}>
                            <TouchableOpacity onPress={pickLogo} style={[styles.logoUpload, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                {companyLogo ? (
                                    <Image source={{ uri: companyLogo }} style={styles.logoImage} />
                                ) : (
                                    <View style={{ alignItems: 'center' }}>
                                        <Upload size={24} color={theme.textTertiary} />
                                        <Typography variant="bodySmall" color={theme.textTertiary} style={{ marginTop: 4 }}>Logo</Typography>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Typography variant="label" style={[styles.label, { color: theme.textSecondary }]}>COMPANY NAME</Typography>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    placeholder="e.g. Acme Corp"
                                    value={companyName}
                                    onChangeText={setCompanyName}
                                    placeholderTextColor={theme.textTertiary}
                                />
                            </View>
                        </View>
                    </BlurView>
                </Animated.View>

                {/* Job Details */}
                <Animated.View entering={FadeInUp.delay(300)}>
                    <View style={[styles.cardWhite, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.cardHeader}>
                            <Check size={20} color={theme.text} />
                            <Typography variant="h3" style={{ marginLeft: 10, color: theme.text }}>Job Details</Typography>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={[styles.label, { color: theme.textSecondary }]}>JOB TITLE</Typography>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                placeholder="e.g. Senior React Native Developer"
                                value={jobTitle}
                                onChangeText={setJobTitle}
                                placeholderTextColor={theme.textTertiary}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={[styles.label, { color: theme.textSecondary }]}>JOB TYPE</Typography>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                                {JOB_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }, jobType === type && [styles.activeChip, { backgroundColor: theme.primary, borderColor: theme.primary }]]}
                                        onPress={() => {
                                            triggerHaptic();
                                            setJobType(type);
                                        }}
                                    >
                                        <Typography style={[styles.chipText, { color: theme.textSecondary }, jobType === type && styles.activeChipText]}>{type}</Typography>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={[styles.label, { color: theme.textSecondary }]}>SALARY RANGE (YEARLY)</Typography>
                            <View style={styles.salaryRow}>
                                <View style={[styles.salaryInput, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <IndianRupee size={16} color={theme.textTertiary} />
                                    <TextInput
                                        style={{ flex: 1, marginLeft: 8, color: theme.text }}
                                        placeholder="Min"
                                        keyboardType="numeric"
                                        value={salaryMin}
                                        onChangeText={setSalaryMin}
                                        placeholderTextColor={theme.textTertiary}
                                    />
                                </View>
                                <Typography style={{ marginHorizontal: 8, color: theme.text }}>-</Typography>
                                <View style={[styles.salaryInput, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <IndianRupee size={16} color={theme.textTertiary} />
                                    <TextInput
                                        style={{ flex: 1, marginLeft: 8, color: theme.text }}
                                        placeholder="Max"
                                        keyboardType="numeric"
                                        value={salaryMax}
                                        onChangeText={setSalaryMax}
                                        placeholderTextColor={theme.textTertiary}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={[styles.label, { color: theme.textSecondary }]}>REQUIRED SKILLS</Typography>
                            <View style={styles.skillInputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Add a skill..."
                                    value={newSkill}
                                    onChangeText={setNewSkill}
                                    onSubmitEditing={addSkill}
                                    placeholderTextColor={theme.textTertiary}
                                />
                                <TouchableOpacity onPress={addSkill} style={[styles.addSkillBtn, { backgroundColor: theme.primary }]}>
                                    <Plus size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.tagsContainer}>
                                {skills.map(skill => (
                                    <TouchableOpacity key={skill} onPress={() => removeSkill(skill)} style={[styles.tag, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF' }]}>
                                        <Typography style={[styles.tagText, { color: isDark ? theme.primary : '#002f34' }]}>{skill}</Typography>
                                        <X size={14} color={isDark ? theme.primary : '#002f34'} style={{ marginLeft: 4 }} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Logistics */}
                <Animated.View entering={FadeInUp.delay(400)}>
                    <View style={[styles.cardWhite, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.cardHeader}>
                            <MapPin size={20} color={theme.text} />
                            <Typography variant="h3" style={{ marginLeft: 10, color: theme.text }}>Logistics</Typography>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={[styles.label, { color: theme.textSecondary }]}>LOCATION</Typography>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                placeholder="City, Country"
                                value={location}
                                onChangeText={setLocation}
                                placeholderTextColor={theme.textTertiary}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={[styles.label, { color: theme.textSecondary }]}>WORK MODE</Typography>
                            <View style={[styles.segmentControl, { backgroundColor: theme.surface }]}>
                                {WORK_MODES.map(mode => (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[styles.segmentBtn, workMode === mode && [styles.activeSegment, { backgroundColor: theme.card }]]}
                                        onPress={() => {
                                            triggerHaptic();
                                            setWorkMode(mode);
                                        }}
                                    >
                                        <Typography style={[styles.segmentText, { color: theme.textSecondary }, workMode === mode && [styles.activeSegmentText, { color: theme.text }]]}>{mode}</Typography>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Description */}
                <Animated.View entering={FadeInUp.delay(500)}>
                    <View style={[styles.cardWhite, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.cardHeader}>
                            <Briefcase size={20} color={theme.text} />
                            <Typography variant="h3" style={{ marginLeft: 10, color: theme.text }}>Description</Typography>
                        </View>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 120, textAlignVertical: 'top', paddingTop: 12 }]}
                            placeholder="Describe the role, responsibilities, and requirements..."
                            multiline
                            value={description}
                            onChangeText={setDescription}
                            placeholderTextColor={theme.textTertiary}
                        />
                    </View>
                </Animated.View>

                {/* Contact */}
                <Animated.View entering={FadeInUp.delay(600)}>
                    <View style={[styles.cardWhite, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.cardHeader}>
                            <Mail size={20} color={theme.text} />
                            <Typography variant="h3" style={{ marginLeft: 10, color: theme.text }}>Application & Contact</Typography>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={[styles.label, { color: theme.textSecondary }]}>CONTACT EMAIL</Typography>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                placeholder="hr@company.com"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                placeholderTextColor={theme.textTertiary}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={[styles.label, { color: theme.textSecondary }]}>CONTACT PHONE (OPTIONAL)</Typography>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                placeholder="+1 234 567 8900"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                                placeholderTextColor={theme.textTertiary}
                            />
                        </View>

                        <View style={styles.rowBetween}>
                            <Typography style={{ fontWeight: '600', color: theme.text }}>Allow In-App Chat</Typography>
                            <Switch
                                value={enableChat}
                                onValueChange={setEnableChat}
                                trackColor={{ false: theme.border, true: theme.primary }}
                            />
                        </View>
                    </View>
                </Animated.View>

            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <TouchableOpacity onPress={handlePreview} style={[styles.previewBtn, { backgroundColor: theme.surface }]}>
                    <Typography style={{ color: theme.text, fontWeight: '700' }}>Preview</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.publishBtn, loading && { opacity: 0.7 }]}
                    onPress={handlePostJob}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[theme.primary, theme.primary]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <Typography style={{ color: '#FFF', fontWeight: '700' }}>
                        {loading ? 'Posting...' : 'Post Job'}
                    </Typography>
                </TouchableOpacity>
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    successContainer: {
        flex: 1,
        backgroundColor: '#002f34',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    doneBtn: { marginTop: 30, backgroundColor: '#FFF', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25 },
    doneBtnText: { color: '#002f34', fontWeight: '800' },
    backHomeBtn: { marginTop: 15, backgroundColor: 'transparent', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25, borderWidth: 2, borderColor: '#FFF' },
    backHomeBtnText: { color: '#FFF', fontWeight: '800' },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    textBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardWhite: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoUpload: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    inputWrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        borderWidth: 1,
    },
    chipRow: {
        flexDirection: 'row',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    activeChip: {
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '600',
    },
    activeChipText: {
    },
    salaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    salaryInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    skillInputRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    addSkillBtn: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#002f34',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontWeight: '600',
        fontSize: 12,
    },
    segmentControl: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeSegment: {
        elevation: 2,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeSegmentText: {
        color: '#1F2937',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
    },
    previewBtn: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderRadius: 16,
    },
    publishBtn: {
        flex: 2,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#002f34',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});

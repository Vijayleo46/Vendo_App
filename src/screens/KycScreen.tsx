import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Dimensions,
    Image,
    Alert,
    TextInput,
    ActivityIndicator
} from 'react-native';
import Animated, { FadeInUp, ZoomIn, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ChevronLeft, Camera, ShieldCheck, CheckCircle2, Shield, ArrowRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { submitKyc } from '../services/kycService';
import { auth } from '../core/config/firebase';

const { width } = Dimensions.get('window');

export const KycScreen = ({ navigation }: any) => {
    const { theme, spacing, borderRadius, isDark } = useTheme();
    const [idNumber, setIdNumber] = useState('');
    const [docType, setDocType] = useState('ID Card');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!idNumber || !image || !auth.currentUser) {
            Alert.alert('Error', 'Please fill all fields and select a document image');
            return;
        }

        setLoading(true);
        console.log('=== SUBMITTING KYC ===');
        console.log('User ID:', auth.currentUser.uid);
        console.log('Document Type:', docType);
        console.log('Document Number:', idNumber);
        console.log('Image URI:', image);

        try {
            await submitKyc(
                auth.currentUser.uid,
                {
                    documentType: docType,
                    documentNumber: idNumber,
                },
                image
            );
            console.log('✅ KYC submitted successfully');
            setSubmitted(true);
            Alert.alert('Success', 'Your verification has been submitted successfully!');
        } catch (error: any) {
            console.error('=== KYC SUBMISSION ERROR ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            Alert.alert('Error', 'Failed to submit KYC. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
                <Animated.View entering={ZoomIn.duration(600)} style={styles.successContainer}>
                    <View style={styles.successPulse}>
                        <CheckCircle2 size={54} {...{ color: "#10B981" } as any} />
                    </View>
                </Animated.View>
                <Animated.View entering={FadeInUp.delay(300)} style={{ alignItems: 'center' }}>
                    <Typography variant="h1" style={{ marginTop: 32, fontSize: 32, fontWeight: '800', textAlign: 'center', color: theme.text }}>Verification Pending</Typography>
                    <Typography variant="bodyLarge" style={{ marginTop: 12, textAlign: 'center', lineHeight: 28, color: theme.textSecondary }}>
                        We're reviewing your documents. You'll receive a notification within 24 hours.
                    </Typography>
                </Animated.View>
                <Animated.View entering={FadeIn.delay(800)} style={{ width: '100%', marginTop: 60 }}>
                    <Button
                        label="Done"
                        variant="primary"
                        onPress={() => navigation.goBack()}
                    />
                </Animated.View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.surface }]}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Typography variant="h2" style={{ fontWeight: '700', fontSize: 20, color: theme.text }}>Identity Verification</Typography>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
                {/* Secure Verification Banner */}
                <Animated.View entering={FadeInUp.delay(200)} style={[styles.secureCard, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF' }]}>
                    <View style={[styles.shieldIconContainer, { backgroundColor: theme.card }]}>
                        <Shield size={24} color="#6366F1" />
                    </View>
                    <View style={{ marginLeft: 16, flex: 1 }}>
                        <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.text, fontSize: 16 }}>
                            Secure Verification
                        </Typography>
                        <Typography variant="bodySmall" style={{ color: '#6366F1', marginTop: 2, fontSize: 13 }}>
                            Encrypted and private identity check.
                        </Typography>
                    </View>
                </Animated.View>

                {/* Select Document */}
                <Typography variant="h3" style={{ marginTop: 32, marginBottom: 16, fontWeight: '600', fontSize: 18, color: theme.text }}>
                    Select Document
                </Typography>
                <View style={styles.docTypeContainer}>
                    {['Passport', 'ID Card', 'Driver License'].map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => setDocType(item)}
                            style={[
                                styles.docTypeButton,
                                {
                                    backgroundColor: docType === item ? theme.primary : theme.card,
                                }
                            ]}
                        >
                            <Typography
                                variant="bodySmall"
                                style={{
                                    fontWeight: '600',
                                    fontSize: 14,
                                    color: docType === item ? '#FFF' : theme.textSecondary
                                }}
                            >
                                {item}
                            </Typography>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Document Number */}
                <View style={{ marginTop: 24 }}>
                    <Typography variant="bodySmall" style={{ color: theme.textTertiary, marginBottom: 8, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 }}>
                        DOCUMENT NUMBER
                    </Typography>
                    <TextInput
                        placeholder="32323345656778"
                        value={idNumber}
                        onChangeText={setIdNumber}
                        style={[styles.documentInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                        placeholderTextColor={theme.textTertiary}
                    />
                </View>

                {/* Capture Document */}
                <Typography variant="h3" style={{ marginTop: 32, marginBottom: 16, fontWeight: '600', fontSize: 18, color: theme.text }}>
                    Capture Document
                </Typography>
                <TouchableOpacity
                    style={[styles.captureBox, { backgroundColor: theme.card }]}
                    onPress={pickImage}
                    activeOpacity={0.8}
                >
                    {image ? (
                        <Image source={{ uri: image }} style={styles.capturedImage} />
                    ) : (
                        <View style={styles.placeholderContent}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400' }}
                                style={styles.placeholderImage}
                            />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary }, (!idNumber || !image) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!idNumber || !image || loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Typography style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                            Submit Verification
                        </Typography>
                    )}
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secureCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    shieldIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docTypeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    docTypeButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    documentInput: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    captureBox: {
        height: 220,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 4,
    },
    homescreen: {
        backgroundColor: '#FFF',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.6,
    },
    submitButton: {
        marginTop: 40,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#D1D5DB',
        shadowOpacity: 0,
    },
    successContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successPulse: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    }
});

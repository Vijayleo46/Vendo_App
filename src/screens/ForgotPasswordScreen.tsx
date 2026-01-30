import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { authService } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mail } from 'lucide-react-native';

export const ForgotPasswordScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        console.log('=== RESET PASSWORD CLICKED ===');
        console.log('Email:', email);

        if (!email) {
            alert('Please enter your email address');
            return;
        }

        setLoading(true);

        try {
            await authService.sendPasswordReset(email);
            alert('Password reset link sent! Check your email.');
            navigation.goBack();
        } catch (error: any) {
            console.error('=== RESET FAILED ===');
            console.error('Error:', error);

            let errorMessage = 'Failed to send reset email.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Gradient Background */}
            <LinearGradient
                colors={['#FFB6D9', '#D8B5FF', '#B8B5FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            >
                {/* Wave Pattern Overlay */}
                <View style={styles.wavePattern} pointerEvents="none" />

                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#333" strokeWidth={2} />
                    <Typography variant="bodyLarge" style={styles.backText}>Back</Typography>
                </TouchableOpacity>
            </LinearGradient>

            {/* White Card */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.cardContainer}
            >
                <ScrollView
                    style={styles.card}
                    contentContainerStyle={styles.cardContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Mail size={32} color="#8B5CF6" />
                        </View>
                        <Typography variant="h1" style={styles.title}>Forgot Password?</Typography>
                        <Typography variant="bodyMedium" style={styles.subtitle}>
                            Don't worry! It happens. Please enter the address associated with your account.
                        </Typography>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { color: '#1F2937' }]}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Reset Button */}
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#FFB6D9', '#B8B5FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.resetGradient}
                        >
                            <Typography variant="h3" style={styles.resetText}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Typography>
                        </LinearGradient>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFB6D9',
    },
    gradientBackground: {
        height: '40%',
        position: 'relative',
    },
    wavePattern: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginLeft: 20,
    },
    backText: {
        marginLeft: 8,
        color: '#333',
        fontSize: 16,
    },
    cardContainer: {
        flex: 1,
        marginTop: -40,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    cardContent: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginBottom: 24,
    },
    input: {
        height: 56,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        color: '#1F2937',
    },
    resetButton: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 32,
    },
    resetGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

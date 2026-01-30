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
import { userService } from '../services/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

export const RegisterScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        console.log('=== REGISTER BUTTON CLICKED ===');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Phone:', phoneNumber);

        if (!name || !email || !password) {
            console.log('❌ Missing fields');
            alert('Please fill all fields');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        console.log('Loading set to true...');

        try {
            console.log('Calling authService.register...');
            const user = await authService.register(email, password, name);
            console.log('✅ Registration successful! User:', user.uid);
            console.log('Display name:', user.displayName);

            if (user) {
                console.log('Creating user profile...');
                const profileData: any = {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: name,
                    createdAt: new Date(),
                    kycStatus: 'unverified'
                };

                if (phoneNumber) {
                    profileData.phone = phoneNumber;
                }

                await userService.updateProfile(user.uid, profileData);
                console.log('✅ User profile created');

                // Send verification email
                await authService.sendVerificationEmail(user);
                alert('Account created! Please check your email to verify your account.');
            }

            console.log('Navigating to Main...');
            navigation.replace('Main');
        } catch (error: any) {
            console.error('=== REGISTRATION FAILED ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            let errorMessage = 'Registration failed. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Use at least 6 characters.';
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
            console.log('Loading set to false');
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
                <View style={styles.wavePattern} />

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation?.goBack()}
                >
                    <ArrowLeft size={24} color="#333" strokeWidth={2} />
                    <Typography variant="bodyLarge" style={styles.backText}>Back</Typography>
                </TouchableOpacity>
            </LinearGradient>

            {/* White Card */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.cardContainer}
            >
                <ScrollView
                    style={styles.card}
                    contentContainerStyle={styles.cardContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Typography variant="h1" style={styles.title}>Create Your Account</Typography>
                        <Typography variant="bodyMedium" style={styles.subtitle}>
                            We're here to help you reach the peaks{'\n'}of learning. Are you ready?
                        </Typography>
                    </View>

                    {/* Full Name Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { color: '#1F2937' }]}
                            placeholder="Enter full name"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                            editable={true}
                            selectTextOnFocus={true}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Enter email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Phone Number Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Enter phone number"
                            placeholderTextColor="#999"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Enter password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={20} color="#999" />
                            ) : (
                                <Eye size={20} color="#999" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity style={styles.forgotContainer}>
                        <Typography variant="bodySmall" style={styles.forgotText}>
                            Forgot password?
                        </Typography>
                    </TouchableOpacity>

                    {/* Get Started Button */}
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#FFB6D9', '#B8B5FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.registerGradient}
                        >
                            <Typography variant="h3" style={styles.registerText}>
                                {loading ? 'Creating Account...' : 'Get Started'}
                            </Typography>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Typography variant="bodySmall" style={styles.dividerText}>
                            Sign up with
                        </Typography>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Typography variant="h2" style={styles.socialIcon}>f</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Typography variant="h2" style={styles.socialIcon}>G</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Typography variant="h2" style={styles.socialIcon}></Typography>
                        </TouchableOpacity>
                    </View>

                    {/* Log In Link */}
                    <View style={styles.footer}>
                        <Typography variant="bodyMedium" style={styles.footerText}>
                            Already have an account?{' '}
                        </Typography>
                        <TouchableOpacity onPress={() => navigation?.goBack()}>
                            <Typography variant="bodyMedium" style={styles.loginText}>
                                Log In
                            </Typography>
                        </TouchableOpacity>
                    </View>
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
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    input: {
        height: 56,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    eyeIcon: {
        position: 'absolute',
        right: 20,
        top: 18,
    },
    forgotContainer: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        fontSize: 14,
        color: '#8B5CF6',
    },
    registerButton: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 32,
    },
    registerGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9CA3AF',
        fontSize: 13,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialIcon: {
        fontSize: 24,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    loginText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '600',
    },
});

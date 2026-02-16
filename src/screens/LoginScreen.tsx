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

export const LoginScreen = ({ navigation }: any) => {
    const { theme, isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async () => {
        console.log('=== LOGIN BUTTON CLICKED ===');
        console.log('Email:', email);
        console.log('Password:', password ? '***' : 'empty');

        if (!email || !password) {
            console.log('❌ Email or password empty');
            alert('Please enter email and password');
            return;
        }

        setLoading(true);
        console.log('Loading set to true...');

        try {
            console.log('Calling authService.login...');
            const firebaseUser = await authService.login(email, password);
            console.log('✅ Login successful! User:', firebaseUser.uid);

            // Fetch extra profile data to check verification status
            const profile = await userService.getProfile(firebaseUser.uid);

            // Allow login only if verified OR if the user is an admin
            if (profile?.kycStatus !== 'verified' && !profile?.isAdmin) {
                console.log('❌ User not verified by admin');
                await authService.logout();
                alert('Your account is pending verification by the Admin. Please try again once verified.');
                setLoading(false);
                return;
            }

            if (!firebaseUser.emailVerified) {
                alert('Please verify your email address to access all features.');
            }

            console.log('Navigating to Main...');
            navigation.replace('Main');
        } catch (error: any) {
            console.error('=== LOGIN FAILED ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            let errorMessage = 'Login failed. Please check your credentials.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Try again later.';
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
            console.log('Loading set to false');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? theme.background : '#FFB6D9' }]}>
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
                    <ArrowLeft size={24} color={isDark ? theme.text : "#333"} strokeWidth={2} />
                    <Typography variant="bodyLarge" style={[styles.backText, { color: isDark ? theme.text : "#333" }]}>Back</Typography>
                </TouchableOpacity>
            </LinearGradient>

            {/* White Card */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.cardContainer}
            >
                <ScrollView
                    style={[styles.card, { backgroundColor: theme.background }]}
                    contentContainerStyle={styles.cardContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Typography variant="h1" style={[styles.title, { color: theme.text }]}>Welcome Back</Typography>
                        <Typography variant="bodyMedium" style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Ready to continue your learning journey?{'\n'}Your path is right here.
                        </Typography>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Enter email"
                            placeholderTextColor={theme.textTertiary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={true}
                            selectTextOnFocus={true}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Password"
                            placeholderTextColor={theme.textTertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            editable={true}
                            selectTextOnFocus={true}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={20} color={theme.textTertiary} />
                            ) : (
                                <Eye size={20} color={theme.textTertiary} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Remember Me & Forgot Password */}
                    <View style={styles.optionsRow}>
                        <TouchableOpacity
                            style={styles.rememberRow}
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                                {rememberMe && <View style={styles.checkmark} />}
                            </View>
                            <Typography variant="bodySmall" style={styles.rememberText}>
                                Remember me
                            </Typography>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Typography variant="bodySmall" style={styles.forgotText}>
                                Forgot password?
                            </Typography>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, { shadowColor: theme.primary }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={isDark ? [theme.primary, theme.primary] : ['#FFB6D9', '#B8B5FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginGradient}
                        >
                            <Typography variant="h3" style={styles.loginText}>
                                {loading ? 'Logging in...' : 'Log In'}
                            </Typography>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                        <Typography variant="bodySmall" style={[styles.dividerText, { color: theme.textTertiary }]}>
                            Sign in with
                        </Typography>
                        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.surface }]}>
                            <Typography variant="h2" style={[styles.socialIcon, { color: theme.text }]}>f</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.surface }]}>
                            <Typography variant="h2" style={[styles.socialIcon, { color: theme.text }]}>G</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.surface }]}>
                            <Typography variant="h2" style={[styles.socialIcon, { color: theme.text }]}></Typography>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.footer}>
                        <Typography variant="bodyMedium" style={[styles.footerText, { color: theme.textSecondary }]}>
                            Don't have an account?{' '}
                        </Typography>
                        <TouchableOpacity onPress={() => navigation?.navigate('Register')}>
                            <Typography variant="bodyMedium" style={[styles.signUpText, { color: theme.primary }]}>
                                Sign Up
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
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
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
        fontSize: 28,
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
        zIndex: 1,
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
    eyeIcon: {
        position: 'absolute',
        right: 20,
        top: 18,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#8B5CF6',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#8B5CF6',
    },
    checkmark: {
        width: 10,
        height: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    rememberText: {
        fontSize: 14,
        color: '#8B5CF6',
    },
    forgotText: {
        fontSize: 14,
        color: '#8B5CF6',
    },
    loginButton: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 32,
    },
    loginGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
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
    signUpText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '600',
    },
});

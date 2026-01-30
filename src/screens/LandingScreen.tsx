import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { useTheme } from '../theme/ThemeContext';
import { Sparkles, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface LandingScreenProps {
    navigation: any;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
    const { theme } = useTheme();

    const handleGetStarted = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.primary + '10', theme.background]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.content}>
                <MotiView
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: 200 }}
                    style={[styles.logoContainer, { backgroundColor: theme.primary + '15' }]}
                >
                    <Sparkles size={48} color={theme.primary} />
                </MotiView>

                <View style={styles.textContainer}>
                    <MotiText
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400 }}
                        style={[styles.title, { color: theme.text }]}
                    >
                        VENDO
                    </MotiText>

                    <MotiText
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 600 }}
                        style={[styles.subtitle, { color: theme.textSecondary }]}
                    >
                        Experience the next generation of marketplace. Fast, secure, and beautiful.
                    </MotiText>
                </View>

                <View style={styles.featuresContainer}>
                    {[
                        { icon: ShoppingBag, text: 'Easy Shopping' },
                        { icon: ShieldCheck, text: 'Secure Payments' },
                        { icon: Sparkles, text: 'AI Powered' },
                    ].map((feature, index) => (
                        <MotiView
                            key={index}
                            from={{ opacity: 0, translateX: -20 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ delay: 800 + index * 200 }}
                            style={styles.featureItem}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: theme.primary + '10' }]}>
                                <feature.icon size={20} color={theme.primary} />
                            </View>
                            <Text style={[styles.featureText, { color: theme.textSecondary }]}>{feature.text}</Text>
                        </MotiView>
                    ))}
                </View>

                <MotiView
                    from={{ opacity: 0, translateY: 50 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', delay: 1400 }}
                    style={styles.buttonContainer}
                >
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary }]}
                        onPress={handleGetStarted}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                        <ArrowRight size={20} color="#FFF" />
                    </TouchableOpacity>
                </MotiView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 15,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 10,
    },
    featuresContainer: {
        width: '100%',
        marginBottom: 60,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 20,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    featureText: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        width: '100%',
    },
    button: {
        height: 64,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6200EE',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 10,
    },
});

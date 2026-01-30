import React from 'react';
import {
    TouchableOpacity,
    TouchableOpacityProps,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from './Typography';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    label,
    variant = 'primary',
    loading,
    icon,
    style,
    disabled,
    ...props
}) => {
    const { theme, spacing, borderRadius } = useTheme();

    const getStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    container: { backgroundColor: theme.primary },
                    text: { color: '#FFF' },
                };
            case 'secondary':
                return {
                    container: { backgroundColor: theme.secondary },
                    text: { color: '#FFF' },
                };
            case 'outline':
                return {
                    container: {
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: theme.primary
                    },
                    text: { color: theme.primary },
                };
            case 'ghost':
                return {
                    container: { backgroundColor: 'transparent' },
                    text: { color: theme.textSecondary },
                };
            default:
                return {
                    container: { backgroundColor: theme.primary },
                    text: { color: '#FFF' },
                };
        }
    };

    const variantStyles = getStyles();

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={disabled || loading}
            style={[
                styles.base,
                {
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                    borderRadius: borderRadius.md,
                },
                variantStyles.container,
                disabled && styles.disabled,
                style,
            ]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variantStyles.text.color} size="small" />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Typography
                        variant="bodyMedium"
                        style={[styles.text, variantStyles.text, { fontWeight: '600' }]}
                    >
                        {label}
                    </Typography>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        textAlign: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    disabled: {
        opacity: 0.5,
    },
});

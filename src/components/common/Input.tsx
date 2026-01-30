import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    const { theme, spacing, borderRadius } = useTheme();

    return (
        <View style={styles.container}>
            <Typography variant="bodySmall" color={theme.textSecondary} style={{ marginBottom: 4 }}>
                {label}
            </Typography>
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: theme.surface,
                        borderRadius: borderRadius.md,
                        borderColor: error ? theme.error : theme.border,
                        borderWidth: 1,
                    }
                ]}
            >
                <TextInput
                    placeholderTextColor={theme.textTertiary}
                    style={[styles.input, { color: theme.text, paddingHorizontal: spacing.md }]}
                    {...props}
                />
            </View>
            {error && (
                <Typography variant="bodySmall" color={theme.error} style={{ marginTop: 4 }}>
                    {error}
                </Typography>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        width: '100%',
    },
    inputContainer: {
        height: 52,
        justifyContent: 'center',
    },
    input: {
        height: '100%',
        fontSize: 16,
    },
});

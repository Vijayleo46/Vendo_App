import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { BlurView } from 'expo-blur';

interface SearchBarProps {
    value?: string;
    onChangeText?: (text: string) => void;
}

export const SearchBar = ({ value, onChangeText }: SearchBarProps) => {
    const { theme, spacing, borderRadius, isDark } = useTheme();

    const Container = Platform.OS === 'ios' ? BlurView : View;

    return (
        <View style={styles.outerContainer}>
            <Container
                intensity={20}
                tint={isDark ? 'dark' : 'light'}
                style={[
                    styles.container,
                    {
                        borderRadius: borderRadius.xl,
                        backgroundColor: Platform.OS === 'android' ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') : 'transparent',
                        paddingHorizontal: spacing.md,
                    }
                ]}
            >
                <Search size={20} {...{ color: theme.textTertiary } as any} />
                <TextInput
                    placeholder="Search products, jobs, services..."
                    placeholderTextColor={theme.textTertiary}
                    style={[styles.input, { color: theme.text, marginLeft: spacing.sm }]}
                    value={value}
                    onChangeText={onChangeText}
                />
            </Container>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        paddingVertical: 10,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
});

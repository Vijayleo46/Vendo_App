import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'flat' | 'outline';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'elevated',
    style,
    ...props
}) => {
    const { theme, spacing, borderRadius } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'elevated':
                return {
                    backgroundColor: theme.card,
                    ...theme.shadow,
                };
            case 'flat':
                return {
                    backgroundColor: theme.card,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.border,
                };
        }
    };

    return (
        <View
            style={[
                styles.base,
                {
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                },
                getVariantStyles(),
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },
});

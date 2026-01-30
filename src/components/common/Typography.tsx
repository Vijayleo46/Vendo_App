import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';

interface TypographyProps extends TextProps {
    variant?: keyof typeof typography;
    color?: string;
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    className?: string;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'bodyMedium',
    color,
    align = 'left',
    style,
    children,
    ...props
}) => {
    const { theme } = useTheme();

    const textStyle: TextStyle = {
        ...typography[variant],
        color: color || theme.text,
        textAlign: align,
    };

    return (
        <Text style={[textStyle, style]} {...props}>
            {children}
        </Text>
    );
};

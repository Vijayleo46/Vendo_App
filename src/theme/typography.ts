import { TextStyle } from 'react-native';

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
    } as TextStyle,
    h2: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
    } as TextStyle,
    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
    } as TextStyle,
    bodyLarge: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    } as TextStyle,
    bodyMedium: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    } as TextStyle,
    bodySmall: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
    } as TextStyle,
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    } as TextStyle,
};

export const palette = {
    // Neutral
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    cream: '#FDFCF0',
    black: '#000000',
    trueBlack: '#050505',

    // Grays
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Accents
    violet: '#002f34', // OLX Dark Teal
    violetLight: '#ebf1f3', // Light teal background
    blue: '#3B82F6',
    blueLight: '#DBEAFE',
    emerald: '#10B981',
    emeraldLight: '#D1FAE5',
    coral: '#FB7185',
    coralLight: '#FFE4E6',
};

export const shadows = {
    subtle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    premium: {
        shadowColor: '#002f34',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    }
};

export const lightTheme = {
    background: '#FFFFFF',
    surface: palette.white,
    text: '#002f34',
    textSecondary: '#4a7374',
    textTertiary: '#7f9799',
    primary: palette.violet,
    secondary: palette.blue,
    accent: palette.emerald,
    error: palette.coral,
    border: '#dbe7e9',
    card: palette.white,
    shadow: shadows.subtle,
};

export const darkTheme = {
    background: '#050505', // Deep Black 
    surface: '#121212',    // Darker surface
    text: '#FEFFFC',       // Blanche White
    textSecondary: '#A0A0A0',
    textTertiary: '#6B7280',
    primary: '#FFEF4D',    // Sandy Yellow
    secondary: '#D0FF00',  // Banana Yellow
    accent: '#84102D',     // Grey Black (Maroon)
    error: '#84102D',
    border: '#1E1E1E',
    card: '#121212',
    shadow: shadows.premium,
};

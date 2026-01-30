import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';

const ThemeContext = createContext({
    theme: lightTheme,
    isDark: false,
    toggleTheme: () => { },
    spacing,
    borderRadius,
    typography,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const colorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(colorScheme === 'dark');

    useEffect(() => {
        setIsDark(colorScheme === 'dark');
    }, [colorScheme]);

    const toggleTheme = () => setIsDark(!isDark);

    const value = {
        theme: isDark ? darkTheme : lightTheme,
        isDark,
        toggleTheme,
        spacing,
        borderRadius,
        typography,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { store } from '../App';
import { setSessionField } from '../store/actions/SessionActions';
import { useDispatch } from 'react-redux';

type Theme = 'Light' | 'Dark' | 'Follow system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>('Light');
    const dispatch = useDispatch()
    const setSession = (key: string, value: any) => {
        dispatch(setSessionField(key, value) as any)
    }

    const isDarkMode = theme === 'Follow system'
        ? systemColorScheme === 'dark'
        : theme === 'Dark';

    useEffect(() => {
        if (store.getState().session?.preferences?.theme) {
            setTheme(store.getState().session?.preferences?.theme);
        } else {
            setTheme('Light');
            setSession("preferences", { theme: 'Light' })
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 
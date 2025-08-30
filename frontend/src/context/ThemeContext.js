'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const themeColors = {
  light: {
    primary: '#4F46E5',
    secondary: '#6366F1',
    background: {
      main: '#FFFAF5',
      secondary: '#FFF6E9',
      elevated: '#FFFFFF'
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      tertiary: '#6B7280'
    },
    border: '#E5E7EB',
    accent: '#3B82F6',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706'
  },
  dark: {
    primary: '#6366F1',
    secondary: '#4F46E5',
    background: {
      main: '#111827',
      secondary: '#1F2937',
      elevated: '#374151'
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#E5E7EB',
      tertiary: '#9CA3AF'
    },
    border: '#374151',
    accent: '#60A5FA',
    success: '#34D399',
    error: '#EF4444',
    warning: '#FBBF24'
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      colors: themeColors[theme],
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

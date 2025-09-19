import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../styles/theme';

export const useThemeColors = () => {
  const { theme: currentTheme } = useTheme();
  
  const colors = {
    ...theme.colors,
    // Override theme-specific colors
    background: theme.colors[currentTheme].background,
    surface: theme.colors[currentTheme].surface,
    surfaceSecondary: theme.colors[currentTheme].surfaceSecondary,
    surfaceHover: theme.colors[currentTheme].surfaceHover || theme.colors[currentTheme].surfaceSecondary,
    text: theme.colors[currentTheme].text,
    textSecondary: theme.colors[currentTheme].textSecondary,
    textLight: theme.colors[currentTheme].textLight || theme.colors[currentTheme].textSecondary,
    border: theme.colors[currentTheme].border,
    input: theme.colors[currentTheme].input,
    inputBorder: theme.colors[currentTheme].inputBorder,
    inputText: theme.colors[currentTheme].inputText,
    inputPlaceholder: theme.colors[currentTheme].inputPlaceholder,
  };
  
  return { colors, theme: currentTheme };
};
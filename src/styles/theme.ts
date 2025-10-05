export const theme = {
  colors: {
    primary: '#00B8D9',
    primaryDark: '#0097A7',
    primaryLight: '#4DD0E1',
    secondary: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',

    // Light theme colors
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceSecondary: '#F1F5F9',
      text: '#1E293B',
      textSecondary: '#64748B',
      textLight: '#94A3B8',
      border: '#E2E8F0',
      input: '#FFFFFF',
      inputBorder: '#D1D5DB',
      inputText: '#1F2937',
      inputPlaceholder: '#9CA3AF',
    },

    // Dark theme colors
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      surfaceSecondary: '#334155',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      textLight: '#94A3B8',
      border: '#475569',
      input: '#334155',
      inputBorder: '#475569',
      inputText: '#F8FAFC',
      inputPlaceholder: '#94A3B8',
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },
  
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    xl: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
  
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};
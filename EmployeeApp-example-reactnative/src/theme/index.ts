import {MD3LightTheme as DefaultTheme, configureFonts} from 'react-native-paper';

// Font configuration
const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '100' as const,
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
  android: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal' as const,
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal' as const,
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal' as const,
    },
  },
};

// Theme configuration
export const theme = {
  ...DefaultTheme,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
    secondary: '#f57c00',
    accent: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50',
    background: '#f0f4f8',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    disabled: '#9e9e9e',
    placeholder: '#9e9e9e',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: '#000000',
    notification: '#f44336',
    // Custom colors
    primaryLight: '#e3f2fd',
    primaryDark: '#0d47a1',
    secondaryLight: '#fff3e0',
    secondaryDark: '#e65100',
    border: '#e0e0e0',
    cardBackground: '#ffffff',
    inputBackground: '#f5f5f5',
  },
  roundness: 8,
};

// Dark theme (can be implemented later)
export const darkTheme = {
  ...theme,
  dark: true,
  colors: {
    ...theme.colors,
    primary: '#90caf9',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    border: '#2c2c2c',
    cardBackground: '#1e1e1e',
    inputBackground: '#2c2c2c',
  },
};

// Export default theme
export default theme;

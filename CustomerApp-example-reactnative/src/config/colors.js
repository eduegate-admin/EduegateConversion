// Import theme files
import almadinaTheme from './themes/almadinaTheme';
import foodworldTheme from './themes/foodworldTheme';
import benchmarkfoodsTheme from './themes/benchmarkfoodsTheme';

// Get client from environment
const client = process.env.CLIENT;

// Theme selector function
const getClientTheme = () => {
  switch(client) {
    case 'almadina':
    case 'almadinadot':
      return almadinaTheme;
    case 'foodworld':
      return foodworldTheme;
    case 'benchmarkfoods':
      return benchmarkfoodsTheme;
    default:
      return almadinaTheme; // Default fallback
  }
};

// Legacy color constants for backward compatibility
const legacyColors = {
  orange: "#F88601",
  lightWhite: "#EEEEEE",
  green: "#27ae60",
  darkGrey: "#424245",
  lightGrey: "#404042",
  transparent: 'rgba(0, 0, 0, 0)',
  darkSilver: "#B8B8B8",
};

// Export theme-aware colors
const colors = {
  ...getClientTheme(),
  ...legacyColors, // Keep legacy colors for backward compatibility
};

export default colors;

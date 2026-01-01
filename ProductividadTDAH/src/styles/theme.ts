// Theme colors matching the PDF agenda design
// Cream/beige background, olive green accents, pink and orange highlights

export const colors = {
  // Primary colors
  background: '#F5F0E8',      // Cream/beige background
  backgroundLight: '#FAF7F2', // Lighter cream
  backgroundDark: '#EDE5D8',  // Darker cream

  // Accent colors
  olive: '#8B9A6D',           // Olive green - main accent
  oliveLight: '#A8B88C',      // Light olive
  oliveDark: '#6B7A4D',       // Dark olive

  // Highlight colors
  pink: '#E8A4B4',            // Pink highlight
  pinkLight: '#F2C4CF',       // Light pink
  pinkDark: '#D88494',        // Dark pink

  orange: '#E8A86B',          // Orange highlight
  orangeLight: '#F2C89B',     // Light orange
  orangeDark: '#D8884B',      // Dark orange

  // Neutral colors
  text: '#4A4A4A',            // Main text
  textLight: '#7A7A7A',       // Secondary text
  textDark: '#2A2A2A',        // Dark text
  white: '#FFFFFF',
  black: '#000000',

  // Status colors
  success: '#8B9A6D',         // Green/olive for success
  warning: '#E8A86B',         // Orange for warnings
  error: '#D88494',           // Pink for errors
  info: '#8BA8D6',            // Blue for info

  // Category colors (for different sections)
  tuAno: '#8B9A6D',           // Olive - Tu Año
  metas: '#E8A4B4',           // Pink - Metas
  autoconocimiento: '#E8A86B', // Orange - Autoconocimiento
  priorizacion: '#8BA8D6',    // Blue - Priorización
  proyectos: '#9B8BD6',       // Purple - Proyectos
  diario: '#8B9A6D',          // Olive - Diario
  casa: '#D6A88B',            // Tan - Casa
  dinero: '#8BD6A8',          // Mint - Dinero
  autocuidado: '#D68BA8',     // Rose - Autocuidado
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  title: 40,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

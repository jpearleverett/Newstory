// Totally TDAH - Premium Theme
// Inspired by the PDF agenda and ADHD-friendly design principles
// Soft, calming colors with playful accents

export const colors = {
  // Primary backgrounds - warm, calming cream tones
  background: '#FAF8F5',        // Warm off-white
  backgroundLight: '#FFFFFF',   // Pure white for cards
  backgroundDark: '#F0EDE8',    // Slightly darker cream
  backgroundMuted: '#E8E4DF',   // Muted background

  // Brand colors - Totally TDAH identity (sage/olive green)
  primary: '#8B9A6D',           // Sage green - main brand color
  primaryLight: '#A8B88C',      // Light sage
  primaryDark: '#6B7A4D',       // Dark sage
  primaryMuted: '#8B9A6D20',    // Sage with opacity

  // Keep olive aliases for backwards compatibility
  olive: '#8B9A6D',
  oliveLight: '#A8B88C',
  oliveDark: '#6B7A4D',

  // Accent colors - warm terracotta/coral
  accent: '#E8A86B',            // Warm terracotta
  accentLight: '#F2C89B',       // Light terracotta
  accentDark: '#D8884B',        // Dark terracotta

  // Secondary - dusty rose/pink
  pink: '#D4A0A0',              // Dusty rose
  pinkLight: '#E8C4C4',         // Light dusty rose
  pinkDark: '#B48080',          // Dark dusty rose

  // Orange tones
  orange: '#E8A86B',
  orangeLight: '#F2C89B',
  orangeDark: '#D8884B',

  // Functional colors
  text: '#3D3D3D',              // Main text - soft black
  textLight: '#6B6B6B',         // Secondary text
  textMuted: '#9B9B9B',         // Muted text
  textDark: '#2D2D2D',          // Headings
  white: '#FFFFFF',
  black: '#1A1A1A',

  // Status colors - muted versions for ADHD-friendly experience
  success: '#8B9A6D',           // Sage green
  successLight: '#8B9A6D20',
  warning: '#E8A86B',           // Warm amber
  warningLight: '#E8A86B20',
  error: '#D48080',             // Soft red
  errorLight: '#D4808020',
  info: '#8090B8',              // Soft blue
  infoLight: '#8090B820',

  // Section colors - each section has its own identity
  tuAno: '#8B9A6D',             // Sage - calm, grounding
  metas: '#D4A0A0',             // Dusty rose - inspiring
  autoconocimiento: '#E8A86B',  // Terracotta - warm, introspective
  priorizacion: '#8090B8',      // Soft blue - clarity
  proyectos: '#9888B8',         // Soft purple - creative
  diario: '#8B9A6D',            // Sage - consistent
  casa: '#B8A088',              // Warm taupe - homey
  dinero: '#88B8A0',            // Soft teal - growth
  autocuidado: '#B888A0',       // Mauve - nurturing

  // Gradient combinations (for LinearGradient)
  gradients: {
    primary: ['#8B9A6D', '#A8B88C'] as [string, string],
    accent: ['#E8A86B', '#F2C89B'] as [string, string],
    rose: ['#D4A0A0', '#E8C4C4'] as [string, string],
    warm: ['#FAF8F5', '#F0EDE8'] as [string, string],
    hero: ['#8B9A6D', '#6B7A4D'] as [string, string],
    sunset: ['#E8A86B', '#D4A0A0'] as [string, string],
  },

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  xxxl: 34,
  title: 42,
  display: 52,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Create a colored glow shadow
export const glowShadow = (color: string, intensity: number = 0.3) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: intensity,
  shadowRadius: 12,
  elevation: 8,
});

// Animation configuration
export const animation = {
  // Durations
  fast: 150,
  normal: 250,
  slow: 400,

  // Spring configs for react-native-reanimated
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.8,
  },
  springGentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
};

// Common layout values
export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.md,
  borderWidth: 1,
  borderWidthThick: 2,
};

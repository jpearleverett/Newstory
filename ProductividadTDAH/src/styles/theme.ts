// Totally TDAH - Premium Theme
// Inspired by the PDF agenda and ADHD-friendly design principles
// Soft, calming colors with playful accents

export const colors = {
  // Primary backgrounds - warm, calming cream tones
  background: '#FAF9F6',        // Warm off-white (Paper white)
  backgroundLight: '#FFFFFF',   // Pure white for cards
  backgroundDark: '#F2EFE9',    // Slightly darker cream
  backgroundMuted: '#EAE6DF',   // Muted background

  // Brand colors - Totally TDAH identity (sage/olive green)
  primary: '#7A8C5A',           // Deeper Sage green - better contrast
  primaryLight: '#9CB078',      // Light sage
  primaryDark: '#5E6E42',       // Dark sage
  primaryMuted: 'rgba(122, 140, 90, 0.15)',    // Sage with opacity

  // Keep olive aliases for backwards compatibility
  olive: '#7A8C5A',
  oliveLight: '#9CB078',
  oliveDark: '#5E6E42',

  // Accent colors - warm terracotta/coral
  accent: '#E08E55',            // Richer Terracotta
  accentLight: '#F5CBA7',       // Light terracotta
  accentDark: '#C27035',        // Dark terracotta
  
  // Highlight - for fun/focus elements
  highlight: '#FFD166',         // Soft Yellow/Gold
  highlightLight: '#FFE8B3',
  
  // Secondary - dusty rose/pink
  pink: '#D68C98',              // Richer Dusty rose
  pinkLight: '#EAC4CA',         // Light dusty rose
  pinkDark: '#B36672',          // Dark dusty rose

  // Orange tones
  orange: '#E08E55',
  orangeLight: '#F5CBA7',
  orangeDark: '#C27035',

  // Functional colors
  text: '#2C3E50',              // Main text - Dark Blue-Grey (Better readability than soft black)
  textLight: '#5D6D7E',         // Secondary text
  textMuted: '#95A5A6',         // Muted text
  textDark: '#1A252F',          // Headings
  white: '#FFFFFF',
  black: '#1A1A1A',

  // Status colors - muted versions for ADHD-friendly experience
  success: '#7A8C5A',           // Sage green
  successLight: 'rgba(122, 140, 90, 0.15)',
  warning: '#E08E55',           // Warm amber
  warningLight: 'rgba(224, 142, 85, 0.15)',
  error: '#D98880',             // Soft red
  errorLight: 'rgba(217, 136, 128, 0.15)',
  info: '#7FB3D5',              // Soft blue
  infoLight: 'rgba(127, 179, 213, 0.15)',

  // Section colors - each section has its own identity (Slightly more vibrant)
  tuAno: '#7A8C5A',             // Sage
  metas: '#D68C98',             // Rose
  autoconocimiento: '#E08E55',  // Terracotta
  priorizacion: '#7FB3D5',      // Soft blue
  proyectos: '#A569BD',         // Purple
  diario: '#52BE80',            // Green
  casa: '#D35400',              // Burnt Orange
  dinero: '#1ABC9C',            // Teal
  autocuidado: '#EC7063',       // Red-Pink

  // Gradient combinations (for LinearGradient)
  gradients: {
    primary: ['#7A8C5A', '#9CB078'] as [string, string],
    accent: ['#E08E55', '#F5CBA7'] as [string, string],
    rose: ['#D68C98', '#EAC4CA'] as [string, string],
    warm: ['#FAF9F6', '#F2EFE9'] as [string, string],
    hero: ['#7A8C5A', '#5E6E42'] as [string, string],
    sunset: ['#E08E55', '#D68C98'] as [string, string],
    ocean: ['#7FB3D5', '#5499C7'] as [string, string],
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
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  round: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 30,
  xxxl: 36,
  title: 44,
  display: 56,
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
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  xl: {
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
};

// Create a colored glow shadow
export const glowShadow = (color: string, intensity: number = 0.3) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: intensity,
  shadowRadius: 16,
  elevation: 8,
});

// Animation configuration
export const animation = {
  // Durations
  fast: 200,
  normal: 300,
  slow: 500,

  // Spring configs for react-native-reanimated
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 10,
    stiffness: 200,
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

// Energy-Adaptive Theming
// These themes change based on the user's energy level for a more compassionate experience
export type EnergyMode = 'low' | 'medium' | 'high';

export const getEnergyMode = (energyLevel: number): EnergyMode => {
  if (energyLevel < 35) return 'low';
  if (energyLevel < 70) return 'medium';
  return 'high';
};

export const energyThemes = {
  low: {
    // Soft, calming colors for low energy days
    background: '#1a1a2e',           // Deep night blue
    backgroundLight: '#16213e',       // Slightly lighter
    backgroundCard: '#0f3460',        // Dark blue card
    text: '#a8b2d1',                  // Soft gray-blue
    textSecondary: '#8892b0',         // Muted
    primary: '#7B68EE',               // Soft lavender
    accent: '#B39DDB',                // Light purple
    gradient: ['#1a1a2e', '#16213e', '#0f3460'] as [string, string, string],
    statusBarStyle: 'light-content' as const,
    motivationalMessage: 'Rest is productive. Be gentle with yourself.',
  },
  medium: {
    // Warm, balanced colors for normal energy
    background: colors.background,
    backgroundLight: colors.backgroundLight,
    backgroundCard: colors.white,
    text: colors.text,
    textSecondary: colors.textLight,
    primary: colors.primary,
    accent: colors.accent,
    gradient: ['#FAF9F6', '#F2EFE9', '#EAE6DF'] as [string, string, string],
    statusBarStyle: 'dark-content' as const,
    motivationalMessage: 'You\'ve got this. One step at a time.',
  },
  high: {
    // Vibrant, energizing colors for high energy days
    background: '#FFFEF0',            // Warm white
    backgroundLight: '#FFF9E6',       // Sunny cream
    backgroundCard: '#FFFFFF',
    text: '#1A252F',                  // Strong dark
    textSecondary: '#2C3E50',
    primary: '#27AE60',               // Vibrant green
    accent: '#F39C12',                // Energetic orange
    gradient: ['#a8e6cf', '#88d8b0', '#56ab2f'] as [string, string, string],
    statusBarStyle: 'dark-content' as const,
    motivationalMessage: 'Channel this energy! What\'s your big move today?',
  },
};

// Get theme based on energy level (0-100)
export const getEnergyTheme = (energyLevel: number) => {
  const mode = getEnergyMode(energyLevel);
  return energyThemes[mode];
};

// Sections visibility based on energy level
export const getVisibleSections = (energyLevel: number) => {
  const mode = getEnergyMode(energyLevel);

  switch (mode) {
    case 'low':
      // Low energy: Only show essential self-care and simple tasks
      return {
        showProjects: false,
        showGoals: false,
        showFinance: false,
        showAutocuidado: true,
        showCasa: true,      // Simple home tasks can be grounding
        showDiario: true,
        showTimeline: false, // Don't add time pressure
        showFullCheckin: false,
        maxTasks: 1,         // Just one thing
      };
    case 'medium':
      // Medium energy: Show most features
      return {
        showProjects: true,
        showGoals: true,
        showFinance: true,
        showAutocuidado: true,
        showCasa: true,
        showDiario: true,
        showTimeline: true,
        showFullCheckin: true,
        maxTasks: 3,
      };
    case 'high':
      // High energy: Show everything with encouragement to tackle big things
      return {
        showProjects: true,
        showGoals: true,
        showFinance: true,
        showAutocuidado: true,
        showCasa: true,
        showDiario: true,
        showTimeline: true,
        showFullCheckin: true,
        maxTasks: 3,
        showProjectsProminent: true, // Encourage tackling bigger tasks
      };
    default:
      return {
        showProjects: true,
        showGoals: true,
        showFinance: true,
        showAutocuidado: true,
        showCasa: true,
        showDiario: true,
        showTimeline: true,
        showFullCheckin: true,
        maxTasks: 3,
      };
  }
};

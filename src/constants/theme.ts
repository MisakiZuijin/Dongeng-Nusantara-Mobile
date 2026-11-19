import { Platform } from 'react-native';

export const COLORS = {
  sunsetOrange: '#FF7A45',
  sunsetOrangeHover: '#E86532',
  lightSecondary: '#D9531E',
  goldenYellow: '#FFB800',
  goldenAccent: '#FFD166',
  emeraldLeaf: '#1B8E83',
  emeraldLeafLight: '#E6F9F7',
  midnightBlue: '#1E2246',
  twilightPurple: '#3A3F7A',
  darkSurfaceVariant: '#2A2F5D',
  warmCream: '#FFF9F0',
  warmCreamAlt: '#FFF8EB',
  slateGray: '#646B8A',
  slateGrayLight: '#A0A6C2',
  borderSoft: '#F0E7D8',
  karaokeHighlight: '#FFF0C2',
  white: '#FFFFFF',
  darkTextSecondary: '#D0D5EE',
  softPeach: '#FFF0DB',
  softPeachAlt: '#FFF4E3',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  section: 40,
  pageMargin: 24,
} as const;

export const RADIUS = {
  sm: 8,
  default: 16,
  md: 20,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const SHADOWS = {
  card: Platform.select({
    ios: {
      shadowColor: '#1E2246',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  cta: Platform.select({
    ios: {
      shadowColor: '#FF7A45',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  sheet: Platform.select({
    ios: {
      shadowColor: '#1E2246',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
    },
    android: {
      elevation: 10,
    },
    default: {},
  }),
} as const;

// src/config/theme.js
// Design system SunuThérapie — direction "Moderne & apaisant"
// Source unique de vérité pour couleurs, espacements, typographie, rayons et ombres.

export const colors = {
  // — Marque —
  primary: '#0E8A8A',        // teal apaisé
  primaryDark: '#0B6E6E',
  primaryDarker: '#084F4F',
  primaryLight: '#E6F5F5',
  primarySurface: '#F1FAFA',

  // — Accent secondaire —
  accent: '#3B7DD8',
  accentDark: '#2C63AE',
  accentLight: '#E7F0FB',

  // — États sémantiques —
  success: '#1F9D6B',
  successLight: '#E4F6EE',
  warning: '#E0892E',
  warningLight: '#FDF1E4',
  danger: '#D64545',
  dangerLight: '#FBEAEA',
  info: '#3B7DD8',
  infoLight: '#E7F0FB',

  // — Neutres / surfaces —
  background: '#F5FAFA',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF5F5',
  border: '#E4EBEB',
  borderStrong: '#D2DCDC',

  // — Texte —
  text: '#132321',
  textMuted: '#5A6A69',
  textFaint: '#8A9998',
  textOnPrimary: '#FFFFFF',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(9, 24, 23, 0.45)',
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, full: 999,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.2 },
  h3: { fontSize: 17, fontWeight: '700', color: colors.text },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  body: { fontSize: 14, fontWeight: '400', color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: '400', color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  label: {
    fontSize: 11, fontWeight: '700', color: colors.textFaint,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
};

export const shadows = {
  none: {},
  sm: { shadowColor: '#0B3A38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  md: { shadowColor: '#0B3A38', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 14, elevation: 5 },
  lg: { shadowColor: '#0B3A38', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 10 },
};

const theme = { colors, spacing, radius, typography, shadows };
export default theme;

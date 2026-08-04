//export const API_URL = 'http://10.0.2.2:8000/api'; // Android émulateur
// export const API_URL = 'http://localhost:8000/api'; // iOS simulateur
export const API_URL = 'https://sunutherapi.com/api'; // Production
// export const API_URL = 'http://localhost:8000/api'; // Local (simulateur iOS)

// Palette rétro-compatible — alignée sur le design system (src/config/theme.js).
// Les écrans existants continuent d'importer COLORS ; les nouveaux écrans
// utilisent plutôt le thème (colors, spacing, radius, typography, shadows).
export const COLORS = {
  primary: '#0E8A8A',
  primaryDark: '#0B6E6E',
  primaryLight: '#E6F5F5',
  secondary: '#3B7DD8',
  secondaryLight: '#E7F0FB',
  green: '#1F9D6B',
  greenLight: '#E4F6EE',
  background: '#F5FAFA',
  white: '#FFFFFF',
  text: '#132321',
  textMuted: '#5A6A69',
  grey: '#EFF5F5',
  greyDark: '#8A9998',
  warning: '#E0892E',
  danger: '#D64545',
  success: '#1F9D6B',
};

export const USER_ROLES = {
  STUDENT: 'etudiant',
  PSY: 'psychologue',
  ADMIN: 'admin',
};

// Ré-export pratique du design system.
export { colors, spacing, radius, typography, shadows } from './theme';
export { default as theme } from './theme';

export const lightColors = {
  blue: '#0F3468',
  orange: '#EF9735',
  grey: '#696969',
  'light-grey': '#BABABA',
  white: '#FFFFFF',
  'dark-white': '#e3e4e8',
  page: '#EEF1F5',
  card: '#FFFFFF',
  border: '#f3f4f6',
};

export const darkColors = {
  blue: '#93c5fd',
  orange: '#EF9735',
  grey: '#9ca3af',
  'light-grey': '#4b5563',
  white: '#1e293b',
  'dark-white': '#334155',
  page: '#0f172a',
  card: '#1e293b',
  border: '#334155',
};

export function getColors(isDark) {
  return isDark ? darkColors : lightColors;
}

export const colors = lightColors;

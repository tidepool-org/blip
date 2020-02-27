export const breakpoints = ['512px', '768px', '1024px', '1280px'];

export const colors = {
  black: '#000',
  superBlack: '#00000',
  white: '#fff',
  blue: '#40EBF9',
  peach: '#fcce9f',
  coral: '#f9706b',
  orange: '#f95f3b',
  green: '#4ce791',
  indigo: '#91A3FF',
  lightestGrey: '#f9f9f9',
  lightGrey: '#EDEDED',
  mediumGrey: '#979797',
  darkGrey: '#606060',
  lightPurple: '#DCE0F9',
  mediumPurple: '#6582FF',
  darkPurple: '#271B46',
  background: '#ffffff',
  primaryFont: '#4f6a92',
  linkFont: '#6582FF',
  buttonColor: '#f9706b',
  primaryTextSubdued: '#7E98C3',
};

export const fonts = {
  default: 'Basis, "Helvetica Neue", Helvetica, Arial, sans-serif',
  monospace: '"Basis Mono", "Andale Mono", monospace',
};
export const fontSizes = [12, 14, 16, 20, 24, 36, 48];

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
  black: 900
};

export const mediaQueries = {
  phone: '@media screen and (max-width: 512px)',
  tablet: '@media screen and (max-width: 767px)',
  laptop: '@media screen and (max-width: 1024px)',
  desktop: '@media screen and (min-width: 1280px)',
};

export const radii = {
  default: 4,
  input: 3,
};

export const shadows = {
  small: '0px 0px 1px rgba(67, 90, 111, 0.47)',
  large: '0px 3px 6px rgba(67, 90, 111, 0.301);',
};

export const space = [0, 4, 8, 16, 24, 32, 64, 128];

export const transitions = {
  easeOut: 'all .2s ease-out',
};

export const zIndices = [0, 10, 100, 1000];

export default {
  breakpoints,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  mediaQueries,
  radii,
  shadows,
  space,
  transitions,
  zIndices,
};

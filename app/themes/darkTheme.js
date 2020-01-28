import colorPalette from './colorPalette';
import baseTheme from './baseTheme';

export default {
  breakpoints: baseTheme.breakpoints,
  space: baseTheme.space,
  fontSizes: baseTheme.fontSizes,
  weights: [400],
  headerWeight: 400,
  colors: {
    black: '#000',
    white: '#fff',
    blue: '#40EBF9',
    peach: '#fcce9f',
    coral: '#f9706b',
    orange: '#f95f3b',
    green: '#4ce791',
    lightGrey: '#ECECED',
    mediumGrey: '#979797',
    darkGrey: '#606060',
    lightPurple: '#DCE0F9',
    mediumPurple: '#6582FF',
    darkPurple: '#271B46',
    background: '#271B46',
    primaryFont: '#fff',
    linkFont: colorPalette.colors.purple.darkPurple,
    buttonColor: '#f9706b'
  },
  radius: 4,
  font: 'BasisMedium, BlinkMacSystemFont, sans-serif',
  monospace: '"SF Mono", "Roboto Mono", Menlo, monospace',
  background: '#271B46'
};

import baseTheme from './baseTheme';

export default {
  breakpoints: ['512px', '768px', '1024px', '1280px'],
  space: baseTheme.space,
  fontSizes: baseTheme.fontSizes,
  weights: [400],
  colors: {
    black: '#000',
    white: '#fff',
    blue: '#40EBF9',
    peach: '#fcce9f',
    coral: '#f9706b',
    orange: '#f95f3b',
    green: '#4ce791',
    lightestGrey: '#f9f9f9',
    lightGrey: '#EDEDED',
    mediumGrey: '#979797',
    darkGrey: '#606060',
    lightPurple: '#DCE0F9',
    mediumPurple: '#6582FF',
    darkPurple: '#271B46',
    background: '#f9f9f9',
    primaryFont: '#4f6a92',
    linkFont: '#6582FF',
    buttonColor: '#f9706b',
    primaryTextSubdued: '#7E98C3'
  },
  radius: 4,
  gridSize: 1200,
  layoutSpacingSmall: 16,
  font: 'BasisMedium, BlinkMacSystemFont, sans-serif',
  monospace: '"SF Mono", "Roboto Mono", Menlo, monospace',
  border: 'solid 1px #ECECED'
};

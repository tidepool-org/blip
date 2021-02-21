import colorPalette from './colorPalette';
import avatars from './base/avatars';
import banners from './base/banners';
import buttons from './base/buttons';
import icons from './base/icons';
import inputs from './base/inputs';
import links from './base/links';
import steppers from './base/steppers';
import tabGroups from './base/tabGroups';
import paginators from './base/paginators';
import tables from './base/tables';
import toasts from './base/toasts';
import forms from './base/forms';

export const breakpoints = ['512px', '768px', '1024px', '1280px'];

export const colors = {
  ...colorPalette.primary,
  ...colorPalette.secondary,
  ...colorPalette.neutrals,
  ...colorPalette.extended,
  text: {
    link: colorPalette.primary.purpleBright,
    primary: colorPalette.primary.blueGreyDark,
    primaryDisabled: colorPalette.primary.blueGreyLight,
    primarySubdued: colorPalette.primary.blueGreyMedium,
  },
  border: {
    webkitFocus: '#005fcc',
    default: colorPalette.extended.grays[1],
    divider: colorPalette.extended.grays[0],
    modal: colorPalette.extended.grays[0],
  },
  feedback: {
    info: colorPalette.primary.purpleMedium,
    warning: '#FFAB00',
    danger: '#DE350C',
    success: '#47B881',
  },
  stat: {
    border: '#75849F',
    text: '#727375',
  },
};

export const borders = {
  default: `1px solid ${colors.border.default}`,
  input: `1px solid ${colors.border.default}`,
  modal: `1px solid ${colors.border.modal}`,
  divider: `2px solid ${colors.border.divider}`,
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
  black: 900,
};

export const lineHeights = [1, 1.25, 1.33, 1.5, 1.75, 2];

export const mediaQueries = {
  phone: '@media screen and (max-width: 512px)',
  tablet: '@media screen and (max-width: 767px)',
  laptop: '@media screen and (max-width: 1024px)',
  desktop: '@media screen and (min-width: 1280px)',
};

export const radii = {
  large: 8,
  default: 4,
  input: 3,
  full: 999,
};

export const shadows = {
  small: '0px 0px 1px rgba(67, 90, 111, 0.47)',
  medium: '0px 0px 4px rgba(67, 90, 111, 0.4)',
  large: '0px 3px 6px rgba(67, 90, 111, 0.301);',
};

export const space = [0, 4, 8, 16, 24, 32, 48, 64, 96, 128];

export const transitions = {
  easeOut: 'all .2s ease-out',
};

export const zIndices = [0, 10, 100, 1000];

const linkVariants = links({ colors, fonts });

const variants = {
  avatars: avatars({ colors, fonts, fontSizes, fontWeights }),
  banners: banners({ colors, fonts, fontSizes, fontWeights }),
  icons: icons({ colors, fontSizes, radii, space }),
  inputs: inputs({ borders, colors, fonts, radii, fontSizes, fontWeights, space }),
  link: linkVariants.default,
  links: linkVariants,
  paginators: paginators({ colors, fonts, fontSizes }),
  steppers: steppers({ colors, fonts, fontWeights, fontSizes }),
  tabGroups: tabGroups({ colors, fonts, fontWeights, fontSizes }),
  tables: tables({ borders, colors, fonts, fontSizes, shadows }),
  toasts: toasts({ borders, colors, radii, fontSizes, shadows }),
};

export default {
  breakpoints,
  buttons: buttons({ colors, borders, fontSizes, radii, fonts, space, fontWeights, lineHeights }),
  variants,
  borders,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  forms: forms({ colors }),
  lineHeights,
  mediaQueries,
  radii,
  shadows,
  space,
  transitions,
  zIndices,
};

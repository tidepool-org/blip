import colorPalette from './colorPalette';
import avatars from './base/avatars';
import banners from './base/banners';
import buttons from './base/buttons';
import icons from './base/icons';
import inputs from './base/inputs';
import links from './base/links';
import tabGroups from './base/tabGroups';
import paginators from './base/paginators';

export const breakpoints = ['512px', '768px', '1024px', '1280px'];

export const colors = {
  ...colorPalette.primary,
  ...colorPalette.secondary,
  ...colorPalette.neutrals,
  ...colorPalette.extended,
  text: {
    primary: '#4F6A92',
    primaryDisabled: '#A6B1BB',
    primarySubdued: '#7E98C3',
    link: '#6582FF',
  },
  border: {
    default: colorPalette.extended.grays[1],
    modal: colorPalette.extended.grays[0],
    divider: colorPalette.extended.grays[0],
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
  default: 4,
  input: 3,
};

export const shadows = {
  small: '0px 0px 1px rgba(67, 90, 111, 0.47)',
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
  inputs: inputs({ borders, colors, fonts, fontSizes, radii }),
  link: linkVariants.default,
  links: linkVariants,
  tabGroups: tabGroups({ colors, fonts, fontWeights, fontSizes }),
  paginators: paginators({ colors, fonts, fontSizes }),
};

export default {
  breakpoints,
  buttons: buttons({ colors, borders, fontSizes, radii, fonts, space, fontWeights, lineHeights }),
  variants,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  mediaQueries,
  radii,
  shadows,
  space,
  transitions,
  zIndices,
};

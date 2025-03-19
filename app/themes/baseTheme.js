import colorPalette from './colorPalette';
import { colors as vizColors } from '@tidepool/viz';
import avatars from './base/avatars';
import banners from './base/banners';
import buttons from './base/buttons';
import containers from './base/containers';
import icons from './base/icons';
import inputs from './base/inputs';
import links from './base/links';
import lists from './base/lists';
import steppers from './base/steppers';
import tabGroups from './base/tabGroups';
import paginators from './base/paginators';
import tables from './base/tables';
import tags from './base/tags';
import toasts from './base/toasts';
import forms from './base/forms';

export const breakpoints = ['512px', '768px', '1024px', '1280px'];

export const colors = {
  ...colorPalette.primary,
  ...colorPalette.secondary,
  ...colorPalette.neutrals,
  ...colorPalette.extended,
  bg: {
    veryLow: vizColors.veryLow,
    low: vizColors.low,
    target: vizColors.target,
    high: vizColors.high,
    veryHigh: vizColors.veryHigh,
    extremeHigh: '#5438A3',
  },
  border: {
    focus: '#4C9AFF',
    default: colorPalette.extended.grays[1],
    divider: colorPalette.extended.grays[0],
    dividerDark: colorPalette.extended.grays[1],
    modal: colorPalette.extended.grays[0],
    inputLight: '#DFE2E6',
    inputDark: '#A6B1BB',
  },
  brand: {
    dexcom: '#56A846',
  },
  feedback: {
    info: colorPalette.primary.purpleMedium,
    warning: vizColors.gold50,
    danger: vizColors.red30,
    success: vizColors.green50,
  },
  banner: {
    info: {
      action: {
        bg: colorPalette.primary.purpleMedium,
        text: colorPalette.neutrals.white,
      },
      bg: '#2A1948',
      closeIcon: colorPalette.neutrals.white,
      icon: colorPalette.primary.purpleMedium,
      message: colorPalette.neutrals.white,
      messageLink: colorPalette.primary.purpleLight,
    },
    warning: {
      action: {
        bg: '#2A1948',
        text: colorPalette.neutrals.white,
      },
      bg: vizColors.gold05,
      closeIcon: vizColors.blue50,
      icon: vizColors.gold30,
      message: '#2A1948',
      messageLink: colorPalette.primary.purpleBright,
    },
    danger: {
      action: {
        bg: '#2A1948',
        text: colorPalette.neutrals.white,
      },
      bg: '#FFEEEC',
      closeIcon: vizColors.blue50,
      icon: vizColors.red30,
      message: '#2A1948',
      messageLink: colorPalette.primary.purpleBright,
    },
    success: {
      action: {
        bg: '#2A1948',
        text: colorPalette.neutrals.white,
      },
      bg: '#EBFBF0',
      closeIcon: '#4F6A92',
      icon: vizColors.green30,
      message: '#2A1948',
      messageLink: colorPalette.primary.purpleBright,
    },
  },
  stat: {
    border: '#75849F',
    text: '#727375',
  },
  status: {
    pending: ['#E2FFEE', '#006644'],
    declined: ['#FFECEE', '#DD2C00'],
  },
  tab: {
    primary: colorPalette.primary.blueGrey,
    disabled: '#A5ADBA',
    selected: colorPalette.primary.purpleMedium,
  },
  text: {
    link: colorPalette.primary.purpleBright,
    primary: vizColors.blue50,
    primaryGrey: colorPalette.primary.blueGrey,
    primaryDisabled: '#A5ADBA',
    primarySubdued: colorPalette.primary.blueGreyMedium,
  },
};

export const borders = {
  default: `1px solid ${colors.border.default}`,
  thick: `2px solid ${colors.border.default}`,
  input: `1px solid ${colors.border.inputLight}`,
  inputDark: `1px solid ${colors.border.inputDark}`,
  modal: `1px solid ${colors.border.modal}`,
  divider: `2px solid ${colors.border.divider}`,
  dividerDark: `2px solid ${colors.border.dividerDark}`,
  card: '1px solid rgba(225, 234, 249, 1)',
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

export const radii = {
  large: 8,
  medium: 6,
  default: 4,
  input: 3,
  full: 999,
};

export const shadows = {
  small: '0px 0px 1px rgba(67, 90, 111, 0.47)',
  medium: '0px 0px 4px rgba(67, 90, 111, 0.4)',
  large: '0px 3px 6px rgba(67, 90, 111, 0.301);',
  focus: `0px 0px 0px 2px ${colors.border.focus}`,
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
  icons: icons({ colors, fontSizes, radii, space, shadows }),
  inputs: inputs({ borders, colors, fonts, radii, fontSizes, fontWeights, space }),
  links: linkVariants,
  lists: lists(),
  paginators: paginators({ colors, fonts, fontSizes, breakpoints }),
  steppers: steppers({ colors, fonts, fontWeights, fontSizes }),
  tabGroups: tabGroups({ colors, fonts, fontWeights, fontSizes }),
  tables: tables({ borders, colors, fonts, fontSizes, shadows, radii }),
  tags: tags({ colors, fonts, radii, fontWeights }),
  toasts: toasts({ borders, colors, radii, fontSizes, shadows }),
  containers: containers({ borders, colors, radii, space, breakpoints }),
};

const defaultText = {
  fontWeight: 'regular',
  fontFamily: 'default',
  color: 'text.primary',
};

const titleText = {
  ...defaultText,
  fontSize: 4,
  lineHeight: 3,
};

const bodyText = {
  ...defaultText,
  display: 'block',
};

const paragraphText = {
  ...bodyText,
  marginBottom: '1em',

  '&:last-child': {
    marginBottom: 0,
  },
};

const text = {
  headline: {
    ...defaultText,
    fontSize: 4,
    lineHeight: 2,
  },

  subheading: {
    ...defaultText,
    fontSize: 2,
    lineHeight: 4,
    fontWeight: 'medium',
  },

  title: titleText,

  mediumTitle: {
    ...titleText,
    fontWeight: 'medium',
    fontSize: 3
  },

  body0: {
    ...bodyText,
    fontSize: 0,
    lineHeight: 2,
  },

  body1: {
    ...bodyText,
    fontSize: 1,
    lineHeight: 3,
  },

  body2: {
    ...bodyText,
    fontSize: 2,
    lineHeight: 3,
  },

  paragraph0: {
    ...paragraphText,
    fontSize: 0,
    lineHeight: 2,
  },

  paragraph1: {
    ...paragraphText,
    fontSize: 1,
    lineHeight: 2,
  },

  paragraph2: {
    ...paragraphText,
    fontSize: 2,
    lineHeight: 3,
  },

  caption: {
    ...defaultText,
    display: 'block',
    fontSize: 0,
    lineHeight: 4,

    '&.error': {
      color: 'feedback.danger',
      ul: {
        paddingLeft: '20px',
        marginTop: 0,
      }
    },

    '&.warning': {
      color: 'feedback.warning',
    },

    '&.required::after': {
      content: '" *"',
      display: 'inline',
    },
  },
};

const styles = {
  a: linkVariants.default,
  hr: { borderBottom: borders.divider },
  dividerDark: { borderBottom: borders.dividerDark },
};

export default {
  breakpoints,
  buttons: buttons({
    colors,
    borders,
    fontSizes,
    radii,
    fonts,
    space,
    fontWeights,
    lineHeights,
    shadows,
    transitions,
  }),
  borders,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  forms: forms({ colors }),
  lineHeights,
  radii,
  shadows,
  space,
  styles,
  text,
  transitions,
  zIndices,
  ...variants,
};

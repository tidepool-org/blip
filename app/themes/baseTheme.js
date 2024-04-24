import colorPalette from './colorPalette';
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
    veryLow: '#E9695E',
    low: '#F19181',
    target: '#8DD0A9',
    high: '#B69CE2',
    veryHigh: '#856ACF',
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
    warning: '#A35700',
    danger: '#EC4C47',
    success: '#00754E',
  },
  banner: {
    info: {
      action: {
        bg: '#2A1948',
        text: colorPalette.neutrals.white,
      },
      bg: colorPalette.primary.purpleLight,
      closeIcon: '#4F6A92',
      icon: colorPalette.primary.purpleMedium,
      message: '#2A1948',
    },
    warning: {
      action: {
        bg: '#2A1948',
        text: colorPalette.neutrals.white,
      },
      bg: '#FFE8CF',
      closeIcon: '#4F6A92',
      icon: '#CC6D00',
      message: '#2A1948',
    },
    danger: {
      action: {
        bg: '#2A1948',
        text: colorPalette.neutrals.white,
      },
      bg: '#FFEEEC',
      closeIcon: '#4F6A92',
      icon: '#EC4C47',
      message: '#2A1948',
    },
    success: {
      action: {
        bg: '#2A1948',
        text: colorPalette.neutrals.white,
      },
      bg: '#EBFBF0',
      closeIcon: '#4F6A92',
      icon: '#08A057',
      message: '#2A1948',
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
    primary: colorPalette.primary.blueGreyDark,
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
  link: linkVariants.default,
  links: linkVariants,
  lists: lists(),
  paginators: paginators({ colors, fonts, fontSizes, breakpoints }),
  steppers: steppers({ colors, fonts, fontWeights, fontSizes }),
  tabGroups: tabGroups({ colors, fonts, fontWeights, fontSizes }),
  tables: tables({ borders, colors, fonts, fontSizes, shadows, radii }),
  tags: tags({ colors, fonts, radii, fontWeights }),
  toasts: toasts({ borders, colors, radii, fontSizes, shadows }),
  containers: containers({ borders, colors, radii, space }),
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

  paragraph1: {
    ...paragraphText,
    fontSize: 1,
    lineHeight: 3,
  },

  paragraph2: {
    ...paragraphText,
    fontSize: 2,
    lineHeight: 3,
  },

  caption: {
    ...defaultText,
    display: 'inline-block',
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
  text,
  transitions,
  zIndices,
  ...variants,
};

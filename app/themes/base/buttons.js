export default ({
  colors,
  borders,
  fontSizes,
  radii,
  fonts,
  space,
  fontWeights,
  shadows,
  transitions
}) => {
  const defaultStyles = {
    fontSize: `${fontSizes[1]}px`,
    fontWeight: fontWeights.regular,
    lineHeight: 0,
    fontFamily: fonts.default,
    padding: `${space[2]}px ${space[4]}px`,
    height: 'auto',
    cursor: 'pointer',
    flex: [1, 'initial'],
    transition: `${transitions.easeOut}`,
    position: 'relative',

    '&:disabled': {
      pointerEevents: 'none',
    },

    '&.processing': {
      pointerEvents: 'none',

      '> div:first-child, .icon': {
        transition: 'none',
        visibility: 'hidden',
      },
    },

    ':focus': {
      outline: 'none',
      boxShadow: shadows.focus,
    },
    '@media (-webkit-min-device-pixel-ratio:0)': {
      ':focus': {
        boxShadow: shadows.focus,
      },
    },
  };

  const primaryStyles = {
    ...defaultStyles,
    flex: [2, 'initial'],
    backgroundColor: colors.purpleMedium,
    border: borders.input,
    borderColor: colors.purpleMedium,
    color: colors.white,
    borderRadius: radii.default,
    '&.selected': {
      cursor: 'default',
    },
    '&:disabled': {
      backgroundColor: colors.lightestGrey,
      borderColor: colors.lightestGrey,
      color: colors.text.primaryDisabled,
    },
  };

  const secondaryStyles = {
    ...defaultStyles,
    backgroundColor: colors.white,
    color: colors.text.primary,
    border: borders.inputDark,
    borderRadius: radii.default,
    '&:disabled': {
      backgroundColor: colors.lightestGrey,
      borderColor: colors.lightestGrey,
      color: colors.text.primaryDisabled,
    },
  };

  const tertiaryStyles = {
    ...defaultStyles,
    backgroundColor: colors.white,
    color: colors.text.primary,
    border: borders.input,
    borderRadius: radii.default,
    '&:hover': {
      borderColor: colors.grays[2],
    },
    '&:active': {
      borderColor: colors.purpleMedium,
    },
    '&.selected': {
      cursor: 'default',
      borderColor: colors.purpleMedium,
    },
    '&:disabled': {
      backgroundColor: colors.lightestGrey,
      borderColor: colors.lightGrey,
      color: colors.text.primaryDisabled,
    },
  };

  const quickActionStyles = {
    ...defaultStyles,
    backgroundColor: '#F4F5FF',
    color: colors.text.primary,
    border: 0,
    borderRadius: radii.default,
    fontWeight: 'medium',
    px: 2,
    py: 1,
  };

  const textButtonStyles = {
    border: 0,
    borderRadius: 0,
    paddingLeft: 2,
    paddingRight: 2,
    backgroundColor: 'transparent',
    '&:disabled': {
      color: colors.text.primaryDisabled,
    },
    '.icon': {
      marginRight: 1,
    },
  };

  const actionListItemStyles = {
    ...textButtonStyles,
    backgroundColor: colors.white,
    width: '100%',
    padding: 3,
    paddingRight: 5,
    fontSize: 2,
    borderBottom: borders.divider,
    '&:last-child': {
      borderBottom: 'none',
    },
    '.icon, .MuiCircularProgress-root': {
      color: 'inherit !important',
      width: '1.125em !important',
      height: '1.125em !important',
    },
  };

  const condensedStyles = {
    py: '6px',
    px: '16px',
    fontSize: 0,
  };

  return {
    primary: primaryStyles,
    primaryCondensed: {
      ...primaryStyles,
      ...condensedStyles,
    },
    secondary: secondaryStyles,
    secondaryCondensed: {
      ...secondaryStyles,
      ...condensedStyles,
    },
    tertiary: tertiaryStyles,
    tertiaryCondensed: {
      ...tertiaryStyles,
      ...condensedStyles,
    },
    quickAction: quickActionStyles,
    quickActionCondensed: {
      ...quickActionStyles,
      ...condensedStyles,
    },
    danger: {
      ...defaultStyles,
      backgroundColor: colors.feedback.danger,
      color: colors.white,
      border: borders.input,
      borderColor: colors.feedback.danger,
      borderRadius: radii.default,
      '&.selected': {
        cursor: 'default',
        backgroundColor: colors.pinks[13],
        borderColor: colors.pinks[13],
      },
      '&:disabled': {
        backgroundColor: colors.coral,
        borderColor: colors.coral,
        color: colors.text.primaryDisabled,
      },
    },
    textPrimary: {
      ...defaultStyles,
      ...textButtonStyles,
      color: colors.purpleBright,
      '&:hover,&:active': {
        color: colors.text.primary,
        textDecoration: 'none',
      },
    },
    textSecondary: {
      ...defaultStyles,
      ...textButtonStyles,
      color: colors.text.primary,
      '&:hover,&:active': {
        color: colors.text.primarySubdued,
        textDecoration: 'none',
      },
    },
    textTertiary: {
      ...defaultStyles,
      ...textButtonStyles,
      color: colors.blueGreyMedium,
      '&:hover,&:active': {
        color: colors.text.primary,
        textDecoration: 'none',
      },
    },
    actionListItem: {
      ...defaultStyles,
      ...actionListItemStyles,
      color: colors.text.primary,
      '&:hover,&:active': {
        color: colors.text.primary,
        backgroundColor: colors.lightestGrey,
      },
    },
    actionListItemDanger: {
      ...defaultStyles,
      ...actionListItemStyles,
      color: colors.feedback.danger,
      '&:hover,&:active': {
        color: colors.feedback.danger,
        backgroundColor: colors.lightestGrey,
      },
    },
    pagination: {
      ...defaultStyles,
      fontSize: `${fontSizes[1]}px`,
      fontWeight: fontWeights.medium,
      backgroundColor: 'transparent',
      color: colors.text.primary,
      border: 0,
      borderRadius: radii.input,
      padding: 1,
      '> div': {
        display: 'flex',
        alignItems: 'center',
      },
      '&:hover': {
        backgroundColor: colors.lightGrey,
      },
      '&:active': {
        backgroundColor: colors.blues[0],
        color: colors.purpleBright,
      },
      '&:disabled': {
        color: colors.text.primaryDisabled,
      },
      '&.selected': {
        cursor: 'default',
        backgroundColor: colors.blueGreyDark,
        color: colors.white,

        '&:disabled': {
          backgroundColor: colors.blueGreyLight,
        },
      },
    },
    paginationLight: {
      ...defaultStyles,
      fontSize: `${fontSizes[1]}px`,
      fontWeight: fontWeights.medium,
      backgroundColor: 'transparent',
      color: colors.text.primary,
      border: 0,
      borderRadius: radii.input,
      padding: 1,
      '> div': {
        display: 'flex',
        alignItems: 'center',
      },
      '&:hover': {
        backgroundColor: colors.lightGrey,
      },
      '&:active': {
        backgroundColor: colors.blues[0],
        color: colors.purpleBright,
      },
      '&:disabled': {
        color: colors.text.primaryDisabled,
      },
      '&.selected': {
        cursor: 'default',
        backgroundColor: colors.blues[0],
        color: colors.purpleBright,

        '&:disabled': {
          color: colors.text.primaryDisabled,
          backgroundColor: colors.lightGrey,
        },
      },
    },
    filter: {
      ...defaultStyles,
      ...tertiaryStyles,
      fontSize: `${fontSizes[0]}px`,
      padding: `${space[1]}px ${space[2]}px`,

      '.icon': {
        fontSize: `${fontSizes[2]}px`,
      },
      '&.selected': {
        cursor: 'default',
        color: colors.purpleMedium,
        backgroundColor: colors.blues[0],
        borderColor: colors.purpleMedium,
      },
    },
    chip: {
      ...defaultStyles,
      backgroundColor: colors.white,
      color: colors.text.primary,
      border: borders.input,
      borderColor: colors.grays[1],
      borderRadius: radii.full,
      fontSize: `${fontSizes[0]}px`,
      fontWeight: fontWeights.medium,
      padding: `${space[1]}px ${space[4]}px`,

      '&.processing': {
        color: colors.white,
        backgroundColor: colors.purpleMedium,
        borderColor: colors.purpleMedium,

        '.MuiCircularProgress-root': {
          width: `${fontSizes[1]}px !important`,
          height: `${fontSizes[1]}px !important`,
        },
      },
      '.icon': {
        fontSize: `${fontSizes[1]}px`,
      },
      '&:hover': {
        borderColor: colors.grays[2],
      },
      '&:active': {
        color: colors.white,
        backgroundColor: colors.purpleMedium,
        borderColor: colors.purpleMedium,
      },
      '&.selected': {
        cursor: 'default',
        color: colors.white,
        backgroundColor: colors.blueGreyDark,
        borderColor: colors.blueGreyDark,
      },
      '&:disabled': {
        backgroundColor: colors.lightestGrey,
        borderColor: colors.lightestGrey,
        color: colors.text.primaryDisabled,
      },
    },
    large: {
      ...defaultStyles,
      backgroundColor: colors.purpleMedium,
      border: borders.input,
      borderColor: colors.purpleMedium,
      color: colors.white,
      borderRadius: radii.large,
      fontSize: `${fontSizes[4]}px`,
      padding: `${space[5]}px ${space[6]}px`,
      '&:hover,&:active': {
        backgroundColor: colors.purpleDark,
        borderColor: colors.purpleDark,
      },
      '&:disabled': {
        backgroundColor: colors.lightestGrey,
        borderColor: colors.lightestGrey,
        color: colors.text.primaryDisabled,
      },
    },
  };
};

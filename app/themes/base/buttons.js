export default ({ colors, borders, fontSizes, radii, fonts, space, fontWeights }) => {
  const defaultStyles = {
    fontSize: `${fontSizes[2]}px`,
    fontWeight: fontWeights.regular,
    lineHeight: 0,
    fontFamily: fonts.default,
    padding: `${space[2]}px ${space[3]}px`,
    height: 'auto',

    '.icon': {
      fontSize: `${fontSizes[3]}px`,
    },
  };

  return {
    primary: {
      ...defaultStyles,
      backgroundColor: colors.purpleMedium,
      border: borders.input,
      borderColor: colors.purpleMedium,
      color: colors.white,
      borderRadius: radii.default,
      '&.selected': {
        backgroundColor: colors.blueGrey,
        borderColor: colors.blueGrey,
      },
      '&:disabled': {
        backgroundColor: colors.lightestGrey,
        borderColor: colors.lightestGrey,
        color: colors.text.primaryDisabled,
      },
    },
    secondary: {
      ...defaultStyles,
      backgroundColor: colors.white,
      color: colors.text.primary,
      border: borders.input,
      borderRadius: radii.default,
      '&:hover,&:active': {
        color: colors.white,
        backgroundColor: colors.text.primary,
        borderColor: colors.text.primary,
      },
      '&:disabled': {
        backgroundColor: colors.lightestGrey,
        borderColor: colors.lightestGrey,
        color: colors.text.primaryDisabled,
      },
    },
    textPrimary: {
      ...defaultStyles,
      backgroundColor: colors.white,
      color: colors.purpleMedium,
      border: 0,
      borderRadius: 0,
      paddingLeft: 2,
      paddingRight: 2,
      '&:hover,&:active': {
        color: colors.text.primary,
      },
      '&:disabled': {
        color: colors.text.primaryDisabled,
      },
    },
    textSecondary: {
      ...defaultStyles,
      backgroundColor: colors.white,
      color: colors.text.primarySubdued,
      border: 0,
      borderRadius: 0,
      paddingLeft: 2,
      paddingRight: 2,
      '&:hover,&:active': {
        color: colors.text.primary,
      },
      '&:disabled': {
        color: colors.text.primaryDisabled,
      },
    },
    pagination: {
      ...defaultStyles,
      fontSize: `${fontSizes[0]}px`,
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
        color: colors.text.link,
      },
      '&:disabled': {
        color: colors.text.primaryDisabled,
      },
      '&.selected': {
        backgroundColor: colors.text.primary,
        color: colors.white,

        '&:disabled': {
          backgroundColor: colors.text.primaryDisabled,
        },
      },
    },
    filter: {
      ...defaultStyles,
      backgroundColor: colors.white,
      color: colors.text.primary,
      border: borders.input,
      borderColor: colors.grays[1],
      borderRadius: radii.default,
      fontSize: `${fontSizes[0]}px`,
      padding: `${space[1]}px ${space[2]}px`,

      '.icon': {
        fontSize: `${fontSizes[2]}px`,
      },
      '&:hover': {
        borderColor: colors.grays[2],
      },
      '&:active, &.selected': {
        borderColor: colors.purpleMedium,
      },
      '&:disabled': {
        backgroundColor: colors.lightestGrey,
        borderColor: colors.lightestGrey,
        color: colors.text.primaryDisabled,
      },
    },
    chip: {
      ...defaultStyles,
      backgroundColor: colors.white,
      color: colors.text.primary,
      border: borders.input,
      borderColor: colors.grays[1],
      borderRadius: radii.full,
      fontSize: `${fontSizes[1]}px`,
      fontWeight: fontWeights.medium,
      padding: `7px ${space[5]}px`,

      '&.processing': {
        color: colors.white,
        backgroundColor: colors.purpleMedium,
        borderColor: colors.purpleMedium,

        '.MuiCircularProgress-root': {
          width: `${fontSizes[2]}px !important`,
          height: `${fontSizes[2]}px !important`,
        },
      },
      '.icon': {
        fontSize: `${fontSizes[2]}px`,
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
        color: colors.white,
        backgroundColor: colors.text.primary,
        borderColor: colors.text.primary,
      },
      '&:disabled': {
        backgroundColor: colors.lightestGrey,
        borderColor: colors.lightestGrey,
        color: colors.text.primaryDisabled,
      },
      ':focus': {
        outline: 'none',
        boxShadow: '0px 0px 0px 2px Highlight',
      },
      '@media (-webkit-min-device-pixel-ratio:0)': {
        ':focus': {
          boxShadow: `0px 0px 0px 1px ${colors.border.webkitFocus}`,
        },
      },
    },
    chip: {
      ...defaultStyles,
      backgroundColor: colors.white,
      color: colors.text.primary,
      border: borders.input,
      borderColor: colors.grays[1],
      borderRadius: radii.full,
      fontSize: `${fontSizes[1]}px`,
      fontWeight: fontWeights.medium,
      padding: `7px ${space[5]}px`,

      '&.processing': {
        color: colors.white,
        backgroundColor: colors.purpleMedium,
        borderColor: colors.purpleMedium,

        '.MuiCircularProgress-root': {
          width: `${fontSizes[2]}px !important`,
          height: `${fontSizes[2]}px !important`,
        },
      },
      '.icon': {
        fontSize: `${fontSizes[2]}px`,
      },
      '&:hover': {
        borderColor: colors.grays[2],
      },
      '&:active': {
        color: colors.white,
        backgroundColor: colors.text.primary,
        borderColor: colors.text.primary,
      },
      '&.active': {
        color: colors.white,
        backgroundColor: colors.purpleMedium,
        borderColor: colors.purpleMedium,
      },
      '&:disabled': {
        backgroundColor: colors.lightestGrey,
        borderColor: colors.lightestGrey,
        color: colors.text.primaryDisabled,
      },
      ':focus': {
        outline: 'none',
        boxShadow: '0px 0px 0px 2px Highlight',
      },
      '@media (-webkit-min-device-pixel-ratio:0)': {
        ':focus': {
          boxShadow: '0px 0px 0px 2px -webkit-focus-ring-color',
        },
      },
    },
  };
};

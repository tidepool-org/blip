export default ({ colors, borders, fontSizes, radii, fonts, space, fontWeights }) => {
  const defaultStyles = {
    fontSize: `${fontSizes[2]}px`,
    fontWeight: fontWeights.regular,
    lineHeight: 0,
    fontFamily: fonts.default,
    padding: `${space[2]}px ${space[3]}px`,
    height: 'auto',
    cursor: 'pointer',

    '.icon': {
      fontSize: '1.125em',
    },
  };

  const tertiaryStyles = {
    ...defaultStyles,
    backgroundColor: colors.white,
    color: colors.text.primary,
    border: borders.input,
    borderColor: colors.grays[1],
    borderRadius: radii.default,
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

  return {
    primary: {
      ...defaultStyles,
      backgroundColor: colors.purpleMedium,
      border: borders.input,
      borderColor: colors.purpleMedium,
      color: colors.white,
      borderRadius: radii.default,
      '&.selected': {
        backgroundColor: colors.blueGreyDark,
        borderColor: colors.blueGreyDark,
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
      '&:hover,&:active,&.active': {
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
    tertiary: tertiaryStyles,
    danger: {
      ...defaultStyles,
      backgroundColor: colors.feedback.danger,
      color: colors.white,
      border: borders.input,
      borderColor: colors.feedback.danger,
      borderRadius: radii.default,
      '&.selected': {
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
      color: colors.purpleMedium,
      '&:hover,&:active': {
        color: colors.text.primary,
      },
    },
    textSecondary: {
      ...defaultStyles,
      ...textButtonStyles,
      color: colors.text.primarySubdued,
      '&:hover,&:active': {
        color: colors.text.primary,
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
        backgroundColor: colors.blues[0],
        color: colors.purpleBright,
        cursor: 'auto',

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
        backgroundColor: colors.blueGreyDark,
        borderColor: colors.blueGreyDark,
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

export default ({ colors, borders, fontSizes, radii, fonts, space, fontWeights, lineHeights }) => {
  const defaultStyles = {
    fontSize: `${fontSizes[2]}px`,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights[0],
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
      '&:hover,&:active': {
        backgroundColor: colors.text.primary,
        borderColor: colors.text.primary,
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
      padding: `${space[2]}px`,

      '.icon': {
        fontSize: `${fontSizes[2]}px`,
      },
      '&:hover': {
        borderColor: colors.grays[2],
      },
      '&:active, &.active': {
        borderColor: colors.purpleMedium,
      },
      '&:disabled': {
        backgroundColor: colors.lightestGrey,
        borderColor: colors.lightestGrey,
        color: colors.text.primaryDisabled,
      },
    },
  };
};

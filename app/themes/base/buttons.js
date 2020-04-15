export default ({ colors, borders, fontSizes, radii, fonts, space, fontWeights, lineHeights }) => {
  const defaultStyles = {
    fontSize: `${fontSizes[2]}px`,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights[0],
    fontFamily: fonts.default,
    padding: `${space[2]}px ${space[3]}px`,
    height: 'auto',
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
    text: {
      ...defaultStyles,
      backgroundColor: colors.white,
      color: colors.text.primary,
      border: 0,
      borderRadius: 0,
      paddingLeft: 2,
      paddingRight: 2,
      '&:hover,&:active': {
        color: colors.text.primarySubdued,
      },
      '&:disabled': {
        color: colors.text.primaryDisabled,
      },
    },
    pagination: {
      ...defaultStyles,
      fontSize: fontSizes[0],

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
  };
};

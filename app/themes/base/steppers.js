export default ({ colors, fonts, fontWeights, fontSizes }) => {
  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[1]}px`,

    '.steps': {
      fontWeight: fontWeights.medium,
      height: '100%',
    },

    '.optional': {
      color: colors.text.primaryDisabled,
    },

    '.MuiStepLabel-label': {
      color: colors.text.primarySubdued,

      '&.MuiStepLabel-active': {
        color: colors.text.link,
      },

      '&.MuiStepLabel-completed': {
        color: colors.text.primary,

        '+.optional': {
          visibility: 'hidden',
        },
      },
    }
  };

  return {
    horizontal: {
      ...defaultStyles,
      flexDirection: 'column',
    },
    vertical: {
      ...defaultStyles,
      flexDirection: 'row',
    },
  };
};

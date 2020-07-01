export default ({ colors, fonts, fontWeights, fontSizes }) => {
  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[1]}px`,

    '.steps': {
      fontWeight: fontWeights.medium,
    },

    '.optional': {
      color: colors.text.primaryDisabled,
      fontWeight: fontWeights.regular,
    },

    '.MuiStepIcon-root': {
      color: colors.text.primaryDisabled,

      '&.MuiStepIcon-active, &.MuiStepIcon-completed': {
        color: colors.purpleMedium,
      },
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
    },

    '.skipped .MuiStepLabel-label': {
      color: colors.text.primaryDisabled,

      '&.MuiStepLabel-active': {
        color: colors.text.link,
      },
    },
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

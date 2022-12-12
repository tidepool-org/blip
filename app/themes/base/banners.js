export default ({ colors, fonts, fontSizes, fontWeights }) => {
  const common = {
    color: colors.white,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,

    '.message': {
      fontFamily: fonts.default,
      fontSize: fontSizes[1],
      fontWeight: fontWeights.medium,
    },

    '.close-icon': {
      color: colors.white,
      fontSize: fontSizes[1],
    },
  };

  return {
    info: {
      ...common,
      backgroundColor: colors.feedback.info,
    },
    warning: {
      ...common,
      backgroundColor: colors.feedback.warning,
    },
    danger: {
      ...common,
      backgroundColor: colors.feedback.danger,
    },
    success: {
      ...common,
      backgroundColor: colors.feedback.success,
    },
  };
};

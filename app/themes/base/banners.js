export default ({ colors, fonts, fontSizes, fontWeights }) => {
  const common = {
    color: colors.white,
    display: 'flex',
    height: '40px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',

    '.message': {
      fontFamily: fonts.default,
      fontSize: fontSizes[1],
      fontWeight: fontWeights.medium,
    },
  };

  return {
    default: {
      ...common,
      backgroundColor: colors.purpleMedium,
    },
    inverse: {
      ...common,
      color: colors.text.primary,
      backgroundColor: colors.blues[1],
    },
  };
};

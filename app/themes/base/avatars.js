export default ({ colors, fonts, fontSizes, fontWeights }) => {
  const common = {
    color: colors.text.primary,
    display: 'flex',
    height: '32px',
    width: '32px',
    borderRadius: '9999px',
    justifyContent: 'center',
    alignItems: 'center',

    '.initials': {
      fontFamily: fonts.default,
      fontSize: fontSizes[1],
      fontWeight: fontWeights.medium,
    },
  };

  return {
    default: {
      ...common,
      backgroundColor: colors.blues[1],
    },
    inverse: {
      ...common,
      color: colors.white,
      backgroundColor: colors.purpleMedium,
    },
  };
};

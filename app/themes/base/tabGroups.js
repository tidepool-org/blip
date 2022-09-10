export default ({ colors, fonts, fontWeights, fontSizes }) => {
  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[1]}px`,

    '.tabs': {
      fontSize: '18px',
      fontWeight: fontWeights.regular,
      height: '100%',
      color: colors.text.primary,
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

export default ({ colors, fonts, fontWeights, fontSizes }) => {
  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[1]}px`,

    '.tabs': {
      fontWeight: fontWeights.medium,
      height: '100%',
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

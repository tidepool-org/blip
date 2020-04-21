export default ({ colors, fonts }) => {
  const defaultStyles = {
    fontFamily: fonts.default,
    textDecoration: 'none',
    color: colors.text.link,
  };

  return {
    default: defaultStyles,
    inverted: {
      ...defaultStyles,
      color: colors.white,
    },
    underlined: {
      ...defaultStyles,
      textDecoration: 'underline',
    },
  };
};

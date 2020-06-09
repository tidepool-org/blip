export default ({ colors, fonts }) => {
  const defaultStyles = {
    fontFamily: fonts.default,
    textDecoration: 'none',
    color: colors.text.link,
    '&:hover, &:active': {
      color: colors.text.link,
      textDecoration: 'none',
    },
    '&:focus': {
      color: colors.text.link,
      outline: 'none',
      textDecoration: 'underline',
    },
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

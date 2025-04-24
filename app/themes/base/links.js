export default ({ colors, fonts }) => {
  const defaultStyles = {
    fontFamily: fonts.default,
    textDecoration: 'underline',
    color: colors.text.link,
    cursor: 'pointer',
    '&:hover, &:active': {
      color: colors.text.link,
      textDecoration: 'underline',
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
  };
};

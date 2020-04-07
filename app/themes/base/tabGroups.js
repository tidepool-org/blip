export default ({ fonts }) => {
  const defaultStyles = {
    fontFamily: fonts.default,
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

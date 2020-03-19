export default ({ borders, colors, fonts, radii }) => {
  const common = {
    border: borders.input,
    borderRadius: `${radii.input}px`,
    backgroundColor: colors.white,
    boxShadow: 'none',
    fontFamily: fonts.default,
  };

  return {
    select: {
      ...common,
      color: colors.text.primary,
      width: ['100%', '75%', '50%'],
      '&.disabled': {
        color: colors.text.primaryDisabled,
        borderColor: colors.lightestGrey,
        backgroundColor: colors.lightestGrey,
      },
    },
  };
};

export default ({ borders, colors, fonts, radii, fontSizes }) => {
  const common = {
    border: borders.input,
    borderRadius: `${radii.input}px`,
    backgroundColor: colors.white,
    boxShadow: 'none',
    fontFamily: fonts.default,
  };

  const radios = {
    ...common,
    border: 0,
    borderRadius: 0,
    color: colors.text.primary,
    fontSize: fontSizes[0],
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
    radios: {
      horizontal: {
        ...radios,
        flexDirection: 'row',
      },
      vertical: {
        ...radios,
        flexDirection: 'column',
      },
    },
  };
};

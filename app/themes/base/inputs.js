export default ({ borders, colors, fonts, radii, fontSizes, space }) => {
  const common = {
    border: borders.input,
    borderRadius: `${radii.input}px`,
    backgroundColor: colors.white,
    boxShadow: 'none',
    fontFamily: fonts.default,
    fontSize: fontSizes[1],
    lineHeight: 'inherit',
  };

  const textInputs = {
    ...common,
    color: colors.text.primary,
    caretColor: colors.text.primary,
    width: '100%',

    '&::placeholder': {
      color: colors.text.primaryTextSubdued,
    },
    '&.active': {
      color: colors.text.primaryTextSubdued,
      boxShadow: 'none',
    },
    '&:focus': {
      boxShadow: 'none',
    },
    '&:disabled': {
      color: colors.text.primaryDisabled,
      borderColor: colors.lightestGrey,
      backgroundColor: colors.lightestGrey,
    },
    '&.error': {
      color: colors.orange,
      borderColor: colors.orange,
      '&::placeholder': {
        color: colors.orange,
      },
    },
  };

  const radios = {
    ...common,
    border: 0,
    borderRadius: 0,
    color: colors.text.primary,
    fontSize: fontSizes[0],
  };

  const selects = {
    ...common,
    color: colors.text.primary,
    '&.disabled': {
      color: colors.text.primaryDisabled,
      borderColor: colors.lightestGrey,
      backgroundColor: colors.lightestGrey,
    },
    '&.error': {
      color: colors.orange,
      borderColor: colors.orange,
    },
  };

  return {
    text: {
      default: {
        input: {
          ...textInputs,
          padding: `${space[2] * 1.5}px`,
        },
      },
      condensed: {
        input: {
          ...textInputs,
          padding: `${space[2]}px`,
        },
      },
    },
    select: {
      default: {
        ...selects,
        select: {
          padding: `${space[2] * 1.5}px`,
        },
      },
      condensed: {
        ...selects,
        select: {
          padding: `${space[2]}px`,
        },
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

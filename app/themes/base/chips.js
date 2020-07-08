export default ({ colors, fonts, fontSizes, fontWeights }) => {
  const common = {
    alignItems: 'center',
    border: '1px solid',
    borderColor: colors.grays[1],
    borderRadius: '50px',
    color: colors.text.primary,
    display: 'flex',
    height: '32px',
    width: '100px',
    justifyContent: 'center',

    '.text': {
      fontFamily: fonts.default,
      fontSize: fontSizes[1],
      fontWeight: fontWeights.medium,
    },
  };

  return {
    default: {
      ...common,
    },
    hover: {
      ...common,
      borderColor: colors.grays[2],
    },
    active: {
      ...common,
      color: colors.white,
      backgroundColor: colors.purpleMedium,
      borderColor: colors.purpleMedium,
    },
    focus: {
      ...common,
      borderColor: colors.blues[14],
    },
    selected: {
      ...common,
      backgroundColor: colors.blues[15],
      borderColor: colors.blues[14],
      color: colors.white,
    },
    disabled: {
      ...common,
      backgroundColor: colors.grays[0],
      border: 'none',
      color: colors.grays[2],
      pointerEvents: 'none',
    },
  };
};

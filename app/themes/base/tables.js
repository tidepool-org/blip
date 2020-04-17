export default ({ colors, fonts, fontSizes }) => {
  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[0]}px`,

    '.MuiTableCell-root': {
      padding: 3,
    },

    '.MuiTableCell-head': {
      paddingY: 1,
    },

    '.MuiTableCell-stickyHeader': {
      backgroundColor: colors.white,
    },
  };

  return {
    default: {
      ...defaultStyles,
    },
    condensed: {
      ...defaultStyles,

      '.MuiTableCell-root': {
        paddingY: 2,
      },
    },
  };
};

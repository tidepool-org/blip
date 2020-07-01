export default ({ borders, colors, fonts, fontSizes, shadows }) => {
  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[0]}px`,

    '.MuiTableCell-head': {
      paddingY: 1,
      borderTop: borders.default,
      borderBottom: 'none',
    },

    '&.MuiTable-stickyHeader': {
      '.MuiTableCell-stickyHeader': {
        backgroundColor: colors.white,
        borderBottom: borders.default,
      },

      '.MuiTableBody-root .MuiTableRow-root:first-child': {
        '.MuiTableCell-body': {
          borderTop: 'none',
        },
      },
    },

    '.MuiTableBody-root .MuiTableRow-root': {
      '.MuiTableCell-body': {
        padding: 3,
        borderColor: colors.border.default,
        borderBottom: 'none',
        borderTop: borders.default,
      },

      '&:last-child .MuiTableCell-body': {
        borderBottom: borders.default,
      },

      '&.MuiTableRow-hover:hover': {
        backgroundColor: colors.white,
        boxShadow: shadows.medium,

        '.MuiTableCell-body': {
          borderColor: 'transparent',
        },

        '+ .MuiTableRow-root .MuiTableCell-body': {
          borderTopColor: 'transparent',
        },
      },
    },
  };

  return {
    default: {
      ...defaultStyles,
    },
    condensed: {
      ...defaultStyles,

      '.MuiTableBody-root .MuiTableRow-root .MuiTableCell-body': {
        paddingY: 2,
      },
    },
  };
};

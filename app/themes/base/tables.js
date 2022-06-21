export default ({ borders, colors, fonts, fontSizes, shadows }) => {
  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[0]}px`,

    '.MuiTableCell-head': {
      paddingY: 1,
      border: 'none',
      bg: 'lightestGrey',
      borderRadius: 'default',
      whiteSpace: 'nowrap',
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

    '.MuiTableCell-root:first-child': {
      position: 'sticky',
      left: 0,
      zIndex: 1,

      '&.MuiTableCell-body': {
        backgroundColor: colors.white,
      },
    },

    '.MuiTableBody-root .MuiTableRow-root': {
      '.MuiTableCell-body': {
        padding: 3,
        borderColor: colors.border.default,
        borderBottom: 'none',
        borderTop: borders.default,
      },

      '&:first-child .MuiTableCell-body': {
        borderTop: 'none',
      },

      '&.MuiTableRow-hover:hover': {
        backgroundColor: colors.white,
        boxShadow: shadows.medium,
        position: 'relative',
        zIndex: 2,

        '.MuiTableCell-body': {
          borderColor: 'transparent',
        },

        '+ .MuiTableRow-root .MuiTableCell-body': {
          borderTopColor: 'transparent',
        },
      },
    },

    '.MuiTableSortLabel-icon': {
      fontSize: 1,
    },
  };

  return {
    default: {
      ...defaultStyles,
    },
    condensed: {
      ...defaultStyles,

      '.MuiTableBody-root .MuiTableRow-root .MuiTableCell-body': {
        paddingY: '10px',
      },
    },
  };
};

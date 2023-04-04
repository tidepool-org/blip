export default ({ borders, colors, fonts, fontSizes, shadows }) => {
  const groupHeader = {
    boxShadow: `inset 0 -2px 0 ${colors.grays[4]}`,
  };

  const groupSpacer = {
    paddingLeft: [0, null, 2],
    paddingRight: [0, null, 2],
  };

  const groupTag = {
    paddingLeft: 0,
    paddingRight: [0, null, 3],
  };

  const groupLeft = {
    paddingLeft: 0,
    paddingRight: [0, null, 1],
  };

  const groupCenter = {
    paddingLeft: [0, null, 2],
    paddingRight: [0, null, 2],
  };

  const groupRight = {
    paddingLeft: [0, null, 1],
    paddingRight: 0,
  };

  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[0]}px`,

    '.MuiTableCell-head': {
      paddingY: 1,
      border: 'none',
      bg: 'lightestGrey',
      borderRadius: 0,
      whiteSpace: 'nowrap',

      '&:first-child': {
        borderRadius: '4px 0 0 4px',
      },

      '&:last-child': {
        borderRadius: '0 4px 4px 0',
      },

      '&.group-spacer': {
        ...groupSpacer,
      },

      '&.group-tag': {
        ...groupHeader,
        ...groupTag,
      },

      '&.group-left': {
        ...groupHeader,
        ...groupLeft,
      },

      '&.group-center': {
        ...groupHeader,
        ...groupCenter,
      },

      '&.group-right': {
        ...groupHeader,
        ...groupRight,
      },
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

    // Styles for mobile cards
    '.MuiTable-root': {
      display: ['block', null, 'table'],
    },

    '.MuiTableHead-root': {
      // Hide table header for mobile, but leave display on for accessibility
      display: ['block', null, 'table-header-group'],
      position: ['absolute', null, 'static'],
      top: '-9999px',
      left: '-9999px',
    },

    '.MuiTableBody-root': {
      display: ['block', null, 'table-row-group'],
    },

    '.MuiTableRow-root': {
      py: [2, null, 0],
      px: [3, null, 0],
      boxShadow: [shadows.medium, null, 'none'],
      width: ['calc(100% - 6px)', null, 'auto'],
      mt: [1, null, 0],
      mb: [4, null, 0],
      mx: ['auto', null, 0],
      display: ['block', null, 'table-row'],
      position: ['relative', null, 'static'],

      '.MuiTableCell-body': {
        display: ['flex', null, 'table-cell'],
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: '16px',
        flexWrap: 'wrap',
        rowGap: '8px',
        padding: [0, null, 3],
        mb: '6px',
        borderColor: colors.border.default,
        borderBottom: 'none',
        borderTop: ['none', null, borders.default],

        '&.no-margin, &:last-child': {
          margin: 0,
        },

        '&.justify-flex-start': {
          justifyContent: 'flex-start',
        },

        '&.justify-flex-end': {
          justifyContent: 'flex-end',
        },

        '&.action-menu': {
          position: ['absolute', null, 'static'],
          top: 1,
          right: 2,
          zIndex: 10,
        },

        '&.action-buttons': {
          mt: 2,
        },

        '&.group-spacer': {
          ...groupSpacer,
        },

        '&.group-tag': {
          ...groupTag,
        },

        '&.group-left': {
          ...groupLeft,
        },

        '&.group-center': {
          ...groupCenter,
        },

        '&.group-right': {
          ...groupRight,
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
        paddingY: [0, null, '10px'],
      },
    },
  };
};

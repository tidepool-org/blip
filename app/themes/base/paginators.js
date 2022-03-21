export default ({ colors, fonts, fontSizes }) => {
  const listItemStyles = {
    display: 'flex',
    justifyContent: 'center',
    marginLeft: 1,
    marginRight: 1,
  };

  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[1]}px`,

    ul: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',

      ul: {
        alignItems: 'center',
      },

      'ul li > *': listItemStyles,
    },

    '.prev-controls, .next-controls': {
      'span .MuiSvgIcon-root': {
        fontSize: `${fontSizes[2]}px`,
      },
    },

    '.pages li > *': {
      ...listItemStyles,
      minWidth: '24px',
      width: 'auto',

      '&.ellipsis': {
        fontSize: `${fontSizes[2]}px`,
        paddingLeft: 0,
        paddingRight: 0,
        width: 'auto',

        '.MuiSvgIcon-root': {
          position: 'relative',
          top: '2px',
        },
      },
    },
  };

  return {
    default: {
      ...defaultStyles,
      '> ul': {
        justifyContent: 'space-between',
      },
    },
    condensed: {
      ...defaultStyles,
      'ul ul li > *': {
        ...listItemStyles,
        width: '24px',
      },
      '> ul': {
        justifyContent: 'center',
      },
    },
  };
};

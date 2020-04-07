export default ({ borders, colors, fonts, fontWeights, fontSizes }) => {
  const defaultStyles = {
    color: colors.text.primary,
    fontFamily: fonts.default,
    fontSize: `${fontSizes[1]}px`,
  };

  const defaultTabsStyles = {
    fontWeight: fontWeights.medium,
  };

  return {
    horizontal: {
      ...defaultStyles,
      flexDirection: 'column',
      '.tabs': {
        ...defaultTabsStyles,
        borderBottom: borders.divider,
        '.MuiTabs-indicator': {
          bottom: '-2px',
        },
      },
    },
    vertical: {
      ...defaultStyles,
      flexDirection: 'row',
      '.tabs': {
        ...defaultTabsStyles,
        height: '100%',
        borderRight: borders.divider,
        '.MuiTabs-indicator': {
          right: '-2px',
        },
      },
    },
  };
};

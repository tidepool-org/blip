export default ({ colors, fonts, fontSizes, fontWeights }) => {
  const common = {
    color: colors.white,
    display: 'flex',
    flexFlow: 'row',
    height: '40px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 12,
    paddingLeft: 16,

    '.message': {
      fontFamily: fonts.default,
      fontSize: fontSizes[1],
      fontWeight: fontWeights.medium,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  };

  return {
    default: {
      ...common,
      backgroundColor: colors.purpleMedium,
    },
    warning: {
      ...common,
      backgroundColor: '#ffab00',
    },
    danger: {
      ...common,
      backgroundColor: '#de350c',
    },
  };
};

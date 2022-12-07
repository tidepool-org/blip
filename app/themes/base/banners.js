export default ({ colors, fonts, fontSizes, fontWeights }) => {
  const common = {
    color: colors.white,
    display: 'flex',
    // flexFlow: 'row',
    // height: 'auto',
    // width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // paddingRight: 12,
    // paddingLeft: 16,
    // paddingTop: 2
    padding: 2,

    '.message': {
      fontFamily: fonts.default,
      fontSize: fontSizes[1],
      fontWeight: fontWeights.medium,
      // overflow: 'hidden',
      // whiteSpace: 'nowrap',
      // textOverflow: 'ellipsis',
    },

    '.close-icon': {
      color: colors.white,
      fontSize: fontSizes[1],
    },
  };

  return {
    info: {
      ...common,
      backgroundColor: colors.feedback.info,
    },
    warning: {
      ...common,
      backgroundColor: colors.feedback.warning,
    },
    danger: {
      ...common,
      backgroundColor: colors.feedback.danger,
    },
    success: {
      ...common,
      backgroundColor: colors.feedback.success,
    },
  };
};

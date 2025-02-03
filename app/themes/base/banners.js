export default ({ colors, fonts, fontSizes, fontWeights }) => {
  const common = variant => ({
    color: colors.banner[variant].message,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    bg: colors.banner[variant].bg,

    '.icon': {
      color: colors.banner[variant].icon,
      fontSize: fontSizes[4],
    },

    '.title': {
      display: 'block',
      fontFamily: fonts.default,
      fontSize: fontSizes[1],
      fontWeight: fontWeights.bold,
    },

    '.message': {
      display: 'block',
      fontFamily: fonts.default,
      fontSize: fontSizes[1],
      fontWeight: fontWeights.medium,
    },

    '.message-link': {
      color: colors.banner[variant].messageLink,
      '&:hover, &:active, &:focus': {
        color: colors.banner[variant].messageLink,
      },
    },

    'button.action': {
      fontFamily: fonts.default,
      fontSize: fontSizes[0],
      fontWeight: fontWeights.medium,
      bg: colors.banner[variant].action.bg,
      borderColor: colors.banner[variant].action.bg,
      color: colors.banner[variant].action.text,
      ml: 2,
    },

    '.close-icon': {
      color: colors.banner[variant].closeIcon,
      fontSize: fontSizes[3],
    },
  });

  return {
    info: common('info'),
    warning: common('warning'),
    danger: common('danger'),
    success: common('success'),
  };
};

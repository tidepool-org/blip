export default ({ colors, fontSizes, radii, space, shadows }) => {
  const disabled = {
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    borderColor: colors.lightestGrey,
    color: colors.text.primaryDisabled,
  };

  const common = {
    backgroundColor: 'transparent',
    color: colors.text.primary,
    minWidth: '1em',
    ':focus': {
      outline: 'none',
      boxShadow: shadows.focus,
    },
    '@media (-webkit-min-device-pixel-ratio:0)': {
      ':focus': {
        boxShadow: shadows.focus,
      },
    },
  };

  const button = {
    ...common,
    pointerEvents: 'auto',
    fontSize: fontSizes[3],
    padding: `${space[1]}px`,
    border: 'none',
    borderRadius: radii.default,
    '&:hover,&:active,&.active': {
      color: colors.text.link,
      backgroundColor: colors.blues[0],
    },
    '&.disabled,&:disabled': disabled,
  };

  return {
    default: {
      ...common,
      fontSize: fontSizes[3],
      padding: 0,
      '&.disabled': disabled,
    },
    static: {
      ...common,
      backgroundColor: 'transparent',
      color: 'inherit',
      fontSize: 'inherit',
      padding: 0,
      '&.disabled': disabled,
    },
    button,
    navigation: {
      ...button,
      color: colors.purpleMedium,
      fontSize: fontSizes[5],
      padding: 0,
      '&:hover,&:active,&.active': {
        color: colors.purpleMedium,
        backgroundColor: 'transparent',
      },
      '&.disabled,&:disabled': {
        ...disabled,
        color: colors.lightGrey
      },
    }
  };
};

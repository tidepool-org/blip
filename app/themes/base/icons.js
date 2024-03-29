export default ({ colors, fontSizes, radii, space, shadows }) => {
  const disabled = {
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
      pointerEvents: 'none',
      '&.disabled': disabled,
    },
    button: {
      ...common,
      fontSize: fontSizes[3],
      padding: `${space[1]}px`,
      border: 'none',
      borderRadius: radii.default,
      '&:hover,&:active,&.active': {
        color: colors.text.link,
        backgroundColor: colors.blues[0],
      },
      '&.disabled': disabled,
    },
  };
};

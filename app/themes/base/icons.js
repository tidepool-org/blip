export default ({ colors, fontSizes, radii, space }) => {
  const disabled = {
    backgroundColor: 'transparent',
    borderColor: colors.lightestGrey,
    color: colors.text.primaryDisabled,
  };

  const common = {
    backgroundColor: 'transparent',
    color: colors.text.primary,
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
      backgroundColor: 'inherit',
      color: 'inherit',
      fontSize: 'inherit',
      padding: 0,
      '&.disabled': disabled,
    },
    button: {
      ...common,
      fontSize: fontSizes[3],
      padding: `${space[1]}px`,
      border: 'none',
      borderRadius: radii.default,
      '&:hover,&:active': {
        color: colors.text.link,
        backgroundColor: colors.blues[0],
      },
      '&.disabled': disabled,
    },
    banner: {
      ...common,
      color: 'inherit',
      fontSize: 'inherit',
      paddingRight: 12,
      cursor: 'default',
    },
  };
};

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
    static: {
      ...common,
      fontSize: fontSizes[3],
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
      '&:disabled': disabled,
    },
  };
};

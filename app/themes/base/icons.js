export default ({ colors, fontSizes, radii, space }) => ({
  static: {
    fontSize: fontSizes[3],
    padding: 0,
    backgroundColor: 'transparent',
    color: colors.text.primary,
    '&.disabled': {
      backgroundColor: 'transparent',
      borderColor: colors.lightestGrey,
      color: colors.text.primaryDisabled,
    },
  },
  button: {
    fontSize: fontSizes[3],
    padding: `${space[1]}px`,
    backgroundColor: 'transparent',
    color: colors.text.primary,
    border: 'none',
    borderRadius: radii.default,
    '&:hover,&:active': {
      color: colors.text.link,
      backgroundColor: colors.blues[0],
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      borderColor: colors.lightestGrey,
      color: colors.text.primaryDisabled,
    },
  },
});

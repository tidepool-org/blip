export default ({ colors, borders, radii }) => ({
  static: {
    bg: 'transparent',
  },
  button: {
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

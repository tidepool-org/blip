export default ({ colors, borders }) => ({
  primary: {
    backgroundColor: colors.purpleMedium,
    border: borders.input,
    borderColor: colors.purpleMedium,
    color: colors.white,
    '&:hover,&:active,&:focus': {
      backgroundColor: colors.text.primary,
      borderColor: colors.text.primary,
    },
  },
  secondary: {
    bg: colors.white,
    color: colors.text.primary,
    border: borders.input,
    '&:hover,&:active,&:focus': {
      color: colors.white,
      backgroundColor: colors.text.primary,
      borderColor: colors.text.primary,
    },
  },
});

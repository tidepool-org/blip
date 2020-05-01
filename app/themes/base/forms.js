export default ({ colors }) => ({
  switch: {
    backgroundColor: colors.purpleMedium,
    borderColor: colors.purpleMedium,
    '&:disabled': {
      backgroundColor: colors.mediumGrey,
      borderColor: colors.mediumGrey,
    },
    thumb: {
      backgroundColor: colors.white,
      borderColor: 'inherit',
    },
  },
});

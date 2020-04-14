export default ({ colors }) => {
  return {
    default: {
      color: colors.white,
      backgroundColor: colors.purpleMedium,
    },
    blue: {
      color: colors.text.primary,
      backgroundColor: colors.blues[1],
    },
  };
};

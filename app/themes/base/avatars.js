export default ({ colors }) => {
  const common = {
    color: colors.text.primary,
  };

  return {
    default: {
      color: colors.white,
      backgroundColor: colors.blues[1],
    },
    blue: {
      ...common,
      backgroundColor: colors.blues[1],
    },
  };
};

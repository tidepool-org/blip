export default ({ colors }) => {
  const common = {
    color: colors.text.primary,
  };

  return {
    default: {
      color: colors.neutrals.white,
      backgroundColor: colors.blues[1],
    },
    blue: {
      ...common,
      backgroundColor: colors.blues[1],
    },
  };
};

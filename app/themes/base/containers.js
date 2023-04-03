export default ({ borders, colors, radii, space }) => {
  const defaultStyles = {
    mx: [0, 'auto'],
    bg: colors.white,
    width: ['100%', '95%'],
    mb: `${space[6]}px`,
    position: 'relative',
  };

  const fluid = {
    ...defaultStyles,
    mx: [0, 'auto'],
    width: ['100%', 'auto%'],
  };

  const large = {
    ...defaultStyles,
    maxWidth: '1600px',
  };

  const medium = {
    ...defaultStyles,
    maxWidth: '840px',
  };

  const small = {
    ...defaultStyles,
    maxWidth: '600px',
  };

  const extraSmall = {
    ...defaultStyles,
    maxWidth: '320px',
  };

  const bordered = {
    borderLeft: ['none', borders.default],
    borderRight: ['none', borders.default],
    borderTop: borders.default,
    borderBottom: borders.default,
    borderRadius: ['none', radii.default],
  };

  return {
    fluid,
    fluidBordered: {
      ...fluid,
      ...bordered,
    },
    large,
    largeBordered: {
      ...large,
      ...bordered,
    },
    medium,
    mediumBordered: {
      ...medium,
      ...bordered,
    },
    small,
    smallBordered: {
      ...small,
      ...bordered,
    },
    extraSmall,
    extraSmallBordered: {
      ...extraSmall,
      ...bordered,
    },
  };
};

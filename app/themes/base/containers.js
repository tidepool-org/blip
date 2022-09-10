export default ({ borders, colors, radii, space }) => {
  const defaultStyles = {
    mx: 'auto',
    bg: colors.white,
    width: ['100%', '85%'],
    mb: `${space[6]}px`,
    position: 'relative',
  };

  const large = {
    ...defaultStyles,
    maxWidth: '1280px',
  };

  const medium = {
    ...defaultStyles,
    maxWidth: '840px',
  };

  const small = {
    ...defaultStyles,
    maxWidth: '600px',
  };

  const bordered = {
    borderLeft: ['none', borders.default],
    borderRight: ['none', borders.default],
    borderTop: borders.default,
    borderBottom: borders.default,
    borderRadius: ['none', radii.default],
  };

  return {
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
  };
};

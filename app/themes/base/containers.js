export default ({ borders, colors, radii, space, breakpoints }) => {
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

  const rounded = {
    borderRadius: ['none', radii.default],
  };

  const bordered = {
    borderLeft: ['none', borders.default],
    borderRight: ['none', borders.default],
    borderTop: borders.default,
    borderBottom: borders.default,
    ...rounded,
  };

  const well = {
    ...defaultStyles,
    ...fluid,
    ...rounded,
    bg: colors.lightestGrey,
    p: space[3],
    mb: 0,
  };

  const card = {
    ...defaultStyles,
    ...fluid,
    ...rounded,
    borderLeft: borders.card,
    borderRight: borders.card,
    borderTop: borders.card,
    borderBottom: borders.card,
    bg: 'rgba(240, 245, 255, 1)',
    mb: 0,
    cursor: 'pointer',

    '.card-content': {
      p: space[3],
    },

    '&:hover': {
      bg: 'rgba(112, 143, 194, 0.1)',
    },
  };

  const patientData = {
    ...bordered,
    mx: [0, 4, null, null, 'auto'],
    width: ['auto', null, null, 'calc(100% - 48px)'],
    maxWidth: breakpoints[3],
    overflow: 'hidden',
  };

  const patientDataInner = {
    display: 'flex',
    p: 3,
    pb: 4,
    bg: 'white',
    minHeight: [0, 0, '50vh'],
    flexDirection: 'row',
    flexWrap: ['wrap', null, 'nowrap'],
    gap: 4,
  };

  const patientDataContent = {
    width: ['100%', null, 'auto'],
    flexGrow: 1,
  };

  const patientDataSidebar = {
    width: ['100%', null, '240px', '320px'],
    flexShrink: 0,
  };

  return {
    card,
    patientData,
    patientDataInner,
    patientDataContent,
    patientDataSidebar,
    fluid,
    fluidRounded: {
      ...fluid,
      ...rounded,
    },
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
    well,
    wellBordered: {
      ...well,
      ...bordered,
      borderLeft: borders.default,
      borderRight: borders.default,
      borderRadius: radii.default,
    },
  };
};

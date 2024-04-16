export default () => {
  const defaultStyles = {
    margin: 0,

    li: {
      mb: '0.5em',
      '&:last-child': {
        mb: 0,
      },
    },
  };

  return {
    ordered: defaultStyles,
  };
};

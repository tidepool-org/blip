export default ({ colors, fonts, radii, fontWeights }) => {
  const text = {
    cursor: 'inherit',
    whiteSpace: 'nowrap',
  };

  const common = {
    alignItems: 'center',
    borderRadius: radii.default,
    backgroundColor: colors.lightGrey,
    color: colors.text.primary,
    display: 'inline-flex !important',
    fontWeight: fontWeights.medium,
    fontFamily: fonts.default,
    fontSize: '12px',
    height: '24px',
    lineHeight: 'normal',
    px: 2,

    '.tag-text': text,
  };

  return {
    default: {
      ...common,
    },
    compact: {
      ...common,
      fontSize: '10px',
      height: '16px',
    },
  };
};

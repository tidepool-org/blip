export default ({ colors }) => ({
  switch: {
    backgroundColor: colors.grays[2],
    border: 'none',
    height: '24px',
    width: '48px',
    transform: 'translateX(0)',

    '> div': {
      transform: 'translateX(4px) !important',
      width: '18px',
      height: '18px',
      border: 'none',
    },

    '&[aria-checked="true"]': {
      backgroundColor: colors.purpleMedium,

      '> div': {
        transform: 'translateX(27px) !important',
        marginTop: 0,
        marginLeft: 0,
      },
    },
    '&:focus': {
      boxShadow: '0 0 0 2px Highlight',
      outline: 'none',
    },
    '@media (-webkit-min-device-pixel-ratio:0)': {
      '&:focus': {
        boxShadow: '0 0 0 2px -webkit-focus-ring-color',
      },
    },
    '&:disabled': {
      backgroundColor: colors.grays[0],

      '> div': {
        backgroundColor: colors.grays[1],
      },
    },
    thumb: {
      backgroundColor: colors.white,
      border: 'none',
    },
  },
});

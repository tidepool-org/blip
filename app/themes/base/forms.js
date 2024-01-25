export default ({ colors }) => ({
  switch: {
    backgroundColor: colors.grays[2],
    border: 'none',
    height: '24px',
    width: '48px',
    transform: 'translateX(0)',
    margin: 0,

    'input ~ & > div': {
      transform: 'translateX(1px) translateY(1px) !important',
      width: '18px',
      height: '18px',
      border: 'none',
    },

    'input:checked ~ &': {
      backgroundColor: colors.purpleMedium,

      '> div': {
        transform: 'translateX(25px) translateY(1px) !important',
      },
    },

    'input:focus ~ &': {
      boxShadow: `0 0 0 2px ${colors.border.focus}`,
      outline: 'none',
    },

    '@media (-webkit-min-device-pixel-ratio:0)': {
      'input:focus ~ &': {
        boxShadow: `0 0 0 2px ${colors.border.focus}`,
      },
    },

    'input:disabled ~ &': {
      backgroundColor: colors.grays[1],

      '> div': {
        backgroundColor: colors.grays[0],
      },
    },
  },
});

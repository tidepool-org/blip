export default ({ borders, colors, fonts, radii, fontSizes, fontWeights, space }) => {
  const common = {
    border: borders.input,
    borderRadius: `${radii.input}px`,
    backgroundColor: colors.white,
    boxShadow: 'none',
    fontFamily: fonts.default,
    fontSize: fontSizes[1],
    lineHeight: 'inherit',
  };

  const textInputs = {
    ...common,
    color: colors.text.primary,
    caretColor: colors.text.primary,
    width: '100%',

    ':focus-within': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'Highlight',
    },

    '@media (-webkit-min-device-pixel-ratio:0)': {
      ':focus-within': {
        outlineColor: '-webkit-focus-ring-color',
        outlineStyle: 'auto',
      },
    },

    input: {
      '&::placeholder': {
        color: colors.text.primaryTextSubdued,
      },
      '&.active': {
        color: colors.text.primaryTextSubdued,
        boxShadow: 'none',
      },
      '&:focus': {
        boxShadow: 'none',
      },
      '&:disabled': {
        color: colors.text.primaryDisabled,
        borderColor: colors.lightestGrey,
        backgroundColor: colors.lightestGrey,
      },
      '&.error': {
        color: colors.feedback.danger,
        borderColor: colors.feedback.danger,
        '&::placeholder': {
          color: colors.feedback.danger,
        },
      },
      '&.warning': {
        color: colors.feedback.warning,
        borderColor: colors.feedback.warning,
      },
    },
  };

  const radios = {
    ...common,
    border: 0,
    borderRadius: 0,
    color: colors.text.primary,
    fontSize: fontSizes[1],
  };

  const checkboxes = {
    ...common,
    border: 0,
    borderRadius: 0,
    color: colors.text.primary,
    width: 'auto',
    marginBottom: 2,
    alignItems: 'center',
    fontSize: fontSizes[1],
    fontWeight: fontWeights.medium,
  };

  const checkboxGroup = {
    display: 'flex',
  };

  const selects = {
    ...common,
    color: colors.text.primary,
    '&.disabled': {
      color: colors.text.primaryDisabled,
      borderColor: colors.lightestGrey,
      backgroundColor: colors.lightestGrey,
    },
    '&.error': {
      color: colors.feedback.danger,
      borderColor: colors.feedback.danger,
    },
  };

  return {
    text: {
      default: {
        ...textInputs,
        input: {
          ...textInputs.input,
          padding: `${space[2] * 1.5}px`,
          border: 'none',
          '&:focus': {
            outline: 'none',
            border: 'none',
          },
          '&[type="time"]': {
            paddingTop: `calc(${space[2] * 1.5}px - 1px)`,
            paddingBottom: `calc(${space[2] * 1.5}px - 1px)`,
          },
        },
        '.prefix': {
          paddingLeft: `${space[2] * 1.5}px`,
        },
        '.suffix, .icon': {
          paddingRight: `${space[2] * 1.5}px`,
        },
      },
      condensed: {
        ...textInputs,
        input: {
          ...textInputs.input,
          padding: `${space[2]}px`,
          border: 'none',
          '&:focus': {
            outline: 'none',
            border: 'none',
          },
          '&[type="time"]': {
            paddingTop: `calc(${space[2]}px - 1px)`,
            paddingBottom: `calc(${space[2]}px - 1px)`,
          },
        },
        '.prefix': {
          paddingLeft: `${space[2]}px`,
        },
        '.suffix, .icon': {
          paddingRight: `${space[2]}px`,
        },
      },
    },
    select: {
      default: {
        ...selects,
        select: {
          padding: `${space[2] * 1.5}px`,
        },
      },
      condensed: {
        ...selects,
        select: {
          padding: `${space[2]}px`,
        },
      },
    },
    checkboxes: {
      default: {
        ...checkboxes,
      },
    },
    checkboxGroup: {
      horizontal: {
        ...checkboxGroup,
        flexDirection: 'row',
      },
      vertical: {
        ...checkboxGroup,
        flexDirection: 'column',
      },
      verticalBordered: {
        ...checkboxGroup,
        flexDirection: 'column',
        padding: `${space[3]}px`,
        border: borders.input,
        marginBottom: `${space[3]}px`,
        fontSize: fontSizes[1],

        '&:last-child': {
          marginBottom: 0,
        },
      },
    },
    radios: {
      horizontal: {
        ...radios,
        flexDirection: 'row',
      },
      vertical: {
        ...radios,
        flexDirection: 'column',
      },
      verticalBordered: {
        ...radios,
        flexDirection: 'column',
        label: {
          padding: `${space[3]}px`,
          border: borders.input,
          marginBottom: `${space[3]}px`,

          '&:last-child': {
            marginBottom: 0,
          },
        },
      },
    },
  };
};

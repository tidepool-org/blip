export default ({ borders, colors, radii, fontSizes, shadows }) => {
  const defaultStyles = {
    backgroundColor: colors.white,
    borderRadius: radii.default,
    boxShadow: shadows.small,
    border: borders.modal,

    'span.feedback, span.close': {
      fontSize: fontSizes[2],
    },
  };

  return {
    danger: {
      ...defaultStyles,
      borderLeft: `3px solid ${colors.feedback.danger}`,
      'span.feedback svg': {
        fill: colors.feedback.danger,
      },
    },
    info: {
      ...defaultStyles,
      borderLeft: `3px solid ${colors.feedback.info}`,
      'span.feedback svg': {
        fill: colors.feedback.info,
      },
    },
    warning: {
      ...defaultStyles,
      borderLeft: `3px solid ${colors.feedback.warning}`,
      'span.feedback svg': {
        fill: colors.feedback.warning,
      },
    },
    success: {
      ...defaultStyles,
      borderLeft: `3px solid ${colors.feedback.success}`,
      'span.feedback svg': {
        fill: colors.feedback.success,
      },
    },
  };
};

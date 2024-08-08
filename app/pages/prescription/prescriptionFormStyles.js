import { default as baseTheme } from '../../themes/baseTheme';

export const fieldsetStyles = {
  mt: 5,
  mb: 6,
  mx: 'auto',
  p: 0,
  sx: {
    width: ['100%', '75%', '50%', '33%'],
    border: 'none',
  },
  as: 'fieldset',
};

export const wideBorderedFieldsetStyles = {
  ...fieldsetStyles,
  py: 3,
  px: 4,
  sx: {
    ...fieldsetStyles.sx,
    width: '100%',
    maxWidth: '1000px',
    border: baseTheme.borders.default,
    borderRadius: baseTheme.radii.large,
  }
};

export const inputStyles = {
  themeProps: {
    sx: {
      width: '100%',
    },
    mb: 5,
  },
};

export const condensedInputStyles = {
  themeProps: {
    sx: {
      width: '100%',
    },
    mb: 3,
  },
};

export const inlineInputStyles = {
  themeProps: {
    ml: 3,
    sx: {
      width: '100%',
      '&:first-child': {
        ml: 0,
      },
    },
  },
};

export const checkboxStyles = {
  themeProps: {
    sx: {
      width: '100%',
    },
    fontSize: 1,
  },
};

export const checkboxGroupStyles = {
  variant: 'inputs.checkboxGroup.verticalBordered',
  theme: baseTheme,
  mb: 3,
};

export const scheduleGroupStyles = {
  p: 3,
  mb: 5,
  bg: 'lightestGrey',
};

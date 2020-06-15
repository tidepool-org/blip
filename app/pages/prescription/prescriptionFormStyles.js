import { default as baseTheme } from '../../themes/baseTheme';

export const fieldsetStyles = {
  width: [1, 0.75, 0.5, 0.33],
  mt: 5,
  mb: 6,
  mx: 'auto',
  p: 0,
  sx: {
    border: 'none',
  },
  as: 'fieldset',
};

export const wideFieldsetStyles = {
  width: [1, 0.75, 0.67],
  maxWidth: '840px',
};

export const borderedFieldsetStyles = {
  py: 3,
  px: 4,
  sx: {
    border: baseTheme.borders.default,
    borderRadius: baseTheme.radii.large,
  },
};

export const inputStyles = {
  width: '100%',
  themeProps: {
    mb: 3,
  },
};

export const inlineInputStyles = {
  width: '100%',
  themeProps: {
    ml: 3,
    sx: {
      '&:first-child': {
        ml: 0,
      },
    },
  },
};

export const checkboxStyles = {
  width: '100%',
  themeProps: {
    fontSize: 1,
  },
};

export const checkboxGroupStyles = {
  variant: 'inputs.checkboxGroup.verticalBordered',
  theme: baseTheme,
  mb: 3,
};

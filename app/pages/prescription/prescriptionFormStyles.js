import { default as baseTheme } from '../../themes/baseTheme';

export const formWrapperStyles = {
  width: [1, 0.75, 0.5, 0.33],
  mt: 5,
  mb: 6,
  mx: 'auto',
};

export const inputStyles = {
  width: '100%',
  themeProps: {
    mb: 3,
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

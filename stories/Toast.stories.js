import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Button from '../app/components/elements/Button';
import Toast from '../app/components/elements/Toast';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Toasts',
  decorators: [withDesign, withKnobs, withTheme],
};

export const Toasts = () => {
  const variants = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
  };

  const autoDismissOptions = {
    Never: '',
    '2s': '2000',
    '4s': '4000',
  };

  const message = () => text('Message', 'You have done something worth calling out.');
  const variant = () => options('Variant', variants, 'info', { display: 'inline-radio' });
  const autoDismiss = () => options('Auto dismiss time', autoDismissOptions, '4000', { display: 'inline-radio' });
  const [open, setOpen] = React.useState(false);

  const onClose = () => setOpen(false);

  return (
    <React.Fragment>
      <Button
        onClick={() => setOpen(true)}
      >
        Open Toast
      </Button>
      <Toast
        message={message()}
        onClose={onClose}
        open={open}
        variant={variant()}
        autoHideDuration={parseInt(autoDismiss(), 10) || null}
      />
    </React.Fragment>
  );
};

Toasts.story = {
  name: 'Toasts',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/ey1CgC9MYEsx1DQhpZiyMg/Prescription-Flow-v1?node-id=254%3A2',
    },
  },
};

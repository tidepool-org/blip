import React from 'react';
import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import { withKnobs, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Box } from 'rebass/styled-components';
import reduce from 'lodash/reduce';

import baseTheme from '../app/themes/baseTheme';
import Stepper from '../app/components/elements/Stepper';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Stepper',
  decorators: [withDesign, withKnobs, withTheme],
};

const orientations = {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
};

const backgrounds = {
  None: 'transparent',
  'Light Grey': 'lightGrey',
};

const steps = [
  {
    label: 'Create Patient Account',
    onComplete: action('Patient Account Created'),
  },
  {
    label: 'Complete Patient Profile',
    onComplete: action('Patient Profile Completed'),
    optional: true,
  },
  {
    label: 'Enter Therapy Settings',
    onComplete: action('Therapy Settings Completed'),
    completeText: 'Review Prescription',
  },
  {
    label: 'Review and Send Prescription',
    onComplete: action('Prescription Sent'),
    completeText: 'Send Prescription',
  },
];

const stepOptions = reduce(steps, (result, value, index) => {
  result[index + 1] = index.toString(); // eslint-disable-line no-param-reassign
  return result;
}, {});

const orientation = () => options('Stepper Orientation', orientations, 'horizontal', { display: 'inline-radio' });
const background = () => options('Stepper Background', backgrounds, 'transparent', { display: 'inline-radio' });
const initialActiveStep = () => options('Initial Active Step', stepOptions, '0', { display: 'inline-radio' });

export const StepperStory = () => {
  const props = {
    steps,
    variant: orientation(),
    'aria-label': 'My Stepper',
    id: 'my-stepper',
    activeStep: parseInt(initialActiveStep(), 10),
    themeProps: {
      wrapper: {
        margin: 2,
        padding: 2,
        sx: {
          border: '1px solid #eee',
        },
      },
      panel: {
        padding: 3,
        minHeight: '20em',
      },
      steps: {
        backgroundColor: background(),
      },
    },
  };

  return (
    <Stepper {...props}>
      <Box>
        Account Creation Form
      </Box>
      <Box>
        Patient Profile Form
      </Box>
      <Box>
        Therapy Settings Form
      </Box>
      <Box>
        Final Prescription Details
      </Box>
    </Stepper>
  );
};

StepperStory.story = {
  name: 'Stepper Group',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=48%3A244',
    },
  },
};

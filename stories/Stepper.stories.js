import React from 'react';
import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import { withKnobs, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Box } from 'rebass/styled-components';
import { forceReRender } from '@storybook/react';

import baseTheme from '../app/themes/baseTheme';
import Stepper from '../app/components/elements/Stepper';
import Checkbox from '../app/components/elements/Checkbox';

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

window.top.onhashchange = () => forceReRender();

export const StepperStory = () => {
  const orientations = {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
  };

  const backgrounds = {
    None: 'transparent',
    'Light Grey': 'lightGrey',
  };

  const orientation = () => options('Stepper Orientation', orientations, 'horizontal', { display: 'inline-radio' });
  const background = () => options('Stepper Background', backgrounds, 'transparent', { display: 'inline-radio' });

  const [profileValid, setProfileValid] = React.useState(false);
  const [prescriptionReviewed, setPrescriptionReviewed] = React.useState(false);
  const handleCheckProfile = (e) => setProfileValid(e.target.checked);
  const handleCheckReview = (e) => setPrescriptionReviewed(e.target.checked);

  const steps = [
    {
      label: 'Create Patient Account',
      onComplete: action('Patient Account Created'),
      subSteps: [
        {
          label: 'Step One',
          onComplete: action('Account Step One Complete'),
        },
        {
          label: 'Step Two',
          onComplete: action('Account Step Two Complete'),
        },
        {
          label: 'Step Three',
          onComplete: action('Account Step Three Complete'),
        },
      ],
    },
    {
      label: 'Complete Patient Profile',
      onComplete: action('Patient Profile Completed'),
      optional: true,
      subSteps: [
        {
          label: 'Step One',
          onComplete: action('Profile Step One Complete'),
        },
        {
          label: 'Step Two',
          onComplete: action('Profile Step Two Complete'),
          backText: 'Back to Profile Step One',
        },
        {
          label: 'Step Three',
          onComplete: action('Profile Step Three Complete'),
          disableComplete: !profileValid,
          completeText: profileValid ? 'Good to Go!' : 'Not yet...',
          backText: 'Back to Profile Step Two',
        },
      ],
    },
    {
      label: 'Enter Therapy Settings',
      onComplete: action('Therapy Settings Completed'),
      completeText: 'Review Prescription',
    },
    {
      label: 'Review and Send Prescription',
      onComplete: action('Prescription Sent'),
      disableComplete: !prescriptionReviewed,
      completeText: 'Send Prescription',
    },
  ];

  const props = {
    steps,
    variant: orientation(),
    'aria-label': 'My Stepper',
    id: 'my-stepper',
    history: window.top.history,
    location: window.top.location,
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
        <Box>
          Patient Account Step One
        </Box>
        <Box>
          Patient Account Step Two
        </Box>
        <Box>
          Patient Account Step Three
        </Box>
      </Box>
      <Box>
        <Box>
          Patient Profile Step One
        </Box>
        <Box>
          Patient Profile Step Two
        </Box>
        <Box>
          <Checkbox
            checked={profileValid}
            name="my-checkbox"
            label={'The profile details are correct'}
            onChange={handleCheckProfile}
            required
          />
        </Box>
      </Box>
      <Box>
        <Box>Therapy Settings Form</Box>
      </Box>
      <Box>
        <Checkbox
          checked={prescriptionReviewed}
          name="my-checkbox"
          label={'The prescription details are correct'}
          onChange={handleCheckReview}
          required
        />
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

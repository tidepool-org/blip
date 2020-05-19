import React from 'react';
import { withDesign } from 'storybook-addon-designs';
import { action, decorate } from '@storybook/addon-actions';
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

const sleep = m => new Promise(r => setTimeout(r, m));

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

  const initialAsyncState = () => ({ pending: false, complete: false });
  const [profileAsyncState, setProfileAsyncState] = React.useState(initialAsyncState());
  const [finalAsyncState, setFinalAsyncState] = React.useState(initialAsyncState());

  const renderStepContent = text => <Box>{text}</Box>;

  const renderStepConfirmation = (name, label, checked, onChange) => (
    <Checkbox
      checked={checked}
      name={name}
      label={label}
      onChange={onChange}
      required
    />
  );

  const steps = [
    {
      label: 'Create Patient Account',
      onComplete: action('Patient Account Created'),
      subSteps: [
        {
          label: 'Step One',
          onComplete: action('Account Step One Complete'),
          panelContent: renderStepContent('Patient Account Step One'),
        },
        {
          label: 'Step Two',
          onComplete: action('Account Step Two Complete'),
          panelContent: renderStepContent('Patient Account Step Two'),
        },
        {
          label: 'Step Three',
          onComplete: action('Account Step Three Complete'),
          panelContent: renderStepContent('Patient Account Step Three'),
        },
      ],
    },
    {
      label: 'Complete Patient Profile',
      onComplete: action('Patient Profile Uploaded'),
      optional: true,
      subSteps: [
        {
          label: 'Step One',
          onComplete: action('Profile Step One Complete'),
          panelContent: renderStepContent('Patient Profile Step One'),
        },
        {
          label: 'Step Two',
          onComplete: action('Profile Step Two Complete'),
          backText: 'Back to Profile Step One',
          panelContent: renderStepContent('Patient Profile Step Two'),
        },
        {
          label: 'Step Three',
          onComplete: async () => {
            setProfileAsyncState({ pending: true, complete: false });
            await sleep(2000);
            setProfileAsyncState({ pending: false, complete: true });
          },
          disableComplete: !profileValid,
          completeText: profileValid ? 'Good to Go!' : 'Not yet...',
          asyncState: profileAsyncState,
          backText: 'Back to Profile Step Two',
          panelContent: renderStepConfirmation(
            'profile-checkbox',
            'The profile details are correct',
            profileValid,
            handleCheckProfile,
          ),
        },
      ],
    },
    {
      label: 'Enter Therapy Settings',
      onComplete: action('Therapy Settings Completed'),
      completeText: 'Review Prescription',
      panelContent: renderStepContent('Therapy Settings Form'),
    },
    {
      label: 'Review and Send Prescription',
      onComplete: async () => {
        setFinalAsyncState({ pending: true, complete: false });
        await sleep(2000);
        setFinalAsyncState({ pending: false, complete: true });
      },
      disableComplete: !prescriptionReviewed || finalAsyncState.complete,
      asyncState: finalAsyncState,
      completed: finalAsyncState.complete,
      completeText: 'Send Prescription',
      panelContent: renderStepConfirmation(
        'review-checkbox',
        'The prescription details are correct',
        prescriptionReviewed,
        handleCheckReview,
      ),
    },
  ];

  const props = {
    steps,
    variant: orientation(),
    'aria-label': 'My Stepper',
    id: 'my-stepper',
    history: window.top.history,
    location: window.top.location,
    onStepChange: decorate([args => {
      setPrescriptionReviewed(false);
      setFinalAsyncState(initialAsyncState());
      return args.slice(0, 1)[0];
    }]).action('On Step'),
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

  return <Stepper {...props} />;
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

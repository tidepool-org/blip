import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, text, number, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';

import TextInput from '../app/components/elements/TextInput';
import SearchIcon from '@material-ui/icons/Search';


const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Text Input',
  component: TextInput,
  decorators: [withDesign, withKnobs, withTheme],
};

const label = () => text('Label', 'Name');
const width = () => number('Width');
const disabled = () => boolean('Disabled', false);
const placeholder = () => text('Placeholder', 'Your name');

const variants = {
  Default: 'default',
  Condensed: 'condensed',
};

const variant = () => options('Variant', variants, 'default', { display: 'inline-radio' });

export const BasicInput = () => (
  <TextInput
    variant={variant()}
    placeholder={placeholder()}
    disabled={disabled()}
    label={label()}
    {...(width() ? { width: width() } : [])}
    name="name" />
);

BasicInput.story = {
  name: 'Basic Input',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};

export const IconInput = () => (
  <TextInput
    variant={variant()}
    placeholder={placeholder()}
    disabled={disabled()}
    label={label()}
    {...(width() ? { width: width() } : [])}
    icon={SearchIcon}
    name="name" />
);

IconInput.story = {
  name: 'Input w/ Icon',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};

export const NumberInput = () => {
  const stepOptions = ['1', '5', '10'];

  const step = () => options('stepOptions', stepOptions, '5', { display: 'inline-radio' });

  const minRangeOptions = {
    range: true,
    min: -10,
    max: 50,
    step: 1,
  };

  const min = () => number('Min', -10, minRangeOptions);

  const maxRangeOptions = {
    range: true,
    min: min(),
    max: 50,
    step: 1,
  };

  const max = () => number('Max', 50, maxRangeOptions);

  return (
    <TextInput
      variant={variant()}
      placeholder="Please select a number"
      disabled={disabled()}
      label={'Number Input'}
      {...(width() ? { width: width() } : [])}
      type="number"
      step={step()}
      min={min()}
      max={max()}
      name="name"
    />
  );
};

NumberInput.story = {
  name: 'Number Input',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};

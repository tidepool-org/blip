import React, { useState } from 'react';
import { boolean as bool, text, number, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';

import baseTheme from '../app/themes/baseTheme';

import TextInput from '../app/components/elements/TextInput';
import SearchIcon from '@material-ui/icons/Search';

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Text Input',
  component: TextInput,
  decorators: [withTheme],
};

const label = () => text('Label', 'Name');
const width = () => number('Width');
const disabled = () => bool('Disabled', false);
const placeholder = () => text('Placeholder', 'Your name');
const error = () => bool('Errored State', false);
const warning = () => bool('Warning State', false);
const required = () => bool('Required', false);
const icon = () => bool('Icon', false);
const suffix = () => text('Suffix', '');
const prefix = () => text('Prefix', '');

const variants = {
  Default: 'default',
  Condensed: 'condensed',
};

const variant = () => options('Variant', variants, 'default', { display: 'inline-radio' });

export const BasicInput = {
  render: () => (
    <TextInput
      variant={variant()}
      placeholder={placeholder()}
      disabled={disabled()}
      label={label()}
      required={required()}
      error={error() ? 'Please enter your name' : null}
      warning={warning() ? 'You can do better' : null}
      {...(width() ? { width: width() } : [])}
      {...(icon() ? { icon: SearchIcon } : [])}
      prefix={prefix()}
      suffix={suffix()}
      name="name"
    />
  ),

  name: 'Basic Input',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};

export const NumberInput = {
  render: () => {
    const stepOptions = { 1: '1', 5: '5', 10: '10' };
    const step = () => options('Step Increment', stepOptions, '5', { display: 'inline-radio' });

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

    const [value, setValue] = useState(10);

    return (
      <TextInput
        min={min()}
        max={max()}
        step={step()}
        variant={variant()}
        value={value}
        disabled={disabled()}
        label={'Number Input'}
        width={100}
        type="number"
        name="name"
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },

  name: 'Number Input',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};

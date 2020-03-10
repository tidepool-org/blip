import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, text, number } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';

import TextInput from '../app/components/elements/TextInput';

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

const label = () => text('Label', '');
const width = () => number('Width');
const disabled = () => boolean('Disabled', false);
const placeholder = () => text('Placeholder', 'Your name');

export const BasicInput = () => (
  <TextInput
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

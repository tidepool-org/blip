import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Checkbox from '../app/components/elements/Checkbox';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Checkbox',
  decorators: [withDesign, withKnobs, withTheme],
};

export const CheckboxStory = () => {
  const defaultChecked = () => boolean('Default Checked', false);
  const disabled = () => boolean('Disable', false);
  const [isChecked, setChecked] = useState(defaultChecked());
  const handleCheckbox = (e) => setChecked(e.target.checked);
  const labelText = () => text('Label Text', 'Check Me');

  return (
    <Checkbox
      checked={isChecked}
      disabled={disabled()}
      name="my-checkbox"
      label={labelText()}
      onChange={handleCheckbox}
    />
  );
};

CheckboxStory.story = {
  name: 'Single Checkbox',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};

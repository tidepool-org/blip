import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Switch } from '@rebass/forms/styled-components';

import baseTheme from '../app/themes/baseTheme';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Toggle',
  decorators: [withDesign, withKnobs, withTheme],
};

export const ToggleStory = () => {
  const defaultChecked = () => boolean('Default Checked', true);
  const disabled = () => boolean('Disable', false);
  const [isChecked, setChecked] = useState(defaultChecked());
  const handleToggle = () => setChecked(!isChecked);

  return (
    <div>
      <Switch
        checked={isChecked}
        disabled={disabled()}
        onClick={handleToggle} />
    </div>
  );
};

ToggleStory.story = {
  name: 'Toggle',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=0%3A1',
    },
  },
};

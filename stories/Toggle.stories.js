import React, { useState } from 'react';
import { boolean as bool } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';
import { Switch } from 'theme-ui';

import baseTheme from '../app/themes/baseTheme';

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Toggle',
  decorators: [withTheme],
};

export const ToggleStory = {
  render: () => {
    const defaultChecked = () => bool('Default Checked', true);
    const disabled = () => bool('Disable', false);
    const [isChecked, setChecked] = useState(defaultChecked());
    const handleToggle = () => setChecked(!isChecked);

    return (
      <div>
        <Switch checked={isChecked} disabled={disabled()} onClick={handleToggle} />
      </div>
    );
  },

  name: 'Toggle',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=2178%3A0',
    },
  },
};

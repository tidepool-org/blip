/* eslint-disable max-len */
/* eslint-disable no-unused-vars */

import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Label } from '@rebass/forms';

import baseTheme from '../app/themes/baseTheme';
import CheckboxCustom from '../app/components/elements/CheckboxCustom';
import CheckboxRebass from '../app/components/elements/Checkbox';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Checkboxes Options',
  decorators: [withDesign, withKnobs, withTheme],
};

export const CheckboxCustomStory = () => {
  const labelText = () => text('Label Text', 'Check Me');
  const defaultChecked = () => boolean('Default Checked', false);
  const [isChecked, setChecked] = useState(defaultChecked());
  const handleCheckbox = (e) => setChecked(e.target.checked);

  return (
    <div>
      <Label>
        <CheckboxCustom
          checked={isChecked}
          name="checkbox"
          onClick={handleCheckbox}
          inputLabel={labelText()}
          />
      </Label>
    </div>
  );
};

CheckboxCustomStory.story = {
  name: 'Custom Checkbox',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
    },
  },
};

export const CheckboxRebassStory = () => {
  const labelText = () => text('Label Text', 'Check Me');
  const defaultChecked = () => boolean('Default Checked', false);
  const [isChecked, setChecked] = useState(defaultChecked());
  const handleCheckbox = (e) => setChecked(e.target.checked);
  const disabled = () => boolean('Disabled', false);

  return (
    <CheckboxRebass
      checked={isChecked}
      disabled={disabled()}
      name="checkbox"
      onChange={handleCheckbox}
      label={labelText()}
  />
  );
};

CheckboxRebassStory.story = {
  name: 'Rebass Checkbox',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};

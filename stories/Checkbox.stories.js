/* eslint-disable max-len */
/* eslint-disable no-unused-vars */

import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Box } from 'rebass/styled-components';

import baseTheme from '../app/themes/baseTheme';
import Checkbox from '../app/components/elements/Checkbox';
import { CheckboxGroupTitle } from '../app/components/elements/FontStyles';

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
  const labelText1 = () => text('Label Text 1', 'Check Me');
  const defaultChecked1 = () => boolean('Default Checked 1', false);

  const disabled = () => boolean('Disabled', false);

  const [isChecked1, setChecked1] = useState(defaultChecked1());
  const handleCheckbox1 = (e) => setChecked1(e.target.checked);

  return (
    <Checkbox
      checked={isChecked1}
      disabled={disabled()}
      name="my-checkbox-1"
      label={labelText1()}
      onChange={handleCheckbox1}
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

export const MultipleCheckboxStory = () => {
  const groupTitleMultiple = () => text('Group Title', 'What do you use to manage your diabetes?');
  const labelText1 = () => text('Group Label Text 1', 'BG Meter');
  const labelText2 = () => text('Group Label Text 2', 'CGM');
  const labelText3 = () => text('Group Label Text 3', 'Insulin Pump');

  const disabled = () => boolean('Disabled', false);

  const [isChecked1, setChecked1] = useState(false);
  const toggleCheckbox1 = () => setChecked1(!isChecked1);

  const [isChecked2, setChecked2] = useState(false);
  const toggleCheckbox2 = () => setChecked2(!isChecked2);

  const [isChecked3, setChecked3] = useState(false);
  const toggleCheckbox3 = () => setChecked3(!isChecked3);

  return (
    <div>
      <CheckboxGroupTitle>{groupTitleMultiple()}</CheckboxGroupTitle>
      <Box>
        <Checkbox
          checked={isChecked1}
          disabled={disabled()}
          name="my-checkbox-1"
          label={labelText1()}
          onChange={toggleCheckbox1}
        />
      </Box>
      <Box>
        <Checkbox
          checked={isChecked2}
          disabled={disabled()}
          name="my-checkbox-2"
          label={labelText2()}
          onChange={toggleCheckbox2}
        />
      </Box>
      <Box>
        <Checkbox
          checked={isChecked3}
          disabled={disabled()}
          name="my-checkbox-3"
          label={labelText3()}
          onChange={toggleCheckbox3}
        />
      </Box>
    </div>
  );
};

MultipleCheckboxStory.story = {
  name: 'Multiple Checkboxes',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
    },
  },
};

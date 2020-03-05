import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Checkbox from '../app/components/elements/Checkbox';
import { CheckboxGroupTitle } from '../app/components/elements/FontStyles';

import RebassCheckbox from '../app/components/elements/RebassCheckbox';

/* eslint-disable jsx-a11y/label-has-associated-control */

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Checkboxes',
  decorators: [withDesign, withTheme],
};

export const CheckboxStory = () => {
  const [isChecked, setChecked] = useState(false);
  const toggleCheckbox = () => setChecked(!isChecked);

  return (
    <div>
      <CheckboxGroupTitle>Do you want emails?</CheckboxGroupTitle>
      <label>
        <Checkbox
          checked={isChecked}
          onClick={toggleCheckbox}
          inputLabel="Send me Emails"
          />
      </label>
    </div>
  );
};

CheckboxStory.story = {
  name: 'Single Checkbox',
  parameters: {
    design: {
      type: 'iframe',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
    },
  },
};

export const MultipleCheckboxStory = () => {
  const [isChecked1, setChecked1] = useState(false);
  const toggleCheckbox1 = () => setChecked1(!isChecked1);

  const [isChecked2, setChecked2] = useState(false);
  const toggleCheckbox2 = () => setChecked2(!isChecked2);

  const [isChecked3, setChecked3] = useState(false);
  const toggleCheckbox3 = () => setChecked3(!isChecked3);

  return (
    <div>
      <CheckboxGroupTitle>How to you manage your diabetes?</CheckboxGroupTitle>
      <label>
        <Checkbox
          checked={isChecked1}
          onClick={toggleCheckbox1}
          inputLabel="BG Meter"
          />
      </label>
      <label>
        <Checkbox
          checked={isChecked2}
          onClick={toggleCheckbox2}
          inputLabel="CGM"
          />
      </label>
      <label>
        <Checkbox
          checked={isChecked3}
          onClick={toggleCheckbox3}
          inputLabel="Insulin Pump"
          />
      </label>
    </div>
  );
};

MultipleCheckboxStory.story = {
  name: 'Multiple Checkboxes',
  parameters: {
    design: {
      type: 'iframe',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
    },
  },
};

export const RebassCheckboxStory = () => {
  const [isChecked, setChecked] = useState(false);
  const toggleCheckbox = () => setChecked(!isChecked);

  return (
    <div>
      <CheckboxGroupTitle>Do you want emails?</CheckboxGroupTitle>
      <label>
        <RebassCheckbox
          checked={isChecked}
          onClick={toggleCheckbox}
          inputLabel="Send me Rebass Emails"
          />
      </label>
    </div>
  );
};

RebassCheckboxStory.story = {
  name: 'Rebass Checkbox',
  parameters: {
    design: {
      type: 'iframe',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
    },
  },
};

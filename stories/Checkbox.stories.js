import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Checkbox from '../app/components/elements/Checkbox';
import { CheckboxGroupTitle } from '../app/components/elements/FontStyles';

/* eslint-disable jsx-a11y/label-has-associated-control */

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Checkboxes',
  decorators: [withDesign, withKnobs, withTheme],
};

export const CheckboxStory = () => {
  const labelText = () => text('Single Label Text', 'Option 1');
  const groupTitleSingle = () => text('Group Title', 'Title');

  const [isChecked, setChecked] = useState(false);
  const toggleCheckbox = () => setChecked(!isChecked);

  return (
    <div>
      <CheckboxGroupTitle>{groupTitleSingle()}</CheckboxGroupTitle>
      <label>
        <Checkbox
          checked={isChecked}
          onClick={toggleCheckbox}
          inputLabel={labelText()}
          />
      </label>
    </div>
  );
};

CheckboxStory.story = {
  name: 'Single Checkbox',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
    },
  },
};

export const MultipleCheckboxStory = () => {
  const groupTitleMultiple = () => text('Group Title', 'What do you use to manage your diabetes?');
  const labelText1 = () => text('Group Label Text 1', 'BG Meter');
  const labelText2 = () => text('Group Label Text 2', 'CGM');
  const labelText3 = () => text('Group Label Text 3', 'Insulin Pump');

  const [isChecked1, setChecked1] = useState(false);
  const toggleCheckbox1 = () => setChecked1(!isChecked1);

  const [isChecked2, setChecked2] = useState(false);
  const toggleCheckbox2 = () => setChecked2(!isChecked2);

  const [isChecked3, setChecked3] = useState(false);
  const toggleCheckbox3 = () => setChecked3(!isChecked3);

  return (
    <div>
      <CheckboxGroupTitle>{groupTitleMultiple()}</CheckboxGroupTitle>
      <label>
        <Checkbox
          checked={isChecked1}
          onClick={toggleCheckbox1}
          inputLabel={labelText1()}
          />
      </label>
      <label>
        <Checkbox
          checked={isChecked2}
          onClick={toggleCheckbox2}
          inputLabel={labelText2()}
          />
      </label>
      <label>
        <Checkbox
          checked={isChecked3}
          onClick={toggleCheckbox3}
          inputLabel={labelText3()}
          />
      </label>
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

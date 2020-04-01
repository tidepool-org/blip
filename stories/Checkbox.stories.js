import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Checkbox from '../app/components/elements/Checkbox';
import CheckboxGroup from '../app/components/elements/CheckboxGroup';

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

export const CheckboxGroupStory = () => {
  const checkboxOptions = [
    { value: '', label: 'None' },
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three' },
  ];

  const label = () => text('Label', 'Group Label');
  const disabled = () => boolean('Disabled', false);

  const [selected, setSelected] = useState(false);

  const handleChange = event => {
    setSelected(event.target.value);
  };

  return (
    <CheckboxGroup
      disabled={disabled()}
      id="my-checkbox-group"
      label={label()}
      name="mySelect"
      options={checkboxOptions}
      value={selected}
      onChange={handleChange}
    />
  );
};

CheckboxGroupStory.story = {
  name: 'Checkbox Group',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
    },
  },
};

// export const MultipleCheckboxStory = () => {
//   const groupTitle = () => text('Group Title', 'What do you use to manage your diabetes?');
//   const labelText1 = () => text('Label Text 1', 'BG Meter that is kind of long');
//   const labelText2 = () => text('Label Text 2', 'CGM');
//   const labelText3 = () => text('Label Text 3', 'Insulin Pump');

//   const disabled = () => boolean('Disable All', false);
//   const defaultChecked = () => boolean('Default Checked First Option', false);

//   const [isChecked1, setChecked1] = useState(defaultChecked());
//   const handleCheckbox1 = () => setChecked1(!isChecked1);

//   const [isChecked2, setChecked2] = useState(false);
//   const handleCheckbox2 = () => setChecked2(!isChecked2);

//   const [isChecked3, setChecked3] = useState(false);
//   const handleCheckbox3 = () => setChecked3(!isChecked3);

//   return (
//     <div>
//       <Caption>{groupTitle()}</Caption>
//       <Checkbox
//         checked={isChecked1}
//         disabled={disabled()}
//         name="checkbox1"
//         label={labelText1()}
//         onChange={handleCheckbox1}
//       />

//       <Checkbox
//         checked={isChecked2}
//         disabled={disabled()}
//         name="checkbox2"
//         label={labelText2()}
//         onChange={handleCheckbox2}
//       />

//       <Checkbox
//         checked={isChecked3}
//         disabled={disabled()}
//         name="checkbox3"
//         label={labelText3()}
//         onChange={handleCheckbox3}
//       />

//     </div>
//   );
// };

// MultipleCheckboxStory.story = {
//   name: 'Multiple Checkboxes',
//   parameters: {
//     design: {
//       type: 'figma',
//       url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
//     },
//   },
// };

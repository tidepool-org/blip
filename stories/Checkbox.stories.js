/* eslint-disable max-len */
/* eslint-disable no-unused-vars */

import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Checkbox from '../app/components/elements/Checkbox';
import Checkbox2 from '../app/components/elements/Checkbox2';
import CheckboxMaterial from '../app/components/elements/CheckboxMaterialUI';
import { CheckboxGroupTitle } from '../app/components/elements/FontStyles';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Checkboxes',
  decorators: [withDesign, withKnobs, withTheme],
};

// export const CheckboxStory = () => {
//   const labelText = () => text('Single Label Text', 'Option 1');
//   const groupTitleSingle = () => text('Group Title', 'Title');

//   const [isChecked, setChecked] = useState(false);
//   const toggleCheckbox = () => setChecked(!isChecked);

//   return (
//     <div>
//       <CheckboxGroupTitle>{groupTitleSingle()}</CheckboxGroupTitle>
//       <label>
//         <Checkbox
//           checked={isChecked}
//           onClick={toggleCheckbox}
//           inputLabel={labelText()}
//           />
//       </label>
//     </div>
//   );
// };

// CheckboxStory.story = {
//   name: 'Single Checkbox',
//   parameters: {
//     design: {
//       type: 'figma',
//       url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
//     },
//   },
// };

export const Checkbox2Story = () => {
  const labelText1 = () => text('Label Text 1', 'Check Me');
  const defaultChecked1 = () => boolean('Default Checked 1', false);

  const labelText2 = () => text('Label Text 2', 'Or Me');
  const defaultChecked2 = () => boolean('Default Checked 2', true);

  const disabled = () => boolean('Disabled', false);

  const [isChecked1, setChecked1] = useState(defaultChecked1());
  const handleCheckbox1 = (e) => setChecked1(e.target.checked);

  const [isChecked2, setChecked2] = useState(defaultChecked2());
  const handleCheckbox2 = (e) => setChecked2(e.target.checked);

  return (
    <React.Fragment>
      <FormControl component="fieldset">
        <FormLabel component="legend">Label Placement</FormLabel>
        <FormGroup aria-label="position" row>
          <Checkbox2
            checked={isChecked1}
            disabled={disabled()}
            name="my-checkbox-1"
            label={labelText1()}
            onChange={handleCheckbox1}
          />
          <Checkbox2
            checked={isChecked2}
            disabled={disabled()}
            name="my-checkbox-2"
            label={labelText2()}
            onChange={handleCheckbox2}
          />

        </FormGroup>
      </FormControl>
    </React.Fragment>
  );
};

Checkbox2Story.story = {
  name: 'Single Checkbox2',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
    },
  },
};

export const CheckboxMaterialStory = () => {
  const labelText1 = () => text('Label Text 1', 'Check Me');
  const defaultChecked1 = () => boolean('Default Checked 1', false);

  const labelText2 = () => text('Label Text 2', 'Or Me');
  const defaultChecked2 = () => boolean('Default Checked 2', true);

  const disabled = () => boolean('Disabled', false);

  const [isChecked1, setChecked1] = useState(defaultChecked1());
  const handleCheckbox1 = (e) => setChecked1(e.target.checked);

  const [isChecked2, setChecked2] = useState(defaultChecked2());
  const handleCheckbox2 = (e) => setChecked2(e.target.checked);

  return (
    <React.Fragment>
      <CheckboxMaterial
        checked={isChecked1}
        disabled={disabled()}
        name="my-checkbox-1"
        label={labelText1()}
        onChange={handleCheckbox1}
      />
      <CheckboxMaterial
        checked={isChecked2}
        disabled={disabled()}
        name="my-checkbox-2"
        label={labelText2()}
        onChange={handleCheckbox2}
      />
    </React.Fragment>
  );
};

CheckboxMaterialStory.story = {
  name: 'Single Checkbox Material',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=51%3A153',
    },
  },
};

// export const MultipleCheckboxStory = () => {
//   const groupTitleMultiple = () => text('Group Title', 'What do you use to manage your diabetes?');
//   const labelText1 = () => text('Group Label Text 1', 'BG Meter');
//   const labelText2 = () => text('Group Label Text 2', 'CGM');
//   const labelText3 = () => text('Group Label Text 3', 'Insulin Pump');

//   const [isChecked1, setChecked1] = useState(false);
//   const toggleCheckbox1 = () => setChecked1(!isChecked1);

//   const [isChecked2, setChecked2] = useState(false);
//   const toggleCheckbox2 = () => setChecked2(!isChecked2);

//   const [isChecked3, setChecked3] = useState(false);
//   const toggleCheckbox3 = () => setChecked3(!isChecked3);

//   return (
//     <div>
//       <CheckboxGroupTitle>{groupTitleMultiple()}</CheckboxGroupTitle>
//       <label>
//         <Checkbox
//           checked={isChecked1}
//           onClick={toggleCheckbox1}
//           inputLabel={labelText1()}
//           />
//       </label>
//       <label>
//         <Checkbox
//           checked={isChecked2}
//           onClick={toggleCheckbox2}
//           inputLabel={labelText2()}
//           />
//       </label>
//       <label>
//         <Checkbox
//           checked={isChecked3}
//           onClick={toggleCheckbox3}
//           inputLabel={labelText3()}
//           />
//       </label>
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

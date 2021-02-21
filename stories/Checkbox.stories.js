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
  const error = () => boolean('Errored', false);
  const required = () => boolean('Required', false);

  return (
    <>
      <Checkbox
        checked={isChecked}
        disabled={disabled()}
        name="my-checkbox"
        label={labelText()}
        onChange={handleCheckbox}
        required={required()}
        error={error() ? 'Invalid selection' : null}
      />
      <Checkbox
        checked={isChecked}
        disabled={disabled()}
        name="my-checkbox"
        label={"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."}
        onChange={handleCheckbox}
        required={required()}
        error={error() ? 'Invalid selection' : null}
      />
    </>
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

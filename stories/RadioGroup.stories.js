import React, { useState } from 'react';

import { boolean as bool, text, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';
import mapValues from 'lodash/mapValues';
import keyBy from 'lodash/keyBy';

import baseTheme from '../app/themes/baseTheme';
import RadioGroup from '../app/components/elements/RadioGroup';

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Radios',
  decorators: [withTheme],
};

export const RadioGroupStory = {
  render: () => {
    const radioOptions = [
      { value: '', label: 'None' },
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' },
      { value: 'three', label: 'Three' },
    ];

    const knobOptions = mapValues(keyBy(radioOptions, 'label'), 'value');

    const label = () => text('Label', 'Group Label');
    const defaultValue = () =>
      options('Default Value', knobOptions, 'two', { display: 'inline-radio' });
    const disabled = () => bool('Disabled', false);
    const error = () => bool('Errored', false);
    const required = () => bool('Required', false);

    const orientations = {
      Horizontal: 'horizontal',
      Vertical: 'vertical',
    };

    const orientation = () =>
      options('Orientation', orientations, 'vertical', { display: 'inline-radio' });

    const [selected, setSelected] = useState(defaultValue());

    const handleChange = (event) => {
      setSelected(event.target.value);
    };

    return (
      <RadioGroup
        disabled={disabled()}
        id="my-radio-group"
        label={label()}
        name="mySelect"
        options={radioOptions}
        value={selected}
        onChange={handleChange}
        variant={orientation()}
        required={required()}
        error={error() ? 'Invalid selection' : null}
      />
    );
  },

  name: 'Radio Group',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};

import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, text, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import mapValues from 'lodash/mapValues';
import keyBy from 'lodash/keyBy';

import baseTheme from '../app/themes/baseTheme';
import Select from '../app/components/elements/Select';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Selects',
  decorators: [withDesign, withKnobs, withTheme],
};

export const Simple = () => {
  const selectOptions = [
    { value: '', label: 'None' },
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three' },
  ];

  const knobOptions = mapValues(keyBy(selectOptions, 'label'), 'value');

  const label = () => text('Label', 'Field Label');
  const defaultValue = () => options('Default Value', knobOptions, 'two', { display: 'inline-radio' });
  const disabled = () => boolean('Disabled', false);

  const [selected, setSelected] = useState(defaultValue());

  const handleChange = () => event => {
    setSelected(event.target.value);
  };

  return (
    <Select
      disabled={disabled()}
      label={label()}
      name="mySelect"
      options={selectOptions}
      value={selected}
      onChange={handleChange('mySelect')}
    />
  );
};

Simple.story = {
  name: 'Simple',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};

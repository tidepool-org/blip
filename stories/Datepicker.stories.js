import React from 'react';
import moment from 'moment';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, date } from '@storybook/addon-knobs';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

import DatePicker from '../app/components/elements/DatePicker';

export default {
  title: 'DatePickers',
  decorators: [withDesign, withKnobs, (Story) => <Story />]
};

export const DatePickerStory = () => {
  const initialDate = new Date('Jan 20 2017');

  const initialDateKnob = (name, defaultValue) => {
    const stringTimestamp = date(name, defaultValue);
    return moment.utc(stringTimestamp);
  }

  const getFocused = () => boolean('Focused', true);

  return <DatePicker
    id="example1"
    focused={getFocused()}
    date={initialDateKnob('Initial Date', initialDate)}
  />;
};

DatePickerStory.story = {
  name: 'DatePicker',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=8%3A826'
    },
  },
};

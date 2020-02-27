import React from 'react';
import moment from 'moment';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, date, optionsKnob as options } from '@storybook/addon-knobs';

import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';

import DatePicker from '../app/components/elements/DatePicker';
import DateRangePicker from '../app/components/elements/DateRangePicker';

// This silly decorator allows the components to properly re-render when knob values are changed
const withWrapper = Story => <Story />;

export default {
  title: 'Date Pickers',
  decorators: [withDesign, withKnobs, withWrapper],
};

export const SingleDatePicker = () => {
  const initialDate = new Date();

  const initialDateKnob = (name, defaultValue) => {
    const stringTimestamp = date(name, defaultValue);
    return moment.utc(stringTimestamp);
  };

  const getFocused = () => boolean('Initially Focused', true);

  return <DatePicker
    id="singleDatePicker"
    initialFocused={getFocused()}
    initialDate={initialDateKnob('Initial Date', initialDate)}
  />;
};

SingleDatePicker.story = {
  name: 'Single Date',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=198%3A6',
    },
  },
};

export const MultiDatePicker = () => {
  const initialStartDate = new Date();
  const initialEndDate = new Date();
  initialEndDate.setDate(initialEndDate.getDate() + 7)

  const initialDateKnob = (name, defaultValue) => {
    const stringTimestamp = date(name, defaultValue);
    return moment.utc(stringTimestamp);
  };

  const focusedInputKnob = () => {
    const label = 'Initially Focused Input';
    const valuesObj = {
      'Start Date': 'startDate',
      'End Date': 'endDate',
      'None': null,
    };

    const defaultValue = null;
    const optionsObj = {
      display: 'select',
    };

    return options(label, valuesObj, defaultValue, optionsObj);
  };

  return <DateRangePicker
    startDateId="dateRangeStart"
    endDateId="dateRangeEnd"
    initialFocusedInput={focusedInputKnob()}
    initialStartDate={initialDateKnob('Initial Start Date', initialStartDate)}
    initialEndDate={initialDateKnob('Initial End Date', initialEndDate)}
  />;
};

MultiDatePicker.story = {
  name: 'Date Range',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=198%3A6',
    },
  },
};

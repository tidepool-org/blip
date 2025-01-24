import React, { useState } from 'react';
import moment from 'moment';
import WindowSizeListener from 'react-window-size-listener';
import { boolean as bool, date, optionsKnob as options } from '@storybook/addon-knobs';

import DatePicker from '../app/components/elements/DatePicker';
import DateRangePicker from '../app/components/elements/DateRangePicker';

// This silly decorator allows the components to properly re-render when knob values are changed
const withWrapper = (Story) => <Story />;

export default {
  title: 'Date Pickers',
  decorators: [withWrapper],
};

export const DatePickerStory = {
  render: () => {
    const initialDate = new Date();

    const dateKnob = (name, defaultValue) => {
      const stringTimestamp = date(name, defaultValue);
      return moment.utc(stringTimestamp);
    };

    const getFocused = () => bool('Initially Focused', true);

    return (
      <DatePicker
        label="Pick a date"
        id="singleDatePicker"
        focused={getFocused()}
        date={dateKnob('Initial Date', initialDate)}
      />
    );
  },

  name: 'Single Date',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=198%3A6',
    },
  },
};

export const DateRangePickerStory = {
  render: () => {
    const initialStartDate = new Date();
    const initialEndDate = new Date();
    initialEndDate.setDate(initialEndDate.getDate() + 7);

    const dateKnob = (name, defaultValue) => {
      const stringTimestamp = date(name, defaultValue);
      return moment.utc(stringTimestamp);
    };

    const focusedInputKnob = () => {
      const label = 'Initially Focused Input';
      const valuesObj = {
        'Start Date': 'startDate',
        'End Date': 'endDate',
        None: null,
      };

      const defaultValue = 'startDate';
      const optionsObj = {
        display: 'select',
      };

      return options(label, valuesObj, defaultValue, optionsObj);
    };

    const [orientation, setOrientation] = useState('horizontal');

    const handleWindowResize = (size) => {
      setOrientation(size.windowWidth > 550 ? 'horizontal' : 'vertical');
    };

    return (
      <React.Fragment>
        <DateRangePicker
          label="Pick a date range"
          startDateId="dateRangeStart"
          endDateId="dateRangeEnd"
          orientation={orientation}
          focusedInput={focusedInputKnob()}
          startDate={dateKnob('Initial Start Date', initialStartDate)}
          endDate={dateKnob('Initial End Date', initialEndDate)}
        />
        <WindowSizeListener onResize={handleWindowResize} />
      </React.Fragment>
    );
  },

  name: 'Date Range',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=198%3A6',
    },
  },
};

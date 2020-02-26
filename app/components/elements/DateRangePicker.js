import React, { useState } from 'react';
import momentPropTypes from 'react-moment-proptypes';
import { DateRangePicker, DateRangePickerShape } from 'react-dates';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import styled from 'styled-components';
import baseTheme from '../../themes/baseTheme';

export const DatePicker = (props) => {
  const [startDate, setStartDate] = useState(props.initialStartDate);
  const [endDate, setEndDate] = useState(props.initialEndDate);
  const [focusedInput, setFocusedInput] = useState(props.initialFocusedInput);

  return (
    <DateRangePicker
      {...omit(props, [
        'initialStartDate',
        'initialEndDate',
        'initialFocusedInput',
      ])}
      startDate={startDate}
      startDateId={props.startDateId}
      endDate={endDate}
      endDateId={props.endDateId}
      onDatesChange={({ startDate, endDate }) => setStartDate(startDate) && setEndDate(endDate) && props.onDatesChange({ startDate, endDate })}
      focusedInput={focusedInput}
      onFocusChange={focusedInput => setFocusedInput(focusedInput) && props.onFocusChange(focusedInput)}
    />
  );
}

DatePicker.propTypes = {
  ...DateRangePickerShape,
  initialStartDate: momentPropTypes.momentObj,
  initialEndDate: momentPropTypes.momentObj,
  initialFocusedInput: DateRangePickerShape.focusedInput,
};

DatePicker.defaultProps = {
  initialStartDate: null,
  initialEndDate: null,
  initialFocusedInput: null,
  onDatesChange: noop,
  onFocusChange: noop,
}

export default DatePicker;

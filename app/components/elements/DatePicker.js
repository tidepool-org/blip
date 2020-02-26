import React, { useState } from 'react';
import momentPropTypes from 'react-moment-proptypes';
import { SingleDatePicker, SingleDatePickerShape } from 'react-dates';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import styled from 'styled-components';
import baseTheme from '../../themes/baseTheme';

export const DatePicker = (props) => {
  const [date, setDate] = useState(props.initialDate);
  const [focused, setFocused] = useState(props.initialFocused);

  return (
    <SingleDatePicker
      {...omit(props, [
        'initialFocused',
        'initialDate',
      ])}
      date={date}
      onDateChange={date => setDate(date) && props.onDateChange(date)}
      focused={focused}
      onFocusChange={({ focused }) => setFocused(focused) && props.onFocusChange(focused)}
      id={props.id}
    />
  );
}

DatePicker.propTypes = {
  ...SingleDatePickerShape,
  initialDate: momentPropTypes.momentObj,
  initialFocused: SingleDatePickerShape.focused,
};

DatePicker.defaultProps = {
  initialDate: null,
  initialFocused: false,
  onDateChange: noop,
  onFocusChange: noop,
}

export default DatePicker;

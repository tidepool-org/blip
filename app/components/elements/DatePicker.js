import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import baseTheme from '../../themes/baseTheme';
import { SingleDatePicker, SingleDatePickerShape } from 'react-dates';
import omit from 'lodash/omit';
import noop from 'lodash/noop';

export const DatePicker = (props) => {
  const [date, setDate] = useState(props.initialDate);
  const [focused, setFocused] = useState(props.autoFocus);

  return (
    <SingleDatePicker
      {...omit(props, [
        'autoFocus',
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
  autoFocus: PropTypes.bool.isRequired,
};

DatePicker.defaultProps = {
  initialDate: null,
  autoFocus: false,
  onDateChange: noop,
  onFocusChange: noop,
}

export default DatePicker;

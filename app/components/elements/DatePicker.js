import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import baseTheme from '../../themes/baseTheme';
import { SingleDatePicker } from 'react-dates';

export const DatePicker = (props) => {
  const [date, setDate] = useState(props.date)
  const [focused, setFocused] = useState(props.focused)
  return <SingleDatePicker
    date={date}
    onDateChange={date => setDate(date)}
    focused={focused}
    onFocusChange={({ focused }) => setFocused(focused)}
    id={props.id}
  />;
}

DatePicker.propTypes = {
  date: PropTypes.oneOfType([momentPropTypes.momentObj, null]),
  focused: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
};

DatePicker.defaultProps = {
  date: null,
  focused: false,
}

export default DatePicker;

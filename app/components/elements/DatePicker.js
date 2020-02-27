import React, { useState } from 'react';
import momentPropTypes from 'react-moment-proptypes';
import { SingleDatePicker, SingleDatePickerShape } from 'react-dates';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { Box, Flex } from 'rebass';
import styled from 'styled-components';
import theme from '../../themes/baseTheme';

const StyledDatePicker = styled(Box)`
  font-family: ${theme.font};

  .SingleDatePickerInput__withBorder {
    border-radius: ${theme.radii.input}px;
    box-shadow: inset ${theme.shadows.small};
  }

  .DayPicker__withBorder {
    border-radius: ${theme.radii.input}px;
    box-shadow: ${theme.shadows.large};
  }

  input {
    font: ${theme.weights[0]} ${theme.fontSizes[1]}px ${theme.font};
    padding: ${theme.space[3]}px;
    border-bottom: 0;
  }
`;

export const DatePicker = (props) => {
  const [date, setDate] = useState(props.initialDate);
  const [focused, setFocused] = useState(props.initialFocused);

  return (
    <StyledDatePicker>
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
        numberOfMonths={1}
        placeholder='mm/dd/yyyy'
        displayFormat='MMM D, YYYY'
      />
    </StyledDatePicker>
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

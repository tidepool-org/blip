import React, { useState } from 'react';
import momentPropTypes from 'react-moment-proptypes';
import { SingleDatePicker, SingleDatePickerShape } from 'react-dates';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { Box } from 'rebass';
import styled from 'styled-components';

import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  shadows,
  space,
} from '../../themes/baseTheme';

const StyledDatePicker = styled(Box)`
  font-family: ${fonts.default};

  .MuiSvgIcon-root {
    color: ${colors.primaryFont};
  }

  .SingleDatePickerInput__withBorder {
    border-radius: ${radii.input}px;
    border-color: ${colors.borderColor};

    input {
      font: ${fontWeights.regular} ${fontSizes[1]}px ${fonts.default};
      padding: ${space[3]}px;
      border-bottom: 0;
      color: ${colors.primaryFont};
    }

    input::placeholder {
      color: ${colors.primaryTextSubdued};
    }
  }

  .SingleDatePicker_picker {
    box-shadow: ${shadows.small};
    margin-top: ${space[3]}px;
  }

  .DayPicker__withBorder {
    border-radius: ${radii.input}px;
    box-shadow: ${shadows.large};
  }

  .DayPickerNavigation_button {
    position: absolute;
    top: 20px;

    &:first-child {
      left: 14px;
    }

    &:last-child {
      right: 14px;
    }
  }

  .CalendarMonth_caption {
    color: ${colors.primaryFont};

    strong {
      font-weight: ${fontWeights.regular};
      font-size: ${fontSizes[2]}
    }
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
        verticalSpacing={0}
        navNext={<NavigateNextRoundedIcon />}
        navPrev={<NavigateBeforeRoundedIcon />}
        isOutsideRange={props.isOutsideRange}
        enableOutsideDays={props.enableOutsideDays}
      />
    </StyledDatePicker>
  );
};

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
  isOutsideRange: noop,
  enableOutsideDays: true,
};

export default DatePicker;

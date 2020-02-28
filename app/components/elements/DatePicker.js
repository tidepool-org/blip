import React, { useState } from 'react';
import momentPropTypes from 'react-moment-proptypes';
import { SingleDatePicker, SingleDatePickerShape } from 'react-dates';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
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

export const StyledDatePickerBase = styled(Box)`
  font-family: ${fonts.default};

  .MuiSvgIcon-root {
    color: ${colors.primaryFont};
  }

  .DateInput {
    input {
      font: ${fontWeights.regular} ${fontSizes[1]}px ${fonts.default};
      padding: ${space[3]}px;
      border-bottom: 0;
      color: ${colors.primaryFont};
    }

    input::placeholder {
      color: ${colors.primaryFontSubdued};
    }
  }

  .DayPicker {
    border-radius: ${radii.input}px;
    box-shadow: ${shadows.large};
  }

  .DayPickerNavigation_button {
    position: absolute;
    top: ${space[2]}px;

    .MuiSvgIcon-root {
      width: 24px;
      height: 24px;
    }

    &:first-child {
      left: 14px;
    }

    &:last-child {
      right: 14px;
    }
  }

  .CalendarMonth_caption {
    color: ${colors.primaryFont};
    padding: ${space[2]}px;
    margin-bottom: ${space[5]}px;
    border-bottom: 1px solid ${colors.borderColor};

    strong {
      font-weight: ${fontWeights.regular};
      font-size: ${fontSizes[2]}px;
    }
  }

  .DayPicker_weekHeader {
    top: 50px;
    color: ${colors.primaryFont};
    font-weight: ${fontWeights.medium};

    small {
      font-size: ${fontSizes[1]}px;
    }
  }

  .CalendarDay {
    color: ${colors.primaryFont};
    font-size: ${fontSizes[1]}px;
    border: 0;

    &.CalendarDay__outside {
      color: ${colors.primaryFontDisabled};
    }

    &.CalendarDay__default:hover {
      border-radius: ${radii.default}px;
    }

    &.CalendarDay__selected,
    &.CalendarDay__selected:active,
    &.CalendarDay__selected:hover {
      color: ${colors.white};
      border: 0;
      border-radius: ${radii.default}px;
      background: ${colors.mediumPurple};
    }
  }
`;

const StyledDatePicker = styled(StyledDatePickerBase)`
  .SingleDatePickerInput {
    border-radius: ${radii.input}px;
    border-color: ${colors.borderColor};
  }

  .SingleDatePicker_picker {
    box-shadow: ${shadows.small};
    margin-top: ${space[3]}px;
  }

  .SingleDatePickerInput_clearDate {
    padding: 0;
    display: flex;

    .MuiSvgIcon-root {
      width: 20px;
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
        customCloseIcon={<CloseRoundedIcon />}
        isOutsideRange={props.isOutsideRange}
        daySize={36}
        enableOutsideDays
        hideKeyboardShortcutsPanel
        showClearDate
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
};

export default DatePicker;

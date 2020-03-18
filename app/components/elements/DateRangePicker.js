import React, { useState } from 'react';
import { DateRangePicker as DateRangePickerBase, DateRangePickerShape } from 'react-dates';
import ArrowRightAltRoundedIcon from '@material-ui/icons/ArrowRightAltRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import noop from 'lodash/noop';
import styled from 'styled-components';

import { DatePicker as StyledDatePickerBase } from './InputStyles';
import { Icon } from './Icon';

import {
  colors,
  fontSizes,
  radii,
  shadows,
  space,
} from '../../themes/baseTheme';

const StyledDateRangePicker = styled(StyledDatePickerBase)`
  .DateRangePickerInput {
    border-radius: ${radii.input}px;
    border-color: ${colors.borderColor};
  }

  .DateRangePicker_picker {
    box-shadow: ${shadows.small};
    margin-top: ${space[3]}px;
  }

  .DateRangePickerInput_clearDates {
    padding: 0;
    display: flex;

    .MuiSvgIcon-root {
      width: ${fontSizes[3]}px;
    }
  }

  .DateRangePickerInput_arrow {
    padding: 0;
    display: inline-flex;
  }

  .CalendarDay {
    &.CalendarDay__selected_start,
    &.CalendarDay__selected_start:active,
    &.CalendarDay__selected_start:hover {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &.CalendarDay__selected_end,
    &.CalendarDay__selected_end:active,
    &.CalendarDay__selected_end:hover {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    &.CalendarDay__hovered_span,
    &.CalendarDay__hovered_span:hover,
    &.CalendarDay__selected_span,
    &.CalendarDay__selected_span:active,
    &.CalendarDay__selected_span:hover {
      background: ${colors.purpleLight};
      border-radius: 0;
    }
  }
`;

export const DateRangePicker = props => {
  const {
    startDate,
    endDate,
    focusedInput: focusedInputProp,
    isOutsideRange,
    onDateChange,
    onFocusChange,
    ...datePickerProps
  } = props;

  const [dates, setDates] = useState({ startDate, endDate });
  const [focusedInput, setFocusedInput] = useState(focusedInputProp);

  return (
    <StyledDateRangePicker>
      <DateRangePickerBase
        startDate={dates.startDate}
        startDateId={props.startDateId}
        endDate={dates.endDate}
        endDateId={props.endDateId}
        onDatesChange={newDates => setDates(newDates) && props.onDatesChange(newDates)}
        focusedInput={focusedInput}
        onFocusChange={newFocusedInput => {
          setFocusedInput(newFocusedInput);
          props.onFocusChange(newFocusedInput);
        }}
        numberOfMonths={2}
        displayFormat="MMM D, YYYY"
        verticalSpacing={0}
        navPrev={<Icon label="previous month" icon={NavigateBeforeRoundedIcon} />}
        navNext={<Icon label="next month" icon={NavigateNextRoundedIcon} />}
        customCloseIcon={<Icon label="clear dates" icon={CloseRoundedIcon} />}
        customArrowIcon={<Icon label="to" icon={ArrowRightAltRoundedIcon} />}
        daySize={36}
        hideKeyboardShortcutsPanel
        showClearDates
        {...datePickerProps}
      />
    </StyledDateRangePicker>
  );
};

DateRangePicker.propTypes = DateRangePickerShape;

DateRangePicker.defaultProps = {
  startDate: null,
  endDate: null,
  focusedInput: null,
  onDatesChange: noop,
  onFocusChange: noop,
  isOutsideRange: noop,
};

export default DateRangePicker;

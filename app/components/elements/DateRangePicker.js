import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DateRangePicker as DateRangePickerBase, DateRangePickerShape } from 'react-dates';
import ArrowRightAltRoundedIcon from '@material-ui/icons/ArrowRightAltRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import noop from 'lodash/noop';
import styled from '@emotion/styled';
import { Label, Box, BoxProps } from 'theme-ui';
import cx from 'classnames';

import { Caption } from './FontStyles';
import { DatePicker as StyledDatePickerBase } from './InputStyles';
import { Icon } from './Icon';

import {
  default as baseTheme,
  colors,
  fontSizes,
  fontWeights,
  radii,
  shadows,
  space,
} from '../../themes/baseTheme';

const StyledDateRangePicker = styled(StyledDatePickerBase)`
  .DateRangePickerInput {
    border-radius: ${radii.input}px;
    border-color: ${colors.border.inputLight};

    .DateInput {
      border-radius: ${radii.input}px;

      input {
        border-radius: ${radii.input}px;
        font-size: ${fontSizes[1]}px;
        padding: ${space[2]}px;
      }
    }
  }

  .DateRangePicker_picker {
    box-shadow: ${shadows.small};
    margin-top: ${space[2]}px;
  }

  .DateRangePickerInput_clearDates {
    padding: 0;
    display: flex;
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

    &.CalendarDay__blocked_out_of_range,
    &.CalendarDay__blocked_out_of_range:hover {
      background-color: ${colors.lightestGrey};
      color: ${colors.blueGreyLight};
      border-radius: 0;
    }

    &.CalendarDay__blocked_calendar,
    &.CalendarDay__blocked_calendar:hover {
      background-color: ${colors.lightGrey};
      color: ${colors.blueGreyMedium};
      border-radius: 0;
    }
  }
`;

export function DateRangePicker(props) {
  const {
    startDate,
    endDate,
    errors = {},
    focusedInput: focusedInputProp,
    label,
    onDatesChange,
    onFocusChange,
    required,
    themeProps,
    ...datePickerProps
  } = props;

  const [dates, setDates] = useState({ startDate, endDate });
  const [focusedInput, setFocusedInput] = useState(focusedInputProp);

  React.useEffect(() => {
    setDates({ startDate, endDate });
  }, [startDate, endDate]);

  const inputClasses = cx({
    error: !!(errors.startDate || errors.endDate),
    required,
  });

  return (
    <Box as={StyledDateRangePicker} {...themeProps}>
      {label && (
        <Label htmlFor={name}>
          <Caption
            sx={{
              fontWeight: fontWeights.medium,
              fontSize: 1,
            }}
            className={inputClasses}
          >
            {label}
          </Caption>
        </Label>
      )}
      <DateRangePickerBase
        startDate={dates.startDate}
        startDateId={props.startDateId}
        endDate={dates.endDate}
        endDateId={props.endDateId}
        onDatesChange={newDates => {
          setDates(newDates);
          onDatesChange(newDates);
        }}
        focusedInput={focusedInput}
        onFocusChange={selectedFocusedInput => {
          setFocusedInput(selectedFocusedInput);
          onFocusChange(selectedFocusedInput);
        }}
        numberOfMonths={2}
        displayFormat="MMM D, YYYY"
        verticalSpacing={0}
        navPrev={<Icon theme={baseTheme} label="previous month" icon={NavigateBeforeRoundedIcon} />}
        navNext={<Icon theme={baseTheme} label="next month" icon={NavigateNextRoundedIcon} />}
        customCloseIcon={<Icon theme={baseTheme} label="clear dates" icon={CloseRoundedIcon} />}
        customArrowIcon={<Icon theme={baseTheme} label="to" icon={ArrowRightAltRoundedIcon} />}
        daySize={36}
        hideKeyboardShortcutsPanel
        showClearDates
        {...datePickerProps}
      />
      {(errors.startDate || errors.endDate) && (
        <Box ml={2} mt={2}>
          {errors.startDate && (
            <Caption
              lineHeight={3}
              className={inputClasses}
            >
              {errors.startDate}
            </Caption>
          )}

          {errors.endDate && (
            <Caption
              lineHeight={3}
              className={inputClasses}
            >
              {errors.endDate}
            </Caption>
          )}
        </Box>
      )}
    </Box>
  );
}

DateRangePicker.propTypes = {
  ...DateRangePickerShape,
  themeProps: PropTypes.shape(BoxProps),
};

DateRangePicker.defaultProps = {
  startDate: null,
  endDate: null,
  focusedInput: null,
  onDatesChange: noop,
  onFocusChange: noop,
  isOutsideRange: noop,
};

export default DateRangePicker;

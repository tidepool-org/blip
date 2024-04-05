import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { SingleDatePicker, SingleDatePickerShape } from 'react-dates';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import map from 'lodash/map';
import noop from 'lodash/noop';
import styled from 'styled-components';
import { Label } from '@rebass/forms';
import { Box, BoxProps, Flex } from 'rebass/styled-components';
import cx from 'classnames';

import { Caption } from './FontStyles';
import Select from './Select';
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

const StyledDatePicker = styled(StyledDatePickerBase)`
  .SingleDatePickerInput {
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

  .SingleDatePicker_picker {
    box-shadow: ${shadows.small};
    margin-top: ${space[2]}px;
  }

  .SingleDatePickerInput_clearDate {
    padding: 0;
    display: flex;
  }

  .CalendarDay {
    &.CalendarDay__blocked_out_of_range {
      background-color: ${colors.lightestGrey};
      color: ${colors.blueGreyLight};
      border-radius: 0;
    }
  }
`;

export const DatePicker = props => {
  const {
    date: dateProp,
    error,
    focused: focusedProp,
    label,
    onDateChange,
    onFocusChange,
    required,
    themeProps,
    showYearPicker,
    ...datePickerProps
  } = props;

  const renderMonthElement = ({ month, onMonthSelect, onYearSelect }) => {
    const monthOptions = map(moment.months(), (monthName, value) => ({ label: monthName, value }));
    const yearsOptions = [];

    for (let i = moment().year(); i >= moment().year() - 130; i--) {
      yearsOptions.push({ value: i, label: i });
    }

    return (
      <Flex px={3} sx={{ justifyContent: 'center', gap: 2 }}>
        <Box sx={{ flexBasis: '50%' }}>
          <Select
            variant="ultraCondensed"
            options={monthOptions}
            value={month.month()}
            onChange={e => onMonthSelect(month, e.target.value)}
            themeProps={{
              width: '100%',
            }}
          />
        </Box>

        <Box sx={{ flexBasis: '50%' }}>
          <Select
            variant="ultraCondensed"
            options={yearsOptions}
            value={month.year()}
            onChange={e => onYearSelect(month, e.target.value)}
            themeProps={{
              width: '100%',
            }}
          />
        </Box>
      </Flex>
    );
  };

  const [date, setDate] = useState(dateProp);
  const [focused, setFocused] = useState(focusedProp);

  React.useEffect(() => {
    setDate(dateProp);
  }, [dateProp]);

  const inputClasses = cx({
    error,
    required,
  });

  return (
    <Box as={StyledDatePicker} {...themeProps}>
      {label && (
        <Label htmlFor={name}>
          <Caption
            fontWeight={fontWeights.medium}
            fontSize={1}
            className={inputClasses}
          >
            {label}
          </Caption>
        </Label>
      )}
      <SingleDatePicker
        date={date}
        onDateChange={newDate => {
          setDate(newDate);
          onDateChange(newDate);
        }}
        focused={focused}
        onFocusChange={({ focused: newFocused }) => {
          setFocused(newFocused);
          onFocusChange(newFocused);
        }}
        id={props.id}
        name={props.name}
        numberOfMonths={1}
        placeholder="mm/dd/yyyy"
        displayFormat="MMM D, YYYY"
        verticalSpacing={0}
        navNext={<Icon theme={baseTheme} label="next month" icon={NavigateNextRoundedIcon} />}
        navPrev={<Icon theme={baseTheme} label="previous month" icon={NavigateBeforeRoundedIcon} />}
        customCloseIcon={<Icon theme={baseTheme} label="clear dates" icon={CloseRoundedIcon} />}
        daySize={36}
        enableOutsideDays
        hideKeyboardShortcutsPanel
        showClearDate
        renderMonthElement={showYearPicker ? renderMonthElement : undefined}
        transitionDuration={showYearPicker ? 0 : undefined}
        {...datePickerProps}
      />
      {error && (
        <Caption ml={2} mt={2} className={inputClasses}>
          {error}
        </Caption>
      )}
    </Box>
  );
};

DatePicker.propTypes = {
  ...SingleDatePickerShape,
  showYearPicker: PropTypes.bool,
  themeProps: PropTypes.shape(BoxProps),
};

DatePicker.defaultProps = {
  date: null,
  focused: false,
  onDateChange: noop,
  onFocusChange: noop,
  isOutsideRange: noop,
};

export default DatePicker;

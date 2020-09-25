import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SingleDatePicker, SingleDatePickerShape } from 'react-dates';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import noop from 'lodash/noop';
import styled from 'styled-components';
import { Label } from '@rebass/forms';
import { Box, BoxProps } from 'rebass/styled-components';
import cx from 'classnames';

import { Caption } from './FontStyles';
import { DatePicker as StyledDatePickerBase } from './InputStyles';
import { Icon } from './Icon';

import {
  default as baseTheme,
  colors,
  radii,
  shadows,
  space,
} from '../../themes/baseTheme';

const StyledDatePicker = styled(StyledDatePickerBase)`
  .SingleDatePickerInput {
    border-radius: ${radii.input}px;
    border-color: ${colors.border.default};
  }

  .SingleDatePicker_picker {
    box-shadow: ${shadows.small};
    margin-top: ${space[3]}px;
  }

  .SingleDatePickerInput_clearDate {
    padding: 0;
    display: flex;
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
    ...datePickerProps
  } = props;

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
          <Caption className={inputClasses}>{label}</Caption>
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

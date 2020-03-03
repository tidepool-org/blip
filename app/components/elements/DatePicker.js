import React, { useState } from 'react';
import momentPropTypes from 'react-moment-proptypes';
import { SingleDatePicker, SingleDatePickerShape } from 'react-dates';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import styled from 'styled-components';

import { DatePicker as StyledDatePickerBase } from './InputStyles';
import { IconButton } from './IconButton';

import {
  colors,
  fontSizes,
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

    .MuiSvgIcon-root {
      width: ${fontSizes[3]}px;
    }
  }
`;

export const DatePicker = props => {
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
        onDateChange={newDate => setDate(newDate) && props.onDateChange(newDate)}
        focused={focused}
        onFocusChange={({ focused: newFocused }) => {
          setFocused(newFocused);
          props.onFocusChange(newFocused);
        }}
        id={props.id}
        numberOfMonths={1}
        placeholder="mm/dd/yyyy"
        displayFormat="MMM D, YYYY"
        verticalSpacing={0}
        navNext={<IconButton label="next month" icon={NavigateNextRoundedIcon} />}
        navPrev={<IconButton label="previous month" icon={NavigateBeforeRoundedIcon} />}
        customCloseIcon={<IconButton label="clear dates" icon={CloseRoundedIcon} />}
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

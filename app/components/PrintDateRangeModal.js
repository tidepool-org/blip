import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import noop from 'lodash/noop';
import { Flex } from 'rebass/styled-components';
import moment from 'moment';

import Button from './elements/Button';
import DateRangePicker from './elements/DateRangePicker';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from './elements/Dialog';
import { Paragraph1, MediumTitle, Caption } from './elements/FontStyles';

export const PrintDateRangeModal = (props) => {
  const {
    onClose,
    onClickPrint,
    onDatesChange,
    open,
    disabled,
    error,
  } = props;

  const [dates, setDates] = useState({ startDate: null, endDate: null });
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    onDatesChange(dates);
  }, [dates])

  const getLastNDays = (startDate) => ({
    startDate: moment().subtract(startDate, 'days'),
    endDate: moment(),
  });

  const doesChipDateMatch = (start) => {
    return moment().subtract(start, 'days').isSame(dates.startDate, 'day') && moment().isSame(dates.endDate, 'day');
  };

  const options = [7, 14, 21, 30];

  return (
    <Dialog maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle divider={false} onClose={onClose}>
        <MediumTitle>Print Report</MediumTitle>
      </DialogTitle>
      <DialogContent divider pb={6}>
        <Paragraph1>Number of days (most recent)</Paragraph1>
        <Flex mb={4}>
          {map(options, (option, i) => (
            <Button
              mx={1}
              variant="chip"
              disabled={disabled}
              id={`${option}-${i}`}
              key={option}
              value={option}
              selected={doesChipDateMatch(option)}
              onClick={() => {
                setDates(getLastNDays(option));
              }}
            >
              {option} days
            </Button>
          ))}
        </Flex>
        <Paragraph1>Or select a custom date range</Paragraph1>
        <DateRangePicker
          startDate={dates.startDate}
          endDate={dates.endDate}
          onDatesChange={dates => setDates(dates)}
          isOutsideRange={day => (moment().diff(day) < 0)}
          onFocusChange={input => setDatePickerOpen(!!input)}
          themeProps={{
            minWidth: '580px',
            minHeight: datePickerOpen ? '300px' : undefined,
          }}
        />
        {error && (
          <Caption mt={2} color="feedback.danger">
            Please select a date range
          </Caption>
        )}
      </DialogContent>
      <DialogActions justifyContent="space-between" alignContent="center" py={2}>
        <Button variant="textSecondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="textPrimary" onClick={() => onClickPrint(dates)}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PrintDateRangeModal.PropTypes = {
  onDatesChange: PropTypes.func,
  onClickPrint: PropTypes.func,
};

PrintDateRangeModal.defaultProps = {
  onDatesChange: noop,
  onClickPrint: noop,
};

export default PrintDateRangeModal;

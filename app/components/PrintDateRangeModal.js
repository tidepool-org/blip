import React, { useState } from 'react';
import map from 'lodash/map';
import { Flex } from 'rebass';
import cx from 'classnames';
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
    open,
    disabled,
    error,
    required,
  } = props;

  const [dates, setDates] = useState({ startDate: null, endDate: null });

  const getLastNDays = (startDate) => ({
    startDate: moment().subtract(startDate, 'days'),
    endDate: moment(),
  });

  const doesChipDateMatch = (start) => {
    return moment().subtract(start, 'days').isSame(dates.startDate, 'day') && moment().isSame(dates.endDate, 'day');
  };

  const inputClasses = cx({
    error,
    required,
  });

  const options = [7, 14, 21, 30];

  return (
    <Dialog maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle divider={false} onClose={onClose}>
        <MediumTitle>Print Report</MediumTitle>
      </DialogTitle>
      <DialogContent divider={false} style={{ marginRight: 100 }}>
        <Paragraph1>Number of days (most recent)</Paragraph1>
        <Flex>
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
      </DialogContent>
      <DialogContent style={{ height: 450 }}>
        <Paragraph1>Or select a custom date range</Paragraph1>
        <DateRangePicker
          startDate={dates.startDate}
          endDate={dates.endDate}
          isOutsideRange={day => (moment().diff(day) < 0)}
        />
        {error && (
          <Flex mt={4} className={inputClasses}>
            <Caption>
              Must Select at number of days or custom date range
            </Caption>
          </Flex>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="textSecondary" onClick={onClose} style={{ flex: '50%' }}>
          Cancel
        </Button>
        <Button variant="textPrimary" onClick={() => onClickPrint(dates)} style={{ textAlign: 'right' }}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintDateRangeModal;

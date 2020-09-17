import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import { Flex } from 'rebass/styled-components';
import moment from 'moment-timezone';

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
    error,
    timePrefs: { timezoneName },
  } = props;

  const endOfToday = useMemo(() => moment().tz(timezoneName).endOf('day').subtract(1, 'ms'), [open]);

  // We want the set dates to start at the floor of the start date and the ceiling of the end date
  // to ensure we are selecting full days of data.
  const setDateRangeToExtents = ({ startDate, endDate }) => ({
    startDate: startDate ? moment(startDate).tz(timezoneName).startOf('day') : null,
    endDate: endDate ? moment(endDate).tz(timezoneName).endOf('day').subtract(1, 'ms') : null,
  });

  const getLastNDays = (days) => {
    return setDateRangeToExtents({
      startDate: moment(endOfToday).tz(timezoneName).subtract(days - 1, 'days'),
      endDate: endOfToday,
    });
  };

  const presetOptions = [7, 14, 21, 30];
  const presetDateRanges = useMemo(() => map(presetOptions, getLastNDays), [open]);
  const [dates, setDates] = useState(getLastNDays(presetOptions[0]));
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    onDatesChange(dates);
  }, [dates])

  return (
    <Dialog id="printDateRangePicker" maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle divider={false} onClose={onClose}>
        <MediumTitle>Print Report</MediumTitle>
      </DialogTitle>
      <DialogContent divider pb={6}>
        <Paragraph1>Number of days (most recent)</Paragraph1>
        <Flex mb={4}>
          {map(presetOptions, (days, i) => (
            <Button
              mx={1}
              variant="chip"
              id={`latest-${days}-days`}
              key={i}
              value={days}
              selected={isEqual(dates, presetDateRanges[i])}
              onClick={() => setDates(getLastNDays(days))}
            >
              {days} days
            </Button>
          ))}
        </Flex>
        <Paragraph1>Or select a custom date range</Paragraph1>
        <DateRangePicker
          startDate={dates.startDate}
          startDateId="printDateRangeStart"
          endDate={dates.endDate}
          endDateId="printDateRangeEnd"
          onDatesChange={dates => setDates(setDateRangeToExtents(dates))}
          isOutsideRange={day => (endOfToday.diff(day) < 0)}
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

PrintDateRangeModal.propTypes = {
  error: PropTypes.bool,
  onClickPrint: PropTypes.func,
  onClose: PropTypes.func,
  onDatesChange: PropTypes.func,
  open: PropTypes.bool,
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool,
    timezoneName: PropTypes.string.isRequired,
  }).isRequired,
};

PrintDateRangeModal.defaultProps = {
  onClickPrint: noop,
  onClose: noop,
  onDatesChange: noop,
};

export default PrintDateRangeModal;

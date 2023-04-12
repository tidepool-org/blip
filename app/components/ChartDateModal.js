import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import { Box } from 'rebass/styled-components';
import moment from 'moment-timezone';

import Button from './elements/Button';
import DatePicker from './elements/DatePicker';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from './elements/Dialog';
import { MediumTitle, Caption, Body1 } from './elements/FontStyles';
import i18next from '../core/language';

const t = i18next.t.bind(i18next);

export const ChartDateModal = (props) => {
  const {
    chartType,
    defaultDate,
    mostRecentDatumDate,
    onClose,
    onSubmit,
    onDateChange,
    open,
    processing,
    timePrefs: { timezoneName = 'UTC' },
    title,
    trackMetric,
  } = props;

  const endOfToday = useMemo(() => moment.utc().tz(timezoneName).endOf('day').subtract(1, 'ms'), [open]);

  const defaults = useMemo(() => ({
    datePickerOpen: true,
    date: moment.utc(defaultDate || mostRecentDatumDate).tz(timezoneName),
    error: false,
    submitted: false,
  }), [mostRecentDatumDate, defaultDate]);

  const [date, setDate] = useState(defaults.date);
  const [error, setError] = useState(defaults.error);
  const [submitted, setSubmitted] = useState(defaults.submitted);
  const [datePickerOpen, setDatePickerOpen] = useState(defaults.datePickerOpen);

  const dateMatchesDefault = () => {
    return moment(date).isSame(defaults.date);
  };

  const validateDate = date => {
    const validationError = !moment.isMoment(date);
    setError(validationError ? 'Please select a date' : false);
    return validationError;
  };

  const formatDateEndpoints = date => ([
    moment.utc(date).tz(timezoneName).startOf('day').valueOf(),
    moment.utc(date).tz(timezoneName).add(1, 'day').startOf('day').valueOf(),
  ]);

  // Handlers
  const handleSubmit = () => {
    setSubmitted(true);
    const validationError = validateDate(date);
    if (!isEqual(validationError, defaults.error)) return;
    if (dateMatchesDefault()) return onClose();
    trackMetric('Set Custom Chart Date', { chartType });
    onSubmit(formatDateEndpoints(date));
  };

  const handleClose = () => {
    onClose();
  };

  // Set to default state when dialog is newly opened
  useEffect(() => {
    if (open) {
      setDatePickerOpen(defaults.datePickerOpen);
      setDate(defaults.date);
      setError(defaults.error);
      setSubmitted(defaults.submitted);
    }
  }, [open]);

  // Validate dates if submitted and call `onDatesChange` prop method when dates change
  useEffect(() => {
    if (submitted) validateDate(date);
    onDateChange(date);
  }, [date]);

  return (
    <Dialog id="ChartDatePicker" maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle divider={false} onClose={handleClose}>
        <MediumTitle>{title}</MediumTitle>
      </DialogTitle>
      <DialogContent divider minWidth="330px" p={0}>
        <Box px={3}>
          <Box mb={3}>
            <Body1 mb={2}>{t('Select a specific day')}</Body1>
            <DatePicker
              id="chart-date"
              name="chart-date"
              date={date}
              onDateChange={newDate => setDate(newDate)}
              isOutsideRange={day => (
                moment.utc(mostRecentDatumDate).tz(timezoneName).endOf('day').subtract(1, 'ms').diff(day) < 0 ||
                endOfToday.diff(day) < 0
              )}
              onFocusChange={input => setDatePickerOpen(!!input)}
              focused
              themeProps={{
                minHeight: datePickerOpen ? '326px' : undefined,
              }}
            />
          </Box>
          {error && (
            <Caption mt={2} color="feedback.danger" id="chart-dates-error">
              {error}
            </Caption>
          )}
        </Box>
      </DialogContent>
      <DialogActions justifyContent="space-between" py="12px">
        <Button variant="textSecondary" className="chart-dates-cancel" onClick={handleClose}>
          {t('Cancel')}
        </Button>
        <Button variant="primary" className="chart-dates-submit" processing={processing} onClick={handleSubmit}>
          {t('Apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ChartDateModal.propTypes = {
  chartType: PropTypes.string,
  defaultDate: PropTypes.string.isRequired,
  mostRecentDatumDate: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool,
  processing: PropTypes.bool,
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool,
    timezoneName: PropTypes.string,
  }),
  trackMetric: PropTypes.func.isRequired,
};

ChartDateModal.defaultProps = {
  onClose: noop,
  onDateChange: noop,
  onSubmit: noop,
  title: t('Chart Date'),
  trackMetric: noop,
};

export default ChartDateModal;

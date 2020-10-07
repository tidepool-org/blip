import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import noop from 'lodash/noop';
import { Flex, Box } from 'rebass/styled-components';
import moment from 'moment-timezone';

import Button from './elements/Button';
import DateRangePicker from './elements/DateRangePicker';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from './elements/Dialog';
import { MediumTitle, Caption, Body1 } from './elements/FontStyles';
import i18next from '../core/language';

const t = i18next.t.bind(i18next);

export const ChartDateRangeModal = (props) => {
  const {
    defaultDates: defaultDatesProp,
    maxDays,
    mostRecentDatumDate,
    onClose,
    onSubmit,
    onDatesChange,
    open,
    processing,
    timePrefs: { timezoneName = 'UTC' },
    title,
    presetDaysOptions,
  } = props;

  const endOfToday = useMemo(() => moment.utc().tz(timezoneName).endOf('day').subtract(1, 'ms'), [open]);

  // We want the set dates to start at the floor of the start date and the ceiling of the end date
  // to ensure we are selecting full days of data.
  const setDateRangeToExtents = ({ startDate, endDate }) => ({
    startDate: startDate ? moment.utc(startDate).tz(timezoneName).startOf('day') : null,
    endDate: endDate ? moment.utc(endDate).tz(timezoneName).endOf('day').subtract(1, 'ms') : null,
  });

  const getLastNDays = days => {
    const endDate = mostRecentDatumDate
      ? moment.utc(mostRecentDatumDate)
      : endOfToday;

    return setDateRangeToExtents({
      startDate: moment.utc(endDate).tz(timezoneName).subtract(days - 1, 'days'),
      endDate,
    });
  };

  const defaultDates = () => defaultDatesProp
    ? setDateRangeToExtents({
      startDate: defaultDatesProp[0],
      endDate: defaultDatesProp[1] - 1,
    })
    : getLastNDays(presetDaysOptions[0], 'basics');

  const defaults = useMemo(() => ({
    datePickerOpen: false,
    dates: defaultDates(),
    errors: false,
    submitted: false,
  }), [mostRecentDatumDate, defaultDatesProp]);

  const [dates, setDates] = useState(defaults.dates);
  const [errors, setErrors] = useState(defaults.errors);
  const [submitted, setSubmitted] = useState(defaults.submitted);
  const [datePickerOpen, setDatePickerOpen] = useState(defaults.datePickerOpen);

  const presetDateRanges = useMemo(() => map(presetDaysOptions, days => getLastNDays(days, 'basics')), [open]);

  const datesMatchPreset = (dates, presetDates) => {
    return moment(dates.startDate).isSame(presetDates.startDate) && moment(dates.endDate).isSame(presetDates.endDate);
  };

  const datesMatchDefault = () => {
    return moment(dates.startDate).isSame(defaults.dates.startDate) && moment(dates.endDate).isSame(defaults.dates.endDate);
  };

  const validateDatesSet = dates => (!moment.isMoment(dates.startDate) || !moment.isMoment(dates.endDate)
    ? t('Please select a date range')
    : false
  );

  const validateDates = dates => {
    const validationErrors = validateDatesSet(dates);
    setErrors(validationErrors);
    return validationErrors;
  };

  const formatDateEndpoints = dates => ([
    dates.startDate.valueOf(),
    moment.utc(dates.endDate).tz(timezoneName).add(1, 'day').startOf('day').valueOf(),
  ]);

  // Handlers
  const handleSubmit = () => {
    setSubmitted(true);
    const validationErrors = validateDates(dates);
    if (!isEqual(validationErrors, defaults.errors)) return;
    if (datesMatchDefault()) return onClose();
    onSubmit(formatDateEndpoints(dates));
  };

  const handleClose = () => {
    onClose();
  };

  // Set to default state when dialog is newly opened
  useEffect(() => {
    if (open) {
      setDatePickerOpen(defaults.datePickerOpen);
      setDates(defaults.dates);
      setErrors(defaults.errors);
      setSubmitted(defaults.submitted);
    }
  }, [open]);

  // Validate dates if submitted and call `onDatesChange` prop method when dates change
  useEffect(() => {
    if (submitted) validateDates(dates);
    onDatesChange(dates);
  }, [dates]);

  return (
    <Dialog id="ChartDateRangePicker" maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle divider={false} onClose={handleClose}>
        <MediumTitle>{title}</MediumTitle>
      </DialogTitle>
      <DialogContent divider minWidth="400px" p={0}>
        <Box px={3}>
          <Box mb={5}>
            <Body1 mb={2}>{t('Number of days (most recent)')}</Body1>
            <Flex id="days-chart">
              {map(presetDaysOptions, (days, i) => (
                <Button
                  mr={2}
                  variant="chip"
                  id={`days-chart-${i}`}
                  name={`days-chart-${i}`}
                  key={`days-chart-${i}`}
                  value={days}
                  selected={datesMatchPreset(dates, presetDateRanges[i])}
                  onClick={() => setDates(getLastNDays(days))}
                >
                  {days} days
                </Button>
              ))}
            </Flex>
          </Box>
          <Box mb={3}>
            <Body1 mb={2}>{t('Or select a custom date range')}</Body1>
            <DateRangePicker
              startDate={dates.startDate}
              startDateId="chart-start-date"
              endDate={dates.endDate}
              endDateId="chart-end-date"
              onDatesChange={newDates => setDates(setDateRangeToExtents(newDates))}
              isOutsideRange={day => (
                endOfToday.diff(day) < 0 ||
                (moment.isMoment(dates.endDate) && dates.endDate.diff(day, 'days') >= maxDays) ||
                (moment.isMoment(dates.startDate) && dates.startDate.diff(day, 'days') <= -maxDays)
              )}
              onFocusChange={input => setDatePickerOpen(!!input)}
              themeProps={{
                minWidth: '580px',
                minHeight: datePickerOpen ? '300px' : undefined,
              }}
            />
          </Box>
          {errors && (
            <Caption mt={2} color="feedback.danger" id="chart-dates-error">
              {errors}
            </Caption>
          )}
        </Box>
      </DialogContent>
      <DialogActions justifyContent="space-between" py={2}>
        <Button variant="textSecondary" className="chart-dates-cancel" onClick={handleClose}>
          {t('Cancel')}
        </Button>
        <Button variant="textPrimary" className="chart-dates-submit" processing={processing} onClick={handleSubmit}>
          {t('Apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ChartDateRangeModal.propTypes = {
  maxDays: PropTypes.number.isRequired,
  mostRecentDatumDate: PropTypes.number.isRequired,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  onDatesChange: PropTypes.func,
  open: PropTypes.bool,
  processing: PropTypes.bool,
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool,
    timezoneName: PropTypes.string.isRequired,
  }).isRequired,
};

ChartDateRangeModal.defaultProps = {
  maxDays: 90,
  onSubmit: noop,
  onClose: noop,
  onDatesChange: noop,
  presetDaysOptions: [14, 21, 30],
  title: t('Chart Date Range'),
};

export default ChartDateRangeModal;

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import filter from 'lodash/filter';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import noop from 'lodash/noop';
import { Flex, Box } from 'rebass/styled-components';
import { Label, Switch } from '@rebass/forms/styled-components';
import moment from 'moment-timezone';

import Accordion from './elements/Accordion';
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

export const PrintDateRangeModal = (props) => {
  const {
    maxDays,
    mostRecentDatumDates,
    onClose,
    onClickPrint,
    onDatesChange,
    open,
    processing,
    timePrefs: { timezoneName = 'UTC' },
    trackMetric,
  } = props;

  const endOfToday = useMemo(() => moment.utc().tz(timezoneName).endOf('day').subtract(1, 'ms'), [open]);

  // We want the set dates to start at the floor of the start date and the ceiling of the end date
  // to ensure we are selecting full days of data.
  const setDateRangeToExtents = ({ startDate, endDate }) => ({
    startDate: startDate ? moment.utc(startDate).tz(timezoneName).startOf('day') : null,
    endDate: endDate ? moment.utc(endDate).tz(timezoneName).endOf('day').subtract(1, 'ms') : null,
  });

  const getLastNDays = (days, chartType) => {
    const endDate = get(mostRecentDatumDates, chartType)
      ? moment.utc(mostRecentDatumDates[chartType])
      : endOfToday;

    return setDateRangeToExtents({
      startDate: moment.utc(endDate).tz(timezoneName).subtract(days - 1, 'days'),
      endDate,
    });
  };

  const basicsDaysOptions = [14, 21, 30];
  const bgLogDaysOptions = [14, 21,30];
  const dailyDaysOptions = [14, 21, 30];

  const defaultDates = () => ({
    basics: getLastNDays(basicsDaysOptions[0], 'basics'),
    bgLog: getLastNDays(bgLogDaysOptions[2], 'bgLog'),
    daily: getLastNDays(dailyDaysOptions[0], 'daily'),
  });

  const defaults = useMemo(() => ({
    datePickerOpen: false,
    dates: defaultDates(),
    enabled: {
      basics: true,
      bgLog: true,
      daily: true,
      settings: true,
    },
    errors: {
      basics: false,
      bgLog: false,
      daily: false,
    },
    expandedPanel: 'basics',
    submitted: false,
  }), [mostRecentDatumDates]);

  const [dates, setDates] = useState(defaults.dates);
  const [enabled, setEnabled] = useState(defaults.enabled);
  const [errors, setErrors] = useState(defaults.errors);
  const [expandedPanel, setExpandedPanel] = React.useState(defaults.expandedPanel);
  const [submitted, setSubmitted] = useState(defaults.submitted);
  const [datePickerOpen, setDatePickerOpen] = useState(defaults.datePickerOpen);

  const presetDateRanges = {
    basics: useMemo(() => map(basicsDaysOptions, days => getLastNDays(days, 'basics')), [open]),
    bgLog: useMemo(() => map(bgLogDaysOptions, days => getLastNDays(days, 'bgLog')), [open]),
    daily: useMemo(() => map(dailyDaysOptions, days => getLastNDays(days, 'daily')), [open]),
  };

  const datesMatchPreset = (dates, presetDates) => {
    return moment(dates.startDate).isSame(presetDates.startDate) && moment(dates.endDate).isSame(presetDates.endDate);
  };

  const validateDatesSet = dates => (!moment.isMoment(dates.startDate) || !moment.isMoment(dates.endDate)
    ? t('Please select a date range')
    : false
  );

  const validateDates = ({ basics, bgLog, daily }) => {
    const validationErrors = {
      basics: validateDatesSet(basics),
      bgLog: validateDatesSet(bgLog),
      daily: validateDatesSet(daily),
    };

    setErrors(validationErrors);
    return validationErrors;
  };

  // Accordion Panels
  const handleAccordionChange = key => (event, isExpanded) => {
    setExpandedPanel(key);
  };

  const accordionProps = (chartType, header) => ({
    label: chartType,
    key: chartType,
    expanded: expandedPanel === chartType,
    onChange: handleAccordionChange(chartType),
    themeProps: {
      wrapper: {
        width: '100%',
      },
      panel: {
        width: '100%',
        px: 5,
        pt: 1,
        pb: 3,
      },
      header: {
        width: '100%',
        color: errors[chartType] ? 'feedback.danger' : undefined,
      },
    },
    header,
  });

  const panels = [
    {
      daysOptions: basicsDaysOptions,
      header: t('Basics Chart'),
      key: 'basics',
    },
    {
      daysOptions: dailyDaysOptions,
      header: t('Daily Charts'),
      key: 'daily',
    },
    {
      daysOptions: bgLogDaysOptions,
      header: t('BG Log Chart'),
      key: 'bgLog',
    },
    {
      header: t('Device Settings'),
      key: 'settings',
    },
  ];

  const formatDateEndpoints = dates => ([
    dates.startDate.valueOf(),
    moment.utc(dates.endDate).tz(timezoneName).add(1, 'day').startOf('day').valueOf(),
  ]);

  // Handlers
  const handleSubmit = () => {
    setSubmitted(true);
    const validationErrors = validateDates(dates);
    if (!isEqual(validationErrors, defaults.errors)) return;

    const printOpts = {
      basics: { endpoints: formatDateEndpoints(dates.basics), disabled: !enabled.basics },
      bgLog: { endpoints: formatDateEndpoints(dates.bgLog), disabled: !enabled.bgLog },
      daily: { endpoints: formatDateEndpoints(dates.daily), disabled: !enabled.daily },
      settings: { disabled: !enabled.settings },
    };

    const getDateRangeMetric = (presets, chartType) => {
      const matches = filter(
        presets,
        (days, i) => datesMatchPreset(dates[chartType], presetDateRanges[chartType][i])
      );

      return get(map(matches, days => `${days} days`), [0], 'custom range');
    };

    const metrics = {
      basics: printOpts.basics.disabled ? 'disabled' : getDateRangeMetric(basicsDaysOptions, 'basics'),
      bgLog: printOpts.bgLog.disabled ? 'disabled' : getDateRangeMetric(bgLogDaysOptions, 'bgLog'),
      daily: printOpts.daily.disabled ? 'disabled' : getDateRangeMetric(dailyDaysOptions, 'daily'),
      settings: printOpts.settings.disabled ? 'disabled' : 'enabled',
    };

    trackMetric('Submitted Print Options', metrics);
    onClickPrint(printOpts);
  };

  const handleClose = () => {
    onClose();
  };

  // Set to default state when dialog is newly opened
  useEffect(() => {
    if (open) {
      setDatePickerOpen(defaults.datePickerOpen);
      setDates(defaults.dates);
      setEnabled(defaults.enabled);
      setErrors(defaults.errors);
      setExpandedPanel(defaults.expandedPanel);
      setSubmitted(defaults.submitted);
    }
  }, [open]);

  // Validate dates if submitted and call `onDatesChange` prop method when dates change
  useEffect(() => {
    if (submitted) validateDates(dates);
    onDatesChange(dates);
  }, [dates]);

  return (
    <Dialog id="printDateRangePicker" maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle divider={false} onClose={handleClose}>
        <MediumTitle>{t('Print Report')}</MediumTitle>
      </DialogTitle>
      <DialogContent divider={false} minWidth="400px" p={0}>
        {map(panels, panel => (
          <Accordion {...accordionProps(panel.key, panel.header)}>
            <Box width="100%">
              <Flex mb={4}>
                <Label htmlFor={`enabled-${panel.key}`}>
                  <Body1 alignSelf="center">Include {panel.header}</Body1>
                  <Switch
                    name={`enabled-${panel.key}`}
                    ml={4}
                    checked={enabled[panel.key]}
                    onClick={() => setEnabled({ ...enabled, [panel.key]: !enabled[panel.key] })}
                  />
                </Label>
              </Flex>

              {enabled[panel.key] && panel.daysOptions && (
                <Box>
                  <Box mb={5}>
                    <Body1 mb={2}>{t('Number of days (most recent)')}</Body1>
                    <Flex id={`days-${panel.key}`}>
                      {map(panel.daysOptions, (days, i) => (
                        <Button
                          mr={2}
                          variant="chip"
                          id={`days-${panel.key}-${i}`}
                          name={`days-${panel.key}-${i}`}
                          key={`days-${panel.key}-${i}`}
                          value={days}
                          selected={datesMatchPreset(dates[panel.key], presetDateRanges[panel.key][i])}
                          onClick={() => setDates({ ...dates, [panel.key]: getLastNDays(days, panel.key) })}
                        >
                          {days} days
                        </Button>
                      ))}
                    </Flex>
                  </Box>
                  <Box mb={3}>
                    <Body1 mb={2}>{t('Or select a custom date range ({{maxDays}} days max)', { maxDays })}</Body1>
                    <DateRangePicker
                      startDate={dates[panel.key].startDate}
                      startDateId={`${[panel.key]}-start-date`}
                      endDate={dates[panel.key].endDate}
                      endDateId={`${[panel.key]}-end-date`}
                      onDatesChange={newDates => setDates({ ...dates, [panel.key]: setDateRangeToExtents(newDates) })}
                      isOutsideRange={day => (
                        endOfToday.diff(day) < 0 ||
                        (moment.isMoment(dates[panel.key].endDate) && dates[panel.key].endDate.diff(day, 'days') >= maxDays) ||
                        (moment.isMoment(dates[panel.key].startDate) && dates[panel.key].startDate.diff(day, 'days') <= -maxDays)
                      )}
                      onFocusChange={input => setDatePickerOpen(!!input)}
                      themeProps={{
                        minWidth: '580px',
                        minHeight: datePickerOpen ? '300px' : undefined,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
            {errors[panel.key] && (
              <Caption mt={2} color="feedback.danger" id={`${panel.key}-error`}>
                {errors[panel.key]}
              </Caption>
            )}
          </Accordion>
        ))}
      </DialogContent>
      <DialogActions justifyContent="space-between" py={2}>
        <Button variant="textSecondary" className="print-cancel" onClick={handleClose}>
          {t('Cancel')}
        </Button>
        <Button variant="textPrimary" className="print-submit" processing={processing} onClick={handleSubmit}>
          {t('Print')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PrintDateRangeModal.propTypes = {
  maxDays: PropTypes.number.isRequired,
  mostRecentDatumDates: PropTypes.shape({
    basics: PropTypes.number.isRequired,
    bgLog: PropTypes.number.isRequired,
    daily: PropTypes.number.isRequired,
  }),
  onClickPrint: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDatesChange: PropTypes.func.isRequired,
  open: PropTypes.bool,
  processing: PropTypes.bool,
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool,
    timezoneName: PropTypes.string.isRequired,
  }).isRequired,
  trackMetric: PropTypes.func.isRequired,
};

PrintDateRangeModal.defaultProps = {
  maxDays: 90,
  onClickPrint: noop,
  onClose: noop,
  onDatesChange: noop,
  trackMetric: noop,
};

export default PrintDateRangeModal;

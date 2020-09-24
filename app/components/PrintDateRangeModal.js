import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
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

export const PrintDateRangeModal = (props) => {
  const {
    mostRecentDatumDates,
    onClose,
    onClickPrint,
    onDatesChange,
    open,
    timePrefs: { timezoneName = 'UTC' },
  } = props;

  const endOfToday = useMemo(() => moment().tz(timezoneName).endOf('day').subtract(1, 'ms'), [open]);

  // We want the set dates to start at the floor of the start date and the ceiling of the end date
  // to ensure we are selecting full days of data.
  const setDateRangeToExtents = ({ startDate, endDate }) => ({
    startDate: startDate ? moment(startDate).tz(timezoneName).startOf('day') : null,
    endDate: endDate ? moment(endDate).tz(timezoneName).endOf('day').subtract(1, 'ms') : null,
  });

  const getLastNDays = (days, chartType) => {
    const endDate = get(mostRecentDatumDates, chartType)
      ? moment.utc(mostRecentDatumDates[chartType])
      : endOfToday;

    return setDateRangeToExtents({
      startDate: moment(endDate).tz(timezoneName).subtract(days - 1, 'days'),
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

  const validateDates = ({ basics, bgLog, daily }) => {
    const validationErrors = {
      basics: !moment.isMoment(basics.startDate) || !moment.isMoment(basics.endDate),
      bgLog: !moment.isMoment(bgLog.startDate) || !moment.isMoment(bgLog.endDate),
      daily: !moment.isMoment(daily.startDate) || !moment.isMoment(daily.endDate),
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
      header: 'Basics Chart',
      key: 'basics',
    },
    {
      daysOptions: dailyDaysOptions,
      header: 'Daily Charts',
      key: 'daily',
    },
    {
      daysOptions: bgLogDaysOptions,
      header: 'BG Log Chart',
      key: 'bgLog',
    },
    {
      header: 'Device Settings',
      key: 'settings',
    },
  ];

  // Handlers
  const handleSubmit = () => {
    setSubmitted(true);
    const validationErrors = validateDates(dates);
    if (!isEqual(validationErrors, defaults.errors)) return;

    onClickPrint({
      basics: { ...mapValues(dates.basics, d => d.valueOf()), enabled: enabled.basics },
      bgLog: { ...mapValues(dates.bgLog, d => d.valueOf()), enabled: enabled.bgLog },
      daily: { ...mapValues(dates.daily, d => d.valueOf()), enabled: enabled.daily },
      settings: { enabled: enabled.settings },
    });
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
        <MediumTitle>Print Report</MediumTitle>
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
                    <Body1 mb={2}>Number of days (most recent)</Body1>
                    <Flex>
                      {map(panel.daysOptions, (days, i) => (
                        <Button
                          mr={2}
                          variant="chip"
                          id={`days-${panel.key}`}
                          name={`days-${panel.key}`}
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
                    <Body1 mb={2}>Or select a custom date range</Body1>
                    <DateRangePicker
                      startDate={dates[panel.key].startDate}
                      startDateId={`${[panel.key]}-start-date`}
                      endDate={dates[panel.key].endDate}
                      endDateId={`${[panel.key]}-end-date`}
                      onDatesChange={newDates => setDates({ ...dates, [panel.key]: setDateRangeToExtents(newDates) })}
                      isOutsideRange={day => (endOfToday.diff(day) < 0)}
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
              <Caption mt={2} color="feedback.danger">
                Please select a date range
              </Caption>
            )}
          </Accordion>
        ))}
      </DialogContent>
      <DialogActions justifyContent="space-between" py={2}>
        <Button variant="textSecondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="textPrimary" onClick={handleSubmit}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PrintDateRangeModal.propTypes = {
  mostRecentDatumDates: PropTypes.shape({
    basics: PropTypes.number.isRequired,
    bgLog: PropTypes.number.isRequired,
    daily: PropTypes.number.isRequired,
  }),
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

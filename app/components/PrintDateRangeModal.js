import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
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

export const PrintDateRangeModal = (props) => {
  const {
    mostRecentDatumDates,
    onClose,
    onClickPrint,
    onDatesChange,
    open,
    errors,
    timePrefs: { timezoneName },
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
      endDate: endDate,
    });
  };

  const basicsDaysOptions = [7,14,21];
  const [basicsEnabled, setBasicsEnabled] = useState(true);
  const [basicsDays, setBasicsDays] = useState(basicsDaysOptions[2]);

  const bgLogDaysOptions = [7,14,21,30];
  const [bgLogEnabled, setBgLogEnabled] = useState(true);
  const [bgLogDays, setBgLogDays] = useState(bgLogDaysOptions[3]);

  const dailyDaysOptions = [7,14,21];
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [dailyDays, setDailyDays] = useState(dailyDaysOptions[0]);

  const [deviceSettingsEnabled, setDeviceSettingsEnabled] = useState(true);

  const presetDateRanges = {
    basics: useMemo(() => map(basicsDaysOptions, days => getLastNDays(days, 'basics')), [open]),
    bgLog: useMemo(() => map(bgLogDaysOptions, days => getLastNDays(days, 'bgLog')), [open]),
    daily: useMemo(() => map(dailyDaysOptions, days => getLastNDays(days, 'daily')), [open]),
  };

  const [dates, setDates] = useState({
    basics: getLastNDays(basicsDays, 'basics'),
    bgLog: getLastNDays(bgLogDays, 'bgLog'),
    daily: getLastNDays(dailyDays, 'daily'),
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    onDatesChange(dates);
  }, [dates]);

  const datesMatchPreset = (dates, presetDates) => {
    return moment(dates.startDate).isSame(presetDates.startDate) && moment(dates.endDate).isSame(presetDates.endDate);
  };

  // Accordion Panels
  const [expandedPanel, setExpandedPanel] = React.useState('basics');

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
      days: basicsDays,
      daysOptions: basicsDaysOptions,
      enabled: basicsEnabled,
      error: errors.basics,
      header: 'Basics Chart',
      key: 'basics',
      setDays: setBasicsDays,
      setEnabled: setBasicsEnabled,
    },
    {
      days: dailyDays,
      daysOptions: dailyDaysOptions,
      enabled: dailyEnabled,
      error: errors.daily,
      header: 'Daily Charts',
      key: 'daily',
      setDays: setDailyDays,
      setEnabled: setDailyEnabled,
    },
    {
      days: bgLogDays,
      daysOptions: bgLogDaysOptions,
      enabled: bgLogEnabled,
      error: errors.bgLog,
      header: 'BG Log Chart',
      key: 'bgLog',
      setDays: setBgLogDays,
      setEnabled: setBgLogEnabled,
    },
    {
      enabled: deviceSettingsEnabled,
      header: 'Device Settings',
      key: 'deviceSettings',
      setEnabled: setDeviceSettingsEnabled,
    },
  ];

  return (
    <Dialog id="printDateRangePicker" maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle divider={false} onClose={onClose}>
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
                    checked={panel.enabled}
                    onClick={() => panel.setEnabled(enabled => !enabled)}
                  />
                </Label>
              </Flex>

              {panel.enabled && panel.days && (
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
            {panel.error && (
              <Caption mt={2} color="feedback.danger">
                Please select a date range
              </Caption>
            )}
          </Accordion>
        ))}
      </DialogContent>
      <DialogActions justifyContent="space-between" py={2}>
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
  errors: PropTypes.shape({
    basics: PropTypes.bool,
    bgLog: PropTypes.bool,
    daily: PropTypes.bool,
  }),
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

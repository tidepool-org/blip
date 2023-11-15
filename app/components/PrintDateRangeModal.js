import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import filter from 'lodash/filter';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import noop from 'lodash/noop';
import { Flex, Box, Text } from 'theme-ui';
import { Switch } from 'theme-ui';
import moment from 'moment-timezone';
import { Element, scroller } from 'react-scroll';

import Button from './elements/Button';
import DateRangePicker from './elements/DateRangePicker';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from './elements/Dialog';
import { MediumTitle, Caption, Body0 } from './elements/FontStyles';
import i18next from '../core/language';
import baseTheme, { borders } from '../themes/baseTheme';
import { useLocalStorage } from '../core/hooks';

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
    loggedInUserId,
  } = props;

  const enabledChartsLocalKey = `${loggedInUserId}_PDFChartsEnabled`;
  const defaultRangesLocalKey = `${loggedInUserId}_PDFChartsSelectedRangeIndices`;

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

  const presetDaysOptions = {
    agpBGM: [14, 30],
    agpCGM: [7, 14],
    basics: [14, 21, 30, 90],
    bgLog: [14, 21, 30, 90],
    daily: [14, 21, 30, 90],
  };

  const [rangePresets, setRangePresets] = useLocalStorage(defaultRangesLocalKey, {
    agpBGM: 1,
    agpCGM: 1,
    basics: 0,
    bgLog: 2,
    daily: 0,
  });

  const defaultDates = () => ({
    agpBGM: getLastNDays(presetDaysOptions.agpBGM[rangePresets.agpBGM], 'agpBGM'),
    agpCGM: getLastNDays(presetDaysOptions.agpCGM[rangePresets.agpCGM], 'agpCGM'),
    basics: getLastNDays(presetDaysOptions.basics[rangePresets.basics], 'basics'),
    bgLog: getLastNDays(presetDaysOptions.bgLog[rangePresets.bgLog], 'bgLog'),
    daily: getLastNDays(presetDaysOptions.daily[rangePresets.daily], 'daily'),
  });

  const defaults = useMemo(() => ({
    datePickerOpen: {
      agpBGM: false,
      agpCGM: false,
      basics: false,
      bgLog: false,
      daily: false,
    },
    dates: defaultDates(),
    enabled: {
      agpBGM: true,
      agpCGM: true,
      basics: true,
      bgLog: true,
      daily: true,
      settings: true,
    },
    errors: {
      agpBGM: false,
      agpCGM: false,
      basics: false,
      bgLog: false,
      daily: false,
      general: false,
    },
    expandedPanel: 'basics',
    submitted: false,
  }), [mostRecentDatumDates]);

  const [dates, setDates] = useState(defaults.dates);
  const [enabled, setEnabled] = useLocalStorage(enabledChartsLocalKey, defaults.enabled, true);
  const [errors, setErrors] = useState(defaults.errors);
  const [submitted, setSubmitted] = useState(defaults.submitted);
  const [datePickerOpen, setDatePickerOpen] = useState(defaults.datePickerOpen);

  const presetDateRanges = {
    agpBGM: useMemo(() => map(presetDaysOptions.agpBGM, days => getLastNDays(days, 'agpBGM')), [open]),
    agpCGM: useMemo(() => map(presetDaysOptions.agpCGM, days => getLastNDays(days, 'agpCGM')), [open]),
    basics: useMemo(() => map(presetDaysOptions.basics, days => getLastNDays(days, 'basics')), [open]),
    bgLog: useMemo(() => map(presetDaysOptions.bgLog, days => getLastNDays(days, 'bgLog')), [open]),
    daily: useMemo(() => map(presetDaysOptions.daily, days => getLastNDays(days, 'daily')), [open]),
  };

  const datesMatchPreset = (dates, presetDates) => {
    return moment(dates.startDate).isSame(presetDates.startDate) && moment(dates.endDate).isSame(presetDates.endDate);
  };

  const validateDatesSet = dates => (!moment.isMoment(dates.startDate) || !moment.isMoment(dates.endDate)
    ? t('Please select a date range')
    : false
  );

  const validateDates = ({ agpBGM, agpCGM, basics, bgLog, daily }) => {
    const validationErrors = {
      agpBGM: enabled.agpBGM && validateDatesSet(agpBGM),
      agpCGM: enabled.agpCGM && validateDatesSet(agpCGM),
      basics: enabled.basics && validateDatesSet(basics),
      bgLog: enabled.bgLog && validateDatesSet(bgLog),
      daily: enabled.daily && validateDatesSet(daily),
    };

    return validationErrors;
  };

  const validateChartEnabled = () => {
    const validationErrors = {
      general: (!enabled.agpBGM && !enabled.agpCGM && !enabled.basics && !enabled.bgLog && !enabled.daily && !enabled.settings)
        ? t('Please enable at least one chart to print')
        : false,
    };

    return validationErrors;
  }

  // Panels
  const panels = [
    {
      daysOptions: presetDaysOptions.agpCGM,
      header: t('AGP Report (CGM)'),
      key: 'agpCGM',
    },
    {
      daysOptions: presetDaysOptions.agpBGM,
      header: t('AGP Report (BGM)'),
      key: 'agpBGM',
    },
    {
      daysOptions: presetDaysOptions.basics,
      header: t('Basics Chart'),
      key: 'basics',
    },
    {
      daysOptions: presetDaysOptions.daily,
      header: t('Daily Charts'),
      key: 'daily',
    },
    {
      daysOptions: presetDaysOptions.bgLog,
      header: t('BG Log Chart'),
      key: 'bgLog',
    },
    {
      header: t('Device Settings'),
      key: 'settings',
    },
  ];

  const formatDateEndpoints = ({ startDate, endDate }) => (startDate && endDate ? [
    startDate.valueOf(),
    moment.utc(endDate).tz(timezoneName).add(1, 'day').startOf('day').valueOf(),
  ] : []);

  // Handlers
  const handleClickPreset = (key, days, presetIndex) => {
    setDates({ ...dates, [key]: getLastNDays(days, key) });
    setRangePresets({ ...rangePresets, [key]: presetIndex })
  };

  const handleSubmit = () => {
    setSubmitted(true);

    const validationErrors = {
      ...validateDates(dates),
      ...validateChartEnabled(),
    };

    setErrors(validationErrors);

    if (!isEqual(validationErrors, defaults.errors)) return;

    const printOpts = {
      agpBGM: { endpoints: formatDateEndpoints(dates.agpBGM), disabled: !enabled.agpBGM },
      agpCGM: { endpoints: formatDateEndpoints(dates.agpCGM), disabled: !enabled.agpCGM },
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
      agpBGM: printOpts.agpBGM.disabled ? 'disabled' : getDateRangeMetric(presetDaysOptions.agpBGM, 'agpBGM'),
      agpCGM: printOpts.agpCGM.disabled ? 'disabled' : getDateRangeMetric(presetDaysOptions.agpCGM, 'agpCGM'),
      basics: printOpts.basics.disabled ? 'disabled' : getDateRangeMetric(presetDaysOptions.basics, 'basics'),
      bgLog: printOpts.bgLog.disabled ? 'disabled' : getDateRangeMetric(presetDaysOptions.bgLog, 'bgLog'),
      daily: printOpts.daily.disabled ? 'disabled' : getDateRangeMetric(presetDaysOptions.daily, 'daily'),
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
      setErrors(defaults.errors);
      setSubmitted(defaults.submitted);
    }
  }, [open]);

  // Call `onDatesChange` prop method when dates change
  useEffect(() => {
    onDatesChange(dates);
  }, [dates]);

  // Validate dates and enabled statuses if submitted
  useEffect(() => {
    if (submitted) setErrors({ ...validateDates(dates), ...validateChartEnabled()});
  }, [enabled, dates]);

  return (
    <Dialog id="printDateRangePicker" PaperProps={{ id: 'printDateRangePickerInner'}} maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle divider={false} onClose={handleClose}>
        <MediumTitle>{t('Print Report')}</MediumTitle>
      </DialogTitle>
      <DialogContent divider={false} sx={{minWidth: '643px' }} py={0} px={3}>
        {map(panels, panel => (
          <Element name={`${panel.key}-wrapper`}>
            <Box
              key={panel.key}
              variant="containers.fluidBordered"
              sx={{
                bg: 'white',
                color: 'text.primary',
              }}
              p={3}
              mb={3}
            >
              <Flex
                id={`${panel.key}-header`}
                mb={enabled[panel.key] && panel.daysOptions ? 2 : 0}
                pb={enabled[panel.key] && panel.daysOptions ? 3 : 0}
                sx={{
                  borderBottom: enabled[panel.key] && panel.daysOptions ? borders.input : 'none',
                  justifyContent: 'space-between',
                }}
              >
                <Text as={Box} sx={{ alignSelf: 'center', fontSize: 1, fontWeight: 'bold' }}>{panel.header}</Text>
                <Box>
                  <Switch
                    theme={baseTheme}
                    name={`enabled-${panel.key}`}
                    ml={4}
                    checked={enabled[panel.key]}
                    onClick={() => setEnabled({ ...enabled, [panel.key]: !enabled[panel.key] })}
                  />
                </Box>
              </Flex>

              {enabled[panel.key] && panel.daysOptions && (
                <Box id={`${panel.key}-content`}>
                  <Box mb={3}>
                    <Body0 mb={2}>{t('Number of days (most recent)')}</Body0>

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
                          onClick={() => handleClickPreset(panel.key, days, i)}
                        >
                          {days} days
                        </Button>
                      ))}
                    </Flex>
                  </Box>

                  <Box>
                    <Body0 mb={2}>{t('Or select a custom date range ({{maxDays}} days max)', { maxDays })}</Body0>

                    <DateRangePicker
                      key={`date-range-picker-${panel.key}`}
                      startDate={dates[panel.key].startDate}
                      startDateId={`${[panel.key]}-start-date`}
                      endDate={dates[panel.key].endDate}
                      endDateId={`${[panel.key]}-end-date`}
                      onDatesChange={newDates => setDates({ ...dates, [panel.key]: setDateRangeToExtents(newDates) })}
                      isOutsideRange={day => (
                        moment.utc(mostRecentDatumDates[panel.key]).tz(timezoneName).endOf('day').subtract(1, 'ms').diff(day) < 0 ||
                        endOfToday.diff(day) < 0 ||
                        (moment.isMoment(dates[panel.key].endDate) && dates[panel.key].endDate.diff(day, 'days') >= maxDays) ||
                        (moment.isMoment(dates[panel.key].startDate) && dates[panel.key].startDate.diff(day, 'days') <= -maxDays)
                      )}
                      onFocusChange={input => {
                        setDatePickerOpen({ ...datePickerOpen, [panel.key]: !!input });
                        if (input) scroller.scrollTo(`${panel.key}-wrapper`, {
                          delay: 0,
                          containerId: 'printDateRangePickerInner',
                          duration: 250,
                          smooth: true,
                        });
                      }}
                      themeProps={{
                        sx: { minHeight: datePickerOpen[panel.key] ? '310px' : undefined },
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
            {errors[panel.key] && (
              <Caption mt={2} sx={{ color: 'feedback.danger' }} id={`${panel.key}-error`}>
                {errors[panel.key]}
              </Caption>
            )}
          </Element>
        ))}
        {errors.general && (
          <Caption mx={5} mt={2} sx={{ color: 'feedback.danger' }} id="general-print-error">
            {errors.general}
          </Caption>
        )}
      </DialogContent>
      <DialogActions
        mt={3}
        py="12px"
        sx={{
          borderTop: borders.default,
          justifyContent: 'space-between',
        }}
      >
        <Button variant="textSecondary" className="print-cancel" onClick={handleClose}>
          {t('Cancel')}
        </Button>
        <Button variant="primary" className="print-submit" disabled={!isEqual(errors, defaults.errors)} processing={processing} onClick={handleSubmit}>
          {t('Print')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PrintDateRangeModal.propTypes = {
  maxDays: PropTypes.number.isRequired,
  mostRecentDatumDates: PropTypes.shape({
    agpBGM: PropTypes.number,
    agpCGM: PropTypes.number,
    basics: PropTypes.number,
    bgLog: PropTypes.number,
    daily: PropTypes.number,
  }),
  onClickPrint: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDatesChange: PropTypes.func.isRequired,
  open: PropTypes.bool,
  processing: PropTypes.bool,
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool,
    timezoneName: PropTypes.string,
  }),
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

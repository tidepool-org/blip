import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import bows from 'bows';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import map from 'lodash/map';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { useFormik } from 'formik';
import moment from 'moment-timezone';
import { Box, BoxProps } from 'theme-ui';
import { Element, scroller } from 'react-scroll';

import { useLocalStorage } from '../../core/hooks';
import { addEmptyOption, getCommonFormikFieldProps } from '../../core/forms';
import { rpmReportConfigSchema, timezoneOptions, dateRegex } from '../../core/clinicUtils';
import { Body0 } from '../../components/elements/FontStyles';
import Select from '../elements/Select';
import DateRangePicker from '../elements/DateRangePicker';
import { async, sync } from '../../redux/actions';
import i18next from '../../core/language';

const t = i18next.t.bind(i18next);
const log = bows('RpmReportConfigForm');

export const exportRpmReport = ({ config, results }) => {
  let { startDate = '', endDate = '' } = config?.rawConfig || {};
  startDate = startDate.replace(dateRegex, '$2/$3/$1');
  endDate = endDate.replace(dateRegex, '$2/$3/$1');

  const csvRows = [
    [
      t('Name'),
      t('Date of Birth'),
      t('MRN'),
      t('# Days With Qualifying Data between {{startDate}} and {{endDate}}', { startDate, endDate }),
      t('Sufficient Data for {{code}}', { code: config?.code }),
    ],
  ];

  function csvEscape(val) {
    if (typeof val === 'string') {
      return `"${val.replace(/"/g, '""')}"`;
    } else if (isNull(val)) {
      return t('N/A');
    }
    return val;
  };

  results.forEach(patient => {
    const { fullName, birthDate, mrn, realtimeDays, hasSufficientData } = patient;

    csvRows.push([
      csvEscape(fullName),
      isNull(birthDate) ? t('N/A') : csvEscape(birthDate.replace(dateRegex, '$2/$3/$1')),
      csvEscape(mrn),
      csvEscape(realtimeDays),
      hasSufficientData ? t('TRUE') : t('FALSE'),
    ]);
  });

  const csv = csvRows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadFileName = `RPM Report (${startDate.replaceAll('/', '-')} - ${endDate.replaceAll('/', '-')}).csv`;

  const a = document.createElement('a');
  a.href = url;
  a.download = downloadFileName;
  a.click();
};

export const RpmReportConfigForm = props => {
  const { t, api, onFormChange, open, patientFetchOptions, trackMetric, ...boxProps } = props;
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const [config, setConfig] = useLocalStorage('rpmReportConfig', {});
  const [focusedDatePickerInput, setFocusedDatePickerInput] = useState();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const localConfigKey = [loggedInUserId, selectedClinicId].join('|');
  const dateFormat = 'YYYY-MM-DD'
  const maxDays = 30;
  const maxDaysInPast = 59;
  const browserTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [utcDayShift, setUtcDayShift] = useState(0);
  const today = moment.utc().startOf('day');

  function setMomentToUTC() {
    log('Setting moment to default to UTC timezone');
    moment.tz.setDefault('UTC');
  }

  function setMomentToLocal() {
    log('Setting moment back to default local timezone of', browserTimezone)
    moment.tz.setDefault();
  }

  const defaultDates = () => {
    return {
      startDate: moment.utc(today).subtract(maxDays - 1, 'days').add(utcDayShift, 'days'),
      endDate: moment.utc(today).add(utcDayShift, 'days'),
    };
  }

  function defaultFormValues(config) {
    const { startDate, endDate } = defaultDates();
    let fallbackTimezone = clinic?.timezone || browserTimezone;
    if (!includes(map(timezoneOptions, 'value'), fallbackTimezone)) fallbackTimezone = '';

    return {
      startDate: startDate.format(dateFormat),
      endDate: endDate.format(dateFormat),
      timezone: includes(map(timezoneOptions, 'value'), config?.timezone) ? config.timezone : fallbackTimezone,
    };
  }

  const formikContext = useFormik({
    initialValues: defaultFormValues(config?.[localConfigKey]),
    onSubmit: values => {
      // We construct the dates and add the timezone offset manually in order to
      // provide a utc datetime in the expected backend format without any unexpected shifting
      // of calendar dates due to timezone conversion
      const start = [
        moment.utc(values.startDate).format(dateFormat),
        'T00:00:00.000',
        moment.utc(values.startDate).tz(values.timezone).startOf('day').toISOString(true).slice(-6),
      ];

      const end = [
        moment.utc(values.endDate).format(dateFormat),
        'T23:59:59.999',
        moment.utc(values.endDate).tz(values.timezone).endOf('day').toISOString(true).slice(-6),
      ];

      const queryOptions = {
        rawConfig: values,
        startDate: start.join(''),
        endDate: end.join(''),

        // Set any currently applied patient filters so that RPM report patient list matches current view
        patientFilters: omit(patientFetchOptions, [
          'offset',
          'sort',
          'sortType',
          'limit',
        ]),
      };

      if (isEmpty(queryOptions.patientFilters.search)) {
        delete queryOptions.patientFilters.search;
      }

      dispatch(async.fetchRpmReportPatients(api, selectedClinicId, queryOptions));

      // Persist selected timezone in localStorage
      setConfig({
        ...config,
        [localConfigKey]: pick(values, ['timezone']),
      });
    },
    validationSchema: rpmReportConfigSchema(utcDayShift),
  });

  const {
    errors,
    setFieldValue,
    values,
    setValues,
    validateForm,
  } = formikContext;

  // Set to default state when dialog is newly opened
  useEffect(() => {
    if (open) {
      // Set global moment to use UTC timezone when config modal opens. This is required for our
      // use within this form, since React-dates (used for our datepicker components) does not allow
      // overriding the default moment-provided timezone, and we need to work with UTC dates for
      // consistent behaviour across various timezones
      setMomentToUTC();
      setValues(defaultFormValues(config?.[localConfigKey]), true)
      dispatch(sync.clearRpmReportPatients());
    } else {
      // Reset global moment to use local/browser timezone when config modal closes
      setMomentToLocal();
    }
  }, [open]);

  useEffect(() => {
    if (!isEmpty(values.timezone)) {
      let newUtcDayShift;
      const utcNow = moment.utc().tz('UTC');
      const timezoneNow = moment.utc().tz(values.timezone);

      // If the current calendar date for the selected timezone has shifted to the next day ahead of
      // UTC, or UTC has shifted ahead for time zones on the other side of UTC, we need to track
      // the day shift so that we can apply it to calendar date availabilty and validation logic
      if (utcNow.dayOfYear() === timezoneNow.dayOfYear()) {
        // no date shift needed on available calendar dates
        newUtcDayShift = 0;
      } else if (utcNow.year() === timezoneNow.year()) {
        // same calendar year, so we shift a day in the appropriate direction
        newUtcDayShift = timezoneNow.dayOfYear() > utcNow.dayOfYear() ? 1 : -1;
      } else {
        // rolled over into new year, so we shift a day in the appropriate direction
        newUtcDayShift = timezoneNow.year() > utcNow.year() ? 1 : -1;
      }

      if (utcDayShift !== newUtcDayShift) {
        log('utc day shift changed from', utcDayShift, 'to', newUtcDayShift);
        setUtcDayShift(newUtcDayShift);
      }
    }
  }, [values.timezone]);

  useEffect(() => {
    validateForm();
    onFormChange(formikContext, utcDayShift);
  }, [values, utcDayShift]);

  useEffect(() => {
    return () => {
      // Reset global moment to use local/browser timezone when unmounting
      setMomentToLocal();
    };
  }, []);

  function setDates(dates) {
    setFieldValue('startDate', moment.isMoment(dates.startDate) ? moment.utc(dates.startDate).format(dateFormat) : '');
    setFieldValue('endDate', moment.isMoment(dates.endDate) ? moment.utc(dates.endDate).format(dateFormat) : '');
  }

  return (
    <Box
      as="form"
      id="rpm-report-config-form"
      {...boxProps}
    >
      <Element name="form-wrapper">
        <Box id='rpm-report-range-select' mb={3}>
          <Body0 sx={{ fontWeight: 'medium' }} mb={2}>{t('Set the start date ({{maxDays}} days max)', { maxDays })}</Body0>
          <Body0 sx={{ fontStyle: 'italic' }} mb={2}>{t('By default, this range is {{maxDays}} days. Adjust the end date to shorten the range. The start date is limited to {{maxDaysInPast}} days prior to today.', { maxDays, maxDaysInPast })}</Body0>

          <DateRangePicker
            startDate={values.startDate ? moment.utc(values.startDate) : null}
            startDateId="rpm-report-start-date"
            startDateOffset={(!values.startDate && focusedDatePickerInput === 'endDate')
              ? day => moment.max([
                moment.utc(today).subtract(maxDaysInPast - 1, 'days').add(utcDayShift, 'days'),
                moment.utc(day).subtract(maxDays - 1, 'days'),
              ])
              : undefined
            }
            endDate={values.endDate ? moment.utc(values.endDate) : null}
            endDateId="rpm-report-end-date"
            endDateOffset={(focusedDatePickerInput === 'startDate')
              ? day => moment.min([
                moment.utc(today).add(utcDayShift, 'days'),
                moment.utc(day).add(maxDays - 1, 'days'),
              ])
              : undefined
            }
            errors={errors}
            onDatesChange={newDates => setDates(newDates)}
            maxDate={moment.utc(today).add(utcDayShift, 'days')}
            minDate={moment.utc(today).add(utcDayShift, 'days').subtract(maxDaysInPast, 'days')}
            isDayBlocked={day => {
              const daysFromToday = moment.utc(today).endOf('day').add(utcDayShift, 'days').diff(moment.utc(day), 'days', true);

              // By default block all future dates, and all days prior to 59 days ago
              let dayIsBlocked = daysFromToday < 0 || daysFromToday >= maxDaysInPast;

              // If adjusting the end date, block out all dates 30 days or more beyond, and all dates prior to, the start date
              if (!dayIsBlocked && values.startDate && focusedDatePickerInput === 'endDate') {
                const daysFromStartDate = day.diff(values.startDate, 'days');
                dayIsBlocked = daysFromStartDate > maxDays - 1 || daysFromStartDate < 0;
              }

              return dayIsBlocked;
            }}
            initialVisibleMonth={() => moment.utc().subtract(1, 'month')}
            onFocusChange={input => {
              setFocusedDatePickerInput(input);
              setDatePickerOpen(!!input);

              if (input) scroller.scrollTo('form-wrapper', {
                delay: 0,
                containerId: 'rpmReportConfigInner',
                duration: 250,
                smooth: true,
              });
            }}
            themeProps={{
              sx: {
                '.DateRangePicker': { width: '100%' },
                '.DateRangePickerInput': { width: '100%' },
                minHeight: datePickerOpen ? '310px' : undefined,
              }
            }}
          />
        </Box>
      </Element>

      <Box id='rpm-report-timezone-select' mb={3}>
        <Body0 sx={{ fontWeight: 'medium' }} mb={2}>{t('Confirm your clinic\'s timezone')}</Body0>

        <Select
          {...getCommonFormikFieldProps('timezone', formikContext)}
          options={addEmptyOption(timezoneOptions, 'Please select a timezone')}
          variant="condensed"
          themeProps={{
            width: '100%',
          }}
        />
      </Box>

      <Body0>{t('Please note that this report will include all patients currently shown in the patient list. It will be downloaded as a .csv file. This report contains information supporting the data sufficiency component of RPM reimbursement, but does not represent other information necessary to support billing (including patient consent, medical necessity, etc.). Please consult your billing specialist.')}</Body0>
    </Box>
  );
};

RpmReportConfigForm.propTypes = {
  ...BoxProps,
  api: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  open: PropTypes.bool,
  patientFetchOptions: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(RpmReportConfigForm);

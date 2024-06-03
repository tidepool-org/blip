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
import { rpmReportConfigSchema as validationSchema, timezoneOptions, dateRegex } from '../../core/clinicUtils';
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

  // React-dates automatically assumes the local browser time zone when dealing with dates.
  // We want to grab only the YYYY-MM-DD portion, and construct a UTC date with it.
  // This avoids several complications, such as DST handling while disabling out-of-range dates.
  // Upon form submission, we then express the date range in the time zone requested by the user.
  const getCalendarDate = (date, timezone = 'UTC') => moment.utc(
    moment.utc(date).tz(timezone).format(dateFormat).split('-').map(
      // Month in date constructor array is zero-indexed, so needs to be decremented by 1
      (part, i) => i === 1 ? parseInt(part) - 1 : parseInt(part)
    )
  );

  const today = getCalendarDate();

  const defaultDates = () => {
    return {
      startDate: moment.utc(today).subtract(maxDays - 1, 'days'),
      endDate: moment.utc(today),
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
        getCalendarDate(values.startDate).format(dateFormat),
        'T00:00:00.000',
        moment(values.startDate).tz(values.timezone).startOf('day').toISOString(true).slice(-6),
      ];

      const end = [
        getCalendarDate(values.endDate).format(dateFormat),
        'T23:59:59.999',
        moment(values.endDate).tz(values.timezone).endOf('day').toISOString(true).slice(-6),
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
    validationSchema,
  });

  const {
    errors,
    setFieldValue,
    values,
    setValues,
    validateForm
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
    validateForm();
    onFormChange(formikContext);
  }, [values]);

  useEffect(() => {
    return () => {
      // Reset global moment to use local/browser timezone when unmounting
      setMomentToLocal();
    };
  }, []);

  function setMomentToUTC() {
    log('Setting moment to default to UTC timezone');
    moment.tz.setDefault('UTC');
  }

  function setMomentToLocal() {
    log('Setting moment back to default local timezone of', browserTimezone)
    moment.tz.setDefault();
  }

  function setDates(dates) {
    setFieldValue('startDate', moment.isMoment(dates.startDate) ? moment(dates.startDate).format(dateFormat) : '');
    setFieldValue('endDate', moment.isMoment(dates.endDate) ? moment(dates.endDate).format(dateFormat) : '');
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
                moment.utc(today).subtract(maxDaysInPast - 1, 'days'),
                moment.utc(getCalendarDate(day)).subtract(maxDays - 1, 'days'),
              ]).subtract(moment().utcOffset()) // we need to subtract the UTC offset here to match the internal calendar date handling in the react-dates component
              : undefined
            }
            endDate={values.endDate ? moment.utc(values.endDate) : null}
            endDateId="rpm-report-end-date"
            endDateOffset={(focusedDatePickerInput === 'startDate')
              ? day => moment.min([
                moment.utc(today),
                moment.utc(getCalendarDate(day)).add(maxDays - 1, 'days'),
              ]).subtract(moment().utcOffset()) // we need to subtract the UTC offset here to match the internal calendar date handling in the react-dates component
              : undefined
            }
            errors={errors}
            onDatesChange={newDates => setDates(newDates)}
            maxDate={moment(today)}
            minDate={moment(today).subtract(maxDaysInPast, 'days')}
            isDayBlocked={day => {
              const daysFromToday = today.diff(getCalendarDate(day), 'days');

              // By default block all future dates, and all days prior to 59 days ago
              let dayIsBlocked = daysFromToday < 0 || daysFromToday >= maxDaysInPast;

              // If adjusting the end date, block out all dates 30 days or more beyond, and all dates prior to, the start date
              if (!dayIsBlocked && values.startDate && focusedDatePickerInput === 'endDate') {
                const daysFromStartDate = getCalendarDate(day).diff(getCalendarDate(values.startDate), 'days');
                dayIsBlocked = daysFromStartDate > maxDays - 1 || daysFromStartDate < 0;
              }

              return dayIsBlocked;
            }}
            initialVisibleMonth={() => moment().subtract(1, 'month')}
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

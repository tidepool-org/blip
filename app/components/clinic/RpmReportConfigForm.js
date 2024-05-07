import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import compact from 'lodash/compact';
import includes from 'lodash/includes';
import isNull from 'lodash/isNull';
import map from 'lodash/map';
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
  const { t, api, onFormChange, open, trackMetric, ...boxProps } = props;
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const [config, setConfig] = useLocalStorage('rpmReportConfig', {});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showEndDateOffset, setShowEndDateOffset] = useState(false);
  const localConfigKey = [loggedInUserId, selectedClinicId].join('|');
  const dateFormat = 'YYYY-MM-DD'
  const maxDays = 30;
  const maxDaysInPast = 60;

  const defaultDates = () => {
    return {
      startDate: moment.utc().subtract(maxDays - 1, 'days'),
      endDate: moment.utc(),
    };
  }

  function defaultFormValues(config) {
    const { startDate, endDate } = defaultDates();
    let fallbackTimezone = clinic?.timezone || new Intl.DateTimeFormat().resolvedOptions().timeZone;
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
      const queryOptions = {
        rawConfig: values,
        startDate: moment(values.startDate).tz(values.timezone).startOf('day').toISOString(),
        endDate: moment(values.endDate).tz(values.timezone).endOf('day').toISOString(),
      };

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
      setValues(defaultFormValues(config?.[localConfigKey]), true)
      dispatch(sync.clearRpmReportPatients());
    }
  }, [open]);

  useEffect(() => {
    validateForm();
    onFormChange(formikContext);
  }, [values]);

  function setDates(dates) {
    if (moment.isMoment(dates.startDate)) {
      const endDate = moment.min(compact([
        dates.endDate,
        moment(),
        moment(dates.startDate).add(maxDays - 1, 'days')
      ]));

      setFieldValue('startDate', dates.startDate.format(dateFormat));
      setFieldValue('endDate', endDate.format(dateFormat));
    } else {
      setFieldValue('startDate', '');
      setFieldValue('endDate', '');
    }
  }

  return (
    <Box
      as="form"
      id="rpm-report-config-form"
      {...boxProps}
    >
      <Element name="form-wrapper">
        <Box id='rpm-report-range-select' mb={3}>
          <Body0 sx={{ fontWeight: 'medium' }} mb={2}>{t('Set the start date (30 days max)')}</Body0>
          <Body0 sx={{ fontStyle: 'italic' }} mb={2}>{t('By default, this range is 30 days. Adjust the end date to shorten the range. The start date is limited to 60 days prior to today.')}</Body0>

          <DateRangePicker
            startDate={values.startDate ? moment.utc(values.startDate) : null}
            startDateId="rpm-report-start-date"
            endDate={values.endDate ? moment.utc(values.endDate) : null}
            endDateId="rpm-report-end-date"
            endDateOffset={showEndDateOffset || !values.endDate
              ? day => moment.min([
                moment().endOf('day'),
                day.add(maxDays - 1, 'days'),
              ])
              : undefined
            }
            errors={errors}
            focusedInput={!values.startDate ? 'startDate' : 'endDate'}
            onDatesChange={newDates => setDates(newDates)}
            maxDate={moment()}
            minDate={moment().subtract(60, 'days')}
            isOutsideRange={day => (
              moment().endOf('day').diff(moment(day).endOf('day')) < 0 ||
              moment().startOf('day').diff(moment(day).startOf('day'), 'days', true) > maxDaysInPast - 1
            )}
            initialVisibleMonth={() => moment().subtract(1, 'month')}
            onFocusChange={input => {
              setDatePickerOpen(!!input);
              setShowEndDateOffset(input === 'startDate');
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
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(RpmReportConfigForm);

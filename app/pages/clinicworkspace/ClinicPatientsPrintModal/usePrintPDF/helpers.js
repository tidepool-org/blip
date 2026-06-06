import moment from 'moment';
import filter from 'lodash/filter';
import min from 'lodash/min';
import at from 'lodash/at';
import map from 'lodash/map';
import keys from 'lodash/keys';
import get from 'lodash/get';

import { utils as vizUtils } from '@tidepool/viz';
const { getTimezoneFromTimePrefs } = vizUtils.datetime;

import personUtils from '../../../../core/personutils';
import { DEFAULT_CGM_SAMPLE_INTERVAL, MS_IN_MIN } from '../../../../core/constants';

export const getMainFetchOpts = (timePrefs, opts, fetchedUntil) => {
  const enabledOpts = filter(opts, { disabled: false });
  const earliestPrintDate = min(at(enabledOpts, map(keys(enabledOpts), key => `${key}.endpoints.0`)));

  const startDate = moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(timePrefs)).toISOString();

  const endDate = fetchedUntil
    ? moment.utc(fetchedUntil).subtract(1, 'milliseconds').toISOString()
    : moment.utc().add(1, 'days').toISOString();

  const sampleIntervalMinimum = opts.daily?.cgmSampleIntervalRange?.[0] || DEFAULT_CGM_SAMPLE_INTERVAL;

  return {
    initial: false,
    startDate,
    endDate,
    returnData: false,
    forceDataWorkerAddDataRequest: true,
    useCache: false,
    sampleIntervalMinimum,
  };
};

export const getEarliestPrintDate = (printOpts, timePrefs) => {
  const enabledOpts = filter(printOpts, { disabled: false });
  const earliestPrintDate = min(at(enabledOpts, map(keys(enabledOpts), key => `${key}.endpoints.0`)));
  return moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(timePrefs)).toISOString();
};

export const getPdfOpts = (printOpts, user, patient, clinicPatient) => {
  const combinedPatient = clinicPatient ? personUtils.combinedAccountAndClinicPatient(patient, clinicPatient) : null;
  const sourcePatient = personUtils.isClinicianAccount(user) && !!combinedPatient ? combinedPatient : patient;
  const patientSettings = patient?.settings || {};
  const siteChangeSource = patient?.settings?.siteChangeSource;

  const pdfPatient = {
    ...sourcePatient,
    id: clinicPatient?.id || patient?.id,
    settings: { ...patientSettings, siteChangeSource },
  };

  return { ...printOpts, patient: pdfPatient };
};

export const getFetchedUntil = (data, printOpts) => {
  return printOpts?.daily?.cgmSampleIntervalRange?.[0] === MS_IN_MIN
    ? get(data, 'oneMinCgmFetchedUntil') || moment.utc().toISOString()
    : get(data, 'fetchedUntil');
};

export const buildPrintWindowUrl = (patientId, opts, clinicId) => {
  const params = new URLSearchParams({
    patientId,
    opts: JSON.stringify(opts),
  });
  if (clinicId) params.set('clinicId', clinicId);
  return `/print?${params.toString()}`;
};

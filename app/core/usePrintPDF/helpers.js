import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';
const { getTimezoneFromTimePrefs } = vizUtils.datetime;
import moment from 'moment';
import utils from '../utils';
import personUtils from '../personutils';
import { getStatsByChartType } from '../dataViewUtils';
import { DEFAULT_GLYCEMIC_RANGES } from '../glycemicRangesUtils';

import {
  DEFAULT_CGM_SAMPLE_INTERVAL_RANGE,
  DEFAULT_CGM_SAMPLE_INTERVAL,
  MS_IN_MIN
} from '../constants';

import get from 'lodash/get';
import filter from 'lodash/filter';
import min from 'lodash/min';
import at from 'lodash/at';
import map from 'lodash/map';
import keys from 'lodash/keys';

export const getInitialFetchOpts = () => ({
  initial: true,
  forceDataWorkerAddDataRequest: true,
  returnData: false,
  useCache: false,
  syncTimePrefs: true,
});

export const getEarliestPrintDate = (opts, timePrefs) => {
  const enabledOpts = filter(opts, { disabled: false });
  const earliestPrintDate = min(at(enabledOpts, map(keys(enabledOpts), key => `${key}.endpoints.0`)));
  const startDate = moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(timePrefs)).toISOString();

  return startDate;
};

export const getMainFetchOpts = (timePrefs, opts, fetchedUntil) => {
  const startDate = getEarliestPrintDate(opts, timePrefs);

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
    syncTimePrefs: true,
  };
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

export const getQueries = (
  data,
  patient,
  clinicPatient,
  clinic,
  timePrefs,
  opts,
) => {
  const glycemicRanges = clinicPatient?.glycemicRanges || DEFAULT_GLYCEMIC_RANGES;
  const derivedBgSource = _.get(data, 'metaData.bgSources.current', 'cbg'); // derive from user's recent data
  const isAutomatedBasalDevice = _.get(data, 'metaData.latestPumpUpload.isAutomatedBasalDevice', false);
  const isSettingsOverrideDevice = _.get(data, 'metaData.latestPumpUpload.isSettingsOverrideDevice', false);
  const deviceOpts = { isAutomatedBasalDevice, isSettingsOverrideDevice };
  const { settings = {} } = patient || {};

  const bgPrefs = (() => {
    const clinicPatientArg = clinicPatient ? { ...clinicPatient, glycemicRanges } : undefined;

    const bgUnitsOverride = { units: clinic?.preferredBgUnits, source: 'preferred clinic units' };
    const localBgPrefs = utils.getBGPrefsForDataProcessing(settings, clinicPatientArg, bgUnitsOverride);
    localBgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(localBgPrefs);

    return localBgPrefs;
  })();

  const commonQueries = {
    bgPrefs: bgPrefs,
    metaData: 'latestPumpUpload, bgSources, devices, matchedDevices',
    timePrefs: timePrefs,
  };

  const queries = {};

  if (!opts.basics?.disabled) {
    queries.basics = {
      endpoints: opts.basics?.endpoints,
      aggregationsByDate: 'basals, boluses, fingersticks, siteChanges',
      bgSource: derivedBgSource,
      stats: getStatsByChartType('basics', derivedBgSource, deviceOpts),
      ...commonQueries,
    };
  }

  if (!opts.bgLog?.disabled) {
    queries.bgLog = {
      endpoints: opts.bgLog?.endpoints,
      aggregationsByDate: 'dataByDate',
      stats: getStatsByChartType('bgLog', 'smbg', deviceOpts),
      types: { smbg: {} },
      bgSource: 'smbg',
      ...commonQueries,
    };
  }

  if (!opts.daily?.disabled) {
    const cgmSampleIntervalRange = opts.daily?.cgmSampleIntervalRange || DEFAULT_CGM_SAMPLE_INTERVAL_RANGE;

    queries.daily = {
      endpoints: opts.daily?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      stats: getStatsByChartType('daily', derivedBgSource, deviceOpts),
      types: {
        basal: {},
        bolus: {},
        insulin: {},
        cbg: {},
        deviceEvent: {},
        food: {},
        message: {},
        smbg: {},
        wizard: {},
        physicalActivity: {},
        reportedState: {},
      },
      bgSource: derivedBgSource,
      cgmSampleIntervalRange: cgmSampleIntervalRange,
      ...commonQueries,
    };
  }

  if (!opts.agpBGM?.disabled) {
    queries.agpBGM = {
      endpoints: opts.agpBGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: 'smbg',
      stats: getStatsByChartType('agpBGM', 'smbg', deviceOpts),
      types: { smbg: {} },
      glycemicRanges,
      ...commonQueries,
    };
  }

  if (!opts.agpCGM?.disabled) {
    queries.agpCGM = {
      endpoints: opts.agpCGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: 'cbg',
      stats: getStatsByChartType('agpCGM', 'cbg', deviceOpts),
      types: { cbg: {} },
      glycemicRanges,
      ...commonQueries,
    };
  }

  if (!opts.settings?.disabled) {
    queries.settings = {
      ...commonQueries,
    };
  }

  return queries;
};

export default {
  getInitialFetchOpts,
  getMainFetchOpts,
  getEarliestPrintDate,
  getPdfOpts,
  getFetchedUntil,
  getQueries,
};

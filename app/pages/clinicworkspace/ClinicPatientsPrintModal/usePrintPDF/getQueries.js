import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';

import utils from '../../../../core/utils';
import { getStatsByChartType } from '../../../../core/dataViewUtils';
import { DEFAULT_GLYCEMIC_RANGES } from '../../../../core/glycemicRangesUtils';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE } from '../../../../core/constants';


const getQueries = (
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

export default getQueries;

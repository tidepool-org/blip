import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';

import utils from '../../../../core/utils';
import { getStatsByChartType } from '../../../../core/dataViewUtils';
import { DEFAULT_GLYCEMIC_RANGES } from '../../../../core/glycemicRangesUtils';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE } from '../../../../core/constants';


const getQueries = (
  data,
  clinicPatient,
  clinic,
  timePrefs,
  opts,
) => {
  // Use sensible defaults for settings that we don't allow manual configuration of
  const cgmSampleIntervalRange = DEFAULT_CGM_SAMPLE_INTERVAL_RANGE;
  const excludedDevices = []; // TODO: FIX;
  const glycemicRanges = clinicPatient?.glycemicRanges || DEFAULT_GLYCEMIC_RANGES;
  const derivedBgSource = _.get(data, 'metaData.bgSources.current', 'cbg'); // derive from user's recent data
  const isAutomatedBasalDevice = _.get(data, 'metaData.latestPumpUpload.isAutomatedBasalDevice', false);
  const isSettingsOverrideDevice = _.get(data, 'metaData.latestPumpUpload.isSettingsOverrideDevice', false);
  const deviceOpts = { isAutomatedBasalDevice, isSettingsOverrideDevice };

  const bgPrefs = (() => {
    // TODO: Should set to Redux -> patient.settings. However, the only use case for useAgpCGM at present is
    // for clinician views. Correct patientSettings will be necessary if useAgpCGM is implement on PwD views.
    const stubPatientSettings = {};

    const clinicPatientArg = {...clinicPatient, glycemicRanges };

    const bgUnitsOverride = {
      units: clinic?.preferredBgUnits,
      source: 'preferred clinic units',
    };

    const localBgPrefs = utils.getBGPrefsForDataProcessing(stubPatientSettings, clinicPatientArg, bgUnitsOverride);
    localBgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(localBgPrefs);

    return localBgPrefs;
  })();

  const commonQueries = {
    bgPrefs: bgPrefs,
    metaData: 'latestPumpUpload, bgSources',
    timePrefs: timePrefs,
    excludedDevices: excludedDevices,
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

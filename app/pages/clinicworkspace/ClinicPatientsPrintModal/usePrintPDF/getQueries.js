import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';
const { commonStats } = vizUtils.stat;

import utils from '../../../../core/utils';
import { DEFAULT_GLYCEMIC_RANGES } from '../../../../core/glycemicRangesUtils';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE } from '../../../../core/constants';

const getStatsByChartType = (chartType, bgSource) => {
  const currentBgSource = bgSource;
  const cbgSelected =  currentBgSource === 'cbg';
  const smbgSelected = currentBgSource === 'smbg';

  const isAutomatedBasalDevice = false; // TODO: FIX;
  const isSettingsOverrideDevice = false; // TODO: FIX;

  // const isAutomatedBasalDevice = _.get(this.props.data, 'metaData.latestPumpUpload.isAutomatedBasalDevice');
  // const isSettingsOverrideDevice = _.get(this.props.data, 'metaData.latestPumpUpload.isSettingsOverrideDevice');

  let stats = [];

  switch (chartType) {
    case 'basics':
      cbgSelected && stats.push(commonStats.timeInRange);
      smbgSelected && stats.push(commonStats.readingsInRange);
      stats.push(commonStats.averageGlucose);
      cbgSelected && stats.push(commonStats.sensorUsage);
      stats.push(commonStats.totalInsulin);
      isAutomatedBasalDevice && stats.push(commonStats.timeInAuto);
      isSettingsOverrideDevice && stats.push(commonStats.timeInOverride);
      stats.push(commonStats.carbs);
      stats.push(commonStats.averageDailyDose);
      cbgSelected && stats.push(commonStats.glucoseManagementIndicator);
      stats.push(commonStats.standardDev);
      stats.push(commonStats.coefficientOfVariation);
      stats.push(commonStats.bgExtents);
      break;

    case 'daily':
      cbgSelected && stats.push(commonStats.timeInRange);
      smbgSelected && stats.push(commonStats.readingsInRange);
      stats.push(commonStats.averageGlucose);
      stats.push(commonStats.totalInsulin);
      isAutomatedBasalDevice && stats.push(commonStats.timeInAuto);
      isSettingsOverrideDevice && stats.push(commonStats.timeInOverride);
      stats.push(commonStats.carbs);
      cbgSelected && stats.push(commonStats.standardDev);
      cbgSelected && stats.push(commonStats.coefficientOfVariation);
      break;

    case 'bgLog':
      stats.push(commonStats.readingsInRange);
      stats.push(commonStats.averageGlucose);
      stats.push(commonStats.standardDev);
      stats.push(commonStats.coefficientOfVariation);
      break;

    case 'agpBGM':
      stats.push(commonStats.averageGlucose,);
      stats.push(commonStats.bgExtents,);
      stats.push(commonStats.coefficientOfVariation,);
      stats.push(commonStats.glucoseManagementIndicator,);
      stats.push(commonStats.readingsInRange,);
      break;

    case 'agpCGM':
      stats.push(commonStats.averageGlucose);
      stats.push(commonStats.bgExtents);
      stats.push(commonStats.coefficientOfVariation);
      stats.push(commonStats.glucoseManagementIndicator);
      stats.push(commonStats.sensorUsage);
      stats.push(commonStats.timeInRange);
      break;

    case 'trends':
      cbgSelected && stats.push(commonStats.timeInRange);
      smbgSelected && stats.push(commonStats.readingsInRange);
      stats.push(commonStats.averageGlucose);
      cbgSelected && stats.push(commonStats.sensorUsage);
      stats.push(commonStats.totalInsulin);
      stats.push(commonStats.averageDailyDose);
      isAutomatedBasalDevice && stats.push(commonStats.timeInAuto);
      isSettingsOverrideDevice && stats.push(commonStats.timeInOverride);
      cbgSelected && stats.push(commonStats.glucoseManagementIndicator);
      stats.push(commonStats.standardDev);
      stats.push(commonStats.coefficientOfVariation);
      stats.push(commonStats.bgExtents);
      break;
  }

  return stats;
};


const getQueries = (
  data,
  clinicPatient,
  clinic,
  opts,
) => {
  const bgSource = 'cgm'; // TODO: FIX
  const cgmSampleIntervalRange = DEFAULT_CGM_SAMPLE_INTERVAL_RANGE; // TODO: FIX
  const excludedDevices = []; // TODO: FIX;

  const bgPrefs = (() => {
    // TODO: Should set to Redux -> patient.settings. However, the only use case for useAgpCGM at present is
    // for clinician views. Correct patientSettings will be necessary if useAgpCGM is implement on PwD views.
    const stubPatientSettings = {};

    // For TIDE Patient Drawer, we currently only show ADA standard ranges
    const glycemicRanges = DEFAULT_GLYCEMIC_RANGES;
    const clinicPatientArg = {...clinicPatient, glycemicRanges };

    const bgUnitsOverride = {
      units: clinic?.preferredBgUnits,
      source: 'preferred clinic units',
    };

    const localBgPrefs = utils.getBGPrefsForDataProcessing(stubPatientSettings, clinicPatientArg, bgUnitsOverride);
    localBgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(localBgPrefs);

    return localBgPrefs;
  })();

  // For TIDE Patient Drawer, we currently only show ADA standard ranges
  const glycemicRanges = DEFAULT_GLYCEMIC_RANGES;

  const timePrefs = (() => {
    const latestTimeZone = data?.metaData?.latestTimeZone;
    const queryParams = {};

    const localTimePrefs = utils.getTimePrefsForDataProcessing(latestTimeZone, queryParams);

    return localTimePrefs;
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
        bgSource: bgSource,
        stats: getStatsByChartType('basics'),
        ...commonQueries,
      };
    }

    if (!opts.bgLog?.disabled) {
      queries.bgLog = {
        endpoints: opts.bgLog?.endpoints,
        aggregationsByDate: 'dataByDate',
        stats: getStatsByChartType('bgLog'),
        types: { smbg: {} },
        bgSource: bgSource,
        ...commonQueries,
      };
    }

    if (!opts.daily?.disabled) {
      queries.daily = {
        endpoints: opts.daily?.endpoints,
        aggregationsByDate: 'dataByDate, statsByDate',
        stats: getStatsByChartType('daily'),
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
        bgSource: bgSource,
        cgmSampleIntervalRange: cgmSampleIntervalRange,
        ...commonQueries,
      };
    }

    if (!opts.agpBGM?.disabled) {
      queries.agpBGM = {
        endpoints: opts.agpBGM?.endpoints,
        aggregationsByDate: 'dataByDate, statsByDate',
        bgSource: bgSource,
        stats: getStatsByChartType('agpBGM'),
        types: { smbg: {} },
        glycemicRanges,
        ...commonQueries,
      };
    }

    if (!opts.agpCGM?.disabled) {
      queries.agpCGM = {
        endpoints: opts.agpCGM?.endpoints,
        aggregationsByDate: 'dataByDate, statsByDate',
        bgSource: bgSource,
        stats: getStatsByChartType('agpCGM'),
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

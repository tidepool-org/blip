import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';
const { commonStats } = vizUtils.stat;

import utils from '../../../../core/utils';
const { GLYCEMIC_RANGE } = vizUtils.constants;

const getQueries = (
  data,
  clinicPatient,
  clinic,
  opts,
) => {
  const bgPrefs = (() => {
    // TODO: Should set to Redux -> patient.settings. However, the only use case for useAgpCGM at present is
    // for clinician views. Correct patientSettings will be necessary if useAgpCGM is implement on PwD views.
    const stubPatientSettings = {};

    // For TIDE Patient Drawer, we currently only show ADA standard ranges
    const clinicPatientArg = {...clinicPatient, glycemicRanges: GLYCEMIC_RANGE.ADA_STANDARD };

    const bgUnitsOverride = {
      units: clinic?.preferredBgUnits,
      source: 'preferred clinic units',
    };

    const localBgPrefs = utils.getBGPrefsForDataProcessing(stubPatientSettings, clinicPatientArg, bgUnitsOverride);
    localBgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(localBgPrefs);

    return localBgPrefs;
  })();

  // For TIDE Patient Drawer, we currently only show ADA standard ranges
  const glycemicRanges = GLYCEMIC_RANGE.ADA_STANDARD;

  const timePrefs = (() => {
    const latestTimeZone = data?.metaData?.latestTimeZone;
    const queryParams = {};

    const localTimePrefs = utils.getTimePrefsForDataProcessing(latestTimeZone, queryParams);

    return localTimePrefs;
  })();

  let stats = [
    commonStats.averageGlucose,
    commonStats.bgExtents,
    commonStats.coefficientOfVariation,
    commonStats.glucoseManagementIndicator,
    commonStats.sensorUsage,
    commonStats.timeInRange,
  ];

  const queries = {
    agpCGM: {
      endpoints: opts.agpCGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: 'cbg',
      stats,
      types: { cbg: {} },
      bgPrefs,
      metaData: 'latestPumpUpload, bgSources',
      timePrefs,
      excludedDevices: [],
      glycemicRanges,
    },
    offsetAgpCGM: {
      endpoints: opts.offsetAgpCGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: 'cbg',
      stats,
      types: { cbg: {} },
      bgPrefs,
      metaData: 'latestPumpUpload, bgSources',
      timePrefs,
      excludedDevices: [],
      glycemicRanges,
    },
  };

  return queries;
};

export default getQueries;

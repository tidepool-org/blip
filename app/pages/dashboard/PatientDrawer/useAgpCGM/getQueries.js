import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';
const { commonStats } = vizUtils.stat;

import utils from '../../../../core/utils';

const getQueries = (
  data,
  patient,
  clinic,
  opts,
) => {
  const bgPrefs = (() => {
    const patientSettings = patient?.settings || {};

    const bgUnitsOverride = {
      units: clinic?.preferredBgUnits,
      source: 'preferred clinic units',
    };

    const localBgPrefs = utils.getBGPrefsForDataProcessing(patientSettings, bgUnitsOverride);
    localBgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(localBgPrefs);

    return localBgPrefs;
  })();

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
    },
  };

  return queries;
};

export default getQueries;
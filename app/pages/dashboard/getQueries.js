import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';
import utils from '../../core/utils';

const chartPrefs = {
  agpBGM: {
    bgSource: 'smbg',
  },
  agpCGM: {
    bgSource: 'cbg',
  },
  settings: {
    touched: false,
  },
  excludedDevices: [],
};

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

  const getStatsByChartType = (chartType, _bgSource) => {
    const { commonStats } = vizUtils.stat;

    let stats = [];

    switch (chartType) { // cases 'basics', 'trends', 'bgLog', and 'daily' omitted
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
    }

    return stats;
  }

  const commonQueries = {
    bgPrefs: bgPrefs,
    metaData: 'latestPumpUpload, bgSources',
    timePrefs: timePrefs,
    excludedDevices: chartPrefs?.excludedDevices,
  };

  const queries = {}

  if (!opts.agpBGM?.disabled) {
    queries.agpBGM = {
      endpoints: opts.agpBGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: _.get(chartPrefs, 'agpBGM.bgSource'),
      stats: getStatsByChartType('agpBGM'),
      types: { smbg: {} },
      ...commonQueries,
    };
  }

  if (!opts.agpCGM?.disabled) {
    queries.agpCGM = {
      endpoints: opts.agpCGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: _.get(chartPrefs, 'agpCGM.bgSource'),
      stats: getStatsByChartType('agpCGM'),
      types: { cbg: {} },
      ...commonQueries,
    };
  }

  return queries;
}

export default getQueries;
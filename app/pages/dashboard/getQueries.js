import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';
import utils from '../../core/utils';

const chartPrefs = {
  basics: {
    stats: {
      excludeDaysWithoutBolus: false,
    },
    sections: {},
    extentSize: 14,
  },
  daily: {
    extentSize: 1,
  },
  trends: {
    activeDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    activeDomain: '2 weeks',
    extentSize: 14,
    // we track both showingCbg & showingSmbg as separate Booleans for now
    // in case we decide to layer BGM & CGM data, as has been discussed/prototyped
    showingCbg: true,
    showingSmbg: false,
    smbgGrouped: false,
    smbgLines: false,
    smbgRangeOverlay: true,

    // Formerly in viz.trends redux store
    cbgFlags: {
      cbg100Enabled: true,
      cbg80Enabled: true,
      cbg50Enabled: true,
      cbgMedianEnabled: true,
    },
    focusedCbgDateTrace: null,
    focusedCbgSlice: null,
    focusedCbgSliceKeys: null,
    focusedSmbg: null,
    focusedSmbgRangeAvg: null,
    showingCbgDateTraces: false,
    touched: false,
    stats: {
      excludeDaysWithoutBolus: false,
    },
  },
  bgLog: {
    bgSource: 'smbg',
    extentSize: 14,
  },
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

    // TODO: This line is breaking but it might be important
    // localBgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(bgPrefs);

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

    switch (chartType) {
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
import { utils as vizUtils } from '@tidepool/viz';
const { commonStats } = vizUtils.stat;

import max from 'lodash/max';
import map from 'lodash/map';
import pick from 'lodash/pick';

export const getStatsByChartType = (chartType, bgSource, deviceOpts = {}) => {
  const cbgSelected = bgSource === 'cbg';
  const smbgSelected = bgSource === 'smbg';

  const { isAutomatedBasalDevice = false, isSettingsOverrideDevice = false } = deviceOpts;

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

export const getMostRecentDatumTimeByChartType = (latestDatumByType, chartType) => {
  let latestDatums;
  const getLatestDatums = types => pick(latestDatumByType, types);

  switch (chartType) {
    case 'basics':
      latestDatums = getLatestDatums([
        'basal',
        'bolus',
        'cbg',
        'deviceEvent',
        'smbg',
        'wizard',
      ]);
      break;

    case 'daily':
      latestDatums = getLatestDatums([
        'basal',
        'bolus',
        'insulin',
        'cbg',
        'deviceEvent',
        'food',
        'message',
        'smbg',
        'wizard',
        'reportedState',
        'physicalActivity',
      ]);
      break;

    case 'bgLog':
      latestDatums = getLatestDatums(['smbg']);
      break;

    case 'agpBGM':
      latestDatums = getLatestDatums(['smbg']);
      break;

    case 'agpCGM':
      latestDatums = getLatestDatums(['cbg']);
      break;

    case 'trends':
      latestDatums = getLatestDatums(['cbg', 'smbg']);
      break;

    default:
      latestDatums = [];
      break;
  }

  return max(map(latestDatums, d => (d.normalEnd || d.normalTime)));
};

export default {
  getMostRecentDatumTimeByChartType,
  getStatsByChartType,
};

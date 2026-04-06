import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';

import utils from '../../../core/utils';
import personUtils from '../../../core/personutils';

const { commonStats } = vizUtils.stat;

function getStatsByChartType(chartType, metaData) {
  const isAutomatedBasalDevice = _.get(metaData, 'latestPumpUpload.isAutomatedBasalDevice');
  const isSettingsOverrideDevice = _.get(metaData, 'latestPumpUpload.isSettingsOverrideDevice');
  const bgSource = _.get(metaData, 'bgSources.current');
  const cbgSelected = bgSource === 'cbg';
  const smbgSelected = bgSource === 'smbg';

  const stats = [];

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
      cbgSelected && stats.push(commonStats.glycemiaRiskIndex);
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
      cbgSelected && stats.push(commonStats.glycemiaRiskIndex);
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
      stats.push(commonStats.averageGlucose);
      stats.push(commonStats.bgExtents);
      stats.push(commonStats.coefficientOfVariation);
      stats.push(commonStats.glucoseManagementIndicator);
      stats.push(commonStats.readingsInRange);
      break;

    case 'agpCGM':
      stats.push(commonStats.averageGlucose);
      stats.push(commonStats.bgExtents);
      stats.push(commonStats.coefficientOfVariation);
      stats.push(commonStats.glucoseManagementIndicator);
      stats.push(commonStats.sensorUsage);
      stats.push(commonStats.timeInRange);
      break;

    default:
      break;
  }

  return stats;
}

/**
 * Builds the queries and patient object for generatePDFRequest, given DataUtil metadata,
 * the clinic patient record, clinic preferences, and the user's print section/date selections.
 *
 * Mirrors the logic in patientdata.js generatePDF() and getStatsByChartType().
 * timePrefs and bgPrefs are derived from DataUtil metadata (available after the metadata query
 * step in usePrintPDF), so they reflect the actual data rather than pre-fetch approximations.
 */
function getPDFQueries(data, clinicPatient, clinic, printOpts) {
  const metaData = data?.metaData || {};
  const patientSettings = clinicPatient?.settings || {};

  const bgPrefs = (() => {
    const localBgPrefs = utils.getBGPrefsForDataProcessing(patientSettings, {
      units: clinic?.preferredBgUnits,
      source: 'preferred clinic units',
    });
    localBgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(localBgPrefs);
    return localBgPrefs;
  })();

  const timePrefs = utils.getTimePrefsForDataProcessing(metaData.latestTimeZone, {});

  const pdfPatient = _.assign(
    {},
    personUtils.accountInfoFromClinicPatient(clinicPatient),
    { id: clinicPatient?.id, settings: patientSettings },
  );

  const bgSource = metaData.bgSources?.current;

  const commonQueries = {
    bgPrefs,
    metaData: 'latestPumpUpload, bgSources',
    timePrefs,
    excludedDevices: metaData.excludedDevices || [],
  };

  const queries = {};

  if (!printOpts.basics?.disabled) {
    queries.basics = {
      endpoints: printOpts.basics?.endpoints,
      aggregationsByDate: 'basals, boluses, fingersticks, siteChanges',
      bgSource,
      stats: getStatsByChartType('basics', metaData),
      excludeDaysWithoutBolus: false,
      ...commonQueries,
    };
  }

  if (!printOpts.bgLog?.disabled) {
    queries.bgLog = {
      endpoints: printOpts.bgLog?.endpoints,
      aggregationsByDate: 'dataByDate',
      stats: getStatsByChartType('bgLog', metaData),
      types: { smbg: {} },
      bgSource: 'smbg',
      ...commonQueries,
    };
  }

  if (!printOpts.daily?.disabled) {
    queries.daily = {
      endpoints: printOpts.daily?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      stats: getStatsByChartType('daily', metaData),
      types: {
        basal: {},
        bolus: {},
        cbg: {},
        deviceEvent: {},
        food: {},
        message: {},
        smbg: {},
        wizard: {},
      },
      bgSource,
      ...commonQueries,
    };
  }

  if (!printOpts.agpBGM?.disabled) {
    queries.agpBGM = {
      endpoints: printOpts.agpBGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: 'smbg',
      stats: getStatsByChartType('agpBGM', metaData),
      types: { smbg: {} },
      ...commonQueries,
    };
  }

  if (!printOpts.agpCGM?.disabled) {
    queries.agpCGM = {
      endpoints: printOpts.agpCGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: 'cbg',
      stats: getStatsByChartType('agpCGM', metaData),
      types: { cbg: {} },
      ...commonQueries,
    };
  }

  if (!printOpts.settings?.disabled) {
    queries.settings = {
      ...commonQueries,
    };
  }

  return { queries, pdfPatient };
}

export default getPDFQueries;

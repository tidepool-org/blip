import _ from 'lodash';

import { AUTOMATED_DELIVERY, SCHEDULED_DELIVERY } from './constants';
import { getPumpVocabulary } from './device';

export const statTypes = {
  barHorizontal: 'barHorizontal',
  barBg: 'barBg',
  simple: 'simple',
};

export const statBgSourceLabels = {
  cbg: 'CGM',
  smbg: 'BGM',
};

export const statFormats = {
  bgCount: 'bgCount',
  bgRange: 'bgRange',
  bgValue: 'bgValue',
  cv: 'cv',
  carbs: 'carbs',
  duration: 'duration',
  gmi: 'gmi',
  percentage: 'percentage',
  standardDevRange: 'standardDevRange',
  standardDevValue: 'standardDevValue',
  units: 'units',
};

export const commonStats = {
  averageGlucose: 'averageGlucose',
  averageDailyCarbs: 'averageDailyCarbs',
  coefficientOfVariation: 'coefficientOfVariation',
  glucoseManagementIndicator: 'glucoseManagementIndicator',
  readingsInRange: 'readingsInRange',
  sensorUsage: 'sensorUsage',
  standardDev: 'standardDev',
  timeInAuto: 'timeInAuto',
  timeInRange: 'timeInRange',
  totalInsulin: 'totalInsulin',
};

export const getSum = data => _.sum(_.map(data, d => d.value));

export const ensureNumeric = value => (_.isNaN(value) ? -1 : parseFloat(value));

export const translatePercentage = value => value / 100;

export const getStatAnnotations = (data, type) => {
  const annotations = [];

  if (data.bgSource === 'smbg') {
    annotations.push(`Based on _**${data.total}**_ ${statBgSourceLabels.smbg} readings for this view.`);
  }

  switch (type) {
    case commonStats.averageGlucose:
      annotations.push('**Average Glucose (mean):** All glucose values added together, divided by the number of readings.');
      break;

    case commonStats.averageDailyCarbs:
      annotations.push(`Based on ${data.total} bolus wizard events available for this view.`);
      break;

    case commonStats.coefficientOfVariation:
      annotations.push('**CV (Coefficient of Variation):** How far apart (wide) glucose values are; ideally a low number.');
      break;

    case commonStats.glucoseManagementIndicator:
      annotations.push('**GMI (Glucose Management Indicator):** Calculated from average glucose; estimates your future lab A1c.');
      break;

    case commonStats.readingsInRange:
      annotations.push(`**Readings In Range:** Daily average of the number of ${statBgSourceLabels.smbg} readings; grouped by range.`);
      break;

    case commonStats.sensorUsage:
      annotations.push(`**Sensor Usage:** Time the ${statBgSourceLabels.cbg} collected data, divided by the total time represented in this view`);
      break;

    case commonStats.standardDev:
      annotations.push('**SD (Standard Deviation):** How far values are from the average; ideally a low number.');
      break;

    case commonStats.timeInAuto:
      annotations.push(`Based on ${data.total}% pump data availability for this view.`);
      break;

    case commonStats.timeInRange:
      annotations.push(`**Time In Range:** Daily average of the number of ${statBgSourceLabels.cbg} readings; grouped by range.`);
      break;

    case commonStats.totalInsulin:
      annotations.push(`Based on ${data.total}% pump data availability for this view.`);
      break;

    default:
      break;
  }

  return annotations;
};

export const getStatData = (data, type, opts) => {
  const vocabulary = getPumpVocabulary(opts.manufacturer);

  let statData = {};

  switch (type) {
    case commonStats.averageGlucose:
      statData.data = [
        {
          value: ensureNumeric(data.averageGlucose),
        },
      ];

      statData.dataPaths = {
        summary: 'data.0',
      };
      break;

    case commonStats.averageDailyCarbs:
      statData.data = [
        {
          value: ensureNumeric(data.averageDailyCarbs),
        },
      ];

      statData.dataPaths = {
        summary: 'data.0',
      };
      break;

    case commonStats.coefficientOfVariation:
      statData.data = [
        {
          id: 'cv',
          value: ensureNumeric(translatePercentage(data.coefficientOfVariation)),
        },
      ];

      statData.dataPaths = {
        summary: 'data.0',
      };
      break;

    case commonStats.glucoseManagementIndicator:
      statData.data = [
        {
          id: 'gmi',
          value: ensureNumeric(translatePercentage(data.glucoseManagementIndicator)),
        },
      ];

      statData.dataPaths = {
        summary: 'data.0',
      };
      break;

    case commonStats.readingsInRange:
      statData.data = [
        {
          id: 'veryLow',
          value: ensureNumeric(data.veryLow),
          title: 'Readings Below Range',
        },
        {
          id: 'low',
          value: ensureNumeric(data.low),
          title: 'Readings Below Range',
        },
        {
          id: 'target',
          value: ensureNumeric(data.target),
          title: 'Readings In Range',
        },
        {
          id: 'high',
          value: ensureNumeric(data.high),
          title: 'Readings Above Range',
        },
        {
          id: 'veryHigh',
          value: ensureNumeric(data.veryHigh),
          title: 'Readings Above Range',
        },
      ];

      statData.total = { value: getSum(statData.data) };
      statData.dataPaths = {
        summary: [
          'data',
          _.findIndex(statData.data, { id: 'target' }),
        ],
      };
      break;

    case commonStats.sensorUsage:
      statData.data = [
        {
          value: ensureNumeric(data.sensorUsage),
        },
      ];
      statData.total = { value: ensureNumeric(data.total) };
      statData.dataPaths = {
        summary: 'data.0',
      };
      break;

    case commonStats.standardDev:
      statData.data = [
        {
          value: ensureNumeric(data.averageGlucose),
          deviation: {
            value: ensureNumeric(data.standardDeviation),
          },
        },
      ];

      statData.dataPaths = {
        summary: 'data.0.deviation',
        title: 'data.0',
      };
      break;

    case commonStats.timeInAuto:
      statData.data = [
        {
          id: 'basalAutomated',
          value: ensureNumeric(data.automated),
          title: `Time In ${vocabulary[AUTOMATED_DELIVERY]}`,
        },
        {
          id: 'basal',
          value: ensureNumeric(data.manual),
          title: `Time In ${vocabulary[SCHEDULED_DELIVERY]}`,
        },
      ];

      statData.total = { value: getSum(statData.data) };
      statData.dataPaths = {
        summary: [
          'data',
          _.findIndex(statData.data, { id: 'basalAutomated' }),
        ],
      };
      break;

    case commonStats.timeInRange:
      statData.data = [
        {
          id: 'veryLow',
          value: ensureNumeric(data.veryLow),
          title: 'Time Below Range',
        },
        {
          id: 'low',
          value: ensureNumeric(data.low),
          title: 'Time Below Range',
        },
        {
          id: 'target',
          value: ensureNumeric(data.target),
          title: 'Time In Range',
        },
        {
          id: 'high',
          value: ensureNumeric(data.high),
          title: 'Time Above Range',
        },
        {
          id: 'veryHigh',
          value: ensureNumeric(data.veryHigh),
          title: 'Time Above Range',
        },
      ];

      statData.total = { value: getSum(statData.data) };
      statData.dataPaths = {
        summary: [
          'data',
          _.findIndex(statData.data, { id: 'target' }),
        ],
      };
      break;

    case commonStats.totalInsulin:
      statData.data = [
        {
          id: 'bolus',
          value: ensureNumeric(data.totalBolus),
          title: 'Bolus Insulin',
        },
        {
          id: 'basal',
          value: ensureNumeric(data.totalBasal),
          title: 'Basal Insulin',
        },
      ];

      statData.total = { id: 'insulin', value: getSum(statData.data) };
      statData.dataPaths = {
        summary: 'total',
        title: 'total',
      };
      break;

    default:
      statData = undefined;
      break;
  }

  return statData;
};

export const getStatDefinition = (data, type, opts = {}) => {
  const vocabulary = getPumpVocabulary(opts.manufacturer);

  let stat = {
    data: getStatData(data, type, opts),
    id: type,
    type: statTypes.barHorizontal,
    annotations: getStatAnnotations(data, type),
  };

  switch (type) {
    case commonStats.averageGlucose:
      stat.dataFormat = {
        label: statFormats.bgValue,
        summary: statFormats.bgValue,
      };
      stat.title = `Average Glucose (${statBgSourceLabels[data.bgSource]})`;
      stat.type = statTypes.barBg;
      break;

    case commonStats.averageDailyCarbs:
      stat.dataFormat = {
        summary: statFormats.carbs,
      };
      stat.title = 'Average Daily Carbs';
      stat.type = statTypes.simple;
      break;

    case commonStats.coefficientOfVariation:
      stat.dataFormat = {
        summary: statFormats.cv,
      };
      stat.title = 'CV';
      stat.type = statTypes.simple;
      break;

    case commonStats.glucoseManagementIndicator:
      stat.dataFormat = {
        summary: statFormats.gmi,
      };
      stat.title = 'GMI';
      stat.type = statTypes.simple;
      break;

    case commonStats.readingsInRange:
      stat.alwaysShowTooltips = true;
      stat.dataFormat = {
        label: statFormats.bgCount,
        summary: statFormats.bgCount,
        tooltip: statFormats.percentage,
        tooltipTitle: statFormats.bgRange,
      };
      stat.title = 'Readings In Range';
      break;

    case commonStats.sensorUsage:
      stat.dataFormat = {
        summary: statFormats.percentage,
      };
      stat.title = 'Sensor Usage';
      stat.type = statTypes.simple;
      break;

    case commonStats.standardDev:
      stat.dataFormat = {
        label: statFormats.standardDevValue,
        summary: statFormats.standardDevValue,
        title: statFormats.standardDevRange,
      };
      stat.title = 'Standard Deviation';
      stat.type = statTypes.barBg;
      break;

    case commonStats.timeInAuto:
      stat.alwaysShowTooltips = true;
      stat.dataFormat = {
        label: statFormats.percentage,
        summary: statFormats.percentage,
        tooltip: statFormats.duration,
      };
      stat.title = `Time In ${vocabulary[AUTOMATED_DELIVERY]}`;
      break;

    case commonStats.timeInRange:
      stat.alwaysShowTooltips = true;
      stat.dataFormat = {
        label: statFormats.percentage,
        summary: statFormats.percentage,
        tooltip: statFormats.duration,
        tooltipTitle: statFormats.bgRange,
      };
      stat.title = 'Time In Range';
      break;

    case commonStats.totalInsulin:
      stat.alwaysShowTooltips = true;
      stat.dataFormat = {
        label: statFormats.percentage,
        summary: statFormats.units,
        title: statFormats.units,
        tooltip: statFormats.units,
      };
      stat.title = 'Total Insulin';
      break;

    default:
      stat = undefined;
      break;
  }

  return stat;
};

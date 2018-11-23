import _ from 'lodash';

import { generateBgRangeLabels } from './bloodglucose';
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
  carbs: 'carbs',
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

export const ensureNumeric = value => (_.isNil(value) || _.isNaN(value) ? -1 : parseFloat(value));

export const getStatAnnotations = (data, type, opts = {}) => {
  const { bgSource, days, manufacturer } = opts;
  const vocabulary = getPumpVocabulary(manufacturer);

  const annotations = [];

  const bgStats = [
    commonStats.averageGlucose,
    commonStats.coefficientOfVariation,
    commonStats.glucoseManagementIndicator,
    commonStats.readingsInRange,
    commonStats.timeInRange,
    commonStats.standardDev,
  ];

  switch (type) {
    case commonStats.averageGlucose:
      annotations.push(`**Avg. Glucose (${statBgSourceLabels[bgSource]}):** All ${statBgSourceLabels[bgSource]} glucose values added together, divided by the number of readings.`);
      break;

    case commonStats.carbs:
      if (days > 1) {
        annotations.push('**Avg. Daily Carbs**: All carb entries from bolus wizard events added together, divided by the number of days in this view');
      } else {
        annotations.push('**Total Carbs**: All carb entries from bolus wizard events added together');
      }
      annotations.push(`Derived from _**${data.total}**_ bolus wizard events.`);
      break;

    case commonStats.coefficientOfVariation:
      annotations.push('**CV (Coefficient of Variation):** How far apart (wide) glucose values are; ideally a low number.');
      break;

    case commonStats.glucoseManagementIndicator:
      annotations.push('**GMI (Glucose Management Indicator):** Calculated from average glucose; estimates your future lab A1c.');
      break;

    case commonStats.readingsInRange:
      annotations.push(`**Readings In Range:** Daily average of the number of ${statBgSourceLabels.smbg} readings.`);
      break;

    case commonStats.sensorUsage:
      annotations.push(`**Sensor Usage:** Time the ${statBgSourceLabels.cbg} collected data, divided by the total time represented in this view`);
      break;

    case commonStats.standardDev:
      annotations.push('**SD (Standard Deviation):** How far values are from the average; ideally a low number.');
      break;

    case commonStats.timeInAuto:
      if (days > 1) {
        annotations.push(`**Time In ${vocabulary[AUTOMATED_DELIVERY]}:** Daily average of the time spent in automated basal delivery`);
        annotations.push(`**How we calculate this:**\n\n**(%)** is the duration in ${vocabulary[AUTOMATED_DELIVERY]} divided the total duration of basals for this time period.\n\n**(time)** is 24 hours multiplied by % in ${vocabulary[AUTOMATED_DELIVERY]}.`);
      } else {
        annotations.push(`**Time In ${vocabulary[AUTOMATED_DELIVERY]}:** Time spent in automated basal delivery`);
        annotations.push(`**How we calculate this:**\n\n**(%)** is the duration in ${vocabulary[AUTOMATED_DELIVERY]} divided the total duration of basals for this time period.\n\n**(time)** is total duration of time in ${vocabulary[AUTOMATED_DELIVERY]}.`);
      }
      break;

    case commonStats.timeInRange:
      if (days > 1) {
        annotations.push(`**Time In Range:**\n\nDaily average of the time spent in range, based on ${statBgSourceLabels.cbg} readings.`);
        annotations.push('**How we calculate this:**\n\n**(%)** is the number of readings in range divided by all readings for this time period.\n\n**(time)** is 24 hours multiplied by % in range.');
      } else {
        annotations.push(`**Time In Range:**\n\nTime spent in range, based on ${statBgSourceLabels.cbg} readings.`);
        annotations.push(`**How we calculate this:**\n\n**(%)** is the number of readings in range divided by all readings for this time period.\n\n**(time)** is number of readings in range multiplied by the ${statBgSourceLabels.cbg} sample frequency.`);
      }
      break;

    case commonStats.totalInsulin:
      if (days > 1) {
        annotations.push('**Total Insulin:**\n\nAll basal and bolus insulin delivery (in Units) added together, divided by the number of days in this view');
      } else {
        annotations.push('**Total Insulin:**\n\nAll basal and bolus insulin delivery (in Units) added together');
      }
      annotations.push('**How we calculate this:**\n\n**(%)** is the respective total of basal or bolus delivery divided by total insulin delivered for this time period.');
      break;

    default:
      break;
  }

  if (_.includes(bgStats, type)) {
    if (bgSource === 'smbg') {
      annotations.push(`Derived from _**${data.total}**_ ${statBgSourceLabels.smbg} readings.`);
    }
  }

  return annotations;
};

export const getStatData = (data, type, opts = {}) => {
  const vocabulary = getPumpVocabulary(opts.manufacturer);
  const bgRanges = generateBgRangeLabels(opts.bgPrefs, { condensed: true });

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

    case commonStats.carbs:
      statData.data = [
        {
          value: ensureNumeric(data.carbs),
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
          value: ensureNumeric(data.coefficientOfVariation),
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
          value: ensureNumeric(data.glucoseManagementIndicator),
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
          legendTitle: bgRanges.veryLow,
        },
        {
          id: 'low',
          value: ensureNumeric(data.low),
          title: 'Readings Below Range',
          legendTitle: bgRanges.low,
        },
        {
          id: 'target',
          value: ensureNumeric(data.target),
          title: 'Readings In Range',
          legendTitle: bgRanges.target,
        },
        {
          id: 'high',
          value: ensureNumeric(data.high),
          title: 'Readings Above Range',
          legendTitle: bgRanges.high,
        },
        {
          id: 'veryHigh',
          value: ensureNumeric(data.veryHigh),
          title: 'Readings Above Range',
          legendTitle: bgRanges.veryHigh,
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
          legendTitle: vocabulary[AUTOMATED_DELIVERY],
        },
        {
          id: 'basal',
          value: ensureNumeric(data.manual),
          title: `Time In ${vocabulary[SCHEDULED_DELIVERY]}`,
          legendTitle: vocabulary[SCHEDULED_DELIVERY],
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
          legendTitle: bgRanges.veryLow,
        },
        {
          id: 'low',
          value: ensureNumeric(data.low),
          title: 'Time Below Range',
          legendTitle: bgRanges.low,
        },
        {
          id: 'target',
          value: ensureNumeric(data.target),
          title: 'Time In Range',
          legendTitle: bgRanges.target,
        },
        {
          id: 'high',
          value: ensureNumeric(data.high),
          title: 'Time Above Range',
          legendTitle: bgRanges.high,
        },
        {
          id: 'veryHigh',
          value: ensureNumeric(data.veryHigh),
          title: 'Time Above Range',
          legendTitle: bgRanges.veryHigh,
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
          value: ensureNumeric(data.bolus),
          title: 'Bolus Insulin',
          legendTitle: 'Bolus',
        },
        {
          id: 'basal',
          value: ensureNumeric(data.basal),
          title: 'Basal Insulin',
          legendTitle: 'Basal',
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

export const getStatTitle = (type, opts = {}) => {
  const { bgSource, days } = opts;
  const vocabulary = getPumpVocabulary(opts.manufacturer);

  let title;

  switch (type) {
    case commonStats.averageGlucose:
      title = `Avg. Glucose (${statBgSourceLabels[bgSource]})`;
      break;

    case commonStats.carbs:
      title = `${days > 1 ? 'Avg. Daily ' : 'Total '}Carbs`;
      break;

    case commonStats.coefficientOfVariation:
      title = `CV (${statBgSourceLabels[bgSource]})`;
      break;

    case commonStats.glucoseManagementIndicator:
      title = `GMI (${statBgSourceLabels[bgSource]})`;
      break;

    case commonStats.readingsInRange:
      title = `${days > 1 ? 'Avg. Daily ' : ''}Readings In Range`;
      break;

    case commonStats.sensorUsage:
      title = 'Sensor Usage';
      break;

    case commonStats.standardDev:
      title = `Standard Deviation (${statBgSourceLabels[bgSource]})`;
      break;

    case commonStats.timeInAuto:
      title = `${days > 1 ? 'Avg. Daily ' : ''}Time In ${vocabulary[AUTOMATED_DELIVERY]}`;
      break;

    case commonStats.timeInRange:
      title = `${days > 1 ? 'Avg. Daily ' : ''}Time In Range`;
      break;

    case commonStats.totalInsulin:
      title = `${days > 1 ? 'Avg. Daily ' : ''}Total Insulin`;
      break;

    default:
      title = '';
      break;
  }

  return title;
};

export const getStatDefinition = (data, type, opts = {}) => {
  let stat = {
    annotations: getStatAnnotations(data, type, opts),
    collapsible: false,
    data: getStatData(data, type, opts),
    id: type,
    title: getStatTitle(type, opts),
    type: statTypes.barHorizontal,
  };

  switch (type) {
    case commonStats.averageGlucose:
      stat.dataFormat = {
        label: statFormats.bgValue,
        summary: statFormats.bgValue,
      };
      stat.type = statTypes.barBg;
      stat.units = _.get(opts, 'bgPrefs.bgUnits');
      break;

    case commonStats.carbs:
      stat.dataFormat = {
        summary: statFormats.carbs,
      };
      stat.type = statTypes.simple;
      break;

    case commonStats.coefficientOfVariation:
      stat.dataFormat = {
        summary: statFormats.cv,
      };
      stat.type = statTypes.simple;
      break;

    case commonStats.glucoseManagementIndicator:
      stat.dataFormat = {
        summary: statFormats.gmi,
      };
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
      stat.reverseLegendOrder = true;
      stat.units = _.get(opts, 'bgPrefs.bgUnits');
      break;

    case commonStats.sensorUsage:
      stat.dataFormat = {
        summary: statFormats.percentage,
      };
      stat.type = statTypes.simple;
      break;

    case commonStats.standardDev:
      stat.dataFormat = {
        label: statFormats.standardDevValue,
        summary: statFormats.standardDevValue,
        title: statFormats.standardDevRange,
      };
      stat.type = statTypes.barBg;
      stat.units = _.get(opts, 'bgPrefs.bgUnits');
      break;

    case commonStats.timeInAuto:
      stat.alwaysShowTooltips = true;
      stat.dataFormat = {
        label: statFormats.percentage,
        summary: statFormats.percentage,
        tooltip: statFormats.duration,
      };
      break;

    case commonStats.timeInRange:
      stat.alwaysShowTooltips = true;
      stat.dataFormat = {
        label: statFormats.percentage,
        summary: statFormats.percentage,
        tooltip: statFormats.duration,
        tooltipTitle: statFormats.bgRange,
      };
      stat.reverseLegendOrder = true;
      stat.units = _.get(opts, 'bgPrefs.bgUnits');
      break;

    case commonStats.totalInsulin:
      stat.alwaysShowTooltips = true;
      stat.dataFormat = {
        label: statFormats.percentage,
        summary: statFormats.units,
        title: statFormats.units,
        tooltip: statFormats.units,
      };
      break;

    default:
      stat = undefined;
      break;
  }

  return stat;
};

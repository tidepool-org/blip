import _ from 'lodash';

export const statTypes = {
  barHorizontal: 'barHorizontal',
  barBg: 'barBg',
  simple: 'simple',
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
  averageBg: 'averageBg',
  averageDailyCarbs: 'averageDailyCarbs',
  coefficientOfVariation: 'coefficientOfVariation',
  glucoseManagementIndex: 'glucoseManagementIndex',
  readingsInRange: 'readingsInRange',
  standardDev: 'standardDev',
  timeInAuto: 'timeInAuto',
  timeInRange: 'timeInRange',
  totalInsulin: 'totalInsulin',
};

export const getSum = data => _.sum(_.map(data, d => d.value));

export const ensureNumeric = value => (_.isNaN(value) ? -1 : parseFloat(value));

export const getStatData = (data, type) => {
  let statData = {};

  switch (type) {
    case commonStats.averageBg:
      statData.data = [
        {
          value: ensureNumeric(data.averageBg),
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
          value: ensureNumeric(data.coefficientOfVariation),
        },
      ];

      statData.dataPaths = {
        summary: 'data.0',
      };
      break;

    case commonStats.glucoseManagementIndex:
      statData.data = [
        {
          id: 'gmi',
          value: ensureNumeric(data.glucoseManagementIndex),
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

    case commonStats.standardDev:
      statData.data = [
        {
          value: ensureNumeric(data.averageBg),
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
          title: 'Time In Auto Mode', // TODO: use labels from pump vocab
        },
        {
          id: 'basal',
          value: ensureNumeric(data.manual),
          title: 'Time In Manual Mode', // TODO: use labels from pump vocab
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

export const getStatDefinition = (data, type) => {
  let stat = {
    data: getStatData(data, type),
    id: type,
    type: statTypes.barHorizontal,
  };

  switch (type) {
    case commonStats.averageBg:
      stat.dataFormat = {
        label: statFormats.bgValue,
        summary: statFormats.bgValue,
      };
      stat.annotations = [
        'Based on 70% CGM data availability for this view.',
        'Average Blood Glucose (mean) is all glucose values added together, divided by the number of readings.',
      ];
      stat.title = 'Average Blood Glucose';
      stat.type = statTypes.barBg;
      break;

    case commonStats.averageDailyCarbs:
      stat.dataFormat = {
        summary: statFormats.carbs,
      };
      stat.annotations = [
        'Based on 10 bolus wizard events available for this view.',
      ];
      stat.title = 'Average Daily Carbs';
      stat.type = statTypes.simple;
      break;

    case commonStats.coefficientOfVariation:
      stat.dataFormat = {
        summary: statFormats.cv,
      };
      stat.annotations = [
        'Based on 70% CGM data availability for this view.',
        'CV (Coefficient of Variation) is…',
      ];
      stat.title = 'CV';
      stat.type = statTypes.simple;
      break;

    case commonStats.glucoseManagementIndex:
      stat.dataFormat = {
        summary: statFormats.gmi,
      };
      stat.annotations = [
        'Based on 70% CGM data availability for this view.',
        'GMI (Glucose Management Indicator) is an estimate of HbA1c that has been calculated based on your average blood glucose.',
      ];
      stat.title = 'GMI';
      stat.type = statTypes.simple;
      break;

    case commonStats.readingsInRange:
      stat.dataFormat = {
        label: statFormats.bgCount,
        summary: statFormats.bgCount,
        tooltip: statFormats.percentage,
        tooltipTitle: statFormats.bgRange,
      };
      stat.annotations = [
        'Based on 7 SMBG readings for this view.',
      ];
      stat.title = 'Readings In Range';
      break;

    case commonStats.standardDev:
      stat.dataFormat = {
        label: statFormats.standardDevValue,
        summary: statFormats.standardDevValue,
        title: statFormats.standardDevRange,
      };
      stat.annotations = [
        'Based on 70% CGM data availability for this view.',
        'SD (Standard Deviation) is…',
      ];
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
      stat.annotations = [
        'Based on 50% pump data availability for this view.',
      ];
      stat.title = 'Time In Auto Mode'; // TODO: use labels from pump vocabulary
      break;

    case commonStats.timeInRange:
      stat.alwaysShowTooltips = true;
      stat.dataFormat = {
        label: statFormats.percentage,
        summary: statFormats.percentage,
        tooltip: statFormats.duration,
        tooltipTitle: statFormats.bgRange,
      };
      stat.annotations = [
        'Based on 70% CGM data availability for this view.',
      ];
      stat.title = 'Time In Range';
      break;

    case commonStats.totalInsulin:
      stat.dataFormat = {
        label: statFormats.percentage,
        summary: statFormats.units,
        title: statFormats.units,
        tooltip: statFormats.units,
      };
      stat.annotations = [
        'Based on 50% pump data availability for this view.',
      ];
      stat.title = 'Total Insulin';
      break;

    default:
      stat = undefined;
      break;
  }

  return stat;
};

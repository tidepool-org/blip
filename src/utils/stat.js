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
  duration: 'duration',
  gmi: 'gmi',
  percentage: 'percentage',
  stdDevRange: 'stdDevRange',
  stdDevValue: 'stdDevValue',
  units: 'units',
};

export const commonStats = {
  readingsInRange: 'readingsInRange',
  timeInAuto: 'timeInAuto',
  timeInRange: 'timeInRange',
  totalInsulin: 'totalInsulin',
};

export const getSum = data => _.sum(_.map(data, d => d.value));

export const ensureNumeric = value => (_.isNaN(value) ? -1 : parseFloat(value));

export const getStatData = (data, type) => {
  let statData = {};

  switch (type) {
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
      stat.title = 'Readings In Range'; // TODO: use labels from pump vocabulary
      break;

    case commonStats.timeInAuto:
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
      stat.dataFormat = {
        label: statFormats.percentage,
        summary: statFormats.percentage,
        tooltip: statFormats.duration,
        tooltipTitle: statFormats.bgRange,
      };
      stat.annotations = [
        'Based on 70% CGM data availability for this view.',
      ];
      stat.title = 'Time In Range'; // TODO: use labels from pump vocabulary
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

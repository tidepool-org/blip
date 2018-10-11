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
  totalInsulin: 'totalInsulin',
  timeInAuto: 'timeInAuto',
};

export const getSum = data => _.sum(_.map(data, d => d.value));

export const ensureNumeric = value => (_.isNaN(value) ? -1 : parseFloat(value));

export const getStatData = (data, type) => {
  let statData = {};

  switch (type) {
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

    default:
      statData = undefined;
      break;
  }

  return statData;
};

export const getStatDefinition = (data, type) => {
  let stat = {
    data: getStatData(data, type),
    type: statTypes.barHorizontal,
  };

  switch (type) {
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

    default:
      stat = undefined;
      break;
  }

  return stat;
};

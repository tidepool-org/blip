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
};

export const getSum = data => _.sum(_.map(data, d => d.value));

export const ensureNumeric = value => (_.isNaN(value) ? -1 : parseFloat(value));

export const getStatData = (data, type) => {
  let statData;

  switch (type) {
    case commonStats.totalInsulin:
      statData = {
        data: [
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
        ],
      };

      statData.total = { id: 'insulin', value: getSum(statData.data) };
      statData.dataPaths = {
        summary: 'total',
        title: 'total',
      };
      break;

    default:
      statData = {};
      break;
  }

  return statData;
};

export const getStatDefinition = (data, type) => {
  let stat = {};

  switch (type) {
    case commonStats.totalInsulin:
      stat = {
        data: getStatData(data, type),
        dataFormat: {
          label: statFormats.percentage,
          summary: statFormats.units,
          title: statFormats.units,
          tooltip: statFormats.units,
        },
        annotations: [
          'Based on 50% pump data availability for this view.',
        ],
        title: 'Total Insulin',
        type: statTypes.barHorizontal,
      };
      break;

    default:
      break;
  }

  return stat;
};

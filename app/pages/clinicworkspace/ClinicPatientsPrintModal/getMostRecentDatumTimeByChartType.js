import pick from 'lodash/pick';
import max from 'lodash/max';
import map from 'lodash/map';

const getMostRecentDatumTimeByChartType = (latestDatumByType, chartType) => {
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

export default getMostRecentDatumTimeByChartType;

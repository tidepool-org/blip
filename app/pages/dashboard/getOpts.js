import moment from 'moment-timezone';
import _ from 'lodash';
import get from 'lodash/get';

const getOpts = (
  data // data from redux (state.blip.data)
) => {
  const getMostRecentDatumTimeByChartType = (data, chartType) => {
    let latestDatums;
    const getLatestDatums = types => _.pick(_.get(data, 'metaData.latestDatumByType'), types);

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
        break

      case 'daily':
        latestDatums = getLatestDatums([
          'basal',
          'bolus',
          'cbg',
          'deviceEvent',
          'food',
          'message',
          'smbg',
          'wizard',
        ]);
        break;

      case 'bgLog':
        latestDatums = getLatestDatums([
          'smbg',
        ]);
        break;

      case 'agpBGM':
        latestDatums = getLatestDatums([
          'smbg',
        ]);
        break;

      case 'agpCGM':
        latestDatums = getLatestDatums([
          'cbg',
        ]);
        break;

      case 'trends':
        latestDatums = getLatestDatums([
          'cbg',
          'smbg',
        ]);
        break;

      default:
        latestDatums = [];
        break;
    }

    return _.max(_.map(latestDatums, d => (d.normalEnd || d.normalTime)));
  }

  const mostRecentDatumDates = {
    agpBGM: getMostRecentDatumTimeByChartType(data, 'agpBGM'),
    agpCGM: getMostRecentDatumTimeByChartType(data, 'agpCGM'),
    basics: getMostRecentDatumTimeByChartType(data, 'basics'),
    bgLog: getMostRecentDatumTimeByChartType(data, 'bgLog'),
    daily: getMostRecentDatumTimeByChartType(data, 'daily'),
  };

  // TODO: use vizUtils
  const timezoneName = data?.timePrefs?.timezoneName || 'UTC';

  const rangePresets = { // may vary; stored in localStorage
    agpBGM: 1,
    agpCGM: 1,
    basics: 0,
    bgLog: 2,
    daily: 0,
  };

  const presetDaysOptions = {
    agpBGM: [14, 30],
    agpCGM: [7, 14, 30],
    basics: [14, 21, 30, 90],
    bgLog: [14, 21, 30, 90],
    daily: [14, 21, 30, 90],
  };

  const endOfToday = moment.utc().tz(timezoneName).endOf('day').subtract(1, 'ms');

  const setDateRangeToExtents = ({ startDate, endDate }) => ({
    startDate: startDate ? moment.utc(startDate).tz(timezoneName).startOf('day') : null,
    endDate: endDate ? moment.utc(endDate).tz(timezoneName).endOf('day').subtract(1, 'ms') : null,
  });

  const getLastNDays = (days, chartType) => {
    const endDate = get(mostRecentDatumDates, chartType)
      ? moment.utc(mostRecentDatumDates[chartType])
      : endOfToday;

    return setDateRangeToExtents({
      startDate: moment.utc(endDate).tz(timezoneName).subtract(days - 1, 'days'),
      endDate,
    });
  };

  const defaultDates = () => ({
    agpBGM: getLastNDays(presetDaysOptions.agpBGM[rangePresets.agpBGM], 'agpBGM'),
    agpCGM: getLastNDays(presetDaysOptions.agpCGM[rangePresets.agpCGM], 'agpCGM'),
    basics: getLastNDays(presetDaysOptions.basics[rangePresets.basics], 'basics'),
    bgLog: getLastNDays(presetDaysOptions.bgLog[rangePresets.bgLog], 'bgLog'),
    daily: getLastNDays(presetDaysOptions.daily[rangePresets.daily], 'daily'),
  });

  const dates = defaultDates();

  const formatDateEndpoints = ({ startDate, endDate }) => (startDate && endDate ? [
    startDate.valueOf(),
    moment.utc(endDate).tz(timezoneName).add(1, 'day').startOf('day').valueOf(),
  ] : []);

  const opts = {
    agpCGM:   { disabled: false, endpoints: formatDateEndpoints(dates.agpCGM) },
    agpBGM:   { disabled: false, endpoints: formatDateEndpoints(dates.agpBGM) },

    basics:   { disabled: true,  endpoints: formatDateEndpoints(dates.basics) },
    bgLog:    { disabled: true,  endpoints: formatDateEndpoints(dates.bgLog) },
    daily:    { disabled: true,  endpoints: formatDateEndpoints(dates.daily) },
    settings: { disabled: true },
  };

  return opts;
};

export default getOpts;
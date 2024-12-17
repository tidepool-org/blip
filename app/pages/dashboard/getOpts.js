import moment from 'moment-timezone';
import _ from 'lodash';
import get from 'lodash/get';
import { utils as vizUtils } from '@tidepool/viz';

const getTimezoneFromTimePrefs = vizUtils.datetime.getTimezoneFromTimePrefs;

const getOpts = (
  data // data from redux (state.blip.data)
) => {
  const getMostRecentDatumTimeByChartType = (data, chartType) => {
    let latestDatums;
    const getLatestDatums = types => _.pick(_.get(data, 'metaData.latestDatumByType'), types);

    switch (chartType) { // cases for 'trends', 'bgLog', 'daily', and 'basics' omitted
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

      default:
        latestDatums = [];
        break;
    }

    return _.max(_.map(latestDatums, d => (d.normalEnd || d.normalTime)));
  }

  const mostRecentDatumDates = {
    agpBGM: getMostRecentDatumTimeByChartType(data, 'agpBGM'),
    agpCGM: getMostRecentDatumTimeByChartType(data, 'agpCGM'),
  };

  const timezoneName = getTimezoneFromTimePrefs(data?.timePrefs);

  const rangePresets = { // may vary; stored in localStorage
    agpBGM: 1,
    agpCGM: 1,
    // basics: 0,
    // bgLog: 2,
    // daily: 0,
  };

  const presetDaysOptions = {
    agpBGM: [14, 30],
    agpCGM: [7, 14, 30],
    // basics: [14, 21, 30, 90],
    // bgLog: [14, 21, 30, 90],
    // daily: [14, 21, 30, 90],
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

  const defaultDates = () => ({ // 'trends', 'bgLog', 'daily', and 'basics' omitted
    agpBGM: getLastNDays(presetDaysOptions.agpBGM[rangePresets.agpBGM], 'agpBGM'),
    agpCGM: getLastNDays(presetDaysOptions.agpCGM[rangePresets.agpCGM], 'agpCGM'),
  });

  const dates = defaultDates();

  const formatDateEndpoints = ({ startDate, endDate }) => (startDate && endDate ? [
    startDate.valueOf(),
    moment.utc(endDate).tz(timezoneName).add(1, 'day').startOf('day').valueOf(),
  ] : []);

  const opts = {
    agpCGM:   { disabled: false, endpoints: formatDateEndpoints(dates.agpCGM) },
    agpBGM:   { disabled: false, endpoints: formatDateEndpoints(dates.agpBGM) },

    basics:   { disabled: true },
    bgLog:    { disabled: true },
    daily:    { disabled: true },
    settings: { disabled: true },
  };

  return opts;
};

export default getOpts;
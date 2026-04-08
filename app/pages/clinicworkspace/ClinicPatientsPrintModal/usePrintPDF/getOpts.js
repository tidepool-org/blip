import moment from 'moment-timezone';
import _ from 'lodash';
import get from 'lodash/get';
import { utils as vizUtils } from '@tidepool/viz';
import utils from '../../../../core/utils';

const getTimezoneFromTimePrefs = vizUtils.datetime.getTimezoneFromTimePrefs;

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

  return _.max(_.map(latestDatums, d => (d.normalEnd || d.normalTime)));
};

const getOpts = (
  data, // data from redux (state.blip.data)
  agpPeriodInDays,
) => {
  const mostRecentDatumDates = {
    agpCGM: getMostRecentDatumTimeByChartType(data, 'agpCGM'),
  };

  const timePrefs = (() => {
    const latestTimeZone = data?.metaData?.latestTimeZone;
    const queryParams = {};

    const localTimePrefs = utils.getTimePrefsForDataProcessing(latestTimeZone, queryParams);

    return localTimePrefs;
  })();

  const timezoneName = getTimezoneFromTimePrefs(timePrefs);

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

  // Get the date range for the current AGP, ending the date of the latest datum
  const dates = getLastNDays(agpPeriodInDays, 'agpCGM');

  // Get the date range for the offset AGP, ending the moment before the start of current AGP
  const offsetDates = {
    startDate: dates.startDate.clone().subtract(agpPeriodInDays, 'days'),
    endDate: dates.startDate.clone().subtract(1, 'ms'),
  };

  const formatDateEndpoints = ({ startDate, endDate }) => (startDate && endDate ? [
    startDate.valueOf(),
    moment.utc(endDate).tz(timezoneName).add(1, 'day').startOf('day').valueOf(),
  ] : []);

  const formatBasicsDateEndpoints = ({ startDate, endDate }) => (startDate && endDate ? [
    moment.utc(startDate).tz(timezoneName).valueOf(),
    moment.utc(endDate).tz(timezoneName).valueOf(),
  ] : []);

  const opts = {
    // agpCGM:       { disabled: false, endpoints: formatDateEndpoints(dates) },
    // offsetAgpCGM: { disabled: false, endpoints: formatDateEndpoints(offsetDates) },
    // agpBGM:       { disabled: true },
    // basics:       { disabled: true },
    // bgLog:        { disabled: true },
    // daily:        { disabled: true },
    // settings:     { disabled: true },

    agpBGM: { endpoints: formatDateEndpoints(dates.agpBGM), disabled: !enabled.agpBGM },
    agpCGM: { endpoints: formatDateEndpoints(dates.agpCGM), disabled: !enabled.agpCGM },
    basics: { endpoints: formatBasicsDateEndpoints(dates.basics), disabled: !enabled.basics },
    bgLog: { endpoints: formatDateEndpoints(dates.bgLog), disabled: !enabled.bgLog },
    daily: { endpoints: formatDateEndpoints(dates.daily), disabled: !enabled.daily },
    settings: { disabled: !enabled.settings },
  };

  return opts;
};

export default getOpts;

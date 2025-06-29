import moment from 'moment-timezone';
import _ from 'lodash';
import get from 'lodash/get';
import { utils as vizUtils } from '@tidepool/viz';
import utils from '../../../../core/utils';

const getTimezoneFromTimePrefs = vizUtils.datetime.getTimezoneFromTimePrefs;

const getOpts = (
  data, // data from redux (state.blip.data)
  agpPeriodInDays,
) => {
  const getMostRecentDatumTimeByChartType = (data, _chartType) => {
    const getLatestDatums = types => _.pick(_.get(data, 'metaData.latestDatumByType'), types);

    let latestDatums = getLatestDatums(['cbg']) || [];

    return _.max(_.map(latestDatums, d => (d.normalEnd || d.normalTime)));
  };

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

  const dates = getLastNDays(agpPeriodInDays, 'agpCGM');

  const offsetDates = {
    startDate: dates.startDate.clone().subtract(agpPeriodInDays, 'days'),
    endDate: dates.endDate.clone().subtract(agpPeriodInDays, 'days'),
  };

  const formatDateEndpoints = ({ startDate, endDate }) => (startDate && endDate ? [
    startDate.valueOf(),
    moment.utc(endDate).tz(timezoneName).add(1, 'day').startOf('day').valueOf(),
  ] : []);

  const opts = {
    agpCGM:       { disabled: false, endpoints: formatDateEndpoints(dates) },
    offsetAgpCGM: { disabled: false, endpoints: formatDateEndpoints(offsetDates) },
    agpBGM:       { disabled: true },
    basics:       { disabled: true },
    bgLog:        { disabled: true },
    daily:        { disabled: true },
    settings:     { disabled: true },
  };

  return opts;
};

export default getOpts;

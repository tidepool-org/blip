import moment from 'moment-timezone';
import _ from 'lodash';
import get from 'lodash/get';
import { utils as vizUtils } from '@tidepool/viz';
import utils from '../../../../core/utils';
import { getMostRecentDatumTimeByChartType } from '../../../../core/dataViewUtils';

const { getLocalizedCeiling, getTimezoneFromTimePrefs } = vizUtils.datetime;

const getOpts = (
  requestId,
  data, // data from redux (state.blip.data)
  agpPeriodInDays,
) => {
  const latestDatumByType = _.get(data, 'metaData.latestDatumByType');
  const mostRecentDatumDates = {
    agpCGM: getMostRecentDatumTimeByChartType(latestDatumByType, 'agpCGM'),
  };

  const timePrefs = (() => {
    const latestTimeZone = data?.metaData?.latestTimeZone;
    const queryParams = {};

    const localTimePrefs = utils.getTimePrefsForDataProcessing(latestTimeZone, queryParams);

    return localTimePrefs;
  })();

  const timezoneName = getTimezoneFromTimePrefs(timePrefs);

  const endOfToday = moment.utc().tz(timezoneName).endOf('day').subtract(1, 'ms');

  const getLastN24HourPeriods = (numOfPeriods, chartType) => {
    const endDate = get(mostRecentDatumDates, chartType)
      ? moment.utc(mostRecentDatumDates[chartType])
      : endOfToday;

    const endHourCeiling = getLocalizedCeiling(endDate.valueOf(), timePrefs, 'hour');

    const startDate = moment.utc(endDate).tz(timezoneName).subtract(numOfPeriods, 'days');
    const startHourCeiling = getLocalizedCeiling(startDate.valueOf(), timePrefs, 'hour');

    return ({
      startDate: moment.utc(startHourCeiling).tz(timezoneName),
      endDate: moment.utc(endHourCeiling).tz(timezoneName),
    });
  };

  // Get the date range for the current AGP, ending at the hour ceiling of the latest datum
  const dates = getLastN24HourPeriods(agpPeriodInDays, 'agpCGM');

  // Get the date range for the offset AGP, ending exactly where the current AGP begins
  const offsetDates = {
    startDate: dates.startDate.clone().subtract(agpPeriodInDays, 'days'),
    endDate: dates.startDate.clone(),
  };

  const formatDateEndpoints = ({ startDate, endDate }) => (startDate && endDate ? [
    startDate.valueOf(),
    endDate.valueOf(),
  ] : []);

  const opts = {
    requestId,
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

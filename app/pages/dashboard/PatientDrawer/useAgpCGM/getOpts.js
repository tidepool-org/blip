import _ from 'lodash';
import utils from '../../../../core/utils';
import { getLastN24HourPeriods } from '../../../../core/datetime';
import { getMostRecentDatumTimeByChartType } from '../../../../core/dataViewUtils';

const getOpts = (
  requestId,
  data, // data from redux (state.blip.data)
  agpPeriodInDays,
) => {
  const latestDatumByType = _.get(data, 'metaData.latestDatumByType');
  const mostRecentDatumDate = getMostRecentDatumTimeByChartType(latestDatumByType, 'agpCGM');

  const timePrefs = (() => {
    const latestTimeZone = data?.metaData?.latestTimeZone;
    const queryParams = {};

    const localTimePrefs = utils.getTimePrefsForDataProcessing(latestTimeZone, queryParams);

    return localTimePrefs;
  })();

  // Get the date range for the current AGP, ending at the hour ceiling of the latest datum
  const dates = getLastN24HourPeriods(agpPeriodInDays, timePrefs, mostRecentDatumDate);

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

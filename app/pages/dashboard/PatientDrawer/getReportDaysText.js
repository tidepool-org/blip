import moment from 'moment-timezone';
import { MS_IN_MIN } from '../../../core/constants';
import { utils as vizUtils } from '@tidepool/viz';
const { getOffset, formatChartDateBounds } = vizUtils.datetime;

const getReportDaysText = ({ endpointsRange = [], newestDatum, bgDaysWorn, timezone }) => {
  if (bgDaysWorn === 1) {
    return moment.utc(newestDatum?.time - getOffset(newestDatum?.time, timezone) * MS_IN_MIN).format('MMMM D, YYYY');
  }

  return formatChartDateBounds(endpointsRange[0], endpointsRange[1], timezone, 'MMMM');
};

export default getReportDaysText;

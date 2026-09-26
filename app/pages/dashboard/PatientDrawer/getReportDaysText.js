import moment from 'moment';
import { MS_IN_MIN } from '../../../core/constants';
import { utils as vizUtils } from '@tidepool/viz';
const { getOffset, formatDataDateRange } = vizUtils.datetime;

const getReportDaysText = ({ newestDatum, oldestDatum, bgDaysWorn, timezone }) => {
  if (bgDaysWorn === 1) {
    return moment.utc(newestDatum?.time - getOffset(newestDatum?.time, timezone) * MS_IN_MIN).format('MMM D, YYYY');
  }

  return formatDataDateRange(oldestDatum?.time, newestDatum?.time, { timezone });
};

export default getReportDaysText;

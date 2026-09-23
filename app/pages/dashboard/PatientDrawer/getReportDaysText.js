import moment from 'moment';
import { MS_IN_MIN } from '../../../core/constants';
import { utils as vizUtils } from '@tidepool/viz';
const { getOffset, formatDataDateRange } = vizUtils.datetime;

// Describes the span of data in the report. The time of day of the oldest and newest data is
// included only when the report's date range is offset from midnight, e.g.
// 'June 6 (4:02 PM) - June 20, 2025 (3:57 PM)'
const getReportDaysText = ({ endpointsRange, newestDatum, oldestDatum, bgDaysWorn, timezone }) => {
  if (bgDaysWorn === 1) {
    return moment.utc(newestDatum?.time - getOffset(newestDatum?.time, timezone) * MS_IN_MIN).format('MMMM D, YYYY');
  }

  return formatDataDateRange(oldestDatum?.time, newestDatum?.time, {
    chartEndpoints: endpointsRange,
    timezone,
  });
};

export default getReportDaysText;

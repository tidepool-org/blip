import moment from 'moment';
import { MS_IN_MIN } from '../../../core/constants';
import isNumber from 'lodash/isNumber';
import { utils as vizUtils } from '@tidepool/viz';
const { getOffset, formatDateRange } = vizUtils.datetime;

const getDateRange = (startDate, endDate, dateParseFormat, _prefix, monthFormat, timezone) => {
  let start = startDate;
  let end = endDate;

  if (isNumber(startDate) && isNumber(endDate)) {
    start = startDate - getOffset(startDate, timezone) * MS_IN_MIN;
    end = endDate - getOffset(endDate, timezone) * MS_IN_MIN;
  }

  return formatDateRange(start, end, dateParseFormat, monthFormat);
};

const getReportDaysText = (newestDatum, oldestDatum, bgDaysWorn, timezone) => {
  const reportDaysText = bgDaysWorn === 1
    ? moment.utc(newestDatum?.time - getOffset(newestDatum?.time, timezone) * MS_IN_MIN).format('MMMM D, YYYY')
    : getDateRange(oldestDatum?.time, newestDatum?.time, undefined, '', 'MMMM', timezone);

  return reportDaysText;
};

export default getReportDaysText;

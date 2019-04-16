/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import _ from 'lodash';
import moment from 'moment-timezone';
import { extent } from 'd3-array';

import { getBasalSequences, getGroupDurations } from '../../utils/basal';
import { getLatestPumpUpload } from '../../utils/device';
import { getTimezoneFromTimePrefs, getLocalizedCeiling } from '../../utils/datetime';

/**
 * stripDatum
 * @param {Object} d - a Tidepool datum
 *
 * @return {Object} Tidepool datum stripped of all fields not needed client-side
 */
export function stripDatum(d) {
  return _.assign({}, _.omit(
    d,
    [
      'clockDriftOffset',
      'conversionOffset',
      'createdUserId',
      'deviceId',
      'deviceSerialNumber',
      'deviceTime',
      'displayOffset',
      'guid',
      'localDayOfWeek',
      'localDate',
      'modifiedUserId',
      'payload',
      'scheduleName',
      'source',
      'time',
      'timezoneOffset',
      'units',
      'uploadId',
    ]
  ));
}

/**
 * filterWithDurationFnMaker
 *
 * @param {String} dateStart - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {String} dateEnd - an ISO 8601-formatted timestamp of the most recent diabetes datum
 *
 * @returns {Function} Function that recieves a Tidepool datum with an extended duration
 *                     to determine if it falls into the given range
 */
export function filterWithDurationFnMaker(dateStart, dateEnd) {
  return (d) => {
    if (d.normalTime && d.normalEnd) {
      if (d.normalTime === dateStart) {
        return true;
      } else if (d.normalTime < dateStart &&
        (d.normalEnd > dateStart && d.normalEnd <= dateEnd)) {
        return true;
      } else if (d.normalTime > dateStart && d.normalTime < dateEnd) {
        return true;
      }
      return false;
    }
    return (d.normalTime >= dateStart) && (d.normalTime < dateEnd);
  };
}

/**
 * filterPointInTimeFnMaker
 *
 * @param {String} dateStart - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {String} dateEnd - an ISO 8601-formatted timestamp of the most recent diabetes datum
 *
 * @returns {Function} Function that recieves a Tidepool datum to determine if it falls into
 *                     the given range
 */
export function filterPointInTimeFnMaker(dateStart, dateEnd) {
  return (d) => ((d.normalTime >= dateStart) && (d.normalTime < dateEnd));
}

/**
 * processDateBoundaries
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Array} groupedData - Object of tideline-preprocessed Tidepool diabetes data & notes;
 *                              grouped by type
 * @param {Number} numDays - number of days of data to select
 * @param {Object} timePrefs - object containing timezoneAware Boolean, timezoneName String or null
 * @returns {Object} the date boundaries for the provided data
 */
function processDateBoundaries(mostRecent, groupedData, numDays, timePrefs) {
  const timezone = getTimezoneFromTimePrefs(timePrefs);
  const end = getLocalizedCeiling(mostRecent, timePrefs);

  const dateBoundaries = [end.toISOString()];
  let last = end;
  for (let i = 0; i < numDays; ++i) {
    const startOfDate = moment.utc(last)
      .tz(timezone)
      .subtract(1, 'day')
      .toDate();
    dateBoundaries.push(
      startOfDate.toISOString()
    );
    last = startOfDate;
  }
  dateBoundaries.reverse();

  const selected = { dataByDate: {}, dateRange: [], timezone };

  for (let i = 0; i < numDays; ++i) {
    const thisDateStart = dateBoundaries[i];
    const thisDateEnd = dateBoundaries[i + 1];
    const date = moment.utc(Date.parse(thisDateStart))
      .tz(timezone)
      .format('YYYY-MM-DD');
    selected.dataByDate[date] = {
      bounds: [Date.parse(thisDateStart), Date.parse(thisDateEnd)],
      date,
      data: _.mapValues(groupedData, (dataForType) => {
        if (_.isEmpty(dataForType)) {
          return [];
        }
        const filterFn = _.includes(['basal', 'bolus'], dataForType[0].type) ?
          filterWithDurationFnMaker(thisDateStart, thisDateEnd) :
          filterPointInTimeFnMaker(thisDateStart, thisDateEnd);
        return _.sortBy(_.map(
          _.filter(dataForType, filterFn),
          (d) => {
            const reshaped = stripDatum(d);
            if (reshaped.suppressed) {
              reshaped.suppressed = stripDatum(reshaped.suppressed);
            }
            reshaped.utc = Date.parse(d.normalTime);
            return reshaped;
          },
        ), 'utc');
      }),
    };

    if (i === 0 || i === numDays - 1) {
      selected.dateRange.push(date);
    }
    // TODO: select out infusion site changes, calibrations from deviceEvent array
    // (NB: deviceEvent not being passed through via blip yet!!)
  }

  return selected;
}

/**
 * processBgRange
 * @param {*} selectedDataByDate - Array of Tidepool datums
 * @returns {Array} the extent of bg range values
 */
function processBgRange(selectedDataByDate) {
  const bgs = _.reduce(
    selectedDataByDate,
    (all, date) => (
      all.concat(_.get(date, ['data', 'cbg'], [])).concat(_.get(date, ['data', 'smbg'], []))
    ),
    []
  );
  return extent(bgs, (d) => (d.value));
}

/**
 * selectDailyViewData
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Array} groupedData - Object of tideline-preprocessed Tidepool diabetes data & notes;
 *                              grouped by type
 * @param {Number} numDays - number of days of data to select
 * @param {Object} timePrefs - object containing timezoneAware Boolean, timezoneName String or null
 *
 * @return {Object} selected data for daily print view
 */
export function selectDailyViewData(mostRecent, groupedData, numDays, timePrefs) {
  const selected = processDateBoundaries(mostRecent, groupedData, numDays, timePrefs);
  const { dataByDate: selectedDataByDate } = selected;

  selected.bgRange = processBgRange(selectedDataByDate);

  const boluses = _.reduce(
    selectedDataByDate, (all, date) => (all.concat(_.get(date, ['data', 'bolus'], []))), []
  );
  _.each(boluses, (bolus) => {
    // eslint-disable-next-line no-param-reassign
    bolus.threeHrBin = Math.floor(moment.utc(bolus.utc).tz(selected.timezone).hours() / 3) * 3;
  });
  selected.bolusRange = extent(boluses, (d) => (d.normal + (d.extended || 0)));

  _.each(selectedDataByDate, (dateObj) => {
    const { data: { bolus: bolusesForDate } } = dateObj;
    selectedDataByDate[dateObj.date].data.bolus = _.map(bolusesForDate, (bolus) => {
      if (bolus.wizard) {
        const reversed = stripDatum(bolus.wizard);
        reversed.bolus = _.omit(bolus, 'wizard');
        return reversed;
      }
      return bolus;
    });
  });

  const allBasals = _.reduce(
    selectedDataByDate, (all, date) => (all.concat(_.get(date, ['data', 'basal'], []))), []
  );
  const rawBasalRange = extent(
    allBasals,
    (d) => (_.max([_.get(d, ['suppressed', 'rate'], 0), d.rate]))
  );
  // multiply the max rate by 1.1 to add a little buffer so the highest basals
  // don't sit at the very top of the basal rendering area and bump into boluses
  selected.basalRange = [0, rawBasalRange[1] * 1.1];

  _.each(selected.dataByDate, (dateData) => {
    const { bounds, data: { basal: basals } } = dateData;
    for (let i = 0; i < basals.length; ++i) {
      const basal = basals[i];
      // trim the first and last basals to fit within the date's bounds
      if (basal.utc < bounds[0]) {
        basal.duration = basal.duration - (bounds[0] - basal.utc);
        basal.utc = bounds[0];
      }
      if (i === basals.length - 1 && dateData.date !== selected.dateRange[1]) {
        basal.duration = bounds[1] - basal.utc;
      }
      let nextBasal;
      basal.subType = basal.deliveryType;
      delete basal.deliveryType;
      if (i !== basals.length - 1) {
        nextBasal = basals[i + 1];
        if ((basal.utc + basal.duration) !== nextBasal.utc) {
          basal.discontinuousEnd = true;
          nextBasal.discontinuousStart = true;
        }
      }
    }
    /* eslint-disable no-param-reassign */
    dateData.data.basalSequences = getBasalSequences(basals);
    dateData.data.timeInAutoRatio = getGroupDurations(basals, bounds[0], bounds[1]);
    /* eslint-enable no-param-reassign */
  });

  if (_.get(groupedData, 'upload.length', 0) > 0) {
    selected.latestPumpUpload = getLatestPumpUpload(groupedData.upload);
  }

  return selected;
}

/**
 * selectBgLogViewData
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Array} groupedData - Object of tideline-preprocessed Tidepool smbg data;
 *                              grouped by type
 * @param {Number} numDays - number of days of data to select
 * @param {Object} timePrefs - object containing timezoneAware Boolean, timezoneName String or null
 *
 * @return {Object} selected data for BG Log print view
 */
export function selectBgLogViewData(mostRecent, groupedData, numDays, timePrefs) {
  const selected = processDateBoundaries(mostRecent, groupedData, numDays, timePrefs);
  return selected;
}

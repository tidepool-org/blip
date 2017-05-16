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

import { getTimezoneFromTimePrefs, getLocalizedCeiling } from '../../utils/datetime';

/**
 * stripDatum
 * @param {Object} d - a Tidepool datum
 *
 * @return {Object} Tidepool datum stripped of all fields not needed client-side
 */
function stripDatum(d) {
  return _.assign({}, _.omit(
    d,
    [
      'clockDriftOffset',
      'conversionOffset',
      'deviceId',
      'deviceSerialNumber',
      'deviceTime',
      'displayOffset',
      'guid',
      'localDayOfWeek',
      'localDate',
      'normalEnd',
      'normalTime',
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
 * selectData
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Array} groupedData - Object of tideline-preprocessed Tidepool diabetes data & notes;
 *                       grouped by type
 * @param {Number} numDays - number of days of data to select
 * @param {Object} timePrefs - object containing timezoneAware Boolean, timezoneName String or null
 *
 * @return {Object} selected data for daily print view
 */
export function selectDailyViewData(mostRecent, groupedData, numDays, timePrefs) {
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
  const selected = { dataByDate: {} };
  const { dataByDate: selectedDataByDate } = selected;

  // eslint-disable-next-line require-jsdoc
  function filterWithDurationFnMaker(dateStart, dateEnd) {
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

  // eslint-disable-next-line require-jsdoc
  function filterPointInTimeFnMaker(dateStart, dateEnd) {
    return (d) => ((d.normalTime >= dateStart) && (d.normalTime < dateEnd));
  }

  for (let i = 0; i < numDays; ++i) {
    const thisDateStart = dateBoundaries[i];
    const thisDateEnd = dateBoundaries[i + 1];
    const date = moment.utc(Date.parse(thisDateStart))
      .tz(timezone)
      .format('YYYY-MM-DD');
    selected.dataByDate[date] = {
      bounds: [thisDateStart, thisDateEnd],
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
    // TODO: select out infusion site changes, calibrations from deviceEvent array
    // (NB: deviceEvent not being passed through via blip yet!!)
  }
  // TODO: properly factor out into own utility? API needs thinking about
  const bgs = _.reduce(
    selectedDataByDate,
    (all, date) => (
      all.concat(_.get(date, ['data', 'cbg'], [])).concat(_.get(date, ['data', 'smbg'], []))
    ),
    []
  );
  selected.bgRange = extent(bgs, (d) => (d.value));

  const boluses = _.reduce(
    selectedDataByDate, (all, date) => (all.concat(_.get(date, ['data', 'bolus'], []))), []
  );
  _.each(boluses, (bolus) => {
    // eslint-disable-next-line no-param-reassign
    bolus.threeHrBin = Math.floor(moment.utc(bolus.utc).tz(timezone).hours() / 3) * 3;
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
  selected.basalRange = extent(
    allBasals,
    (d) => (_.max([_.get(d, ['suppressed', 'rate'], 0), d.rate]))
  );

  _.each(selected.dataByDate, (dateData) => {
    const { data: { basal: basals } } = dateData;
    for (let i = 0; i < basals.length; ++i) {
      const basal = basals[i];
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
    // eslint-disable-next-line no-param-reassign
    dateData.data.basalSequences = [];
    const basalSequences = dateData.data.basalSequences;
    let idx = 0;
    let currentBasal = basals[0];
    let seq = [basals[0]];
    while (idx < basals.length - 1) {
      const nextBasal = basals[idx + 1];
      if (nextBasal.subType !== currentBasal.subType || currentBasal.discontinuousEnd) {
        basalSequences.push(seq);
        seq = [];
      }
      seq.push(nextBasal);
      currentBasal = nextBasal;
      ++idx;
    }
    const finalBasal = basals[basals.length - 1];
    if (!finalBasal.discontinuousStart) {
      seq.push(finalBasal);
      basalSequences.push(seq);
    } else {
      basalSequences.push(seq);
      basalSequences.push([finalBasal]);
    }
  });

  return selected;
}

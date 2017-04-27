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

import { timezoneAwareCeiling } from '../../utils/datetime';

/**
 * selectData
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Object} dataByDate - a Crossfilter dimension for querying diabetes data by normalTime
 * @param {Number} numDays - number of days of data to select
 * @param {String} timezone - named timezone; UTC if timezone-naive rendering is on
 *
 * @return {Object} selected data for daily print view
 */
export function selectDailyViewData(mostRecent, dataByDate, numDays, timezone) {
  const end = timezoneAwareCeiling(mostRecent, timezone);
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
  for (let i = 0; i < numDays; ++i) {
    const start = dateBoundaries[i];
    const date = moment.utc(Date.parse(start))
      .tz(timezone)
      .format('YYYY-MM-DD');
    selected.dataByDate[date] = {
      bounds: [start, dateBoundaries[i + 1]],
      date,
      data: _.groupBy(dataByDate.filterRange([start, dateBoundaries[i + 1]]).top(Infinity), 'type'),
    };
    // NB: this assumes wizards are embedded into boluses as whole objects, not IDs
    const typesToDelete = ['fill', 'pumpSettings', 'wizard'];
    // get rid of irrelevant data types for...neatness?
    _.each(typesToDelete, (type) => {
      if (selectedDataByDate[date].data[type]) {
        delete selectedDataByDate[date].data[type];
      }
    });
    // TODO: select out infusion site changes, calibrations from deviceEvent array
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
    bolus.threeHrBin = Math.floor(moment.utc(bolus.normalTime).tz(timezone).hours() / 3) * 3;
  });
  selected.bolusRange = extent(boluses, (d) => (d.normal + (d.extended || 0)));

  _.each(selectedDataByDate, (dateObj) => {
    const { data: { bolus: bolusesForDate } } = dateObj;
    selectedDataByDate[dateObj.date].data.bolus = _.map(bolusesForDate, (bolus) => {
      if (bolus.wizard) {
        const reversed = _.cloneDeep(bolus.wizard);
        reversed.bolus = _.omit(bolus, 'wizard');
        return reversed;
      }
      return bolus;
    });
  });

  const basals = _.reduce(
    selectedDataByDate, (all, date) => (all.concat(_.get(date, ['data', 'basal'], []))), []
  );
  selected.basalRange = extent(basals, (d) => (d.rate));

  console.log('DAILY PRINT VIEW DATA', selected);
  return selected;
}

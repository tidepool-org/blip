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

import {
  getTimezoneFromTimePrefs,
  timezoneAwareCeiling,
} from '../../utils/datetime';

/**
 * selectData
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Object} dataByDate - a Crossfilter dimension for querying diabetes data by normalTime
 * @param {Number} numDays - number of days of data to select
 *
 * @return {TYPE} NAME
 */
export function selectDailyViewData(mostRecent, dataByDate, numDays, timePrefs) {
  const timezone = getTimezoneFromTimePrefs(timePrefs);
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
  const selected = {};
  for (let i = 0; i < numDays; ++i) {
    const start = dateBoundaries[i];
    const date = moment.utc(Date.parse(start))
      .tz(timezone)
      .format('YYYY-MM-DD');
    selected[date] = {
      bounds: [start, dateBoundaries[i + 1]],
      date,
      data: _.groupBy(dataByDate.filterRange([start, dateBoundaries[i + 1]]).top(Infinity), 'type'),
    };
    // get rid of irrelevant data types for...neatness?
    if (selected[date].data.fill) {
      delete selected[date].data.fill;
    }
    if (selected[date].data.pumpSettings) {
      delete selected[date].data.pumpSettings;
    }
    if (selected[date].data.wizard) {
      const wizards = selected[date].data.wizard;
      selected[date].data.wizard = _.reduce(wizards, (wizardsMap, wiz) => {
        wizardsMap[wiz.bolus.id] = wiz; // eslint-disable-line no-param-reassign
        return wizardsMap;
      }, {});
    }
    // TODO: select out infusion site changes, calibrations from deviceEvent array
  }
  // TODO: properly factor out into own utility? API needs thinking about
  const bgs = _.reduce(
    selected,
    (all, date) => (
      all.concat(_.get(date, ['data', 'cbg'], [])).concat(_.get(date, ['data', 'smbg'], []))
    ),
    []
  );
  selected.bgRange = extent(bgs, (d) => (d.value));

  const boluses = _.reduce(
    selected, (all, date) => (all.concat(_.get(date, ['data', 'bolus'], []))), []
  );
  selected.bolusRange = extent(boluses, (d) => (d.normal + (d.extended || 0)));

  const basals = _.reduce(
    selected, (all, date) => (all.concat(_.get(date, ['data', 'basal'], []))), []
  );
  selected.basalRange = extent(basals, (d) => (d.rate));

  console.log('DAILY PRINT VIEW DATA', selected);
  return selected;
}

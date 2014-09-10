/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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

// TODO: eventually to be combined with js/data/util/datetime.js
// and moved into sundial

module.exports = {
  addDuration: function(datetime, duration) {
    if (typeof(datetime) === 'string') {
      datetime = new Date(datetime);
    }

    return new Date(datetime.valueOf() + duration).toISOString();
  },
  difference: function(d2, d1) {
    return new Date(d2) - new Date(d1);
  }
};
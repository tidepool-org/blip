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

module.exports = {
  TidelineData: require('./tidelinedata'),
  pool: require('./pool'),
  oneDay: require('./oneday'),
  twoWeek: require('./twoweek'),

  data: {
    BasalUtil: require('./data/basalutil'),
    BolusUtil: require('./data/bolusutil'),
    CBGUtil: require('./data/cbgutil'),
    DeviceUtil: require('./data/deviceutil'),
    SegmentUtil: require('./data/segmentutil'),
    util: {
      datetime: require('./data/util/datetime'),
      format: require('./data/util/format')
    }
  },

  lib: require('./lib/index'),

  plot: {
    basal: require('./plot/basal'),
    bolus: require('./plot/bolus'),
    carbs: require('./plot/carbs'),
    cbg: require('./plot/cbg'),
    message: require('./plot/message'),
    SMBGTime: require('./plot/smbgtime'),
    smbg: require('./plot/smbg'),
    stats: {
      puddle: require('./plot/stats/puddle'),
      widget: require('./plot/stats/widget')
    },
    util: {
      fill: require('./plot/util/fill'),
      scales: require('./plot/util/scales'),
      tooltip: require('./plot/util/tooltip')
    }
  }
};

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
  settings: require('./settings'),

  data: {
    BasalUtil: require('./data/basalutil'),
    BolusUtil: require('./data/bolusutil'),
    BGUtil: require('./data/bgutil'),
    DeviceUtil: require('./data/deviceutil'),
    SegmentUtil: require('./data/segmentutil'),
    SettingsUtil: require('./data/settingsutil'),
    util: {
      datetime: require('./data/util/datetime'),
      format: require('./data/util/format'),
      TidelineCrossFilter: require('./data/util/tidelinecrossfilter')
    }
  },

  lib: require('./lib/index'),

  plot: {
    basal: require('./plot/basal'),
    basaltab: require('./plot/basaltab'),
    bolus: require('./plot/bolus'),
    cbg: require('./plot/cbg'),
    message: require('./plot/message'),
    SMBGTime: require('./plot/smbgtime'),
    smbg: require('./plot/smbg'),
    wizard: require('./plot/wizard'),
    stats: {
      puddle: require('./plot/stats/puddle'),
      widget: require('./plot/stats/widget')
    },
    util: {
      annotation: require('./plot/util/annotation'),
      axes: {
        dailyx: require('./plot/util/axes/dailyx')
      },
      defs: require('./plot/util/annotationdefinitions'),
      fill: require('./plot/util/fill'),
      legend: require('./plot/util/legend'),
      scales: require('./plot/util/scales'),
      shapes: require('./plot/util/shapes'),
      tooltip: require('./plot/util/tooltip'),
      DrawBolus: require('./plot/util/drawbolus')
    }
  }
};

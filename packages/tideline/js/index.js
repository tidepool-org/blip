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
var _ = require('lodash');
window.d3 = window.d3 || require('d3/d3.min.js');
window.d3.chart = window.d3.chart || require('d3.chart/d3.chart.min.js');

var i18next = require('i18next');
// Should be initialized in calling module
if (_.get(i18next, 'options.returnEmptyString') === undefined) {
  // Return key if no translation is present
  i18next.init({returnEmptyString: false});
}

module.exports = {
  TidelineData: require('./tidelinedata'),  
  pool: require('./pool'),
  oneDay: require('./oneday'),
  twoWeek: require('./twoweek'),
  settings: require('./settings'),

  validation: {
    validate: require('./validation/validate')
  },

  data: {
    BasalUtil: require('./data/basalutil'),
    BolusUtil: require('./data/bolusutil'),
    BGUtil: require('./data/bgutil'),
    util: {
      datetime: require('./data/util/datetime'),
      format: require('./data/util/format'),
      categorize: require('./data/util/categorize')
    }
  },

  plot: {
    basal: require('./plot/basal'),
    quickbolus: require('./plot/quickbolus'),
    cbg: require('./plot/cbg'),
    message: require('./plot/message'),
    timechange: require('./plot/timechange'),
    SMBGTime: require('./plot/smbgtime'),
    smbg: require('./plot/smbg'),
    suspend: require('./plot/suspend'), 
    wizard: require('./plot/wizard'),
    carb: require('./plot/carb'),
    physicalActivity: require('./plot/physicalActivity'),
    reservoirChange: require('./plot/reservoir'),
    deviceParameterChange: require('./plot/deviceParameterChange'),
    zenModeEvent: require('./plot/zenModeEvent'),
    confidentialModeEvent: require('./plot/confidentialModeEvent'),
    stats: {
      puddle: require('./plot/stats/puddle'),
    },
    util: {
      annotations: {
        annotation: require('./plot/util/annotations/annotation'),
        defs: require('./plot/util/annotations/annotationdefinitions')
      },
      axes: {
        dailyx: require('./plot/util/axes/dailyx')
      },
      tooltips: {
        generalized: require('./plot/util/tooltips/generalized'),
        shapes: require('./plot/util/tooltips/shapes'),
        Tooltips: require('./plot/util/tooltips/tooltip')
      },
      bgboundary: require('./plot/util/bgboundary'),
      commonbolus: require('./plot/util/commonbolus'),
      drawbolus: require('./plot/util/drawbolus'),
      fill: require('./plot/util/fill'),
      legend: require('./plot/util/legend'),
      scales: require('./plot/util/scales'),
      shadow: require('./plot/util/shadow'),
      shapeutil: require('./plot/util/shapeutil')
    }
  }
};

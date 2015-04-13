/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
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

var d3 = require('d3');

var sundial = require('sundial');

var basicsState = {};

basicsState.getInitial = function(datum, timezone) {
  timezone = timezone || 'US/Pacific';
  var latest = datum ? datum.time : new Date();
  var endOfRange = sundial.ceil(latest, 'days', timezone);
  var begOfRange = d3.time.hour.utc.offset(new Date(endOfRange), -14*24);
  return {
    dateRange: [
      begOfRange.toISOString(),
      endOfRange.toISOString()
    ],
    domain: '2 weeks',
    sections: {
      basalBolusRatio: {
        active: true,
        column: 'left',
        index: 3,
        name: 'Basal : bolus ratio'
      },
      basals: {
        active: true,
        column: 'right',
        index: 3,
        name: 'Basals',
        components: {
          rates: {
            active: true,
            name: 'Basal rates'
          },
          suspends: {
            active: true,
            name: 'Suspends'
          },
          temps: {
            active: true,
            name: 'Temp basals'
          }
        }
      },
      bgDistribution: {
        active: true,
        column: 'left',
        index: 1,
        name: 'BG distribution'
      },
      bgTesting: {
        active: true,
        column: 'right',
        index: 1,
        name: 'Blood sugar testing',
        components: {
          fingerstick: {
            active: true,
            name: 'Fingersticks'
          },
          cgm: {
            active: true,
            name: 'CGM use'
          },
          cgmCalibration: {
            active: true,
            name: 'CGM calibration'
          }
        }
      },
      boluses: {
        active: true,
        column: 'right',
        index: 2,
        name: 'Bolusing',
        components: {
          bolusFreq: {
            active: true,
            name: 'Boluses'
          }
        }
      },
      general: {
        active: true,
        column: 'right',
        index: 4,
        name: 'General care',
        components: {
          infusionSite: {
            active: true,
            name: 'Infusion site changes'
          }
        }
      },
      tdd: {
        active: true,
        column: 'left',
        index: 2,
        name: 'Total daily dose'
      }
    },
    timezone: timezone
  };
};

module.exports = basicsState;
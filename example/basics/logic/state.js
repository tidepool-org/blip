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

var BasicContainer = require('../components/BasicContainer');
var CalendarContainer = require('../components/CalendarContainer');

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
        chart: BasicContainer,
        column: 'left',
        index: 3,
        title: 'Basal : bolus ratio',
        open: true
      },
      basals: {
        active: true,
        column: 'right',
        index: 3,
        title: 'Basals',
        open: true,
        components: {
          rates: {
            active: true,
            chart: BasicContainer,
            title: 'Basal rates'
          },
          suspends: {
            active: false,
            chart: CalendarContainer,
            title: 'Suspends'
          },
          temps: {
            active: false,
            chart: CalendarContainer,
            title: 'Temp basals'
          }
        }
      },
      bgDistribution: {
        active: true,
        chart: BasicContainer,
        column: 'left',
        index: 1,
        title: 'BG distribution',
        open: true
      },
      bgTesting: {
        active: true,
        column: 'right',
        index: 1,
        title: 'Blood sugar testing',
        open: true,
        components: {
          fingerstick: {
            active: true,
            chart: CalendarContainer,
            title: 'Fingersticks'
          },
          cgm: {
            active: false,
            chart: CalendarContainer,
            title: 'CGM use'
          },
          cgmCalibration: {
            active: false,
            chart: CalendarContainer,
            title: 'CGM calibration'
          }
        }
      },
      boluses: {
        active: true,
        column: 'right',
        index: 2,
        title: 'Bolusing',
        open: true,
        components: {
          bolusFreq: {
            active: true,
            chart: CalendarContainer,
            title: 'Boluses'
          }
        }
      },
      general: {
        active: true,
        column: 'right',
        index: 4,
        title: 'General care',
        open: true,
        components: {
          infusionSite: {
            active: true,
            chart: CalendarContainer,
            title: 'Infusion site changes'
          }
        }
      },
      tdd: {
        active: true,
        chart: BasicContainer,
        column: 'left',
        index: 2,
        title: 'Total daily dose',
        open: true
      }
    },
    timezone: timezone
  };
};

module.exports = basicsState;
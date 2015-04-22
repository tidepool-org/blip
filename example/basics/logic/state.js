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

var _ = require('lodash');
var d3 = require('d3');

var sundial = require('sundial');

var BasicContainer = require('../components/BasicContainer');
var CalendarContainer = require('../components/CalendarContainer');

var BasalBolusRatio = _.noop;
var BasalRates = _.noop;
var BGDistribution = _.noop;
var WrapCount = require('../components/WrapCount');
var SiteChanges = _.noop;
var TDD = _.noop;

var basicsActions = require('./actions');

var basicsState = {};

basicsState.getInitial = function(datum, timezone) {
  timezone = timezone || 'US/Pacific';
  var latest = datum ? datum.time : new Date();
  var endOfRange = sundial.ceil(sundial.floor(latest, 'weeks', timezone), 'days', timezone);
  var begOfRange = d3.time.hour.utc.offset(new Date(endOfRange), -14*24);
  return {
    data: {},
    dateRange: [
      begOfRange.toISOString(),
      new Date(endOfRange - 1).toISOString()
    ],
    days: basicsActions.getCurrentDays([begOfRange, endOfRange], timezone),
    domain: '2 weeks',
    sections: {
      basalBolusRatio: {
        active: true,
        chart: BasalBolusRatio,
        container: BasicContainer,
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
            chart: BasalRates,
            container: BasicContainer,
            title: 'Basal rates'
          },
          suspends: {
            active: false,
            container: CalendarContainer,
            open: true,
            title: 'Suspends'
          },
          temps: {
            active: false,
            container: CalendarContainer,
            open: true,
            title: 'Temp basals'
          }
        }
      },
      bgDistribution: {
        active: true,
        chart: BGDistribution,
        container: BasicContainer,
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
            chart: WrapCount,
            container: CalendarContainer,
            open: true,
            title: 'Fingersticks'
          },
          cgm: {
            active: false,
            container: CalendarContainer,
            open: true,
            title: 'CGM use'
          },
          cgmCalibration: {
            active: false,
            container: CalendarContainer,
            open: true,
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
            chart: WrapCount,
            container: CalendarContainer,
            open: true,
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
            chart: SiteChanges,
            container: CalendarContainer,
            open: true,
            title: 'Infusion site changes'
          }
        }
      },
      tdd: {
        active: true,
        chart: TDD,
        container: BasicContainer,
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
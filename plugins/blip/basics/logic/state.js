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
var React = require('react');

var BasicContainer = require('../components/BasicContainer');
var CalendarContainer = require('../components/CalendarContainer');

var BasalBolusRatio = _.noop;
var BGDistribution = _.noop;
var WrapCount = React.createFactory(require('../components/chart/WrapCount'));
var SiteChanges = _.noop;
var TDD = _.noop;

var basicsActions = require('./actions');

var basicsState = {
  sections: {
    basalBolusRatio: {
      active: true,
      chart: BasalBolusRatio,
      container: BasicContainer,
      column: 'left',
      index: 3,
      title: 'Basal : bolus ratio',
      types: ['basal', 'bolus'],
      open: true
    },
    bgDistribution: {
      active: true,
      chart: BGDistribution,
      container: BasicContainer,
      column: 'left',
      index: 1,
      title: 'BG distribution',
      types: ['cbg', 'smbg'],
      open: true
    },
    bgTesting: {
      active: true,
      column: 'right',
      index: 1,
      title: 'Fingerstick testing',
      open: true,
      components: {
        fingerstick: {
          active: true,
          chart: WrapCount,
          container: CalendarContainer,
          title: 'Fingersticks',
          type: 'smbg'
        }
      }
    },
    boluses: {
      active: true,
      column: 'right',
      index: 2,
      title: 'Bolusing',
      open: false,
      components: {
        bolusFreq: {
          active: true,
          chart: WrapCount,
          container: CalendarContainer,
          title: 'Boluses',
          type: 'bolus'
        }
      }
    },
    general: {
      active: true,
      column: 'right',
      index: 4,
      title: 'Infusion site changes',
      open: false,
      components: {
        infusionSite: {
          active: true,
          chart: SiteChanges,
          container: CalendarContainer,
          title: 'Infusion site changes',
          type: 'deviceEvent'
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
      types: ['basal', 'bolus'],
      open: true
    }
  }
};

module.exports = basicsState;
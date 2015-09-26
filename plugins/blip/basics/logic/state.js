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

var BasalBolusRatio = React.createFactory(require('../components/chart/BasalBolusRatio'));
var BGDistribution = React.createFactory(require('../components/chart/BGDistribution'));
var WrapCount = React.createFactory(require('../components/chart/WrapCount'));
var SiteChange = React.createFactory(require('../components/chart/SiteChange'));
var TotalDailyDose = React.createFactory(require('../components/chart/TotalDailyDose'));

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
      open: true
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
      title: 'BG readings',
      open: true,
      components: [{
          active: true,
          chart: WrapCount,
          container: CalendarContainer,
          hasHover: true,
          title: 'BGs',
          type: 'smbg'
        }]
    },
    boluses: {
      active: true,
      column: 'right',
      index: 2,
      title: 'Bolusing',
      open: true,
      components: [{
          active: true,
          chart: WrapCount,
          container: CalendarContainer,
          hasHover: true,
          title: 'Boluses',
          type: 'bolus'
        }]
    },
    general: {
      active: true,
      column: 'right',
      index: 4,
      title: 'Infusion site changes',
      open: true,
      components: [{
          active: true,
          chart: SiteChange,
          container: CalendarContainer,
          hasHover: false,
          noDataMessage: 'Infusion site changes for CareLink data are coming soon.',
          title: 'Infusion site changes',
          type: 'deviceEvent'
        }]
    },
    tdd: {
      active: true,
      chart: TotalDailyDose,
      container: BasicContainer,
      column: 'left',
      index: 2,
      title: 'Avg total daily dose',
      open: true
    }
  }
};

module.exports = basicsState;

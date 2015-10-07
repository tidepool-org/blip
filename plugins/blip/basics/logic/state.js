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
var SummaryGroup = React.createFactory(require('../components/misc/SummaryGroup'));

var BasalBolusRatio = React.createFactory(require('../components/chart/BasalBolusRatio'));
var BGDistribution = React.createFactory(require('../components/chart/BGDistribution'));
var WrapCount = React.createFactory(require('../components/chart/WrapCount'));
var SiteChange = React.createFactory(require('../components/chart/SiteChange'));
var TotalDailyDose = React.createFactory(require('../components/chart/TotalDailyDose'));
var InfusionHoverDisplay = React.createFactory(require('../components/day/hover/InfusionHoverDisplay'));

var basicsActions = require('./actions');

var basicsState = {
  sections: {
    basalBolusRatio: {
      active: true,
      chart: BasalBolusRatio,
      container: BasicContainer,
      column: 'left',
      id: 'basalBolusRatio',
      index: 3,
      title: 'Basal : bolus ratio',
      open: true
    },
    bgDistribution: {
      active: true,
      chart: BGDistribution,
      container: BasicContainer,
      column: 'left',
      id: 'bgDistribution',
      index: 1,
      title: 'BG distribution',
      open: true
    },
    fingersticks: {
      active: true,
      chart: WrapCount,
      column: 'right',
      container: CalendarContainer,
      hasHover: true,
      id: 'fingersticks',
      index: 1,
      open: true,
      selector: SummaryGroup,
      selectorOptions: [
        { path: 'smbg', key: 'total', label: 'All BGs', default: true, primary: true},
        { path: 'smbg', key: 'meter', label: 'Meter' },
        { path: 'smbg', key: 'manual', label: 'Manual' },
        { path: 'calibration', key: 'calibration', label: 'Calibrations' }
      ],
      title: 'BG readings',
      type: 'fingerstick'
    },
    boluses: {
      active: true,
      chart: WrapCount,
      column: 'right',
      container: CalendarContainer,
      hasHover: true,
      id: 'boluses',
      index: 2,
      open: true,
      selector: SummaryGroup,
      selectorOptions: [
        { key: 'total', label: 'All Boluses', default: true, primary: true },
        { key: 'wizard', label: 'Calculator' },
        { key: 'manual', label: 'Manual' },
        { key: 'extended', label: 'Extended' },
        { key: 'override', label: 'Override' },
        { key: 'underride', label: 'Underride' },
        { key: 'interrupted', label : 'Interrupted' }
      ],
      title: 'Bolusing',
      type: 'bolus'
    },
    siteChanges: {
      active: true,
      chart: SiteChange,
      column: 'right',
      container: CalendarContainer,
      hasHover: true,
      hoverDisplay: InfusionHoverDisplay,
      id: 'siteChanges',
      index: 4,
      noDataMessage: 'Infusion site changes for CareLink data are coming soon.',
      open: true,
      title: 'Infusion site changes',
      type: 'reservoirChange'
    },
    totalDailyDose: {
      active: true,
      chart: TotalDailyDose,
      container: BasicContainer,
      column: 'left',
      id: 'totalDailyDose',
      index: 2,
      title: 'Avg total daily dose',
      open: true
    }
  }
};

module.exports = basicsState;

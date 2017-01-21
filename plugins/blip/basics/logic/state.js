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
var SiteChangeSelector = React.createFactory(require('../components/sitechange/Selector'));
var DailyDoseTitle = React.createFactory(require('../components/misc/DailyDoseTitle'));

var BasalBolusRatio = React.createFactory(require('../components/chart/BasalBolusRatio'));
var BGDistribution = React.createFactory(require('../components/chart/BGDistribution'));
var WrapCount = React.createFactory(require('../components/chart/WrapCount'));
var SiteChange = React.createFactory(require('../components/chart/SiteChange'));
var DailyDose = React.createFactory(require('../components/chart/DailyDose'));
var DailyCarbs = React.createFactory(require('../components/chart/DailyCarbs'));
var InfusionHoverDisplay = React.createFactory(require('../components/day/hover/InfusionHoverDisplay'));

var basicsActions = require('./actions');
var constants = require('./constants');
var togglableState = require('../TogglableState');

var basicsState = {
  sections: {
    basals: {
      active: true,
      chart: WrapCount,
      column: 'right',
      container: CalendarContainer,
      hasHover: true,
      id: 'basals',
      index: 4,
      togglable: togglableState.off,
      selector: SummaryGroup,
      selectorOptions: {
        primary: { key: 'total', label: 'Basal Events' },
        rows: [
          [
            { key: 'temp', label: 'Temp Basals' },
            { key: 'suspend', label: 'Suspends' }
            // commented out because there's a problem with scheduleName in OmniPod data :(
            // { key: 'scheduleChange', label: 'Schedule Changes' }
          ]
        ]
      },
      settingsTogglable: togglableState.off,
      title: 'Basals',
      type: 'basal'
    },
    basalBolusRatio: {
      active: true,
      chart: BasalBolusRatio,
      container: BasicContainer,
      column: 'left',
      id: 'basalBolusRatio',
      index: 3,
      noData: false,
      title: 'Insulin ratio',
      togglable: togglableState.off,
      settingsTogglable: togglableState.off,
    },
    bgDistribution: {
      active: true,
      chart: BGDistribution,
      container: BasicContainer,
      column: 'left',
      id: 'bgDistribution',
      index: 1,
      title: 'BG distribution',
      togglable: togglableState.off,
      settingsTogglable: togglableState.off,
    },
    boluses: {
      active: true,
      chart: WrapCount,
      column: 'right',
      container: CalendarContainer,
      hasHover: true,
      id: 'boluses',
      index: 2,
      togglable: togglableState.off,
      selector: SummaryGroup,
      selectorOptions: {
        primary: { key: 'total', label: 'Avg per day', average: true },
        rows: [
          [
            { key: 'wizard', label: 'Calculator', percentage: true  },
            { key: 'correction', label: 'Correction', percentage: true  },
            { key: 'override', label: 'Override', percentage: true  }
          ],
          [
            { key: 'manual', label: 'Manual', percentage: true  },
            { key: 'extended', label: 'Extended', percentage: true  },
            { key: 'interrupted', label : 'Interrupted', percentage: true  }
          ]
        ]
      },
      settingsTogglable: togglableState.off,
      title: 'Bolusing',
      type: 'bolus'
    },
    fingersticks: {
      active: true,
      chart: WrapCount,
      column: 'right',
      container: CalendarContainer,
      hasHover: true,
      id: 'fingersticks',
      index: 1,
      togglable: togglableState.off,
      selector: SummaryGroup,
      selectorOptions: {
        primary: { path: 'smbg', key: 'total', label: 'Avg per day', average: true },
        rows: [
          [
            { path: 'smbg', key: 'meter', label: 'Meter', percentage: true },
            { path: 'smbg', key: 'manual', label: 'Manual', percentage: true },
            { path: 'calibration', key: 'calibration', label: 'Calibrations' }
          ],
          [
            { path: 'smbg', key: 'verylow', labelOpts: {type: 'bg', key: 'verylow'}, percentage: true },
            { path: 'smbg', key: 'veryhigh', labelOpts: {type: 'bg', key: 'veryhigh'}, percentage: true }
          ]
        ]
      },
      settingsTogglable: togglableState.off,
      title: 'BG readings',
      type: 'fingerstick'
    },
    siteChanges: {
      active: true,
      chart: SiteChange,
      column: 'right',
      container: CalendarContainer,
      hasHover: true,
      hoverDisplay: InfusionHoverDisplay,
      id: 'siteChanges',
      index: 3,
      noDataMessage: 'Infusion site changes are not yet available for all pumps. Coming soon!',
      togglable: togglableState.off,
      selector: SiteChangeSelector,
      selectorOptions: {
        primary: { key: constants.SITE_CHANGE_RESERVOIR, label: 'Reservoir Change' },
        rows: [
          [
            { key: constants.SITE_CHANGE_TUBING, label: 'Tube Primes' },
            { key: constants.SITE_CHANGE_CANNULA, label: 'Cannula Fills' }
          ]
        ]
      },
      settingsTogglable: togglableState.closed,
      title: 'Infusion site changes',
      type: constants.SITE_CHANGE_RESERVOIR
    },
    totalDailyDose: {
      active: true,
      chart: DailyDose,
      container: BasicContainer,
      column: 'left',
      id: 'totalDailyDose',
      index: 4,
      noData: false,
      title: DailyDoseTitle,
      togglable: togglableState.closed,
      settingsTogglable: togglableState.off,
    },
    averageDailyCarbs: {
      active: true,
      chart: DailyCarbs,
      container: BasicContainer,
      column: 'left',
      id: 'averageDailyCarbs',
      index: 2,
      noData: false,
      title: '',
      togglable: togglableState.off,
      settingsTogglable: togglableState.off,
    }
  }
};

module.exports = basicsState;

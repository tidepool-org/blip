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

/* jshint esversion:6 */

// in order to get d3.chart dependency
var tideline = require('../../../js/');

var _ = require('lodash');
var bows = require('bows');
var d3 = require('d3');
var moment = require('moment-timezone');
var React = require('react');

var sundial = require('sundial');

require('./less/basics.less');
var debug = bows('Basics Chart');
var basicsState = require('./logic/state');
var basicsActions = require('./logic/actions');
var dataMungerMkr = require('./logic/datamunger');
var constants = require('./logic/constants');
var { getLatestPumpUpload, isAutomatedBasalDevice } = require('../../../js/data/util/device');

var Section = require('./components/DashboardSection');
var UnknownStatistic = React.createFactory(require('./components/misc/UnknownStatistic'));
var DailyCarbsTitle = React.createFactory(require('./components/misc/DailyCarbsTitle'));

var togglableState = require('./TogglableState');

var dataUrl = 'data/blip-input.json';

var BasicsChart = React.createClass({
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    onSelectDay: React.PropTypes.func.isRequired,
    patient: React.PropTypes.object.isRequired,
    patientData: React.PropTypes.object.isRequired,
    permsOfLoggedInUser: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    updateBasicsData: React.PropTypes.func.isRequired,
    updateBasicsSettings: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
  },

  _adjustSectionsBasedOnAvailableData: function(basicsData) {
    var latestPumpUpload = getLatestPumpUpload(this.props.patientData.grouped.upload);
    var inactiveBasalRatio = isAutomatedBasalDevice(latestPumpUpload) ? 'basalBolusRatio' : 'timeInAutoRatio';

    var insulinDataAvailable = this._insulinDataAvailable();
    var noPumpDataMessage = 'This section requires data from an insulin pump, so there\'s nothing to display.';
    var noSMBGDataMessage = 'This section requires data from a blood-glucose meter, so there\'s nothing to display.';

    if (basicsData.sections.siteChanges.type !== constants.SECTION_TYPE_UNDECLARED) {
      if (!this._hasSectionData(basicsData.sections.siteChanges.type)) {
        basicsData.sections.siteChanges.active = false;
        basicsData.sections.siteChanges.message = noPumpDataMessage;
        basicsData.sections.siteChanges.settingsTogglable = togglableState.off;
        if (!insulinDataAvailable) {
          basicsData.sections.siteChanges.noDataMessage = null;
        }
      }
    }

    if (!this._hasSectionData(basicsData.sections.boluses.type)) {
      basicsData.sections.boluses.active = false;
      basicsData.sections.boluses.message = noPumpDataMessage;
    }

    if (!this._hasSectionData(basicsData.sections.basals.type)) {
      basicsData.sections.basals.active = false;
      basicsData.sections.basals.message = noPumpDataMessage;
    }

    if (!this._automatedBasalEventsAvailable()) {
      var basalSection = _.find(basicsData.sections, {type: 'basal'});

      basalSection.selectorOptions.rows.forEach(function(row) {
        _.each(row, function(option) {
          if (option.key === 'automatedStop') {
            option.active = false;
          }
        });
      });
    }

    if (!this._hasSectionData('smbg') && !this._hasSectionData('calibration')) {
      basicsData.sections.fingersticks.active = false;
      basicsData.sections.fingersticks.message = noSMBGDataMessage;
    }

    if (_.isEmpty(basicsData.data.calibration.data)) {
      var fingerstickSection = _.find(basicsData.sections, {type: 'fingerstick'});

      fingerstickSection.selectorOptions.rows.forEach(function(row) {
        var calibrationSelector = _.find(row, function(option) {
          return option.key === 'calibration';
        });
        if (calibrationSelector) {
          calibrationSelector.active = false;
        }
      });
    }

    if (basicsData.data.averageDailyCarbs === null) {
      var averageDailyCarbsSection = _.find(basicsData.sections, {id: 'averageDailyCarbs'});
      averageDailyCarbsSection.noData = true;
      averageDailyCarbsSection.togglable = insulinDataAvailable ? togglableState.off : togglableState.closed;
      averageDailyCarbsSection.title = DailyCarbsTitle;
      averageDailyCarbsSection.chart = UnknownStatistic;
    }

    if (_.isEmpty(basicsData.data.basalBolusRatio)) {
      var basalBolusRatioSection = _.find(basicsData.sections, {id: 'basalBolusRatio'});
      basalBolusRatioSection.noData = true;
      basalBolusRatioSection.togglable = insulinDataAvailable ? togglableState.off : togglableState.closed;
    }

    if (basicsData.data.totalDailyDose === null) {
      var totalDailyDoseSection = _.find(basicsData.sections, {id: 'totalDailyDose'});
      totalDailyDoseSection.noData = true;
      totalDailyDoseSection.togglable = togglableState.closed;
    }

    delete(basicsData.sections[inactiveBasalRatio]);
  },

  _insulinDataAvailable: function() {
    var {
      basal,
      bolus,
      wizard,
    } = _.get(this.props, 'patientData.basicsData.data', {});

    if (_.get(basal, 'data.length') || _.get(bolus, 'data.length') || _.get(wizard, 'data.length')) {
      return true;
    }
    return false;
  },

  _automatedBasalEventsAvailable: function() {
    return _.get(this.props, 'patientData.basicsData.data.basal.summary.automatedStop.count', 0) > 0;
  },

  _aggregatedDataEmpty: function() {
    var {
      basalBolusRatio,
      timeInAutoRatio,
      averageDailyDose,
      averageDailyCarbs,
    } = this.state.data;

    if (basalBolusRatio === null || averageDailyDose === null || averageDailyCarbs === null) {
      return true;
    }
    return false;
  },

  _hasSectionData: function (section) {
    var basicsData = this.props.patientData.basicsData;

    // check that section has data within range of current view
    return _.some(basicsData.data[section].data, function(datum) {
      return (datum.time >= basicsData.dateRange[0]);
    });
  },

  _availableDeviceData: function () {
    var deviceTypes = [];

    if (this._hasSectionData('cbg')) {
      deviceTypes.push('CGM');
    }
    if (this._hasSectionData('smbg')) {
      deviceTypes.push('BGM');
    }
    if (this._insulinDataAvailable()) {
      deviceTypes.push('Pump');
    }

    return deviceTypes;
  },

  componentWillMount: function() {
    var basicsData = this.props.patientData.basicsData;
    if (basicsData.sections == null) {
      var dataMunger = dataMungerMkr(this.props.bgClasses, this.props.bgUnits);
      var basalUtil = this.props.patientData.basalUtil;
      var latestPump = dataMunger.getLatestPumpUploaded(this.props.patientData);
      basicsData = _.assign({}, basicsData, basicsState(latestPump));

      dataMunger.reduceByDay(basicsData);

      dataMunger.processInfusionSiteHistory(basicsData, latestPump, this.props.patient, this.props.permsOfLoggedInUser);

      basicsData.data.bgDistribution = dataMunger.bgDistribution(basicsData);
      var basalBolusStats = dataMunger.calculateBasalBolusStats(basicsData, basalUtil);
      basicsData.data.basalBolusRatio = basalBolusStats.basalBolusRatio;
      basicsData.data.timeInAutoRatio = basalBolusStats.timeInAutoRatio;
      basicsData.data.averageDailyDose = basalBolusStats.averageDailyDose;
      basicsData.data.totalDailyDose = basalBolusStats.totalDailyDose;
      basicsData.data.averageDailyCarbs = basalBolusStats.averageDailyCarbs;
      this._adjustSectionsBasedOnAvailableData(basicsData);
    }
    this.setState(basicsData);
    basicsActions.bindApp(this);
  },

  componentDidMount: function() {
    var availableDeviceData = this._availableDeviceData();

    if (availableDeviceData.length > 0) {
      var device = availableDeviceData.sort().join('+');
      if (availableDeviceData.length === 1) {
        device += ' only';
      }

      this.props.trackMetric('web - viewed basics data', { device });
    }

    if (this._aggregatedDataEmpty() && this.props.trackMetric) {
      this.props.trackMetric('web - pump vacation message displayed');
    }
  },

  componentWillUnmount: function() {
    this.props.updateBasicsData(this.state);
  },

  render: function() {
    var leftColumn = this.renderColumn('left');
    var rightColumn = this.renderColumn('right');
    return (
      <div className='Container--flex'>
        <div className='Column Column--left'>
          {leftColumn}
        </div>
        <div className='Column Column--right'>
          {rightColumn}
        </div>
      </div>
    );
  },

  renderColumn: function(columnSide) {
    var self = this;
    var timePrefs = this.props.timePrefs;
    var tz = timePrefs.timezoneAware ? timePrefs.timezoneName : 'UTC';
    var sections = [];
    for (var key in this.state.sections) {
      var section = _.cloneDeep(self.state.sections[key]);
      section.name = key;
      sections.push(section);
    }
    var column = _.sortBy(
      _.where(sections, {column: columnSide}),
      'index'
    );

    return _.map(column, function(section, index) {
      return (
        <Section key={section.name}
          bgClasses={self.props.bgClasses}
          bgUnits={self.props.bgUnits}
          chart={section.chart}
          data={self.state.data}
          days={self.state.days}
          labels={section.labels}
          name={section.name}
          onSelectDay={self.props.onSelectDay}
          open={section.open}
          togglable={section.togglable}
          section={section}
          title={section.title}
          settingsTogglable={section.settingsTogglable}
          updateBasicsSettings={self.props.updateBasicsSettings}
          timezone={tz}
          trackMetric={self.props.trackMetric} />
      );
    });
  }
});

module.exports = BasicsChart;

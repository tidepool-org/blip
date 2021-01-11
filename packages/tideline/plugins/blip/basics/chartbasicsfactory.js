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

import i18next from 'i18next';

var _ = require('lodash');
var PropTypes = require('prop-types');
var React = require('react');

require('./less/basics.less');
var basicsState = require('./logic/state');
var basicsActions = require('./logic/actions');
var dataMungerMkr = require('./logic/datamunger');
var constants = require('./logic/constants');
var sizeMe = require('react-sizeme');

var Section = require('./components/DashboardSection');

var togglableState = require('./TogglableState');

var t = i18next.t.bind(i18next);

class BasicsChart extends React.Component {
  static propTypes = {
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    onSelectDay: PropTypes.func.isRequired,
    patient: PropTypes.object.isRequired,
    patientData: PropTypes.object.isRequired,
    permsOfLoggedInUser: PropTypes.object.isRequired,
    size: PropTypes.object.isRequired,
    timePrefs: PropTypes.object.isRequired,
    updateBasicsData: PropTypes.func.isRequired,
    updateBasicsSettings: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
  };

  _adjustSectionsBasedOnAvailableData = (basicsData) => {
    var insulinDataAvailable = this._insulinDataAvailable();
    var noPumpDataMessage = t("This section requires data from an insulin pump, so there's nothing to display.");
    var noSMBGDataMessage = t("This section requires data from a blood-glucose meter, so there's nothing to display.");

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
        _.forEach(row, function(option) {
          if (option.key === 'automatedStop') {
            option.active = false;
          }
        });
      });
    }
  };

  _insulinDataAvailable = () => {
    var {
      basal,
      bolus,
      wizard,
    } = _.get(this.props, 'patientData.basicsData.data', {});

    if (_.get(basal, 'data.length') || _.get(bolus, 'data.length') || _.get(wizard, 'data.length')) {
      return true;
    }
    return false;
  };

  _automatedBasalEventsAvailable = () => {
    return _.get(this.props, 'patientData.basicsData.data.basal.summary.automatedStop.count', 0) > 0;
  };

  _hasSectionData = (section) => {
    var basicsData = this.props.patientData.basicsData;

    // check that section has data within range of current view
    return _.some(basicsData.data[section].data, function(datum) {
      return (datum.time >= basicsData.dateRange[0]);
    });
  };

  _availableDeviceData = () => {
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
  };

  UNSAFE_componentWillMount() {
    var basicsData = this.props.patientData.basicsData;
    if (basicsData.sections == null) {
      var dataMunger = dataMungerMkr(this.props.bgClasses, this.props.bgUnits);
      var latestPump = dataMunger.getLatestPumpUploaded(this.props.patientData);
      basicsData = _.assign({}, basicsData, basicsState(latestPump, this.props.patientData.latestPumpManufacturer));

      dataMunger.reduceByDay(basicsData);

      dataMunger.processInfusionSiteHistory(basicsData, latestPump, this.props.patient, this.props.permsOfLoggedInUser);

      this._adjustSectionsBasedOnAvailableData(basicsData);
    }
    this.setState(basicsData);
    basicsActions.bindApp(this);
  }

  componentDidMount() {
    var availableDeviceData = this._availableDeviceData();

    if (availableDeviceData.length > 0) {
      var device = availableDeviceData.sort().join('+');
      if (availableDeviceData.length === 1) {
        device += ' only';
      }

      this.props.trackMetric('web - viewed basics data', { device });
    }
  }

  componentWillUnmount() {
    this.props.updateBasicsData(this.state);
  }

  render() {
    var rightColumn = this.renderColumn('right');
    return (
      <div>
        {rightColumn}
      </div>
    );
  }

  renderColumn = (columnSide) => {
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
      _.filter(sections, {column: columnSide}),
      'index'
    );

    return _.map(column, function(section, index) {
      return (
        <Section key={section.name}
          bgClasses={self.props.bgClasses}
          bgUnits={self.props.bgUnits}
          chart={section.chart}
          chartWidth={self.props.size.width}
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
  };
}

module.exports = sizeMe({ monitorHeight: true })(BasicsChart);
module.exports.inner = BasicsChart;

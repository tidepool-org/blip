/** @jsx React.DOM */
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
var bows = require('bows');
var d3 = require('d3');
var moment = require('moment-timezone');
var React = require('react');

var sundial = require('sundial');

require('./less/basics.less');
var debug = bows('Basics Chart');
var basicsState = require('./logic/state');
var basicsActions = require('./logic/actions');
var dataMunger = require('./logic/datamunger');

var Section = require('./components/DashboardSection');

var dataUrl = 'data/blip-input.json';

var BasicsChart = React.createClass({
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    patientData: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired
  },
  componentWillMount: function() {
    var timePrefs = this.props.timePrefs;
    var tz = timePrefs.timezoneAware ? timePrefs.timezoneName : 'UTC';
    var basicsData = this.props.patientData.basicsData;
    if (basicsData.sections == null) {
      basicsData = _.assign(basicsData, basicsState);
      // TODO: check for existence of deviceEvent first
      basicsData.data.deviceEvent.infusionSiteHistory = dataMunger.infusionSiteHistory(basicsData);
    }
    this.setState(basicsData);
    basicsActions.bindApp(this);
  },
  componentWillUnmount: function() {
    this.props.patientData.basicsData = this.state;
  },
  render: function() {
    var leftColumn = this.renderColumn('left');
    var rightColumn = this.renderColumn('right');
    return (
      <div id="tidelineContainer" className="patient-data-chart">
        <div className='Container--flex'>
          <div className='Column Column--left'>
            {leftColumn}
          </div>
          <div className='Column Column--right'>
            {rightColumn}
          </div>
        </div>
      </div>
    );
  },
  renderColumn: function(columnSide) {
    var self = this;
    var sections = [];
    for (var key in this.state.sections) {
      var section = _.cloneDeep(self.state.sections[key]);
      section.name = key;
      sections.push(section);
    }
    var column = _.sortBy(
      _.where(sections, {column: columnSide, active: true}),
      'index'
    );

    return _.map(column, function(section, index) {
      return (
        <Section key={section.name}
          chart={section.chart || null}
          container={section.container || section.components}
          data={self.state.data}
          days={self.state.days}
          name={section.name}
          open={section.open}
          title={section.title} />
      );
    });
  }
});

module.exports = BasicsChart;

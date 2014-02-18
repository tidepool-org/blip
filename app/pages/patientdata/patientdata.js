/** @jsx React.DOM */
/**
 * Copyright (c) 2014, Tidepool Project
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
 */

var React = window.React;
var _ = window._;
var config = window.config;

var ChartDaily = require('../../components/chartdaily');

var PatientData = React.createClass({
  propTypes: {
    patientData: React.PropTypes.array,
    fetchingPatientData: React.PropTypes.bool
  },

  render: function() {
    var subnav = this.renderSubnav();
    var patientData = this.renderPatientData();

    /* jshint ignore:start */
    return (
      <div className="patient-data">
        {subnav}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              {patientData}
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderSubnav: function() {
    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          <div className="grid patient-data-subnav">
            <div className="grid-item one-whole medium-one-third">
              <a href="#/">
                <i className="icon-back"></i>
                {' ' + 'Back'}
              </a>
            </div>
            <div className="grid-item one-whole medium-one-third">
              <div className="patient-data-subnav-title">Patient data</div>
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderPatientData: function() {
    if (this.props.fetchingPatientData) {
      return this.renderLoading();
    }

    if (_.isEmpty(this.props.patientData)) {
      return this.renderNoData();
    }

    return this.renderChart();
  },

  renderLoading: function() {
    /* jshint ignore:start */
    return (
      <div className="patient-data-message patient-data-message-loading">
        Loading data...
      </div>
    );
    /* jshint ignore:end */
  },

  renderNoData: function() {
    /* jshint ignore:start */
    return (
      <div className="patient-data-message patient-data-message-no-data">
        {'This patient doesn\'t have any data yet.'}
      </div>
    );
    /* jshint ignore:end */
  },

  renderChart: function() {
    /* jshint ignore:start */
    return (
      <ChartDaily
        patientData={this.props.patientData}
        imagesEndpoint={config.IMAGES_ENDPOINT + '/tideline'} />
    );
    /* jshint ignore:end */
  }
});

module.exports = PatientData;
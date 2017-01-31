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

import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import bows from 'bows';
import sundial from 'sundial';

import config from '../../config';
import loadingGif from './loading.gif';

import * as actions from '../../redux/actions';

import personUtils from '../../core/personutils';
import utils from '../../core/utils';
import { header as Header } from '../../components/chart';
import PrintView from '../../components/printview';

export let PrintData = React.createClass({
  propTypes: {
    clearPatientData: React.PropTypes.func.isRequired,
    currentPatientInViewId: React.PropTypes.string.isRequired,
    fetchers: React.PropTypes.array.isRequired,
    fetchingPatient: React.PropTypes.bool.isRequired,
    fetchingPatientData: React.PropTypes.bool.isRequired,
    isUserPatient: React.PropTypes.bool.isRequired,
    onRefresh: React.PropTypes.func.isRequired,
    patient: React.PropTypes.object,
    patientDataMap: React.PropTypes.object.isRequired,
    patientNotesMap: React.PropTypes.object.isRequired,
    queryParams: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired,
    user: React.PropTypes.object
  },

  getInitialState: function() {
    var state = {
      datetimeLocation: null,
      initialDatetimeLocation: null,
      processingData: true,
      processedPatientData: null,
      timePrefs: {
        timezoneAware: false,
        timezoneName: null
      }
    };

    return state;
  },

  log: bows('PrintData'),

  render: function() {
    var print = this.renderPrintData();

    return (
      <div className="print-data js-print-page">
        {print}
      </div>
    );

  },

  renderPrintData: function() {
    if (this.props.fetchingPatient || this.props.fetchingPatientData || this.state.processingData) {
      return this.renderLoading();
    }

    if (this.isEmptyPatientData() || this.isInsufficientPatientData()) {
      return this.renderNoData();
    }

    return this.renderPrintView();
  },

  renderEmptyHeader: function() {

    return (
      <Header
        chartType={'no-data'}
        inTransition={false}
        atMostRecent={false}
        title={'Print'}
        ref="header" />
      );

  },

  renderLoading: function() {
    var header = this.renderEmptyHeader();

    return (
      <div className="printViewMain">
        {header}
        <div className="container-box-outer print-data-content-outer">
          <div className="container-box-inner print-data-content-inner">
            <div className="print-data-content">
              <img className='print-data-loading-image' src={loadingGif} alt="Loading animation" />
              <div className="print-data-message print-data-loading-message">
                Loading data...
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  },

  renderNoData: function() {
    var header = this.renderEmptyHeader();
    var content = personUtils.patientFullName(this.props.patient) + ' does not have any data yet.';

    var self = this;
    var handleClickUpload = function() {
      self.props.trackMetric('Clicked No Data Upload');
    };

    if (this.props.isUserPatient) {

      content = (
        <div className="print-data-message-no-data">
          <p>{'There is no data in here yet!'}</p>
          <a
            href={this.props.uploadUrl}
            target="_blank"
            onClick={handleClickUpload}>Upload data</a>
          <p>
            {'Or try '}<a href="" onClick={this.handleClickRefresh}>refreshing</a>{' the page.'}
          </p>
        </div>
      );

    }


    return (
      <div className="printViewMain">
        {header}
        <div className="container-box-outer print-data-content-outer">
          <div className="container-box-inner print-data-content-inner">
            <div className="print-data-content">
              <div className="print-data-message">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  },

  isEmptyPatientData: function() {
    return (!_.get(this.props, 'patient.userid', false) || !this.state.processedPatientData);
  },

  isInsufficientPatientData: function() {
    var data = _.get(this.state.processedPatientData, 'data', {});
    // add additional checks against data and return false iff:
    // only messages data
    if (_.reject(data, function(d) { return d.type === 'message'; }).length === 0) {
      this.log('Sorry, tideline is kind of pointless with only messages.');
      return true;
    }
    return false;
  },

  renderPrintView: function() {
    var header = this.renderEmptyHeader();

    var weekViewTimeRanges = [
      this.getMostRecentDataEndpoints()
    ];

    return (
      <div className="printViewMain">
        <div className="print-data-user-facing">{header}</div>
        <div className="container-box-outer print-data-content-outer">
          <div className="print-data-content">
            <div className="container-box-inner print-data-content-inner">
              <div className="print-data-user-facing">
                <div className="print-data-message">
                  { 'Choose File > Print.' }
                </div>
              </div>
              <div className="print-data-print-facing">
                <PrintView
                  bgPrefs={this.state.bgPrefs}
                  timePrefs={this.state.timePrefs}
                  weekViewTimeRanges={weekViewTimeRanges}
                  patient={this.props.patient}
                  patientData={this.state.processedPatientData}
                  updateDatetimeLocation={this.updateDatetimeLocation}
                  trackMetric={this.props.trackMetric} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  getMostRecentDataEndpoints: function() {
    var data = this.state.processedPatientData.data;

    var lastObj = _.sortBy(data, function(d) {
      return d.normalEnd ? d.normalEnd : d.normalTime;
    }).reverse()[0];
    var end = lastObj.normalEnd ? new Date(lastObj.normalEnd) : new Date(lastObj.normalTime);
    end.setHours(23,59,59,999);

    var start = new Date(end);
    start.setDate(start.getDate() - 7);
    start.setMilliseconds(start.getMilliseconds() + 1);

    return [start, end];
  },

  handleClickRefresh: function(e) {
    this.handleRefresh(e);
    this.props.trackMetric('Clicked No Data Refresh');
  },

  handleRefresh: function(e) {
    if (e) {
      e.preventDefault();
    }

    var refresh = this.props.onRefresh;
    if (refresh) {
      this.props.clearPatientData(this.props.currentPatientInViewId);
      this.setState({
        title: this.DEFAULT_TITLE,
        processingData: true,
        processedPatientData: null
      });
      refresh(this.props.currentPatientInViewId);
    }
  },

  componentWillMount: function() {
    this.doFetching(this.props);
    var params = this.props.queryParams;

    if (!_.isEmpty(params)) {
      var prefs = _.cloneDeep(this.state.chartPrefs);
      prefs.bolusRatio = params.dynamicCarbs ? 0.5 : 0.35;
      prefs.dynamicCarbs = params.dynamicCarbs;
      this.setState({
        chartPrefs: prefs
      });
    }
  },

  componentWillUnmount: function() {
    this.props.clearPatientData(this.props.currentPatientInViewId);
  },

  componentWillReceiveProps: function(nextProps) {
    var userId = this.props.currentPatientInViewId;
    var currentPatientData = _.get(this.props, ['patientDataMap', userId], null);

    var nextPatientData = _.get(nextProps, ['patientDataMap', userId], null);

    if (!currentPatientData && nextPatientData) {
      this.doProcessing(nextProps);
    }
  },

  doProcessing: function(nextProps) {
    var userId = this.props.currentPatientInViewId;
    var patientData = _.get(nextProps, ['patientDataMap', userId], null);
    if (patientData) {
      let combinedData = patientData.concat(nextProps.patientNotesMap[userId]);
      window.downloadInputData = () => {
        console.save(combinedData, 'blip-input.json');
      };
      let processedData = utils.processPatientData(
        this,
        combinedData,
        this.props.queryParams
      );
      this.setState({
        processedPatientData: processedData,
        bgPrefs: {
          bgClasses: processedData.bgClasses,
          bgUnits: processedData.bgUnits
        },
        processingData: false
      });
    }
  },

  doFetching: function(nextProps) {
    if (this.props.trackMetric) {
      this.props.trackMetric('Printed Data');
    }

    if (!nextProps.fetchers) {
      return
    }

    nextProps.fetchers.forEach(function(fetcher) {
      fetcher();
    });
  }
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    dispatchProps.fetchPatient.bind(null, api, ownProps.routeParams.id),
    dispatchProps.fetchPatientData.bind(null, api, ownProps.routeParams.id)
  ];
};

export function mapStateToProps(state) {
  var user = null;
  var patient = null;
  if (state.blip.allUsersMap){
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }

    if (state.blip.currentPatientInViewId){
      patient = state.blip.allUsersMap[state.blip.currentPatientInViewId];
    }
  }

  return {
    user: user,
    isUserPatient: personUtils.isSame(user, patient),
    patient: patient,
    patientDataMap: state.blip.patientDataMap,
    patientNotesMap: state.blip.patientNotesMap,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress,
    fetchingPatientData: state.blip.working.fetchingPatientData.inProgress
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  fetchPatient: actions.async.fetchPatient,
  fetchPatientData: actions.async.fetchPatientData,
  clearPatientData: actions.sync.clearPatientData,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, _.pick(dispatchProps, ['clearPatientData']), stateProps, {
    fetchers: getFetchers(dispatchProps, ownProps, api),
    uploadUrl: api.getUploadUrl(),
    onRefresh: dispatchProps.fetchPatientData.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric,
    queryParams: ownProps.location.query,
    currentPatientInViewId: ownProps.routeParams.id
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PrintData);

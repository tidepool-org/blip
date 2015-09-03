/** @jsx React.DOM */
/*
 * == BSD2 LICENSE ==
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
 * == BSD2 LICENSE ==
 */
var bows = require('bows');
var React = require('react');
var cx = require('react/lib/cx');

var tideline = {
  log: bows('Header')
};

var TidelineHeader = React.createClass({
  propTypes: {
    chartType: React.PropTypes.string.isRequired,
    inTransition: React.PropTypes.bool.isRequired,
    atMostRecent: React.PropTypes.bool.isRequired,
    title: React.PropTypes.string.isRequired,
    onClickBack: React.PropTypes.func,
    onClickModal: React.PropTypes.func,
    onClickMostRecent: React.PropTypes.func,
    onClickNext: React.PropTypes.func,
    onClickOneDay: React.PropTypes.func,
    onClickTwoWeeks: React.PropTypes.func,
    onClickSettings: React.PropTypes.func
  },
  render: function() {
    var dayLinkClass = cx({
      'patient-data-subnav-active': this.props.chartType === 'daily',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var modalLinkClass = cx({
      'patient-data-subnav-active': this.props.chartType === 'modal',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var weekLinkClass = cx({
      'patient-data-subnav-active': this.props.chartType === 'weekly',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var dateLinkClass = cx({
      'patient-data-subnav-text' : this.props.chartType === 'daily' || this.props.chartType === 'weekly' || this.props.chartType === 'modal',
      'patient-data-subnav-dates-daily': this.props.chartType === 'daily',
      'patient-data-subnav-dates-weekly': this.props.chartType === 'weekly',
      'patient-data-subnav-dates-modal': this.props.chartType === 'modal'
    });

    var mostRecentLinkClass = cx({
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'no-data' ||
        this.props.chartType === 'modal'
    });

    var backClass = cx({
      'patient-data-subnav-active': !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data' || this.props.chartType === 'modal'
    });

    var nextClass = cx({
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data' || this.props.chartType === 'modal'
    });

    var settingsLinkClass = cx({
      'patient-data-subnav-right': true,
      'patient-data-subnav-right-label': true,
      'patient-data-subnav-active': this.props.chartType === 'settings',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          <div className="grid patient-data-subnav">
            <div className="grid-item one-whole large-one-quarter">
                <a href="" className={dayLinkClass} onClick={this.props.onClickOneDay}>Daily</a>
                <a href="" className={weekLinkClass} onClick={this.props.onClickTwoWeeks}>Weekly</a>
                <a href="" className={modalLinkClass} onClick={this.props.onClickModal}>Trends</a>
            </div>
            <div className="grid-item one-whole large-one-half patient-data-subnav-center" id="tidelineLabel">
              <a href="" className={backClass} onClick={this.props.onClickBack}><i className={this.props.iconBack}/></a>
              <div className={dateLinkClass}>
                {this.props.title}
              </div>
              <a href="" className={nextClass} onClick={this.props.onClickNext}><i className={this.props.iconNext}/></a>
              <a href="" className={mostRecentLinkClass} onClick={this.props.onClickMostRecent}><i className={this.props.iconMostRecent}/></a>
            </div>
            <div className="grid-item one-whole large-one-quarter">
              <a href="" className={settingsLinkClass} onClick={this.props.onClickSettings}>Device settings</a>
            </div>
          </div>
        </div>
      </div>
      );
    
  }
});

module.exports = TidelineHeader;


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
var cx = require('classnames');

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
    onClickBasics: React.PropTypes.func,
    onClickModal: React.PropTypes.func,
    onClickMostRecent: React.PropTypes.func,
    onClickNext: React.PropTypes.func,
    onClickOneDay: React.PropTypes.func,
    onClickTwoWeeks: React.PropTypes.func,
    onClickSettings: React.PropTypes.func
  },
  render: function() {
    var basicsLinkClass = cx({
      'js-basics': true,
      'patient-data-subnav-active': this.props.chartType === 'basics',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var dayLinkClass = cx({
      'js-daily': true,
      'patient-data-subnav-active': this.props.chartType === 'daily',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var modalLinkClass = cx({
      'js-modal': true,
      'patient-data-subnav-active': this.props.chartType === 'modal',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var weekLinkClass = cx({
      'js-weekly': true,
      'patient-data-subnav-active': this.props.chartType === 'weekly',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var dateLinkClass = cx({
      'js-date': true,
      'patient-data-subnav-text' : this.props.chartType === 'basics' || 
        this.props.chartType === 'daily' || 
        this.props.chartType === 'weekly' ||
        this.props.chartType === 'modal',
      'patient-data-subnav-dates-basics': this.props.chartType === 'basics',
      'patient-data-subnav-dates-daily': this.props.chartType === 'daily',
      'patient-data-subnav-dates-weekly': this.props.chartType === 'weekly',
      'patient-data-subnav-dates-modal': this.props.chartType === 'modal'
    });

    var mostRecentClass = cx({
      'js-most-recent': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'no-data' ||
        this.props.chartType === 'modal'
    });

    var backClass = cx({
      'js-back': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data' || this.props.chartType === 'modal'
    });

    var nextClass = cx({
      'js-next': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data' || this.props.chartType === 'modal'
    });

    var settingsLinkClass = cx({
      'js-settings': true,
      'patient-data-subnav-right': true,
      'patient-data-subnav-right-label': true,
      'patient-data-subnav-active': this.props.chartType === 'settings',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          <div className="grid patient-data-subnav">
            <div className="grid-item one-whole large-one-third">
                <a href="" className={basicsLinkClass} onClick={this.props.onClickBasics}>Basics</a>
                <a href="" className={dayLinkClass} onClick={this.props.onClickOneDay}>Daily</a>
                <a href="" className={weekLinkClass} onClick={this.props.onClickTwoWeeks}>Weekly</a>
                <a href="" className={modalLinkClass} onClick={this.props.onClickModal}>Trends</a>
            </div>
            <div className="grid-item one-whole large-one-third patient-data-subnav-center" id="tidelineLabel">
              {this.renderNavButton(backClass, this.props.onClickBack, this.props.iconBack)}
              <div className={dateLinkClass}>
                {this.props.title}
              </div>
              {this.renderNavButton(nextClass, this.props.onClickNext, this.props.iconNext)}
              {this.renderNavButton(mostRecentClass, this.props.onClickMostRecent, this.props.iconMostRecent)}
            </div>
            <div className="grid-item one-whole large-one-third">
              <a href="" className={settingsLinkClass} onClick={this.props.onClickSettings}>Device settings</a>
            </div>
          </div>
        </div>
      </div>
      );
  },

  /**
   * Helper function for rendering the various navigation buttons in the header.
   * It accounts for the transition state and disables the button if it is currently processing.
   * 
   * @param  {String} buttonClass
   * @param  {Function} clickAction
   * @param  {String} icon
   * 
   * @return {ReactElement}
   */
  renderNavButton: function(buttonClass, clickAction, icon) {
    var nullAction = function(e) {
      if (e) {
        e.preventDefault();
      }
    };
    if (this.props.inTransition) {
      return (<a href="" className={buttonClass} onClick={nullAction}><i className={icon}/></a>);
    } else {
      return (<a href="" className={buttonClass} onClick={clickAction}><i className={icon}/></a>);
    }
  }
});

module.exports = TidelineHeader;

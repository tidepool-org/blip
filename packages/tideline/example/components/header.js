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
var PropTypes = require('prop-types');
var React = require('react');
var cx = require('classnames');

var tideline = {
  log: bows('Header')
};

class TidelineHeader extends React.Component {
  static propTypes = {
    chartType: PropTypes.string.isRequired,
    inTransition: PropTypes.bool,
    atMostRecent: PropTypes.bool,
    title: PropTypes.string.isRequired,
    onClickBack: PropTypes.func,
    onClickModal: PropTypes.func.isRequired,
    onClickMostRecent: PropTypes.func,
    onClickNext: PropTypes.func,
    onClickOneDay: PropTypes.func.isRequired,
    onClickTwoWeeks: PropTypes.func.isRequired,
    onClickSettings: PropTypes.func.isRequired
  };

  render() {
    var next = this.props.next;
    var back = this.props.back;
    var mostRecent = this.props.mostRecent;

    var dayLinkClass = cx({
      'tidelineNavLabel': true,
      'active': this.props.chartType === 'daily'
    });

    var modalLinkClass = cx({
      'tidelineNavLabel': true,
      'active': this.props.chartType === 'modal'
    });

    var weekLinkClass = cx({
      'tidelineNavLabel': true,
      'active': this.props.chartType === 'weekly'
    });

    var mostRecentLinkClass = cx({
      'active': !this.props.atMostRecent && !this.props.inTransition,
      'inactive': this.props.atMostRecent || this.props.inTransition,
      'hidden': this.props.chartType === 'settings'
    });

    var backClass = cx({
      'active': !this.props.inTransition,
      'inactive': this.props.inTransition,
      'hidden': this.props.chartType === 'settings' || this.props.chartType === 'modal'
    });

    var nextClass = cx({
      'active': !this.props.atMostRecent && !this.props.inTransition,
      'inactive': this.props.atMostRecent || this.props.inTransition,
      'hidden': this.props.chartType === 'settings' || this.props.chartType === 'modal'
    });

    var settingsLinkClass = cx({
      'tidelineNavLabel': true,
      'tidelineNavRightLabel': true,
      'active': this.props.chartType === 'settings'
    });

    /* jshint ignore:start */
    return (
      <div className="tidelineNav grid">
        <div className="grid-item one-quarter">
            <a className={dayLinkClass} onClick={this.props.onClickOneDay}>Daily</a>
            <a className={weekLinkClass} onClick={this.props.onClickTwoWeeks}>Weekly</a>
            <a className={modalLinkClass} onClick={this.props.onClickModal}>Trends</a>
        </div>
        <div className="grid-item one-half" id="tidelineLabel">
          <a href="#" className={backClass} onClick={this.props.onClickBack}><i className={this.props.iconBack}/></a>
          <div className="tidelineNavLabelWrapper">
            <span className="tidelineNavLabel">{this.props.title}</span>
          </div>
          <a href="#" className={nextClass} onClick={this.props.onClickNext}><i className={this.props.iconNext}/></a>
          <a href="#" className={mostRecentLinkClass} onClick={this.props.onClickMostRecent}><i className={this.props.iconMostRecent}/></a>
        </div>
        <div className="grid-item one-quarter">
          <a className={settingsLinkClass} onClick={this.props.onClickSettings}>Device settings</a>
        </div>
      </div>
      );
    /* jshint ignore:end */
  }
}

module.exports = TidelineHeader;

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
var cx = require('classnames');
var d3 = require('d3');
var React = require('react');

var sundial = require('sundial');

var TimeNav = React.createClass({
  propTypes: {
    dateRange: React.PropTypes.array.isRequired,
    dateRangeMask: React.PropTypes.string.isRequired,
    domain: React.PropTypes.string.isRequired,
    timezone: React.PropTypes.string.isRequired,
    // action functions
    switchDomain: React.PropTypes.func.isRequired
  },
  getDefaultProps: function() {
    return {
      dateRangeMask: 'MMM D'
    }
  },
  render: function() {
    var dateRange = this.renderDateRange();
    var domainSelection = this.renderDomainSelection();
    return (
      <div className="TimeNav">
        {dateRange}
        {domainSelection}
      </div>
    );
  },
  renderDateRange: function() {
    var s = sundial.formatInTimezone(this.props.dateRange[0], this.props.timezone, this.props.dateRangeMask);
    var e = sundial.formatInTimezone(this.props.dateRange[1], this.props.timezone, this.props.dateRangeMask);
    return (
      <h3 className="TimeNav-dateRange">
        <a href=""><i className="icon-back"/></a>
        {s} - {e}
        <a href=""><i className="icon-next"/></a>
        <a href=""><i className="icon-most-recent"/></a>
      </h3>
    );
  },
  renderDomainSelection: function() {
    var self = this;
    var domains = ['1 week', '2 weeks', '4 weeks'];
    return (
      <div className="TimeNav-domainSelector">
        {_.map(domains, function(domain) {
          var buttonClass = cx({
            'TimeNav-button': true,
            'TimeNav-button--active': domain === self.props.domain,
            'TimeNav-button--inactive': domain !== self.props.domain
          });
          var onClickFn = _.noop;
          if (domain !== self.props.domain) {
            self.makeHandleSwitchDomain(domain);
          }
          return (
            <button key={domain} className={buttonClass}>{domain}</button>
          );
        })}
      </div>
    );
  },
  makeHandleSwitchDomain: function(newDomain) {
    var self = this;

    return function(e) {
      if (e) {
        e.preventDefault();
        self.props.switchDomain(newDomain);
      }
    };
  }
});

module.exports = TimeNav;

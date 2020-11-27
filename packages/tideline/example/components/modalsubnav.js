var PropTypes = require('prop-types');
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

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');

var d3 = window.d3;

var DaysGroup = require('./dayfiltergroup');

var ModalSubNav = createReactClass({
  displayName: 'ModalSubNav',

  propTypes: {
    activeDays: PropTypes.object.isRequired,
    activeDomain: PropTypes.string.isRequired,
    extentSize: PropTypes.number.isRequired,
    domainClickHandlers: PropTypes.object.isRequired,
    onClickDay: PropTypes.func.isRequired,
    toggleWeekdays: PropTypes.func.isRequired,
    toggleWeekends: PropTypes.func.isRequired
  },

  DAY_ABBREVS: {
    monday: 'M',
    tuesday: 'Tu',
    wednesday: 'W',
    thursday: 'Th',
    friday: 'F',
    saturday: 'Sa',
    sunday: 'Su'
  },

  getInitialState: function() {
    return {
      weekdaysActive: true,
      weekendsActive: true
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.areWeekdaysActive(nextProps);
    this.areWeekendsActive(nextProps);
  },

  render: function() {
    var domainLinks = this.renderDomainLinks();
    var dayFilters = this.renderDayFilters();
    /* jshint ignore:start */
    return (
      <div id="modalSubNav">
        <div className="modalSubNavContainer">
          <div>{domainLinks}</div>
          <div className="flexed" id="modalScroll"></div>
          <div className="dayFilters">{dayFilters}</div>
        </div>
      </div>
      );
    /* jshint ignore:end */
  },

  renderDomainLinks: function() {
    var domains = ['1 week', '2 weeks', '4 weeks'];
    var domainLinks = [];
    for (var i = 0; i < domains.length; ++i) {
      domainLinks.push(this.renderDomainLink(domains[i]));
    }
    var activeDays = this.props.activeDays, numActiveDays = 0;
    for (var day in activeDays) {
      if (activeDays[day]) {
        numActiveDays += 1;
      }
    }
    var visibleDaysText, numVisibleDays = this.props.extentSize/7 * numActiveDays;
    if (numVisibleDays % 1 !== 0) {
      visibleDaysText = 'Approx ' + Math.round(numVisibleDays) + ' days in view';
    }
    else {
      visibleDaysText = numVisibleDays + ' days in view';
    }

    /* jshint ignore:start */
    return (
      <div>
        <div className="visibleDays">{visibleDaysText}</div>
        <div>{domainLinks}</div>
      </div>
      );
    /* jshint ignore:end */
  },

  renderDomainLink: function(domain) {
    var domainLinkClass = cx({
      'active': domain === this.props.activeDomain,
      'modalDomain': true
    });
    /* jshint ignore:start */
    return (
      <a className={domainLinkClass} key={domain} onClick={this.props.domainClickHandlers[domain]}>{domain}</a>
      );
    /* jshint ignore:end */
  },

  renderDayFilters: function() {
    var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    var dayLinks = [];
    for (var i = 0; i < days.length; ++i) {
      dayLinks.push(this.renderDay(days[i]));
    }
    /* jshint ignore:start */
    return (
      <div className="dayGroupsContainer">
        <DaysGroup
          active={this.state.weekdaysActive}
          category={'weekday'}
          days={dayLinks.slice(0,5)}
          onClickGroup={this.handleSelectDaysGroup} />
        <DaysGroup
          active={this.state.weekendsActive}
          category={'weekend'}
          days={dayLinks.slice(5,7)}
          onClickGroup={this.handleSelectDaysGroup} />
      </div>
      );
    /* jshint ignore:end */
  },

  renderDay: function(day) {
    var dayLinkClass = cx({
      'dayFilter': true,
      'active': this.props.activeDays[day],
      'inactive': !this.props.activeDays[day]
    }) + ' ' + day;
    /* jshint ignore:start */
    return (
      <a className={dayLinkClass} key={day} onClick={this.props.onClickDay(day)}>{this.DAY_ABBREVS[day]}</a>
      );
    /* jshint ignore:end */
  },

  areWeekdaysActive: function(props) {
    var weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    var active = true;
    var activeDays = props.activeDays;
    for (var i = 0; i < weekdays.length; ++i) {
      if (!activeDays[weekdays[i]]) {
        active = false;
        break;
      }
    }
    this.setState({
      weekdaysActive: active
    });
  },

  areWeekendsActive: function(props) {
    var activeDays = props.activeDays;
    this.setState({
      weekendsActive: activeDays.saturday && activeDays.sunday
    });
  },

  // handlers
  handleSelectDaysGroup: function(category) {
    if (category === 'weekday') {
      this.props.toggleWeekdays(this.state.weekdaysActive);
    }
    else if (category === 'weekend') {
      this.props.toggleWeekends(this.state.weekendsActive);
    }
  },
});

module.exports = ModalSubNav;

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
var cx = require('classnames');
import { translate } from 'react-i18next';

var d3 = window.d3;

var DaysGroup = React.createClass({
  propTypes: {
    active: React.PropTypes.bool.isRequired,
    category: React.PropTypes.string.isRequired,
    days: React.PropTypes.array.isRequired,
    onClickGroup: React.PropTypes.func.isRequired
  },
  render: function() {
    var groupClass = cx({
      'daysGroup': true,
      'active': this.props.active
    }) + ' ' + this.props.category;

    return (
      <div>
        <input type="checkbox" className={groupClass}
        onChange={this.handleDaysGroupClick}
        checked={this.props.active} />
        {this.props.days}
      </div>
      );

  },
  handleDaysGroupClick: function() {
    this.props.onClickGroup(this.props.category);
  }
});

var TrendsSubNav = translate()(React.createClass({
  propTypes: {
    activeDays: React.PropTypes.object.isRequired,
    activeDomain: React.PropTypes.string.isRequired,
    extentSize: React.PropTypes.number.isRequired,
    domainClickHandlers: React.PropTypes.object.isRequired,
    onClickDay: React.PropTypes.func.isRequired,
    toggleWeekdays: React.PropTypes.func.isRequired,
    toggleWeekends: React.PropTypes.func.isRequired
  },
  renderDayAbbrev: function(day) {
    const { t } = this.props;
    switch (day) {
      case 'monday': return t('M_Monday');
      case 'tuesday': return t('Tu_Tuesday');
      case 'wednesday': return t('W_Wednesday');
      case 'thursday': return t('Th_Thursday');
      case 'friday': return t('F_Friday');
      case 'saturday': return t('Sa_Saturday');
      case 'sunday': return t('Su_Sunday');
      default: return undefined
    }
  },
  renderDomain: function(domain) {
    const { t } = this.props;
    switch (domain) {
      case '1 week': return t('1 week');
      case '2 weeks': return t('2 weeks');
      case '4 weeks': return t('4 weeks');
      default: return domain;
    }
  },
  componentWillMount: function() {
    this.areWeekdaysActive(this.props);
    this.areWeekendsActive(this.props);
  },
  componentWillReceiveProps: function(nextProps) {
    this.areWeekdaysActive(nextProps);
    this.areWeekendsActive(nextProps);
  },
  render: function() {
    var domainLinks = this.renderDomainLinks();
    var dayFilters = this.renderDayFilters();

    return (
      <div id="trendsSubNav">
        <div className="trendsSubNavContainer">
          <div className="domainLinks">{domainLinks}</div>
          <div className="dayFilters">{dayFilters}</div>
        </div>
      </div>
      );

  },
  renderDomainLinks: function() {
    const { t } = this.props;
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
      visibleDaysText = t('Approx {{numVisibleDays}} days in view', {numVisibleDays: Math.round(numVisibleDays)});
    }
    else {
      visibleDaysText = t('{{numVisibleDays}} days in view', {numVisibleDays});
    }


    return (
      <div>
        <div className="domainContainer">{domainLinks}</div>
        <div className="visibleDays">{visibleDaysText}</div>
      </div>
      );

  },
  renderDomainLink: function(domain) {
    var domainLinkClass = cx({
      'btn btn-chart-control' : true,
      'active': domain === this.props.activeDomain
    });

    return (
      <button className={domainLinkClass} key={domain}
        onClick={this.props.domainClickHandlers[domain]}>{this.renderDomain(domain)}</button>
      );

  },
  renderDayFilters: function() {
    var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    var dayLinks = [];
    for (var i = 0; i < days.length; ++i) {
      dayLinks.push(this.renderDay(days[i]));
    }

    return (
      <div className="daysGroupContainer">
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

  },
  renderDay: function(day) {
    var dayLinkClass = cx({
      'dayFilter': true,
      'btn btn-chart-control': true,
      'active': this.props.activeDays[day],
      'inactive': !this.props.activeDays[day]
    }) + ' ' + day;

    return (
      <a className={dayLinkClass} key={day} onClick={this.props.onClickDay(day)}>{this.renderDayAbbrev(day)}</a>
      );

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
  }
}));

module.exports = TrendsSubNav;

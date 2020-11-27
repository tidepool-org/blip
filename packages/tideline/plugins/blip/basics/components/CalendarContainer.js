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

/* jshint esversion:6 */

var _ = require('lodash');
var bows = require('bows');
var cx = require('classnames');
var moment = require('moment-timezone');
var PropTypes = require('prop-types');
var React = require('react');

var createReactClass = require('create-react-class');

var basicsActions = require('../logic/actions');
var BasicsUtils = require('./BasicsUtils');

var ADay = require('./day/ADay');
var HoverDay = require('./day/HoverDay');

var constants = require('../logic/constants');
var togglableState = require('../TogglableState');

var { DDD_FORMAT } = require('../../../../js/data/util/constants');

var CalendarContainer = createReactClass({
  displayName: 'CalendarContainer',
  mixins: [BasicsUtils],

  propTypes: {
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    chart: PropTypes.func.isRequired,
    chartWidth: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    days: PropTypes.array.isRequired,
    hasHover: PropTypes.bool.isRequired,
    hoverDisplay: PropTypes.func,
    onSelectDay: PropTypes.func.isRequired,
    sectionId: PropTypes.string.isRequired,
    selector: PropTypes.func,
    selectorOptions: PropTypes.object,
    selectorMetaData: PropTypes.object,
    settingsTogglable: PropTypes.oneOf([
      togglableState.open,
      togglableState.closed,
      togglableState.off,
    ]).isRequired,
    timezone: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    trackMetric: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
  },

  actions: basicsActions,

  getInitialState: function() {
    return {
      hoverDate: null
    };
  },

  /**
   * Function that is passed to children to update the state
   * to the current hover date, of which there can only be one
   *
   * @param  {String} date
   */
  onHover: function(date) {
    this.setState({hoverDate: date});
  },

  _getSelectedSubtotal: function() {
    var options = this.props.selectorOptions;

    if (options) {
      return _.get(_.find(_.flatten(options.rows), {selected: true}), 'key', options.primary.key);
    }

    return null;
  },

  UNSAFE_componentWillMount() {
    var self = this;
    var options = this.props.selectorOptions;
    var data = (this.props.type !== constants.SECTION_TYPE_UNDECLARED) ? this.props.data[this.props.type].summary : null;

    if (options) {
      var rows = _.flatten(options.rows);
      var selectedOption = _.find(rows, {selected: true}) || options.primary;

      // If the default selected option has no value, choose the first option that does
      if (selectedOption.path && !this.getOptionValue(selectedOption, data)) {
        selectedOption = _.find(_.reject(_.union(options.primary, rows), { key: selected }), function(option) {
          return self.getOptionValue(option, data) > 0;
        });
        var selected = _.get(selectedOption, 'key', null);
        this.actions.selectSubtotal(this.props.sectionId, selected);
      }
    }
  },

  render: function() {
    var containerClass = cx('Calendar-container-' + this.props.type, {
      'Calendar-container': true
    });

    var days = this.renderDays();
    var dayLabels = this.renderDayLabels();

    var selector = null;

    if (this.props.selector && this.props.selectorOptions && this.props.settingsTogglable !== togglableState.closed) {
      selector = this.renderSelector();
    }

    return (
      <div className='Container'>
        <div className={containerClass} ref='container'>
          {selector}
          <div className='Calendar' ref='content'>
            <div className="weekdays">
              {dayLabels}
            </div>
            <div className="day-grid">
              {days}
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderSelector: function() {
    return this.props.selector({
      bgClasses: this.props.bgClasses,
      bgUnits: this.props.bgUnits,
      data: (this.props.type !== constants.SECTION_TYPE_UNDECLARED) ? this.props.data[this.props.type].summary : null,
      selectedSubtotal: this._getSelectedSubtotal(),
      selectorOptions: this.props.selectorOptions,
      selectorMetaData: this.props.selectorMetaData,
      updateBasicsSettings: this.props.updateBasicsSettings,
      sectionId: this.props.sectionId,
      trackMetric: this.props.trackMetric,
    });
  },

  renderDayLabels: function() {
    // Take the first day in the set and use this to set the day labels
    // Could be subject to change so I thought this was preferred over
    // hard-coding a solution that assumes Monday is the first day
    // of the week.
    var firstDay = moment(this.props.days[0].date).day();
    return _.range(firstDay, firstDay + 7).map(function(dow) {
      var day = moment().day(dow).format(DDD_FORMAT);
      return (
        <div key={moment().day(dow)} className='Calendar-day-label'>
          <div className='Calendar-dayofweek'>
            {day}
          </div>
        </div>
      );
    });
  },

  renderDays: function() {
    var self = this;
    var path = this.getPathToSelected();

    return this.props.days.map(function(day, id) {
      if (self.props.hasHover && self.state.hoverDate === day.date) {
        return (
          <HoverDay
            key={day.date}
            data={path ? self.props.data[self.props.type][path] :
              self.props.data[self.props.type]}
            date={day.date}
            hoverDisplay={self.props.hoverDisplay}
            onHover={self.onHover}
            onSelectDay={self.props.onSelectDay}
            subtotalType={self._getSelectedSubtotal()}
            timezone={self.props.timezone}
            type={self.props.type}
            title={self.props.title}
            trackMetric={self.props.trackMetric}
          />
        );
      } else {
        return (
          <ADay key={day.date}
            chart={self.props.chart}
            chartWidth={self.props.chartWidth}
            data={path ? self.props.data[self.props.type][path] :
              self.props.data[self.props.type]}
            date={day.date}
            future={day.type === 'future'}
            isFirst={id === 0}
            mostRecent={day.type === 'mostRecent'}
            onHover={self.onHover}
            subtotalType={self._getSelectedSubtotal()}
            type={self.props.type} />
        );
      }
    });
  },
});

module.exports = CalendarContainer;

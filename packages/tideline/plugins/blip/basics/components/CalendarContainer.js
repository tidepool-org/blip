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

import _ from 'lodash';
import cx from 'classnames';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';

import { dateTimeFormats } from '../../../../js/data/util/constants';

import basicsActions from '../logic/actions';
import { getOptionValue, getPathToSelected } from './BasicsUtils';
import ADay from './day/ADay';
import HoverDay from './day/HoverDay';
import * as constants from '../logic/constants';
import togglableState from '../TogglableState';

class CalendarContainer extends React.Component {
  constructor(props) {
    super(props);
    this.getOptionValue = getOptionValue;
    this.getPathToSelected = getPathToSelected;
    this.state = {
      hoverDate: null
    };
  }

  /**
   * Function that is passed to children to update the state
   * to the current hover date, of which there can only be one
   *
   * @param  {String} date
   */
  onHover = (date) => {
    this.setState({hoverDate: date});
  }

  getSelectedSubtotal() {
    var options = this.props.selectorOptions;

    if (options) {
      return _.get(_.find(_.flatten(options.rows), {selected: true}), 'key', options.primary.key);
    }
    return null;
  }

  UNSAFE_componentWillMount() {
    var options = this.props.selectorOptions;
    var data = (this.props.type !== constants.SECTION_TYPE_UNDECLARED) ? this.props.data[this.props.type].summary : null;

    if (options) {
      var rows = _.flatten(options.rows);
      var selectedOption = _.find(rows, {selected: true}) || options.primary;

      // If the default selected option has no value, choose the first option that does
      if (selectedOption.path && !this.getOptionValue(selectedOption, data)) {
        selectedOption = _.find(_.reject(_.union(options.primary, rows), { key: selected }), (option) => {
          return this.getOptionValue(option, data) > 0;
        });
        var selected = _.get(selectedOption, 'key', null);
        this.actions.selectSubtotal(this.props.sectionId, selected);
      }
    }
  }

  render() {
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
        <div className={containerClass}>
          {selector}
          <div className='Calendar'>
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
  }

  renderSelector() {
    return this.props.selector({
      bgClasses: this.props.bgClasses,
      bgUnits: this.props.bgUnits,
      data: (this.props.type !== constants.SECTION_TYPE_UNDECLARED) ? this.props.data[this.props.type].summary : null,
      selectedSubtotal: this.getSelectedSubtotal(),
      selectorOptions: this.props.selectorOptions,
      selectorMetaData: this.props.selectorMetaData,
      updateBasicsSettings: this.props.updateBasicsSettings,
      sectionId: this.props.sectionId,
      trackMetric: this.props.trackMetric,
    });
  }

  renderDayLabels() {
    // Take the first day in the set and use this to set the day labels
    // Could be subject to change so I thought this was preferred over
    // hard-coding a solution that assumes Monday is the first day
    // of the week.
    var firstDay = moment.utc(this.props.days[0].date).day();
    const daysRange = _.range(firstDay, firstDay + 7);
    return daysRange.map((dow) => {
      var day = moment.utc().day(dow).format(dateTimeFormats.DDD_FORMAT);
      return (
        <div key={moment.utc().day(dow)} className='Calendar-day-label'>
          <div className='Calendar-dayofweek'>
            {day}
          </div>
        </div>
      );
    });
  }

  renderDays() {
    var path = this.getPathToSelected();

    return this.props.days.map((day, id) => {
      if (this.props.hasHover && this.state.hoverDate === day.date) {
        return (
          <HoverDay
            key={day.date}
            data={path ? this.props.data[this.props.type][path] :
              this.props.data[this.props.type]}
            date={day.date}
            hoverDisplay={this.props.hoverDisplay}
            onHover={this.onHover}
            onSelectDay={this.props.onSelectDay}
            subtotalType={this.getSelectedSubtotal()}
            timezone={this.props.timezone}
            type={this.props.type}
            title={this.props.title}
            trackMetric={this.props.trackMetric}
          />
        );
      } else {
        return (
          <ADay key={day.date}
            chart={this.props.chart}
            chartWidth={this.props.chartWidth}
            data={path ? this.props.data[this.props.type][path] :
              this.props.data[this.props.type]}
            date={day.date}
            future={day.type === 'future'}
            isFirst={id === 0}
            mostRecent={day.type === 'mostRecent'}
            onHover={this.onHover}
            subtotalType={this.getSelectedSubtotal()}
            type={this.props.type} />
        );
      }
    });
  }
}

CalendarContainer.prototype.actions = basicsActions;

CalendarContainer.propTypes = {
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
};

export default CalendarContainer;


/**
 * Copyright (c) 2020, Diabeloop
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
import PropTypes from 'prop-types';
import i18next from '../../core/language';
import _ from 'lodash';
import moment from 'moment';
import bows from 'bows';

const SELECT_BEGIN = 0;
const SELECT_END = 1;

/**
 * A date picker pop-up for a range of dates.
 */
class RangeDatePicker extends React.Component {
  static propTypes = {
    /** Timezone */
    timezone: PropTypes.string,
    /** Default date for the first calendar: begining of the range. Date as an ISO string, a Date object or a moment object. */
    begin: PropTypes.oneOfType([ PropTypes.object, PropTypes.string ]).isRequired,
    /** Default date for the second calendar: end of the range. Date as an ISO string, a Date object or a moment object. */
    end: PropTypes.oneOfType([ PropTypes.object, PropTypes.string ]).isRequired,
    /** Oldest date acceptable */
    min: PropTypes.oneOfType([ PropTypes.object, PropTypes.string ]),
    /** Newest date acceptable */
    max: PropTypes.oneOfType([ PropTypes.object, PropTypes.string ]),
    /** Message (tooltip) for dates before the min date */
    beforeMinDateMessage: PropTypes.string,
    /** Message (tooltip) for dates after the max date */
    afterMaxDateMessage: PropTypes.string,
    /** Minimum duration between begin & end dates: number, duration in days */
    minDuration: PropTypes.number,
    /** Maximum duration between begin & end dates: number, duration in days */
    maxDuration: PropTypes.number,
    /** Message (tooltip) for dates when the range is below the min duration */
    belowMinDurationMessage: PropTypes.string,
    /** Message (tooltip) for dates when the range is above the max duration */
    aboveMaxDurationMessage: PropTypes.string,
    /** Allow the user to select a date above or below the min/max duration. If true, the other date will be changed accordingly */
    allowSelectDateOutsideDuration: PropTypes.bool,
    /** Callback when the date ranges are selected: (begin: Moment, end: Moment) => {} */
    onChange: PropTypes.func.isRequired,
    /** Callback when the user cancel the selection (click outside the pop-up) */
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    timezone: 'UTC',
    min: null,
    max: null,
    beforeMinDateMessage: null,
    afterMaxDateMessage: null,
    /** Negative value = disabled */
    minDuration: -1,
    /** Negative value = disabled */
    maxDuration: -1,
    belowMinDurationMessage: null,
    aboveMaxDurationMessage: null,
    allowSelectDateOutsideDuration: false,
    onCancel: _.noop,
  };

  static reIdPrevNextMonth = /datepicker-popup-(prev|next)-month/;

  toMoment(value, isRequired = false) {
    const { timezone } = this.props;
    if (value === null) {
      if (isRequired) {
        throw new Error('Value is required');
      }
      return null;
    }
    if (typeof value === 'string') {
      return moment.utc(value).tz(timezone).startOf('day');
    }
    return moment.utc(value).tz(timezone).startOf('day');
  }

  constructor(props) {
    super(props);

    const { timezone } = props;
    this.t = i18next.t.bind(i18next);
    this.log = bows('RangeDatePicker');

    let selectedBegin = this.toMoment(props.begin, true);
    let selectedEnd = this.toMoment(props.end, true);

    if (selectedBegin.isSameOrAfter(selectedEnd, 'day')) {
      this.log.error('begin date is after end date!');
      const tmp = selectedBegin;
      selectedBegin = selectedEnd;
      selectedEnd = tmp;
    }

    const hoverDate = moment.utc(selectedBegin).tz(timezone);
    const displayMonth = moment.utc(selectedBegin).tz(timezone).date(1);
    if (selectedBegin.get('month') !== selectedEnd.get('month')) {
      // When 2 month (or more) are displayed, the start displayed
      // date should be on the left calendar side
      displayMonth.add(1, 'months');
    }

    this.state = {
      hidden: false,
      hoverDate,
      selectedBegin,
      selectedEnd,
      displayMonth,
      nextSelection: SELECT_BEGIN,
    };

    this.minDate = this.toMoment(props.min);
    this.maxDate = this.toMoment(props.max);

    this.handlePrevNextMonth = this.handlePrevNextMonth.bind(this);
    this.handleHoverDay = this.handleHoverDay.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    // Register the event to close this calendar when click outside of it.
    const body = document.getElementsByTagName('body');
    body[0].addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    // Unregister the event to close this calendar when click outside of it.
    const body = document.getElementsByTagName('body');
    body[0].removeEventListener('click', this.handleClickOutside);
  }

  render() {
    const { timezone } = this.props;
    const {
      hidden,
      hoverDate,
      selectedBegin,
      selectedEnd,
      displayMonth,
      nextSelection,
    } = this.state;

    if (hidden) {
      return null;
    }

    const months = [
      this.renderMonth(moment.utc(displayMonth).tz(timezone).subtract(1, 'month')),
      this.renderMonth(displayMonth)
    ];

    let first = selectedBegin;
    let last = selectedEnd;
    if (nextSelection === SELECT_END) {
      last = hoverDate;
    }
    if (first.isAfter(last, 'day')) {
      // Swap first & last date
      let tmp = first;
      first = last;
      last = tmp;
    }

    const nDays = last.diff(first, 'days') + 1;
    const numberOfDays = this.t('Number of days: {{nDays}}', { nDays });

    return (
      <div className="datepicker-popup">
        <div className="range">
          <p id="datepicker-popup-prev-month" className="change-month icon-back" onClick={this.handlePrevNextMonth} />
          <div className="calendars">
            {months}
          </div>
          <p id="datepicker-popup-next-month" className="change-month icon-next" onClick={this.handlePrevNextMonth}  />
        </div>
        <div className="popup-footer">
          <button id="datepicker-popup-btn-cancel" type="button" className="btn btn-secondary" onClick={this.handleCancel}>{this.t('Cancel')}</button>
          <button type="button" className="btn btn-primary" onClick={this.handleApply}>{this.t('Apply')}</button>
          <p id="datepicker-popup-nbdays">{numberOfDays}</p>
        </div>
      </div>
    );
  }

  /**
   * Render a month
   * @param {moment} month The month to render
   */
  renderMonth(month) {
    const { timezone } = this.props;
    // Build the weekdays (Su Mo Tu We Th Fr Sa)
    const weekDays = [];
    for (let i=0; i<7; i++) {
      const weekDay = moment().weekday(i);
      const weekDayLabel = weekDay.format('dd');
      weekDays.push(<span className="weekday" key={weekDayLabel}>{weekDayLabel}</span>);
    }

    // Build days
    const monthDays = []; // Array of JSX.Element
    const day = moment.utc(month).tz(timezone).weekday(0); // First day to display

    // Previous month
    while (day.get('month') !== month.get('month')) {
      monthDays.push(this.renderDay(day, false));
      day.add(1, 'days');
    }
    // Current month
    while (day.get('month') === month.get('month')) {
      monthDays.push(this.renderDay(day, true));
      day.add(1, 'days');
    }
    // Last week days in the next month
    while (day.weekday() > 0) {
      monthDays.push(this.renderDay(day, false));
      day.add(1, 'days');
    }

    return (
      <div className="calendar" key={month.toISOString()}>
        <p className="year">{month.format('MMMM YYYY')}</p>
        <div className="monthdays">
          {weekDays}
          {monthDays}
        </div>
      </div>
    );
  }

  /**
   * Render a single day of the calendar
   * @param {moment} day The day to display
   * @param {boolean} sameMonth if false the day will not be displayed: using CSS class `day-invisible`,
   * and no event possible on that day
   */
  renderDay(day, sameMonth) {
    const { maxDuration, aboveMaxDurationMessage } = this.props;
    const { selectedBegin, selectedEnd, hoverDate, nextSelection } = this.state;
    const key = day.unix().toString(10);
    const dayOfMonth = day.get('date');

    let className = 'day';
    let tooltip = null;
    let clickEvent = null;
    let hoverEvent = null;

    if (sameMonth) {
      hoverEvent = this.handleHoverDay;
      clickEvent = this.handleHoverDay; // Use the same event for touch screen

      let first = selectedBegin;
      let last = selectedEnd;

      if (nextSelection === SELECT_END) {
        last = hoverDate;
        // Honored the max duration
        // Can only be done after the first date selection.
        if (maxDuration > 0 && Math.abs(first.diff(day, 'days')) > maxDuration) {
          tooltip = aboveMaxDurationMessage;
          className = `${className} day-out`;
        }
      }

      if (first.isAfter(last, 'day')) {
        const tmp = first;
        first = last;
        last = tmp;
      }

      if (day.isBetween(first, last, 'days')) {
        className = `${className} day-in`;
      } else if (day.isSame(first, 'day') || day.isSame(last, 'day')) {
        className = `${className} day-selected`;
      } else if (moment.isMoment(this.minDate) && day.isSameOrBefore(this.minDate, 'day')) {
        const { beforeMinDateMessage } = this.props;
        className = `${className} day-disable`;
        hoverEvent = null;
        clickEvent = null;
        tooltip = beforeMinDateMessage;
      } else if (moment.isMoment(this.maxDate) && day.isSameOrAfter(this.maxDate, 'day')) {
        const { afterMaxDateMessage } = this.props;
        className = `${className} day-disable`;
        hoverEvent = null;
        clickEvent = null;
        tooltip = afterMaxDateMessage;
      }

    } else {
      className = `${className} day-invisible`;
    }

    return (<span id={`datepicker-popup-day-${key}`} className={className} key={key} value={key} onClick={clickEvent} onMouseOver={hoverEvent} title={tooltip}>{dayOfMonth}</span>);
  }

  /**
   * Click on the prev/next month arrows
   * @param {Event} e click event
   */
  handlePrevNextMonth(e) {
    const { timezone } = this.props;
    const { displayMonth } = this.state;
    const { target } = e;
    const id = target.getAttribute('id');

    if (id === 'datepicker-popup-prev-month') {
      this.setState({ displayMonth: moment(displayMonth).tz(timezone).subtract(1, 'month') });
    } else if (id === 'datepicker-popup-next-month') {
      this.setState({ displayMonth: moment.utc(displayMonth).tz(timezone).add(1, 'month') });
    } else {
      // ignore: error somewhere ?
      this.log.error('handlePrevNextMonth(): Invalid event target');
    }
  }

  /**
   * Mouse hover a date.
   * @param {MouseEvent} e The mouse event
   */
  handleHoverDay(e) {
    const { timezone } = this.props;
    const { type, target } = e;
    const value = target.getAttribute('value');
    const unixDate = Number.parseInt(value, 10);
    const date = moment.unix(unixDate).tz(timezone);

    this.setState({ hoverDate: date }, () => {
      if (type === 'click') {
        this.handleSelectDay();
      }
    });
  }

  /**
   * Click on a date.
   */
  handleSelectDay() {
    const { timezone, minDuration, maxDuration } = this.props;
    const { nextSelection, hoverDate, selectedBegin } = this.state;

    if (nextSelection === SELECT_BEGIN || nextSelection > SELECT_END) {
      this.log(`selectedBegin: ${hoverDate.toISOString()}`);
      this.setState({
        nextSelection: SELECT_END,
        selectedBegin: moment.utc(hoverDate).tz(timezone),
      });

    } else if (nextSelection === SELECT_END) {
      let begin = moment.utc(selectedBegin).tz(timezone);
      let end = moment.utc(hoverDate).tz(timezone);

      let diffDays = Math.abs(end.diff(begin, 'days'));
      this.log(`diffDays: ${diffDays}`);

      if (minDuration > 0 && diffDays < minDuration) {
        begin = moment.utc(end).tz(timezone).subtract(minDuration, 'days');
        diffDays = end.diff(begin, 'days');
        this.log(`diffDays adjusted: ${diffDays}`);
      } else if (maxDuration > 0 && diffDays > maxDuration) {
        if (begin.isBefore(end)) {
          begin = moment.utc(end).tz(timezone).subtract(maxDuration, 'days');
        } else {
          begin = moment.utc(end).tz(timezone).add(maxDuration, 'days');
        }
        diffDays = end.diff(begin, 'days');
        this.log(`diffDays adjusted: ${diffDays}`);
      }

      this.log(`selectedBegin: ${begin.toISOString()} selectedEnd: ${end.toISOString()}`);
      this.setState({ nextSelection: SELECT_END + 1, selectedBegin: begin, selectedEnd: end });
    }
  }

  /**
   * Accept the range
   * @param {Event} e click event
   */
  handleApply(e) {
    const { timezone } = this.props;
    const { selectedBegin, selectedEnd } = this.state;

    let begin = moment.utc(selectedBegin).tz(timezone);
    let end = moment.utc(selectedEnd).tz(timezone);
    if (begin.isAfter(end)) {
      const tmp = begin;
      begin = end;
      end = tmp;
    }

    this.setState({ hidden: true }, () => {
      // Use _.defer() (setTimeout() shortcut) to let the pop-up hide itself before continuing
      _.defer(this.props.onChange, begin, end);
    });
  }

  handleCancel() {
    this.setState({ hidden: true }, () => {
      _.defer(this.props.onCancel);
    });
  }

  /**
   * Click outside the popup
   * @param {Event} e click event
   */
  handleClickOutside(e) {
    let elem = e.target;
    let isInsidePopup = false;
    while (elem !== null && !isInsidePopup) {
      isInsidePopup = elem.classList.contains('datepicker-popup');
      elem = elem.parentElement;
    }

    if (!isInsidePopup) {
      e.stopPropagation(); // Prevent others elements to have this click event.
      // Click outside the datepicker popup, cancel the action, hide the popup.
      this.log('Hide the popup & cancel the event');
      this.setState({ hidden: true }, () => {
        _.defer(this.props.onCancel);
      });
    }
  }
}

export default RangeDatePicker;

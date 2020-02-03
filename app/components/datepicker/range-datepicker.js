
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

/**
 * A date picker pop-up for a range of dates.
 */
class RangeDatePicker extends React.Component {
  static propTypes = {
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

  static reIdPrevNextMonth = /datepicker-popup-(begin|end)-(prev|next)-month/;
  static reDayValue = /^(begin|end)-(\d+)$/;

  static toMoment(value, isRequired = false) {
    if (value === null) {
      if (isRequired) {
        throw new Error('Value is required');
      }
      return null;
    }
    if (typeof value === 'string') {
      return moment.utc(value).startOf('day');
    }
    return moment(value).startOf('day');
  }

  constructor(props) {
    super(props);

    const begin = RangeDatePicker.toMoment(props.begin, true);
    const end = RangeDatePicker.toMoment(props.end, true);
    const displayMonthBegin = moment(begin).date(1);
    const displayMonthEnd = moment(end).date(1);

    this.state = {
      hidden: false,
      begin,
      end,
      displayMonthBegin,
      displayMonthEnd,
    };

    this.t = i18next.t.bind(i18next);
    this.log = bows('RangeDatePicker');
    this.minDate = RangeDatePicker.toMoment(props.min);
    this.maxDate = RangeDatePicker.toMoment(props.max);

    this.handlePrevNextMonth = this.handlePrevNextMonth.bind(this);
    this.handleSelectDay = this.handleSelectDay.bind(this);
    this.handleApply = this.handleApply.bind(this);
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

    this.minDate = null;
    this.maxDate = null;
  }

  render() {
    const { hidden } = this.state;

    if (hidden) {
      return null;
    }

    const startCalendar = this.renderSingleCalendar('begin');
    const endCalendar = this.renderSingleCalendar('end');

    return (
      <div className="datepicker-popup datepicker-popup-range">
        <div className="datepicker-popup-calendars">
          {startCalendar}
          {endCalendar}
        </div>
        <div className="datepicker-popup-validate">
          <button type="button" className="btn btn-primary" onClick={this.handleApply}>{this.t('Apply')}</button>
        </div>
      </div>
    );
  }

  /**
   * Render a single calendar
   * @param {string} which 'begin' or 'end'
   * @returns JSX.Element
   */
  renderSingleCalendar(which) {
    const date = which === 'begin' ? this.state.begin : this.state.end;
    const displayMonth = which === 'begin' ? this.state.displayMonthBegin : this.state.displayMonthEnd;

    // Build the weekdays (Su Mo Tu We Th Fr Sa)
    const weekDays = [];
    const weekDaysLabel = [];
    for (let i=0; i<7; i++) {
      const weekDay = moment().weekday(i);
      const weekDayLabel = weekDay.format('dd');
      weekDaysLabel.push(weekDayLabel);
      weekDays.push(<span className="datepicker-popup-weekday" key={weekDayLabel}>{weekDayLabel}</span>);
    }

    // Build days
    const monthDays = []; // Array of JSX.Element
    const day = moment(displayMonth).weekday(0); // First day to display

    // Check if the user can see to the previous month
    let prevMonthClassname = 'datepicker-popup-change-month icon-back';
    if (this.minDate !== null && moment(displayMonth).subtract(1, 'months').isBefore(this.minDate)) {
      prevMonthClassname = `${prevMonthClassname} datepicker-popup-elem-invisible`;
    }
    // Check if the user can see to the next month
    let nextMonthClassname = 'datepicker-popup-change-month icon-next';
    if (this.maxDate !== null && moment(displayMonth).add(1, 'months').isSameOrAfter(this.maxDate)) {
      nextMonthClassname = `${prevMonthClassname} datepicker-popup-elem-invisible`;
    }

    // Previous month
    while (day.get('month') !== displayMonth.get('month')) {
      const isSameDay = date.isSame(day, 'day');
      monthDays.push(this.getNextSpanDay(day, which, isSameDay, true));
    }
    // Current month
    while (day.get('month') === displayMonth.get('month')) {
      const isSameDay = date.isSame(day, 'day');
      monthDays.push(this.getNextSpanDay(day, which, isSameDay));
    }
    // Last week days in the next month
    if (day.format('dd') !== weekDaysLabel[weekDaysLabel.length - 1]) {
      const isSameDay = date.isSame(day, 'day');
      while (day.format('dd') !== weekDaysLabel[weekDaysLabel.length - 1]) {
        monthDays.push(this.getNextSpanDay(day, which, isSameDay, true));
      }
      monthDays.push(this.getNextSpanDay(day, which, isSameDay, true));
    }

    return (
      <div className={`datepicker-popup-calendar datepicker-popup-${which}`}>
        <div className="datepicker-popup-head">
          <span id={`datepicker-popup-${which}-prev-month`} className={prevMonthClassname} onClick={this.handlePrevNextMonth}></span>
          <span className="datepicker-popup-year">{displayMonth.format('MMMM YYYY')}</span>
          <span id={`datepicker-popup-${which}-next-month`} className={nextMonthClassname} onClick={this.handlePrevNextMonth}></span>
        </div>
        <div className="datepicker-popup-monthdays">
          {weekDays}
          {monthDays}
        </div>
      </div>
    );
  }

  /**
   * private function.
   *
   * The day moment value will be incremented by 1 day after a call of this function.
   * @param {moment} day the current day.
   * @param {string} which Which calendar: 'begin' | 'end'
   * @param {boolean} isSelected true to set the class 'datepicker-popup-day-selected'
   * @param {boolean} wrongMonth true if outside the current displayed month
   */
  getNextSpanDay(day, which, isSelected = false, wrongMonth = false) {
    const { minDuration, maxDuration, allowSelectDateOutsideDuration } = this.props;
    const dayOfMonth = day.get('date');
    const key = `${which}-${day.unix()}`;
    const isBefore = this.minDate !== null && day.isBefore(this.minDate);
    const isAfter = this.maxDate !== null && day.isAfter(this.maxDate);
    let isDisabled = isBefore || isAfter || wrongMonth;
    let isBelowMinRange = false;
    let isAboveMaxRange = false;

    // Range min/max duration
    if (minDuration > 0 || maxDuration > 0) {
      let duration;
      if (which === 'begin') {
        duration = moment.duration(day.diff(this.state.end)).asDays();
        isBelowMinRange = minDuration > 0 && duration <= 0 && Math.abs(duration) < minDuration;
        isAboveMaxRange = maxDuration > 0 && duration < 0 && Math.abs(duration) > maxDuration;
      } else {
        duration = moment.duration(day.diff(this.state.begin)).asDays();
        isBelowMinRange = minDuration > 0 && duration >= 0 && duration < minDuration;
        isAboveMaxRange = maxDuration > 0 && duration > 0 && duration > maxDuration;
      }

      isDisabled = isDisabled || (!allowSelectDateOutsideDuration && (isBelowMinRange || isAboveMaxRange));
    }

    // Increment day
    day.add(1, 'days');

    let className = isDisabled ? 'datepicker-popup-day-disabled' : 'datepicker-popup-day';
    if (isSelected) {
      className = `${className} datepicker-popup-day-selected`;
    }
    if (wrongMonth) {
      className = `${className} datepicker-popup-elem-invisible`;
    }
    if (isAboveMaxRange || isBelowMinRange) {
      className = `${className} datepicker-popup-day-out`;
    }

    const clickEvent = isDisabled ? _.noop : this.handleSelectDay;

    let tooltip = null;
    if (isBefore) {
      const { beforeMinDateMessage } = this.props;
      tooltip = beforeMinDateMessage;
    } else if (isAfter) {
      const { afterMaxDateMessage } = this.props;
      tooltip = afterMaxDateMessage;
    } else if (isBelowMinRange) {
      const { belowMinDurationMessage } = this.props;
      tooltip = belowMinDurationMessage;
    } else if (isAboveMaxRange) {
      const { aboveMaxDurationMessage } = this.props;
      tooltip = aboveMaxDurationMessage;
    }

    return (<span id={`datepicker-popup-day-${key}`} className={className} key={key} value={key} onClick={clickEvent} title={tooltip}>{dayOfMonth}</span>);
  }

  /**
   * Click on the prev/next month arrows
   * @param {Event} e click event
   */
  handlePrevNextMonth(e) {
    const { target } = e;
    const id = target.getAttribute('id');
    const re = RangeDatePicker.reIdPrevNextMonth.exec(id);

    if (_.isArray(re)) {
      const which = re[1];
      const direction = re[2];
      const month = which === 'begin' ? moment(this.state.displayMonthBegin) : moment(this.state.displayMonthEnd);

      if (direction === 'prev') {
        month.subtract(1, 'months');
      } else {
        month.add(1, 'months');
      }
      if (which === 'begin') {
        this.setState({ displayMonthBegin: month });
      } else {
        this.setState({ displayMonthEnd: month });
      }
    }
  }

  handleSelectDay(e) {
    const { maxDuration, minDuration, allowSelectDateOutsideDuration } = this.props;
    const value = e.target.getAttribute('value');
    const exValue = RangeDatePicker.reDayValue.exec(value);
    const which = exValue[1];
    const unixDate = Number.parseInt(exValue[2], 10);
    const date = moment.unix(unixDate).utc();

    this.log(`Selected date: ${date.toISOString()}`);

    if (which === 'begin') {
      const duration = Math.abs(moment.duration(date.diff(this.state.end)).asDays());

      if (maxDuration > 0 && maxDuration < duration) {
        if (allowSelectDateOutsideDuration) {
          const end = moment(date).add(maxDuration, 'days');
          this.setState({ begin: date, end });
        }
      } else if (minDuration > 0 && (minDuration > duration || date.isAfter(this.state.end))) {
        if (allowSelectDateOutsideDuration) {
          const end = moment(date).add(minDuration, 'days');
          this.setState({ begin: date, end });
        }
      } else {
        this.setState({ begin: date });
      }

    } else {
      const duration = Math.abs(moment.duration(date.diff(this.state.begin)).asDays());

      if (maxDuration > 0 && maxDuration < duration) {
        if (allowSelectDateOutsideDuration) {
          const begin = moment(date).subtract(maxDuration, 'days');
          this.setState({begin, end: date});
        }
      } else if (minDuration > 0 && (minDuration > duration || date.isBefore(this.state.begin))) {
        if (allowSelectDateOutsideDuration) {
          const begin = moment(date).subtract(minDuration, 'days');
          this.setState({ begin, end: date });
        }
      } else {
        this.setState({ end: date });
      }
    }
  }

  handleApply() {
    const begin = moment(this.state.begin);
    const end = moment(this.state.end);
    this.setState({ hidden: true }, () => {
      this.log(`Date range: ${begin.toISOString()} - ${end.toISOString()}`);
      this.props.onChange(begin, end);
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
        this.props.onCancel();
      });
    }
  }
}

export default RangeDatePicker;

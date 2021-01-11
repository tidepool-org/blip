
/**
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
 */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';

import i18n from '../../core/language';

const t = i18n.t.bind(i18n);

function containsAll(str, letters) {
  const ll = letters.length;
  let ca = true;
  for (let i = 0; i < ll && ca; i++) {
    ca = ca && str.indexOf(letters[i]) >= 0;
  }
  return ca;
}

class DatePicker extends React.Component {
  static defaultValue = {
    day: undefined,
    month: undefined,
    year: undefined
  };

  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    min: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    max: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    beforeMinDateMessage: PropTypes.string,
    afterMaxDateMessage: PropTypes.string,
    disabled: PropTypes.bool,
    popup: PropTypes.bool,
    onChange: PropTypes.func,
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    name: 'datepicker',
    value: DatePicker.defaultValue,
    min: null,
    max: null,
    beforeMinDateMessage: null,
    afterMaxDateMessage: null,
    disabled: false,
    popup: false,
    onChange: _.noop,
    onCancel: _.noop,
  };

  static propsValueToMoment(value) {
    let mValue = null;

    if (_.isDate(value)) {
      mValue = moment.utc(value);
    } else if (moment.isMoment(value)) {
      mValue = value;
    } else if (typeof value === 'string') {
      mValue = moment.utc(value);
    } else if (_.isObject(value) && _.isNumber(value.year) && _.isNumber(value.month) && _.isNumber(value.day)) {
      mValue = moment.utc({ year: value.year, month: value.month, day: value.day });
    }

    return mValue;
  }

  constructor(props) {
    super(props);

    const defaultDate = DatePicker.propsValueToMoment(props.value);
    const minDate = DatePicker.propsValueToMoment(props.min);
    const maxDate = DatePicker.propsValueToMoment(props.max);

    let value = DatePicker.defaultValue;
    if (defaultDate !== null) {
      value = {
        day: defaultDate.get('date'),
        month: defaultDate.get('month'),
        year: defaultDate.get('year')
      };
    } else if (props.popup) {
      // For popup version if value is not set, display the current date
      const today = new Date();
      value = {
        day: today.getDate(),
        month: today.getMonth(),
        year: today.getFullYear(),
      };
    }

    this.state = {
      value,
      defaultDate,
      minDate,
      maxDate,
      hidden: false
    };

    this.handleChangeFlat = this.handleChangeFlat.bind(this);
    this.handleChangePopup = this.handleChangePopup.bind(this);
    this.handlePrevMonth = this.handlePrevMonth.bind(this);
    this.handleNextMonth = this.handleNextMonth.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.value, this.props.value)) {
      this.setState({
        value: this.props.value || DatePicker.defaultValue
      });
    }
  }

  componentDidMount() {
    const { popup } = this.props;
    if (popup) {
      const body = document.getElementsByTagName('body');
      body[0].addEventListener('click', this.handleClickOutside);
    }
  }

  componentWillUnmount() {
    const { popup } = this.props;
    if (popup) {
      const body = document.getElementsByTagName('body');
      body[0].removeEventListener('click', this.handleClickOutside);
    }
  }

  render() {
    const { popup } = this.props;
    const { hidden } = this.state;

    if (hidden) {
      return null;
    } else if (popup) {
      return this.renderPopup();
    } else {
      return this.renderFlat();
    }
  }

  renderFlat() {
    const { value } = this.state;
    const formElements = [null, null, null];
    const months = this.getMonths();
    const monthOptions = _.map(months, (item) => {
      return <option key={item.value} value={item.value}>{item.label}</option>;
    });

    const dateFormat = t('date.format', { defaultValue: 'MDY' });

    const selectMonth = (
      <select
        className="DatePicker-control DatePicker-control--month"
        name="month"
        value={value.month || ''}
        disabled={this.props.disabled}
        onChange={this.handleChangeFlat}>
        {monthOptions}
      </select>
    );

    const inputDay = (
      <input
        className="DatePicker-control DatePicker-control--day"
        name="day"
        value={value.day || ''}
        placeholder={t('Day')}
        disabled={this.props.disabled}
        onChange={this.handleChangeFlat} />
    );

    const inputYear = (
      <input
        className="DatePicker-control DatePicker-control--year"
        name="year"
        value={value.year || ''}
        placeholder={t('Year')}
        disabled={this.props.disabled}
        onChange={this.handleChangeFlat} />
    );

    if (dateFormat.length === 3 && containsAll(dateFormat, 'YMD')) {
      for (let i = 0; i < 3; i++) {
        switch (dateFormat[i]) {
          case 'Y':
            formElements[i] = inputYear;
            break;
          case 'M':
            formElements[i] = selectMonth;
            break;
          case 'D':
            formElements[i] = inputDay;
            break;
        }
      }
    } else {
      formElements[0] = selectMonth;
      formElements[1] = inputDay;
      formElements[2] = inputYear;
    }

    return (
      <div className="DatePicker" name={this.props.name}>
        { formElements[0]}
        { formElements[1]}
        { formElements[2]}
      </div>
    );
  }

  renderPopup() {
    const { value, defaultDate } = this.state;
    const m = moment.utc(value);

    // Build the weekdays (Su Mo Tu We Th Fr Sa)
    const weekDays = [];
    const weekDaysLabel = [];
    for (let i = 0; i < 7; i++) {
      const weekDay = moment().weekday(i);
      const weekDayLabel = weekDay.format('dd');
      weekDaysLabel.push(weekDayLabel);
      weekDays.push(<span className="datepicker-popup-weekday" key={weekDayLabel}>{weekDayLabel}</span>);
    }

    // Build days
    const monthDays = [];
    const currentMonth = m.get('month');
    const day = moment.utc(m).date(1).weekday(0);

    // Previous month
    while (day.get('month') !== currentMonth) {
      monthDays.push(this.getNextSpanDay(day, false, true));
    }
    // Current month
    while (day.get('month') === currentMonth) {
      const isSameDay = moment.isMoment(defaultDate) && defaultDate.isSame(day, 'day');
      monthDays.push(this.getNextSpanDay(day, isSameDay));
    }
    // Last week days in the next month
    if (day.format('dd') !== weekDaysLabel[weekDaysLabel.length - 1]) {
      while (day.format('dd') !== weekDaysLabel[weekDaysLabel.length - 1]) {
        monthDays.push(this.getNextSpanDay(day, false, true));
      }
      monthDays.push(this.getNextSpanDay(day, false, true));
    }

    return (
      <div className="datepicker-popup">
        <div className="datepicker-popup-head">
          <span className="datepicker-popup-change-month icon-back" onClick={this.handlePrevMonth}></span>
          <span className="datepicker-popup-year">{m.format('MMM YYYY')}</span>
          <span className="datepicker-popup-change-month icon-next" onClick={this.handleNextMonth}></span>
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
   * @param {boolean} isSelected true to set the class 'datepicker-popup-day-selected'
   * @param {boolean} wrongMonth true if outside the current displayed month
   */
  getNextSpanDay(day, isSelected = false, wrongMonth = false) {
    const { minDate, maxDate } = this.state;
    const dayOfMonth = day.get('date');
    const key = day.toISOString();
    const isBefore = moment.isMoment(minDate) && day.isBefore(minDate);
    const isAfter = moment.isMoment(maxDate) && day.isAfter(maxDate);
    const isDisabled = isBefore || isAfter;

    let className = isDisabled ? 'datepicker-popup-day-disabled' : 'datepicker-popup-day';
    if (isSelected) {
      className = `${className} datepicker-popup-day-selected`;
    }
    if (wrongMonth) {
      className = `${className} datepicker-popup-day-out`;
    }

    // Increment day
    day.add(1, 'days');

    const clickEvent = isDisabled ? _.noop : this.handleChangePopup;

    let tooltip = null;
    if (isBefore) {
      const { beforeMinDateMessage } = this.props;
      if (typeof beforeMinDateMessage === 'string') {
        tooltip = t(beforeMinDateMessage);
      }
    } else if (isAfter) {
      const { afterMaxDateMessage } = this.props;
      if (typeof afterMaxDateMessage === 'string') {
        tooltip = t(afterMaxDateMessage);
      }
    }

    return (<span className={className} key={key} value={key} onClick={clickEvent} title={tooltip}>{dayOfMonth}</span>);
  }

  getMonths() {
    return [
      { value: '', label: t('Month') },
      { value: '0', label: t('January') },
      { value: '1', label: t('February') },
      { value: '2', label: t('March') },
      { value: '3', label: t('April') },
      { value: '4', label: t('May') },
      { value: '5', label: t('June') },
      { value: '6', label: t('July') },
      { value: '7', label: t('August') },
      { value: '8', label: t('September') },
      { value: '9', label: t('October') },
      { value: '10', label: t('November') },
      { value: '11', label: t('December') }
    ];
  }

  handlePrevMonth(e) {
    const m = moment.utc(this.state.value);
    m.subtract(1, 'months');
    const value = {
      day: m.get('date'),
      month: m.get('month'),
      year: m.get('year')
    };

    e.stopPropagation();
    this.setState({ value });
  }

  handleNextMonth(e) {
    const m = moment.utc(this.state.value);
    m.add(1, 'months');
    const value = {
      day: m.get('date'),
      month: m.get('month'),
      year: m.get('year')
    };

    e.stopPropagation();
    this.setState({ value });
  }

  handleChangePopup(e) {
    const isoDate = e.target.getAttribute('value');
    const valueAsMoment = moment.utc(isoDate);
    const value = {
      day: valueAsMoment.get('date'),
      month: valueAsMoment.get('month'),
      year: valueAsMoment.get('year')
    };
    const valueAsDate = new Date(isoDate);

    e.stopPropagation();
    this.setState({ hidden: true }, () => {
      this.props.onChange({
        name: this.props.name,
        value,
        valueAsDate,
        valueAsMoment,
      });
    });
  }

  handleChangeFlat(e) {
    const target = e.target;
    const { value: oldValue } = this.state;
    const value = _.clone(oldValue);
    value[target.name] = target.value;

    let valueAsDate = null;
    if (typeof value.year === 'number' && typeof value.month === 'number' && typeof value.day === 'number') {
      valueAsDate = new Date(value.year, value.month, value.day);
    }

    this.props.onChange({
      name: this.props.name,
      value,
      valueAsDate
    });
  }

  handleClickOutside(e) {
    let elem = e.target;
    let isInsidePopup = false;
    while (elem !== null && !isInsidePopup) {
      isInsidePopup = elem.className === 'datepicker-popup';
      elem = elem.parentElement;
    }
    if (!isInsidePopup) {
      // Click outside the datepicker popup, cancel the action, hide the popup.
      this.setState({ hidden: true }, () => {
        this.props.onCancel();
      });
    }
  }

}

export default DatePicker;

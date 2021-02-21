
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

import PropTypes from 'prop-types';
import React from 'react';
import { translate } from 'react-i18next';
import _ from 'lodash';

var DATE_FORMAT = 'YYYY-MM-DD';

var DatePicker = translate()(class extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func
  };

  state = {
    value: this.props.value || {}
  };

  months = () => {
    const { t } = this.props;
    return [
      {value: '', label: t('Month')},
      {value: '0', label: t('January')},
      {value: '1', label: t('February')},
      {value: '2', label: t('March')},
      {value: '3', label: t('April')},
      {value: '4', label: t('May')},
      {value: '5', label: t('June')},
      {value: '6', label: t('July')},
      {value: '7', label: t('August')},
      {value: '8', label: t('September')},
      {value: '9', label: t('October')},
      {value: '10', label: t('November')},
      {value: '11', label: t('December')}
    ];
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value || {}
    });
  }

  render() {
    return (
      <div className="DatePicker" name={this.props.name}>
        {this.renderMonth()}
        {this.renderDay()}
        {this.renderYear()}
      </div>
    );
  }

  renderMonth = () => {
    var options = _.map(this.months(), function(item) {
      return <option key={item.value} value={item.value}>{item.label}</option>;
    });
    return (
      <select
        className="DatePicker-control DatePicker-control--month"
        name="month"
        value={this.state.value.month}
        disabled={this.props.disabled}
        onChange={this.handleChange}>
        {options}
      </select>
    );
  };

  renderDay = () => {
    const { t } = this.props;
    return <input
      className="DatePicker-control DatePicker-control--day"
      name="day"
      value={this.state.value.day}
      placeholder={t('Day')}
      disabled={this.props.disabled}
      onChange={this.handleChange} />;
  };

  renderYear = () => {
    const { t } = this.props;
    return <input
      className="DatePicker-control DatePicker-control--year"
      name="year"
      value={this.state.value.year}
      placeholder={t('Year')}
      disabled={this.props.disabled}
      onChange={this.handleChange} />;
  };

  handleChange = (e) => {
    var target = e.target;
    var value = this.state.value;
    value[target.name] = target.value;

    if (this.props.onChange) {
      this.props.onChange({
        name: this.props.name,
        value: value
      });
    }
  };
});

module.exports = DatePicker;

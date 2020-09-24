
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
import _ from 'lodash';
import cx from 'classnames';
import Select from 'react-select';

import DatePicker from '../datepicker';
import ShowHidePassword from '../showHidePassword';

// Input with label and validation error message
class InputGroup extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.node,
    items: PropTypes.array,
    text: PropTypes.node,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
      PropTypes.object // dates for datepicker input type are objects
    ]),
    error: PropTypes.string,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    rows: PropTypes.number,
    disabled: PropTypes.bool,
    multi: PropTypes.bool,
    onChange: PropTypes.func,
    info: PropTypes.string,
  };

  DEFAULT_TEXTAREA_ROWS = 3;

  render() {
    var className = this.getClassName();
    var label = this.renderLabel();
    var input = this.renderInput();
    var message = this.renderMessage();

    return (
      <div className={className}>
        <div>
          {label}
          {input}
        </div>
        {message}
      </div>
    );
  }

  renderLabel = () => {
    var text = this.props.label;
    var htmlFor = this.props.name;

    if (this.props.type === 'checkbox' ||
        this.props.type === 'radios') {
      // Label part of input
      return null;
    }

    if (text) {
      return (
        <label
          className="input-group-label"
          htmlFor={htmlFor}
          ref="label">{text}</label>
      );
    }

    return null;
  };

  renderInput = () => {
    var type = this.props.type;

    if (type === 'passwordShowHide') {
      return this.renderPasswordShowHide();
    }

    if (type === 'textarea') {
      return this.renderTextArea();
    }

    if (type === 'checkbox') {
      return this.renderCheckbox();
    }

    if (type === 'radios') {
      return this.renderRadios();
    }

    if (type === 'select') {
      return this.renderSelect();
    }

    if (type === 'datepicker') {
      return this.renderDatePicker();
    }

    if (type === 'explanation') {
      return this.renderExplanation();
    }

    return (
      <input
        type={type}
        className="input-group-control form-control"
        id={this.props.name}
        name={this.props.name}
        title={this.props.info}
        value={this.props.value}
        placeholder={this.props.placeholder}
        onChange={this.handleChange}
        disabled={this.props.disabled}
        ref="control"/>
    );
  };

  renderPasswordShowHide = () => {
    return (
      <ShowHidePassword
        className="input-group-control form-control"
        id={this.props.name}
        name={this.props.name}
        value={this.props.value}
        placeholder={this.props.placeholder}
        onChange={this.handleChange}/>
    );
  };

  renderTextArea = () => {
    var rows = this.props.rows || this.DEFAULT_TEXTAREA_ROWS;

    return (
      <textarea
        className="input-group-control form-control"
        id={this.props.name}
        name={this.props.name}
        value={this.props.value}
        placeholder={this.props.placeholder}
        rows={rows}
        onChange={this.handleChange}
        disabled={this.props.disabled}
        ref="control"></textarea>
    );
  };

  renderCheckbox = () => {

    return (
      <label
        className="input-group-checkbox-label"
        htmlFor={this.props.name}
        ref="label">
        <input
          type="checkbox"
          className="input-group-checkbox-control"
          id={this.props.name}
          name={this.props.name}
          checked={this.props.value}
          onChange={this.handleChange}
          disabled={this.props.disabled}
          ref="control"/>
        {' '}
        {this.props.label}
      </label>
    );
  };

  renderRadios = () => {
    var self = this;
    var radios = _.map(this.props.items, function(radio, index) {
      var id = self.props.name + index;
      var checked = (self.props.value === radio.value);

      return (
        <label
          className="input-group-radio-label"
          htmlFor={id}
          key={id}
          ref={'label' + index}>
          <input
            type="radio"
            className="input-group-radio-control"
            id={id}
            name={self.props.name}
            value={radio.value}
            checked={checked}
            onChange={self.handleChange}
            disabled={self.props.disabled}
            ref={'control' + index}/>
          {' '}
          {radio.label}
        </label>
      );
    });

    return (
      <div className="input-group-radios">
        {radios}
      </div>
    );
  };

  renderSelect = () => {
    var isMultiSelect = this.props.multi || false;

    var classNames = cx({
      'input-group-control': true,
      'form-control': true,
      'Select': true,
    });

    let valueArray = [];

    if (!_.isEmpty(this.props.value)) {
      // Select all provided values that have a corresponding option value
      valueArray = _.intersectionBy(
        this.props.items,
        _.map(this.props.value.split(','), value => ({ value })),
        'value'
      );
    }

    return (
      <Select
        className={classNames}
        classNamePrefix="Select"
        name={this.props.name}
        id={this.props.name}
        isMulti={isMultiSelect}
        isClearable={isMultiSelect}
        closeMenuOnSelect={!isMultiSelect}
        placeholder={this.props.placeholder}
        value={valueArray}
        onChange={this.handleChange}
        isDisabled={this.props.disabled}
        options={this.props.items}
      />
    );
  };

  renderDatePicker = () => {
    return (
      <DatePicker
        name={this.props.name}
        value={this.props.value}
        disabled={this.props.disabled}
        title={this.props.info}
        onChange={this.handleChange} />
    );
  };

  renderExplanation = () => {
    return <div className='input-group-explanation'>
      {this.props.text}
    </div>;
  };

  renderMessage = () => {
    var error = this.props.error;
    if (error) {
      return (
        <div
          className="input-group-message form-help-block"
          ref="message">{error}</div>
      );
    }
    return null;
  };

  getClassName = () => {
    var className = 'input-group form-group clearfix';
    if (this.props.error) {
      className += ' input-group-error';
    }
    return className;
  };

  handleChange = (e) => {
    var target = (e !== null) ? e.target || e : {};

    var attributes = {
      name: target.name || this.props.name,
      value: target.value || null,
    };

    if (this.props.type === 'checkbox') {
      // "Normalize" checkbox change events to use `value` like other inputs
      attributes.value = target.checked;
    }

    if (this.props.type === 'select' && this.props.multi) {
      // Target comes in as an array of objects when using react-select's 'multi' attribute
      attributes.value = target;
    }

    var changeCallback = this.props.onChange;
    if (changeCallback) {
      changeCallback(attributes);
    }
  };
}

module.exports = InputGroup;

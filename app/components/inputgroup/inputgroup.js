/** @jsx React.DOM */
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

var React = window.React;
var _ = window._;

// Input with label and validation error message
var InputGroup = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    label: React.PropTypes.string,
    items: React.PropTypes.array,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.bool
    ]),
    error: React.PropTypes.string,
    type: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    rows: React.PropTypes.number,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func
  },

  DEFAULT_TEXTAREA_ROWS: 3,

  render: function() {
    var className = this.getClassName();
    var label = this.renderLabel();
    var input = this.renderInput();
    var message = this.renderMessage();

    return (
      /* jshint ignore:start */
      <div className={className}>
        <div>
          {label}
          {input}
        </div>
        {message}
      </div>
      /* jshint ignore:end */
    );
  },

  renderLabel: function() {
    var text = this.props.label;
    var htmlFor = this.props.name;

    if (this.props.type === 'checkbox' ||
        this.props.type === 'radios') {
      // Label part of input
      return null;
    }

    if (text) {
      return (
        /* jshint ignore:start */
        <label
          className="input-group-label"
          htmlFor={htmlFor}
          ref="label">{text}</label>
        /* jshint ignore:end */
      );
    }

    return null;
  },

  renderInput: function() {
    var type = this.props.type;

    if (type === 'textarea') {
      return this.renderTextArea();
    }

    if (type === 'checkbox') {
      return this.renderCheckbox();
    }

    if (type === 'radios') {
      return this.renderRadios();
    }

    return (
      /* jshint ignore:start */
      <input
        type={type}
        className="input-group-control form-control"
        id={this.props.name}
        name={this.props.name}
        value={this.props.value}
        placeholder={this.props.placeholder}
        onChange={this.handleChange}
        disabled={this.props.disabled}
        ref="control"/>
      /* jshint ignore:end */
    );
  },

  renderTextArea: function() {
    var rows = this.props.rows || this.DEFAULT_TEXTAREA_ROWS;

    /* jshint ignore:start */
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
    /* jshint ignore:end */
  },

  renderCheckbox: function() {

    return (
      /* jshint ignore:start */
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
      /* jshint ignore:end */
    );
  },

  renderRadios: function() {
    var self = this;
    var radios = _.map(this.props.items, function(radio, index) {
      var id = self.props.name + index;
      var checked = (self.props.value === radio.value);
      /* jshint ignore:start */
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
      /* jshint ignore:end */
    });

    return (
      /* jshint ignore:start */
      <div className="input-group-radios">
        {radios}
      </div>
      /* jshint ignore:end */
    );
  },

  renderMessage: function() {
    var error = this.props.error;
    if (error) {
      return (
        /* jshint ignore:start */
        <div
          className="input-group-message form-help-block"
          ref="message">{error}</div>
        /* jshint ignore:end */
      );
    }
    return null;
  },

  getClassName: function() {
    var className = 'input-group form-group clearfix';
    if (this.props.error) {
      className += ' input-group-error';
    }
    return className;
  },

  handleChange: function(e) {
    var target = e.target;
    var attributes = {
      name: target.name,
      value: target.value
    };

    if (this.props.type === 'checkbox') {
      // "Normalize" checkbox change events to use `value` like other inputs
      attributes.value = target.checked;
    }

    var changeCallback = this.props.onChange;
    if (changeCallback) {
      changeCallback(attributes);
    }
  }
});

module.exports = InputGroup;

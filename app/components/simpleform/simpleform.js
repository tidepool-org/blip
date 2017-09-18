
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

var React = require('react');
var _ = require('lodash');

var InputGroup = require('../inputgroup');

// Simple form with validation errors, submit button, and notification message
var SimpleForm = React.createClass({
  propTypes: {
    inputs: React.PropTypes.array,
    formValues: React.PropTypes.object,
    validationErrors: React.PropTypes.object,
    submitButtonText: React.PropTypes.string,
    submitDisabled: React.PropTypes.bool,
    onSubmit: React.PropTypes.func,
    onChange: React.PropTypes.func,
    notification: React.PropTypes.object,
    disabled: React.PropTypes.bool,
    renderSubmit: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      formValues: {},
      validationErrors: {},
      renderSubmit: true,
    };
  },

  getInitialState: function() {
    var formValues =
      this.getInitialFormValues(this.props.inputs, this.props.formValues);
    return {
      formValues: formValues
    };
  },

  // Make sure all inputs have a defined form value (can be blank)
  getInitialFormValues: function(inputsProp, formValuesProp) {
    var formValues = {};
    _.forEach(inputsProp, function(input) {
      var name = input.name;
      formValues[name] = formValuesProp[name];
    });
    return formValues;
  },

  componentWillReceiveProps: function(nextProps) {
    // Keep form values in sync with upstream changes
    // (here `setState` will not trigger a double render)
    var formValues =
      this.getInitialFormValues(nextProps.inputs, nextProps.formValues);
    this.setState({formValues: formValues});
  },

  render: function() {
    var inputs = this.renderInputs();
    var submitButton = this.props.renderSubmit ? this.renderSubmitButton() : null;
    var notification = this.renderNotification();

    return (
        <form className="simple-form">
          <div className="simple-form-inputs" ref="inputs" key="inputs">
            {inputs}
          </div>
            {this.props.children}
          <div className="simple-form-action-group">
            {submitButton}
            {notification}
          </div>
        </form>
    );
  },

  renderInputs: function() {
    var self = this;
    var inputs = this.props.inputs || [];
    if (inputs.length) {
      return _.map(inputs, self.renderInput);
    }

    return null;
  },

  renderInput: function(input) {
    var name = input.name;
    var type = input.type;
    var label = input.label;
    var items = input.items;
    var text = input.text;
    var multi = input.multi || false;
    var value = this.state.formValues[name];
    var error = this.props.validationErrors[name];
    var placeholder = input.placeholder;
    var disabled = this.props.disabled || input.disabled;

    return (
      <InputGroup
        key={name}
        name={name}
        label={label}
        items={items}
        value={value}
        text={text}
        error={error}
        type={type}
        multi={multi}
        placeholder={placeholder}
        disabled={disabled}
        onChange={this.handleChange}/>
    );
  },

  renderSubmitButton: function() {
    var text = this.props.submitButtonText || 'Submit';
    var disabled = this.props.disabled || this.props.submitDisabled;

    return (
      <button
        className="simple-form-submit btn btn-primary js-form-submit"
        onClick={this.handleSubmit}
        disabled={disabled}
        ref="submitButton">{text}</button>
    );
  },

  renderNotification: function() {
    var notification = this.props.notification;
    if (notification && notification.message) {
      var type = notification.type || 'alert';
      var className = [
        'simple-form-notification',
        'simple-form-notification-' + type,
        'js-form-notification'
      ].join(' ');
      var message = notification.message;

      return (
        <div className={className} ref="notification">{message}</div>
      );
    }
    return null;
  },

  handleChange: function(attributes) {
    var key = attributes.name;
    var value = attributes.value;

    if (this.props.onChange) {
      this.props.onChange(attributes);
    } else if (key) {
      var formValues = _.clone(this.state.formValues);
      formValues[key] = value;
      this.setState({formValues: formValues});
    }
  },

  handleSubmit: function(e) {
    if (e) {
      e.preventDefault();
    }

    var submit = this.props.onSubmit;
    if (submit) {
      var formValues = _.clone(this.state.formValues);
      submit(formValues);
    }
  },

  getFormValues: function() {
    return _.cloneDeep(this.state.formValues);
  }
});

module.exports = SimpleForm;

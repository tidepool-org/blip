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
    notification: React.PropTypes.object,
    disabled: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      formValues: {},
      validationErrors: {}
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
    var submitButton = this.renderSubmitButton();
    var notification = this.renderNotification();

    /* jshint ignore:start */
    return (
        <form className="simple-form">
          <div className="simple-form-inputs" ref="inputs">
            {inputs}
          </div>
          <div className="simple-form-action-group">
            {submitButton}
            {notification}
          </div>
        </form>
    );
    /* jshint ignore:end */
  },

  renderInputs: function() {
    var self = this;
    var inputs = this.props.inputs;
    if (inputs.length) {
      /* jshint ignore:start */
      return _.map(inputs, self.renderInput);
      /* jshint ignore:end */
    }

    return null;
  },

  renderInput: function(input) {
    var name = input.name;
    var type = input.type;
    var label = input.label;
    var value = this.state.formValues[name];
    var error = this.props.validationErrors[name];
    var placeholder = input.placeholder;
    var disabled = this.props.disabled || input.disabled;
    
    /* jshint ignore:start */
    return (
      <InputGroup
        key={name}
        name={name}
        label={label}
        value={value}
        error={error}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        onChange={this.handleChange}/>
    );
    /* jshint ignore:end */
  },

  renderSubmitButton: function() {
    var text = this.props.submitButtonText || 'Submit';
    var disabled = this.props.disabled || this.props.submitDisabled;

    /* jshint ignore:start */
    return (
      <button
        className="simple-form-submit btn btn-primary js-form-submit"
        onClick={this.handleSubmit}
        disabled={disabled}
        ref="submitButton">{text}</button>
    );
    /* jshint ignore:end */
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

      /* jshint ignore:start */
      return (
        <div className={className} ref="notification">{message}</div>
      );
      /* jshint ignore:end */
    }
    return null;
  },

  handleChange: function(e) {
    var key = e.target.name;
    var value = e.target.value;
    if (key) {
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
  }
});

module.exports = SimpleForm;
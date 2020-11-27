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
import bows from 'bows';

import i18n from '../../core/language';
import InputGroup from '../inputgroup';

// Simple form with validation errors, submit button, and notification message
class SimpleForm extends React.Component {
  constructor(props) {
    super(props);
    this.log = bows('SimpleForm');
    const formValues = this.getInitialFormValues();
    this.state = { formValues };
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props, prevProps)) {
      const { formValues: prevFormValues } = prevProps;
      const { formValues: stateFormValues } = this.state;
      const newFormValues = this.getInitialFormValues();

      const formValues = _.cloneDeep(stateFormValues);
      let haveChanges = false;
      // Check if prevProps & newProps are not equals
      for (const name in newFormValues) {
        let propChange = _.has(newFormValues, name);
        propChange = propChange && (!_.has(prevFormValues, name) || prevFormValues[name] !== newFormValues[name]);
        if (propChange) {
          haveChanges = true;
          formValues[name] = newFormValues[name];
        }
      }

      if (haveChanges) {
        this.log.info('Props updated => state to be changed');
        this.setState({ formValues });
      }
    }
  }

  // Make sure all inputs have a defined form value (can be blank)
  getInitialFormValues() {
    const { inputs, formValues } = this.props;
    const initialFormValues = {};
    _.forEach(inputs, (input) => {
      const name = _.get(input, 'name', null);
      if (_.isString(name) && _.has(formValues, name)) {
        const value = _.get(formValues, name, null);
        if (value !== null) {
          initialFormValues[name] = value;
        }
      } else {
        this.log.info('Missing name on input, or missing formValues.name', input, formValues);
      }
    });
    return initialFormValues;
  }

  render() {
    const { children, renderSubmit } = this.props;
    const inputs = this.renderInputs();
    const submitButton = renderSubmit ? this.renderSubmitButton() : null;
    const notification = this.renderNotification();

    return (
      <form className="simple-form">
        <div className="simple-form-inputs">
          {inputs}
        </div>
        {children}
        <div className="simple-form-action-group">
          {submitButton}
          {notification}
        </div>
      </form>
    );
  }

  renderInputs() {
    const { inputs } = this.props;
    if (inputs.length) {
      return _.map(inputs, this.renderInput);
    }

    return null;
  }

  renderInput = (input) => {
    const { validationErrors, disabled } = this.props;
    const { formValues } = this.state;

    const {
      name,
      type,
      label,
      items,
      text,
      info,
      placeholder,
    } = input;
    const multi = _.get(input, 'multi', false);
    const value = _.get(formValues, name, null);
    const error = _.get(validationErrors, name, null);

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
        disabled={disabled || input.disabled}
        onChange={this.handleChange}
        info={info}
      />
    );
  };

  renderSubmitButton() {
    const { submitButtonText , disabled, submitDisabled } = this.props;
    const text = _.isString(submitButtonText) ? submitButtonText : i18n.t('Submit');

    return (
      <button
        className="simple-form-submit btn btn-primary js-form-submit"
        onClick={this.handleSubmit}
        disabled={disabled || submitDisabled}>
          {text}
      </button>
    );
  }

  renderNotification() {
    const { notification } = this.props;
    if (notification && notification.message) {
      const type = notification.type || 'alert';
      const className = [
        'simple-form-notification',
        'simple-form-notification-' + type,
        'js-form-notification'
      ].join(' ');
      const message = notification.message;

      return (
        <div className={className}>{message}</div>
      );
    }
    return null;
  }

  handleChange = (/** @type{{name: string, value: string|number }} */ attributes) => {
    const { name, value } = attributes;
    const formValues = _.cloneDeep(this.state.formValues);
    if (_.isString(name)) {
      _.set(formValues, name, value);
    }

    this.setState({ formValues });

    if (_.isFunction(this.props.onChange)) {
      this.props.onChange(attributes);
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { onSubmit } = this.props;
    if (_.isFunction(onSubmit)) {
      const formValues = _.cloneDeep(this.state.formValues);
      onSubmit(formValues);
    }
  };
}

SimpleForm.propTypes = {
  inputs: PropTypes.array,
  formValues: PropTypes.object,
  validationErrors: PropTypes.object,
  submitButtonText: PropTypes.string,
  submitDisabled: PropTypes.bool,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  notification: PropTypes.object,
  disabled: PropTypes.bool,
  renderSubmit: PropTypes.bool,
  children: PropTypes.node,
};

SimpleForm.defaultProps = {
  inputs: [],
  formValues: {},
  validationErrors: {},
  renderSubmit: true,
  disabled: false,
  submitDisabled: false,
  onChange: null,
  submitButtonText: null,
};

export default SimpleForm;


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

import TrDatePicker from '../datepicker';
import ShowHidePassword from '../showHidePassword';

function Label(props) {
  const { label, name, type } = props;

  if (type === 'checkbox' || type === 'radios' || _.isEmpty(label)) {
    // Label part of input
    return null;
  }

  return <label className="input-group-label" htmlFor={name}>{label}</label>;
}

Label.propTypes = {
  name: PropTypes.string,
  label: PropTypes.node,
  type: PropTypes.string.isRequired,
};

function Radios(props) {
  const radios = _.map(props.items, (radio, index) => {
    const id = props.name + index;
    const checked = (props.value === radio.value);

    return (
      <label className="input-group-radio-label" htmlFor={id} key={id}>
        <input
          type="radio"
          className="input-group-radio-control"
          id={id}
          name={props.name}
          value={radio.value}
          checked={checked}
          onChange={props.onChange}
          disabled={props.disabled} />
        {` ${radio.label}`}
      </label>
    );
  });

  return (
    <div className="input-group-radios">
      {radios}
    </div>
  );
}

Radios.propTypes = {
  name: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

Radios.defaultProps = {
  onChange: null,
  disabled: false,
  value: null,
};

function InputSelect(props) {
  const { multi, name, placeholder, onChange, disabled, items, value } = props;
  const classNames = cx({
    'input-group-control': true,
    'form-control': true,
    'Select': true,
  });

  let valueArray = [];
  if (!_.isEmpty(value)) {
    // Select all provided values that have a corresponding option value
    const values = value.split(',');
    for (const v of values) {
      for (const i of items) {
        if (i.value === v) {
          valueArray.push(i);
        }
      }
    }
  }

  return (
    <Select
      className={classNames}
      classNamePrefix="Select"
      name={name}
      id={name}
      isMulti={multi}
      isClearable={multi}
      closeMenuOnSelect={!multi}
      placeholder={placeholder}
      value={valueArray}
      onChange={onChange}
      isDisabled={disabled}
      options={items}
    />
  );
}

InputSelect.propTypes = {
  name: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  multi: PropTypes.bool.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
};

InputSelect.defaultProps = {
  value: null,
  onChange: null,
  disabled: false,
  placeholder: null,
};

// Input with label and validation error message
function InputGroup(props) {
  const {
    error,
    name,
    label,
    type,
    value,
    info,
    rows,
    items,
    text,
    multi,
    placeholder,
    onChange,
    disabled,
  } = props;

  const className = cx({
    'input-group': true,
    'form-group': true,
    clearfix: true,
    'input-group-error': !_.isEmpty(error),
  });

  const handleChange = _.isFunction(onChange) ? (/** @type {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} */ e) => {
    const target = _.get(e, 'target', {});
    const attributes = {
      name: _.get(target, 'name', name),
      value: _.get(target, 'value', ''),
    };

    if (type === 'checkbox') {
      // "Normalize" checkbox change events to use `value` like other inputs
      attributes.value = _.get(target, 'checked', false);
    } else if (type === 'select') {
      // @ts-ignore
      attributes.value = e.value;
    }

    if (_.isFunction(onChange)) {
      onChange(attributes);
    }
  } : null;

  let input = null;
  switch (type) {
    case 'passwordShowHide':
      input = <ShowHidePassword
        className="input-group-control form-control"
        id={name}
        name={name}
        value={_.isString(value) ? value : ''}
        placeholder={placeholder}
        onChange={handleChange} />;
      break;
    case 'textarea':
      input = <textarea
        className="input-group-control form-control"
        id={name}
        name={name}
        value={_.isString(value) ? value : ''}
        placeholder={placeholder}
        rows={rows}
        onChange={handleChange}
        disabled={disabled} />;
      break;
    case 'checkbox':
      input = (
        <label className="input-group-checkbox-label" htmlFor={name}>
          <input
            type="checkbox"
            className="input-group-checkbox-control"
            id={name}
            name={name}
            checked={value}
            onChange={handleChange}
            disabled={disabled} />
          {' '}{label}
        </label>
      );
      break;
    case 'radios':
      input = <Radios name={name} items={items} onChange={handleChange} disabled={disabled} value={value} />;
      break;
    case 'select':
      input = <InputSelect
        multi={multi}
        name={name}
        items={items}
        onChange={handleChange}
        disabled={disabled}
        value={value}
        placeholder={placeholder} />;
      break;
    case 'datepicker':
      input = <TrDatePicker
        name={name}
        value={value}
        disabled={disabled}
        title={info}
        onChange={handleChange} />;
      break;
    case 'explanation':
      input = (
        <div className='input-group-explanation'>
          {text}
        </div>
      );
      break;
    case 'text':
    case 'email':
    case 'password':
    default:
      input = <input
        type={type}
        className="input-group-control form-control"
        id={name}
        name={name}
        title={info}
        value={_.isString(value) ? value : ''}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled} />;
  }

  let message = null;
  if (_.isString(error) && error.length > 0) {
    message = <div className="input-group-message form-help-block">{error}</div>;
  }

  return (
    <div className={className}>
      <div>
        <Label name={name} label={label} type={type} />
        {input}
      </div>
      {message}
    </div>
  );
}

InputGroup.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
  items: PropTypes.array,
  text: PropTypes.node,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.object // dates for datepicker input type are objects
  ]),
  error: PropTypes.string,
  type: PropTypes.oneOf([
    'passwordShowHide',
    'textarea',
    'checkbox',
    'radios',
    'select',
    'datepicker',
    'explanation',
    'text',
    'password',
    'email',
  ]).isRequired,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  disabled: PropTypes.bool,
  multi: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  info: PropTypes.string,
};

InputGroup.defaultProps = {
  label: '',
  text: null,
  items: null,
  value: null,
  error: null,
  placeholder: null,
  rows: 3,
  disabled: false,
  multi: false,
  info: null,
};

export default InputGroup;

import React, { PropTypes } from 'react';
import _ from 'lodash';
import Select from 'react-select';

import styles from './InputGroup.css';

const InputGroup = (props) => {
  const {
    name,
    label,
    min = 0,
    max = 1000,
    step,
    suffix,
    suffixValue,
    type,
    value,
  } = props;

  const disableManualInput = (inputValue, { action }) => {
    return (action === 'input-change') ? '' : inputValue;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      </div>
      <div className={styles.inputs}>
        <input
          className={styles[`input-${type}`]}
          name={name}
          id={name}
          type={type}
          step={step}
          max={max}
          min={min}
          onChange={props.onChange}
          value={value}
        />
        {_.isString(suffix) && (
          <div className={styles.suffixText}>{suffix}</div>
        )}
        {_.isArray(suffix) && (
          <div className={styles.suffix}>
            <Select
              classNamePrefix="inputGroup-suffix"
              value={suffixValue}
              onChange={props.onSuffixChange}
              onInputChange={disableManualInput}
              options={suffix}
            />
          </div>
        )}
      </div>
    </div>
  );
};

InputGroup.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  max: PropTypes.number,
  min: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onSuffixChange: PropTypes.func,
  step: PropTypes.number,
  suffix: PropTypes.oneOf([PropTypes.string, PropTypes.array]),
  suffixValue: PropTypes.string,
  type: PropTypes.string.isRequired,
  value: PropTypes.string,
};

export default InputGroup;

import React, { PropTypes } from 'react';
import _ from 'lodash';
import Select from 'react-select';

import styles from './InputGroup.css';

const InputGroup = (props) => {
  const {
    id,
    label,
    min,
    max,
    onChange,
    onSuffixChange,
    step,
    suffix,
    type,
    value,
  } = props;

  const disableManualInput = (inputValue, { action }) => ((action === 'input-change')
    ? ''
    : inputValue
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>
      <div className={styles.inputs}>
        <input
          className={styles[`input-${type}`]}
          id={id}
          max={max}
          min={min}
          name={id}
          onChange={onChange}
          step={step || 'any'}
          type={type}
          value={value}
        />
        {_.isString(suffix) && (
          <div className={styles.suffixText}>{suffix}</div>
        )}
        {_.isPlainObject(suffix) && (
          <div className={styles.suffix}>
            <Select
              classNamePrefix="inputGroup-suffix"
              id={suffix.id}
              name={suffix.id}
              onChange={onSuffixChange}
              onInputChange={disableManualInput}
              options={suffix.options}
              value={suffix.value}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const suffixOptionPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
});

InputGroup.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  max: PropTypes.number,
  min: PropTypes.number,
  onChange: PropTypes.func,
  onSuffixChange: PropTypes.func,
  step: PropTypes.number,
  suffix: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(suffixOptionPropType),
      value: suffixOptionPropType,
    }),
  ]),
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default InputGroup;

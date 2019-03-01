
/**
 * Copyright (c) 2017, Tidepool Project
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

import React from 'react'
import cx from 'classnames';
import { MMOLL_UNITS } from '../../core/constants';
import { utils } from '@tidepool/viz';

const IncrementalInput = (props) => {
  function calculate(e) {
    const {
      name,
      value,
      unit,
      minValue,
      maxValue,
      step,
      onChange,
    } = props;
    const operator = e.target.parentNode.getAttribute('operator');
    const operations = {
      '+': function(value, step) {
        return value + step;
      },
      '-': function(value, step) {
        return value - step;
      },
    };

    const newValue = operations[operator](value, step);

    if (newValue >= minValue && newValue <= maxValue) {
      onChange(name, newValue, unit);
    }
  }

  const classes = cx({
    'IncrementalInput': true,
    'IncrementalInput--error': props.error,
    [`IncrementalInput--${props.name}`]: true,
  });

  let displayValue = utils.bg.formatBgValue(props.value, { bgUnits: props.unit });

  return (
    <div className={classes}>
      <span>{displayValue} {props.unit}</span>
      <div className="IncrementalInputArrows">
        <svg className="IncrementalInputArrow IncrementalInputArrow--increase" operator="+" width="16" height="10" viewBox="-1 -1 16 10">
          <path d="M7 0l7 8H0z" onClick={calculate} />
        </svg>
        <svg className="IncrementalInputArrow IncrementalInputArrow--decrease" operator="-" width="16" height="10" viewBox="-1 10 16 10">
          <path d="M7 19l7-8H0z" onClick={calculate} />
        </svg>
      </div>
    </div>
  );
}

IncrementalInput.propTypes = {
  name: React.PropTypes.string.isRequired,
  value: React.PropTypes.number.isRequired,
  unit: React.PropTypes.string.isRequired,
  minValue: React.PropTypes.number.isRequired,
  maxValue: React.PropTypes.number.isRequired,
  step: React.PropTypes.number.isRequired,
  onChange: React.PropTypes.func.isRequired,
};

export default IncrementalInput;

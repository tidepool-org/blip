
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

import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import cx from 'classnames';
import { MMOLL_UNITS } from '../../core/constants';
import { utils } from '@tidepool/viz';

const getAllowedValues = (minValue, maxValue, step, additionalAllowedValues) => {
  let allowedValues = [];

  for (let currVal = minValue; currVal < maxValue; currVal += step) {
    allowedValues.push(currVal);
  }

  allowedValues.push(maxValue);

  allowedValues.push(...additionalAllowedValues);

  allowedValues.sort((a, b) => a - b);

  return _.uniq(allowedValues);
};

const IncrementalInput = ({
  name,
  value,
  unit,
  minValue,
  maxValue,
  step,
  onChange,
  error,
  additionalAllowedValues = [],
}) => {
  const allowedValues = useMemo(() => {
    return getAllowedValues(minValue, maxValue, step, additionalAllowedValues);
  }, [additionalAllowedValues, minValue, maxValue, step]);

  const position = allowedValues.findIndex(possibleValue => possibleValue === value);

  const validateValue = (value) => _.isNumber(value) && value <= maxValue && value >= minValue;

  const handlePositionChange = (targetPosition) => {
    const targetValue = allowedValues[targetPosition];

    if (!validateValue(targetValue)) return;

    onChange(name, targetValue, unit);
  };

  const classes = cx({
    'IncrementalInput': true,
    'IncrementalInput--error': error,
    [`IncrementalInput--${name}`]: true,
  });

  let displayValue = utils.bg.formatBgValue(value, { bgUnits: unit });

  return (
    <div className={classes}>
      <span>{displayValue} {unit}</span>
      <div className="IncrementalInputArrows">
        <svg className="IncrementalInputArrow IncrementalInputArrow--increase" operator="+" width="16" height="10" viewBox="-1 -1 16 10">
          <path d="M7 0l7 8H0z" onClick={() => handlePositionChange(position + 1)} />
        </svg>
        <svg className="IncrementalInputArrow IncrementalInputArrow--decrease" operator="-" width="16" height="10" viewBox="-1 10 16 10">
          <path d="M7 19l7-8H0z" onClick={() => handlePositionChange(position - 1)} />
        </svg>
      </div>
    </div>
  );
};

IncrementalInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
  minValue: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default IncrementalInput;

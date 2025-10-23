
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
import { utils as vizUtils } from '@tidepool/viz';
import utils from '../../core/utils';

const MINIMUM_STEP = 0.1;

// Returns an array of all possible values (every step between min and max)
const getValueOptions = (minValue, maxValue, step, extraValues) => {
  let valueOptions = [];

  for (let currVal = minValue; currVal < maxValue; currVal += step) {
    valueOptions.push(utils.roundToNearest(currVal, MINIMUM_STEP));
  }

  valueOptions.push(maxValue);

  valueOptions.push(...extraValues);

  valueOptions.sort((a, b) => a - b);

  return _.uniq(valueOptions);
};

// Returns the index of the value within the valueOptions
const getPosition = (valueOptions, value) => {
  let position = valueOptions.findIndex(allowedValue => allowedValue === value);

  // Find the closest index if the value doesn't exist within valueOptions
  if (position === -1) {
    position = _.findLastIndex(valueOptions, allowedValue => allowedValue < value);
  };

  return position;
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
  extraValues = [], // extra values that the input is allowed to take
}) => {
  const valueOptions = useMemo(() => {
    return getValueOptions(minValue, maxValue, step, extraValues);
  }, [extraValues, minValue, maxValue, step]);

  const position = useMemo(() => {
    return getPosition(valueOptions, value);
  }, [valueOptions, value]);

  const validateValue = (value) => _.isNumber(value) && value <= maxValue && value >= minValue;

  const handlePositionChange = (targetPosition) => {
    const targetValue = valueOptions[targetPosition];

    if (!validateValue(targetValue)) return;

    onChange(name, targetValue, unit);
  };

  const classes = cx({
    'IncrementalInput': true,
    'IncrementalInput--error': error,
    [`IncrementalInput--${name}`]: true,
  });

  let displayValue = vizUtils.bg.formatBgValue(value, { bgUnits: unit });

  return (
    <div className={classes}>
      <span>{displayValue} {unit}</span>
      <div className="IncrementalInputArrows">
        <svg className="IncrementalInputArrow IncrementalInputArrow--increase" operator="+" width="16" height="10" viewBox="-1 -1 16 10">
          <path data-testid="increment-arrow" d="M7 0l7 8H0z" onClick={() => handlePositionChange(position + 1)} />
        </svg>
        <svg className="IncrementalInputArrow IncrementalInputArrow--decrease" operator="-" width="16" height="10" viewBox="-1 10 16 10">
          <path data-testid="decrement-arrow" d="M7 19l7-8H0z" onClick={() => handlePositionChange(position - 1)} />
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
  extraValues: PropTypes.arrayOf(PropTypes.number),
};

export default IncrementalInput;

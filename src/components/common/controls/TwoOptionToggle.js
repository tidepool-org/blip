/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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
 * == BSD2 LICENSE ==
 */

import React, { PropTypes } from 'react';
import cx from 'classnames';

import styles from './TwoOptionToggle.css';

const TwoOptionToggle = (props) => {
  const { disabled, left, right, toggleFn } = props;

  const rightLabelClasses = cx({
    [styles.active]: !disabled && right.state,
    [styles.label]: true,
  });

  const leftLabelClasses = cx({
    [styles.active]: !disabled && left.state,
    [styles.label]: true,
  });

  return (
    <div className={styles.container}>
      <span className={leftLabelClasses}>{left.label}</span>
      <Toggle disabled={disabled} leftOptionActive={left.state} toggleFn={toggleFn} />
      <span className={rightLabelClasses}>{right.label}</span>
    </div>
  );
};

TwoOptionToggle.defaultProps = {
  disabled: false,
};

TwoOptionToggle.propTypes = {
  disabled: PropTypes.bool.isRequired,
  left: PropTypes.shape({
    label: PropTypes.string.isRequired,
    state: PropTypes.bool.isRequired,
  }).isRequired,
  right: PropTypes.shape({
    label: PropTypes.string.isRequired,
    state: PropTypes.bool.isRequired,
  }).isRequired,
  toggleFn: PropTypes.func.isRequired,
};


TwoOptionToggle.displayName = 'TwoOptionToggle';

export const Toggle = (props) => {
  const { disabled, leftOptionActive, toggleFn } = props;
  return (
    <div
      className={disabled ? styles.disabled : styles.toggle}
      onClick={disabled ? () => {} : toggleFn}
    >
      <div className={styles.track} />
      <div className={leftOptionActive ? styles.leftThumb : styles.rightThumb} />
    </div>
  );
};

Toggle.propTypes = {
  disabled: PropTypes.bool.isRequired,
  leftOptionActive: PropTypes.bool.isRequired,
  toggleFn: PropTypes.func.isRequired,
};

Toggle.displayName = 'Toggle';

export default TwoOptionToggle;

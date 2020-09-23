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

import PropTypes from 'prop-types';

import React from 'react';

import styles from './LabeledCheckbox.css';

const LabeledCheckbox = (props) => {
  const { name, checked, onFn, offFn, label } = props;
  const handleChange = function handleChange() {
    if (checked) {
      offFn();
    } else {
      onFn();
    }
  };

  return (
    <label htmlFor={name} className={styles.label}>
      <input
        type="checkbox" name={name} id={name}
        checked={checked}
        onChange={handleChange}
      /> {label}
    </label>
  );
};

LabeledCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onFn: PropTypes.func.isRequired,
  offFn: PropTypes.func.isRequired,
  label: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
};

export default LabeledCheckbox;

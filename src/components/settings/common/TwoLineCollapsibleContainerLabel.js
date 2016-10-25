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

import cx from 'classnames';
import React, { PropTypes } from 'react';

import norgie from './norgie.css';
import styles from './TwoLineCollapsibleContainerLabel.css';

const TwoLineCollapsibleContainerLabel = (props) => {
  const { className, isOpened, label: { main, secondary, units }, onClick } = props;
  const containerClasses = cx({
    label: true, // for testing
    [styles.collapsibleLabel]: !Boolean(className),
    [styles.labelContainer]: true,
    [className]: Boolean(className),
  });
  const norgieContainerClasses = cx({
    [styles.norgieLabelContainer]: true,
    [norgie.opened]: isOpened,
  });
  return (
    <div className={containerClasses} onClick={onClick}>
      <div className={styles.secondaryLabel}>{secondary}</div>
      <div className={norgieContainerClasses}>
        <div>
          {main}
          <span className={styles.secondaryText}>{units}</span>
        </div>
      </div>
    </div>
  );
};

TwoLineCollapsibleContainerLabel.propTypes = {
  className: PropTypes.string,
  isOpened: PropTypes.bool.isRequired,
  label: PropTypes.shape({
    main: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
  }),
  onClick: PropTypes.func.isRequired,
};

export default TwoLineCollapsibleContainerLabel;

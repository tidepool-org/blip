import _ from 'lodash';
import cx from 'classnames';

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

import norgie from './norgie.css';
import styles from './SingleLineCollapsibleContainerLabel.css';

const SingleLineCollapsibleContainerLabel = (props) => {
  const { className, isOpened, label: { main, secondary, units }, onClick } = props;
  const containerClasses = cx({
    label: true, // for testing
    [styles.collapsibleLabel]: !Boolean(className),
    [styles.labelContainer]: true,
    [className]: Boolean(className),
    [norgie.opened]: isOpened,
  });
  return (
    <div className={containerClasses} onClick={onClick}>
      <div>
        <span className={styles.mainText}>{main}</span>
        {_.isEmpty(secondary) ?
          null : (<span className={styles.secondaryText}>{secondary}</span>)}
        {_.isEmpty(units) ?
          null : (<span className={styles.secondaryText}>{units}</span>)}
      </div>
    </div>
  );
};

SingleLineCollapsibleContainerLabel.propTypes = {
  className: PropTypes.string,
  isOpened: PropTypes.bool.isRequired,
  label: PropTypes.shape({
    main: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired,
    units: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SingleLineCollapsibleContainerLabel;

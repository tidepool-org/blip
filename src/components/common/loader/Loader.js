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

import styles from './Loader.css';

const Loader = (props) => {
  const { show, overlay } = props;

  const loaderClasses = cx({
    [styles.loaderDots]: true,
    [styles.hidden]: !show,
    [styles.overlay]: overlay,
  });

  return (
    <div className={styles.loader}>
      <div className={loaderClasses}>
        <div className={styles.loaderDot}></div>
        <div className={styles.loaderDot}></div>
        <div className={styles.loaderDot}></div>
        <div className={styles.loaderDot}></div>
        <div className={styles.loaderDot}></div>
      </div>
    </div>
    );
};

Loader.defaultProps = {
  show: true,
  overlay: false,
};

Loader.propTypes = {
  show: PropTypes.bool.isRequired,
  overlay: PropTypes.bool.isRequired,
};

export default Loader;

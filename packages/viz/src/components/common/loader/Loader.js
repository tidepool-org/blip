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

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import i18next from 'i18next';

import styles from './Loader.css';

const Loader = (props) => {
  const t = i18next.t.bind(i18next);
  const { show, overlay, text } = props;

  const loaderOuterClasses = cx({
    loader: true,
    [styles.loader]: true,
  });

  const loaderInnerClasses = cx({
    [styles.loaderDots]: true,
    [styles.hidden]: !show,
    [styles.overlay]: overlay,
  });

  const loaderDotClasses = cx({
    [styles.loaderDot]: true,
    [styles.animating]: show,
  });

  return (
    <div className={loaderOuterClasses}>
      <div className={loaderInnerClasses}>
        <div className={loaderDotClasses} />
        <div className={loaderDotClasses} />
        <div className={loaderDotClasses} />
        <div className={loaderDotClasses} />
        <div className={loaderDotClasses} />

        <div className={styles.loaderText}>{t(text)}</div>
      </div>
    </div>
  );
};

Loader.defaultProps = {
  overlay: false,
  show: true,
  text: 'Loading...',
};

Loader.propTypes = {
  overlay: PropTypes.bool.isRequired,
  show: PropTypes.bool.isRequired,
  text: PropTypes.string,
};

export default Loader;

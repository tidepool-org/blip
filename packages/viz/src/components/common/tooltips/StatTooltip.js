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
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';

import Tooltip from '../../common/tooltips/Tooltip';
import colors from '../../../styles/colors.css';
import styles from './StatTooltip.css';

function StatTooltip(props) {
  const { annotations } = props;

  const rows = [];
  _.forEach(annotations, (message, index) => {
    rows.push(
      <ReactMarkdown key={`message-${index}`} className={styles.message} linkTarget="_blank">
        {message}
      </ReactMarkdown>
    );
    if (index !== annotations.length - 1) {
      rows.push(
        <div
          key={`divider-${index}`}
          className={styles.divider}
        />
      );
    }
  });

  return (
    <Tooltip
      {...props}
      content={<div className={styles.container}>{rows}</div>}
    />
  );
}

StatTooltip.propTypes = {
  annotations: PropTypes.arrayOf(PropTypes.string).isRequired,
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  offset: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number,
    horizontal: PropTypes.number,
  }),
  title: PropTypes.node,
  tail: PropTypes.bool.isRequired,
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
  tailColor: PropTypes.string.isRequired,
  tailWidth: PropTypes.number.isRequired,
  tailHeight: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string.isRequired,
  borderWidth: PropTypes.number.isRequired,
};

StatTooltip.defaultProps = {
  annotations: [],
  tail: true,
  side: 'right',
  tailWidth: 9,
  tailHeight: 17,
  tailColor: colors.statDefault,
  borderColor: colors.statDefault,
  borderWidth: 2,
};

export default StatTooltip;

/*
 * == BSD2 LICENSE ==
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
 * == BSD2 LICENSE ==
 */

import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import moment from 'moment';

import Tooltip from '../../common/tooltips/Tooltip';

import styles from './CBGDateTraceLabel.css';

const CBGDateTraceLabel = (props) => {
  if (!props.focusedDateTrace) {
    return null;
  }
  const { focusedDateTrace: { data: { localDate: date }, position } } = props;
  const formattedDate = moment.utc(date).format(i18next.t('dddd, MMMM D'));
  return (
    <div className={styles.container}>
      <Tooltip
        title={<span className={styles.dateLabel}>{formattedDate}</span>}
        borderWidth={0}
        position={{ left: position.left, top: 2.25 * position.yPositions.topMargin }}
        side={'bottom'}
        tail={false}
      />
    </div>
  );
};

CBGDateTraceLabel.propTypes = {
  focusedDateTrace: PropTypes.shape({
    data: PropTypes.shape({
      localDate: PropTypes.string.isRequired,
    }),
    position: PropTypes.shape({
      left: PropTypes.number.isRequired,
      yPositions: PropTypes.shape({
        top: PropTypes.number.isRequired,
        topMargin: PropTypes.number.isRequired,
      }),
    }),
  }),
};

export default CBGDateTraceLabel;

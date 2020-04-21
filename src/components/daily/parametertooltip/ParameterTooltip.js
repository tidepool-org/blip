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

import { formatLocalizedFromUTC, getHourMinuteFormat } from '../../../utils/datetime';

import Tooltip from '../../common/tooltips/Tooltip';
import colors from '../../../styles/colors.css';
import styles from './ParameterTooltip.css';
import i18next from 'i18next';

const t = i18next.t.bind(i18next);

class ParameterTooltip extends React.Component {
  constructor(props) {
    super(props);

    this.hourMinuteFormat = getHourMinuteFormat();
  }

  renderParameter(parameter) {
    let previousValue = null;
    let prevToNext = null;
    let valueClassName = styles.value;
    if (typeof parameter.previousValue === 'string') {
      previousValue = <span className={styles.previous} key={`${parameter.id}-prev`}>{parameter.previousValue}</span>;
      prevToNext = <span key={`${parameter.id}-arrow`}>&rarr;</span>;
    } else {
      valueClassName = `${valueClassName} ${styles['value-no-prev']}`;
    }

    const displayHour = formatLocalizedFromUTC(
      parameter.normalTime, this.props.timePrefs, this.hourMinuteFormat);

    return [
      <span className={styles.date} key={`${parameter.id}-date`}>{displayHour}</span>,
      <span className={styles.label} key={`${parameter.id}-name`}>{t(`params:::${parameter.name}`)}</span>,
      previousValue,
      prevToNext,
      <span className={valueClassName} key={`${parameter.id}-value`}>{parameter.value}</span>,
      <span className={styles.units} key={`${parameter.id}-units`}>{t(`${parameter.units}`)}</span>,
    ];
  }

  renderParameters(parameters) {
    const rows = [];
    for (let i = 0; i < parameters.length; ++i) {
      Array.prototype.push.apply(rows, this.renderParameter(parameters[i]));
    }

    return (
      <div className={styles.container}>
        {rows}
      </div>
    );
  }

  render() {
    const title = this.props.title ? this.props.title : (
      <div className={styles.title}>
        {
          formatLocalizedFromUTC(
            this.props.parameter.normalTime,
            this.props.timePrefs,
            this.hourMinuteFormat)
          }
      </div>
    );
    const content = this.renderParameters(this.props.parameter.params);
    return (
      <Tooltip
        {...this.props}
        title={title}
        content={content}
      />
    );
  }
}

ParameterTooltip.propTypes = {
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
  tail: PropTypes.bool,
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  tailColor: PropTypes.string,
  tailWidth: PropTypes.number,
  tailHeight: PropTypes.number,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
  borderWidth: PropTypes.number,
  parameter: PropTypes.shape({
    normalTime: PropTypes.string.isRequired,
    params: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        normalTime: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        previousValue: PropTypes.string,
        units: PropTypes.string.isRequired,
      })).isRequired,
  }).isRequired,
  timePrefs: PropTypes.object.isRequired,
};

ParameterTooltip.defaultProps = {
  tail: true,
  side: 'right',
  tailWidth: 9,
  tailHeight: 17,
  tailColor: colors.deviceEvent,
  borderColor: colors.deviceEvent,
  borderWidth: 2,
};

export default ParameterTooltip;

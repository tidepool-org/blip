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

import React, { PropTypes, PureComponent } from 'react';

import { formatLocalizedFromUTC, getHourMinuteFormat } from '../../../utils/datetime';

import Tooltip from '../../common/tooltips/Tooltip';
import colors from '../../../styles/colors.css';
import styles from './PhysicalTooltip.css';
import i18next from 'i18next';

const t = i18next.t.bind(i18next);

class PhysicalTooltip extends PureComponent {
  getDurationInMinutes() {
    const display = {
      units: 'minutes',
      value: 0,
    };
    const units = this.props.physicalActivity.duration.units;
    const duration = this.props.physicalActivity.duration.value;
    switch (units) {
      case 'seconds':
        display.value = Math.round(duration / 60);
        break;
      case 'hours':
        display.value = duration * 60;
        break;
      default:
        display.value = duration;
        break;
    }
    return display;
  }

  renderPhysicalActivity() {
    const d = this.getDurationInMinutes();
    const rows = [
      <div key={'title'} className={styles.pa}>
        <div className={styles.label}>{t('Physical Activity')}</div>
      </div>,
      <div key={'physical'} className={styles.pa}>
        <div className={styles.label}>{t('Intensity')}</div>
        <div className={styles.value}>
          {t(`${this.props.physicalActivity.reportedIntensity}-pa`)}
        </div>
      </div>,
      <div key={'duration'} className={styles.pa}>
        <div className={styles.label}>{t('Duration')}</div>
        <div className={styles.value}>{`${d.value}`}</div>
        <div className={styles.units}>{`${d.units}`}</div>
      </div>,
    ];

    return <div className={styles.container}>{rows}</div>;
  }

  render() {
    const title = this.props.title ? this.props.title : (
      <div className={styles.title}>
        {
          formatLocalizedFromUTC(
            this.props.physicalActivity.normalTime,
            this.props.timePrefs,
            getHourMinuteFormat())
          }
      </div>
    );
    return (
      <Tooltip
        {...this.props}
        title={title}
        content={this.renderPhysicalActivity()}
      />
    );
  }
}

PhysicalTooltip.propTypes = {
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
  physicalActivity: PropTypes.shape({
    reportedIntensity: PropTypes.string.isRequired,
    duration: PropTypes.shape({
      units: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  timePrefs: PropTypes.object.isRequired,
};

PhysicalTooltip.defaultProps = {
  tail: true,
  side: 'right',
  tailWidth: 9,
  tailHeight: 17,
  tailColor: colors.physicalActivity,
  borderColor: colors.physicalActivity,
  borderWidth: 2,
};

export default PhysicalTooltip;

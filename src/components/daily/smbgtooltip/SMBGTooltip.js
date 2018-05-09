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
import _ from 'lodash';
import { classifyBgValue, reshapeBgClassesToBgBounds } from '../../../utils/bloodglucose';
import { formatLocalizedFromUTC } from '../../../utils/datetime';
import Tooltip from '../../common/tooltips/Tooltip';
import colors from '../../../styles/colors.css';
import styles from './SMBGTooltip.css';

const medtronic600BGMessages = {
  'medtronic600/smbg/user-accepted-remote-bg': 'Yes',
  'medtronic600/smbg/user-rejected-remote-bg': 'No',
  'medtronic600/smbg/remote-bg-acceptance-screen-timeout': 'Timed Out',
};

const medtronic600CalibrationMessages = {
  'medtronic600/smbg/bg-sent-for-calib': 'Yes',
  'medtronic600/smbg/user-rejected-sensor-calib': 'No',
};

class SMBGTooltip extends PureComponent {
  getMedtronic600AnnotationMessages() {
    const annotations = _.map(_.get(this.props.smbg, 'annotations', []), 'code');
    const messages = [];
    const medtronic600BGMessage = _.intersection(_.keys(medtronic600BGMessages), annotations);
    if (medtronic600BGMessage.length > 0) {
      messages.push(
        <div key={"confirmBG"} className={styles.confirmBG}>
          <div className={styles.label}>Confirm BG</div>
          <div className={styles.value}>{medtronic600BGMessages[medtronic600BGMessage]}</div>
        </div>
      );
    }
    const medtronic600CalibrationMessage = _.intersection(
      _.keys(medtronic600CalibrationMessages),
      annotations
    );
    if (medtronic600CalibrationMessage.length > 0) {
      messages.push(
        <div key={"calibration"} className={styles.calibration}>
          <div className={styles.label}>Calibration</div>
          <div className={styles.value}>
            {medtronic600CalibrationMessages[medtronic600CalibrationMessage]}
          </div>
        </div>
      );
    }
    return messages;
  }

  renderSMBG() {
    const smbg = this.props.smbg;
    let rows = [<div key={"bg"} className={styles.bg}>
      <div className={styles.label}>BG</div>
      <div className={styles.value}>{`${smbg.value}`}</div>
    </div>];

    if (!_.isEmpty(smbg.subType)) {
      rows.push(
        <div key={"source"} className={styles.source}>
          <div className={styles.label}>Source</div>
          <div className={styles.value}>{`${_.capitalize(smbg.subType)}`}</div>
        </div>
      );
    }

    rows = rows.concat(this.getMedtronic600AnnotationMessages());

    return (
      <div className={styles.container}>
        {rows}
      </div>
    );
  }

  render() {
    const bgClass = classifyBgValue(
      reshapeBgClassesToBgBounds({ bgClasses: this.props.bgClasses }),
      this.props.smbg.value
    );
    const title = (
      <div className={styles.title}>
        {formatLocalizedFromUTC(this.props.smbg.normalTime, this.props.timePrefs, 'h:mm a')}
      </div>
    );
    return (<Tooltip
      {...this.props}
      title={title}
      content={this.renderSMBG()}
      borderColor={colors[bgClass]}
      tailColor={colors[bgClass]}
    />);
  }
}

SMBGTooltip.propTypes = {
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  offset: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number,
    horizontal: PropTypes.number,
  }),
  tail: PropTypes.bool.isRequired,
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
  tailColor: PropTypes.string.isRequired,
  tailWidth: PropTypes.number.isRequired,
  tailHeight: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string.isRequired,
  borderWidth: PropTypes.number.isRequired,
  smbg: PropTypes.shape({
    type: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
  }).isRequired,
  timePrefs: PropTypes.object.isRequired,
  bgClasses: PropTypes.object.isRequired,
};

SMBGTooltip.defaultProps = {
  tail: true,
  side: 'right',
  tailWidth: 9,
  tailHeight: 17,
  tailColor: colors.bolus,
  borderColor: colors.bolus,
  borderWidth: 2,
};

export default SMBGTooltip;

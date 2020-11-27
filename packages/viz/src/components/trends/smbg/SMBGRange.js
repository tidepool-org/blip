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

import PropTypes from 'prop-types';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { focusTrendsSmbgRangeAvg, unfocusTrendsSmbgRangeAvg } from '../../../redux/actions/trends';

export class SMBGRange extends PureComponent {
  static defaultProps = {
    rectWidth: 108,
  };

  static propTypes = {
    classes: PropTypes.string.isRequired,
    datum: PropTypes.shape({
      id: PropTypes.string.isRequired,
      max: PropTypes.number,
      mean: PropTypes.number,
      min: PropTypes.number,
      msX: PropTypes.number.isRequired,
      msFrom: PropTypes.number.isRequired,
      msTo: PropTypes.number.isRequired,
    }),
    focusRange: PropTypes.func.isRequired,
    interpolated: PropTypes.shape({
      key: PropTypes.string.isRequired,
      style: PropTypes.shape({
        height: PropTypes.number.isRequired,
        opacity: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    positionData: PropTypes.shape({
      left: PropTypes.number.isRequired,
      tooltipLeft: PropTypes.bool.isRequired,
      yPositions: PropTypes.shape({
        max: PropTypes.number.isRequired,
        mean: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
      }).isRequired,
    }),
    rectWidth: PropTypes.number.isRequired,
    unfocusRange: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
  }

  handleMouseOut() {
    const { unfocusRange, userId } = this.props;
    unfocusRange(userId);
  }

  handleMouseOver() {
    const { datum, focusRange, positionData, userId } = this.props;
    focusRange(userId, datum, positionData);
  }

  render() {
    const { classes, interpolated: { key, style }, positionData, rectWidth } = this.props;
    return (
      <rect
        className={classes}
        id={`smbgRange-${key}`}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
        x={positionData.left - rectWidth / 2}
        y={style.y}
        width={rectWidth}
        height={style.height}
        opacity={style.opacity}
      />
    );
  }
}

export function mapStateToProps(state) {
  const { blip: { currentPatientInViewId } } = state;
  return {
    userId: currentPatientInViewId,
  };
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    focusRange: focusTrendsSmbgRangeAvg,
    unfocusRange: unfocusTrendsSmbgRangeAvg,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SMBGRange);

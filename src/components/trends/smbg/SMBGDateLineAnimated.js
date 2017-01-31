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

// this component renders a line connecting the smbgs from a single date
// it has two or three potential states:
// - grouping on: the y-position of each point on the line segment
//   is the average of all the smbgs in the group
//   NB: when grouping is on, no line hover interaction
// - grouping off: just connect the dots!
//   but also include a 2nd, fatter invisible line with onMouseOver & onMouseOut handlers
//   for the line to "focus" the whole date
//   (there seems to be a regression on prod re: the rendering of the fatter invisible lines)
// - date is focused (through hover) fatter & solid line connecting the dots
//   this style also applies when a single smbg is focused

import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TransitionMotion, spring } from 'react-motion';
import { line } from 'd3-shape';
import _ from 'lodash';
import cx from 'classnames';

import { springConfig } from '../../../utils/constants';
import { THREE_HRS } from '../../../utils/datetime';
import { findBinForTimeOfDay } from '../../../utils/trends/data';

import { focusTrendsSmbg, unfocusTrendsSmbg } from '../../../redux/actions/trends';

import styles from './SMBGDateLineAnimated.css';

export class SMBGDateLineAnimated extends PureComponent {
  static propTypes = {
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      msPer24: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    })).isRequired,
    date: PropTypes.string.isRequired,
    focusedDay: PropTypes.string.isRequired,
    focusLine: PropTypes.func.isRequired,
    grouped: PropTypes.bool.isRequired,
    onSelectDate: PropTypes.func.isRequired,
    nonInteractive: PropTypes.bool,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    unfocusLine: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.getDefaultPoints = this.getDefaultPoints.bind(this);
    this.getPoints = this.getPoints.bind(this);

    this.getPositions = this.getPositions.bind(this);

    this.handleClick = this.handleClick.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);

    this.willEnter = this.willEnter.bind(this);
    this.willLeave = this.willLeave.bind(this);
  }

  getDefaultPoints() {
    const { data, grouped, xScale, yScale } = this.props;
    const points = [];
    _.map(data, (d) => {
      points.push({
        key: d.id,
        style: {
          opacity: 0,
          x: xScale(this.getXPosition(d.msPer24, grouped)),
          y: yScale(d.value),
        } },
      );
    });
    return points;
  }

  getPoints() {
    const { data, grouped, xScale, yScale } = this.props;
    const points = [];
    _.map(data, (d) => {
      points.push({
        key: d.id,
        style: {
          opacity: spring(1, springConfig),
          x: spring(xScale(this.getXPosition(d.msPer24, grouped)), springConfig),
          y: yScale(d.value),
        } },
      );
    });
    return points;
  }

  getPositions() {
    const { data, tooltipLeftThreshold, xScale, yScale } = this.props;
    return _.map(data, (d) => ({
      tooltipLeft: d.msPer24 > tooltipLeftThreshold,
      left: xScale(this.getXPosition(d.msPer24)),
      top: yScale(d.value),
    }));
  }

  getXPosition(msPer24, grouped) {
    if (grouped) {
      return findBinForTimeOfDay(THREE_HRS, msPer24);
    }
    return msPer24;
  }

  handleClick() {
    const { date, onSelectDate } = this.props;
    onSelectDate(date);
  }

  handleMouseOut() {
    const { unfocusLine, userId } = this.props;
    unfocusLine(userId);
  }

  handleMouseOver() {
    const { data, date, focusLine, userId } = this.props;
    const positions = this.getPositions();
    focusLine(userId, data[0], positions[0], data, positions, date);
  }

  willEnter() {
    return {
      opacity: 0,
    };
  }

  willLeave() {
    return {
      opacity: spring(0, springConfig),
    };
  }

  render() {
    const {
      data,
      date,
      focusedDay,
      nonInteractive,
    } = this.props;

    const classes = cx({
      [styles.smbgPath]: true,
      [styles.highlightPath]: focusedDay === date,
    });

    // NOTE: This mapping is required due to the differing
    // expectations of TransitionMotion and d3 line
    const mapObject = (obj, fn) => _.map(_.keys(obj), (key) => fn(obj[key], key, obj));

    return (
      <g id={`smbgDateLine-${date}`}>
        <TransitionMotion
          defaultStyles={this.getDefaultPoints(data)}
          styles={this.getPoints(data)}
          willEnter={this.willEnter}
          willLeave={this.willLeave}
        >
          {(interpolated) => {
            if (interpolated.length === 0) {
              return null;
            }
            return (
              <path
                d={line()(mapObject(_.pluck(interpolated, 'style'), ({ x, y }) => [x, y]))}
                className={classes}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
                onClick={this.handleClick}
                pointerEvents={nonInteractive ? 'none' : 'stroke'}
                strokeOpacity={_.get(interpolated[0], ['style', 'opacity'])}
              />
            );
          }}
        </TransitionMotion>
      </g>
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
    focusLine: focusTrendsSmbg,
    unfocusLine: unfocusTrendsSmbg,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SMBGDateLineAnimated);

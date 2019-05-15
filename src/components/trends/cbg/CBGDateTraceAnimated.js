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

import _ from 'lodash';
import { TweenMax } from 'gsap';
import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import connectWithTransitionGroup from '../../common/connectWithTransitionGroup';
import { focusTrendsCbgDateTrace, unfocusTrendsCbgDateTrace } from '../../../redux/actions/trends';
import { classifyBgValue } from '../../../utils/bloodglucose';

import styles from './CBGDateTraceAnimated.css';

export class CBGDateTraceAnimated extends PureComponent {
  static defaultProps = {
    animationDuration: 0.2,
    cbgRadius: 2.5,
  };

  static propTypes = {
    animationDuration: PropTypes.number.isRequired,
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }).isRequired,
    cbgRadius: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      // here only documenting the properties we actually use rather than the *whole* data model!
      id: PropTypes.string.isRequired,
      msPer24: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    })).isRequired,
    date: PropTypes.string.isRequired,
    focusDateTrace: PropTypes.func.isRequired,
    onSelectDate: PropTypes.func.isRequired,
    topMargin: PropTypes.number.isRequired,
    unfocusDateTrace: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  componentWillEnter(cb) {
    const { animationDuration, data } = this.props;
    const targets = _.map(data, (d) => (this[d.id]));
    TweenMax.staggerTo(
      targets, animationDuration, { opacity: 1, onComplete: cb }, animationDuration / targets.length
    );
  }

  componentWillLeave(cb) {
    const { animationDuration, data } = this.props;
    const targets = _.map(data, (d) => (this[d.id]));
    TweenMax.staggerTo(
      targets, animationDuration, { opacity: 0, onComplete: cb }, animationDuration / targets.length
    );
  }

  handleClick() {
    const { date, onSelectDate } = this.props;
    onSelectDate(date);
  }

  handleMouseOut() {
    const { unfocusDateTrace, userId } = this.props;
    unfocusDateTrace(userId);
  }

  render() {
    const { bgBounds, cbgRadius, data, date, topMargin, userId, xScale, yScale } = this.props;
    return (
      <g id={`cbgDateTrace-${date}`}>
        {_.map(data, (d) => (
          <circle
            className={styles[classifyBgValue(bgBounds, d.value, 'fiveWay')]}
            cx={xScale(d.msPer24)}
            cy={yScale(d.value)}
            id={`cbgCircle-${d.id}`}
            key={d.id}
            onClick={this.handleClick}
            onMouseOver={() => {
              this.props.focusDateTrace(userId, d, {
                left: xScale(d.msPer24),
                yPositions: {
                  top: yScale(d.value),
                  topMargin,
                },
              });
            }}
            onMouseOut={this.handleMouseOut}
            opacity={0}
            r={cbgRadius}
            ref={(node) => { this[d.id] = node; }}
          />
        ))}
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
    focusDateTrace: focusTrendsCbgDateTrace,
    unfocusDateTrace: unfocusTrendsCbgDateTrace,
  }, dispatch);
}

export default connectWithTransitionGroup(
  connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(CBGDateTraceAnimated)
);

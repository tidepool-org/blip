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
import { TimelineMax } from 'gsap';
import React, { Component, PropTypes } from 'react';

import { classifyBgValue } from '../../../utils/bloodglucose';

import styles from './CBGDateTraceAnimated.css';

class CBGDateTraceAnimated extends Component {
  static defaultProps = {
    cbgRadius: 2.5,
  };

  static propTypes = {
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
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  componentWillEnter(cb) {
    const { data } = this.props;
    const targets = _.map(data, (d) => (this[d.id]));
    const t = new TimelineMax({ onComplete: cb });

    t.staggerTo(targets, 0.2, { opacity: 1 }, 0.0015);
  }

  // TransitionGroupPlus gets mad if this isn't defined :(
  componentDidEnter() {}

  componentWillLeave(cb) {
    const { data } = this.props;
    const targets = _.map(data, (d) => (this[d.id]));
    const t = new TimelineMax({ onComplete: cb });

    t.staggerTo(targets, 0.2, { opacity: 0 }, 0.0015);
  }

  render() {
    const { bgBounds, cbgRadius, data, date, xScale, yScale } = this.props;
    return (
      <g id={`cbgDateTrace-${date}`}>
        {_.map(data, (d) => (
          <circle
            className={`cbgCircle ${styles[classifyBgValue(bgBounds, d.value)]}`}
            cx={xScale(d.msPer24)}
            cy={yScale(d.value)}
            key={d.id}
            opacity={0}
            pointerEvents="none"
            r={cbgRadius}
            ref={(node) => { this[d.id] = node; }}
          />
        ))}
      </g>
    );
  }
}

export default CBGDateTraceAnimated;

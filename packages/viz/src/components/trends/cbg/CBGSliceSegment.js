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

import { delayShowCbgTracesOnFocus } from '../../../redux/actions/thunks';
import { unfocusTrendsCbgSlice } from '../../../redux/actions/trends';

export class CBGSliceSegment extends PureComponent {
  static propTypes = {
    classes: PropTypes.string.isRequired,
    datum: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
    focusSlice: PropTypes.func.isRequired,
    interpolated: PropTypes.shape({
      key: PropTypes.string.isRequired,
      style: PropTypes.object.isRequired,
    }),
    positionData: PropTypes.shape({
      left: PropTypes.number.isRequired,
      tooltipLeft: PropTypes.bool.isRequired,
      yPositions: PropTypes.shape({
        firstQuartile: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        median: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        ninetiethQuantile: PropTypes.number.isRequired,
        tenthQuantile: PropTypes.number.isRequired,
        thirdQuartile: PropTypes.number.isRequired,
        topMargin: PropTypes.number.isRequired,
      }).isRequired,
    }),
    segment: PropTypes.shape({
      height: PropTypes.string.isRequired,
      heightKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
      y: PropTypes.string.isRequired,
    }),
    unfocusSlice: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props);

    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
  }

  handleMouseOut(e) {
    // we don't want to unfocus the slice if the user just rolled over a cbg inside it
    if (e.relatedTarget && e.relatedTarget.id.search('cbgCircle') !== -1) {
      return;
    }
    this.props.unfocusSlice(this.props.userId);
  }

  handleMouseOver() {
    const {
      datum, focusSlice, positionData, segment: { heightKeys: focusedKeys }, userId,
    } = this.props;

    focusSlice(
      userId,
      datum,
      positionData,
      focusedKeys,
    );
  }

  render() {
    const { classes, datum, interpolated: { key, style }, segment, width, x } = this.props;
    return (
      <rect
        className={classes}
        key={key}
        id={`cbgSlice-${datum.id}-${key}`}
        width={width}
        height={style[segment.height]}
        x={x}
        y={style[segment.y]}
        opacity={style.opacity}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
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
    focusSlice: delayShowCbgTracesOnFocus,
    unfocusSlice: unfocusTrendsCbgSlice,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CBGSliceSegment);

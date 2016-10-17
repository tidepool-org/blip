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

// TODO: this component should roughly follow the model of the other animation containers
// but since there really isn't any data munging needed (at least not that jebeck can think of now)
// it can probably be a pure functional component that just recalculates xPositions every render
// depending on whether smbgGrouped is true or false

// it is the xPositions for grouping/ungrouping that will be animated via this container
// animating the lines (if turned on) based on grouping/ungrouping is a tougher problem
// because the number of line segments can vary, so we could experiment with it, but it may
// not be possible. if it isn't, it won't be a regression in functionality compared with
// tideline trends view, which also does *not* animate the lines on grouping/ungrouping change

// components to be rendered by this container:
// - SMBGDayPoints
//    + renders a circle for each individual smbg in the day
//    + attaches hover handler for focusing a single smbg
// - SMBGDayLine
//    + render a line connecting smbgs in the day
//    + attaches hover handler for focusing the day of smbgs

import React, { PropTypes } from 'react';
import _ from 'lodash';

import SMBGDayPointsAnimated from '../../components/trends/smbg/SMBGDayPointsAnimated';
import SMBGDayLineAnimated from '../../components/trends/smbg/SMBGDayLineAnimated';

const SMBGDaysAnimationContainer = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const { xScale, yScale, grouped, lines, focusedSmbg, focusSmbg, unfocusSmbg } = props;
  const focusedDay = focusedSmbg ? focusedSmbg.day : '';
  const smbgsByDate = _.groupBy(data, 'localDate');

  function getLines() {
    if (!lines) {
      if (!focusedDay) {
        return null;
      }
      return (
        <SMBGDayLineAnimated
          day={focusedDay}
          focusedDay={focusedDay}
          data={focusedSmbg.dayPoints}
          xScale={xScale}
          yScale={yScale}
          focusLine={focusSmbg}
          unfocusLine={unfocusSmbg}
          grouped={grouped}
        />
      );
    }
    return _.map(smbgsByDate, (smbgs, date) => (
      <SMBGDayLineAnimated
        day={date}
        focusedDay={focusedDay}
        data={smbgs}
        xScale={xScale}
        yScale={yScale}
        focusLine={focusSmbg}
        unfocusLine={unfocusSmbg}
        grouped={grouped}
      />
    ));
  }

  function getPoints() {
    return _.map(smbgsByDate, (smbgs, date) => (
      <SMBGDayPointsAnimated
        day={date}
        focusedDay={focusedDay}
        data={smbgs}
        xScale={xScale}
        yScale={yScale}
        focusSmbg={focusSmbg}
        unfocusSmbg={unfocusSmbg}
        grouped={grouped}
      />
    ));
  }

  return (
    <g id="smbgDayAnimationContainer">
      {getLines()}
      {getPoints()}
    </g>
  );
};

SMBGDaysAnimationContainer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    // here only documenting the properties we actually use rather than the *whole* data model!
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    localDate: PropTypes.string.isRequired,
  })).isRequired,
  grouped: PropTypes.bool.isRequired,
  lines: PropTypes.bool.isRequired,
  focusedSmbg: PropTypes.shape({
    dayPoints: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      msPer24: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
      localDate: PropTypes.string.isRequired,
    })).isRequired,
    smbgData: PropTypes.shape({
      value: PropTypes.number.isRequired,
    }),
    smbgPosition: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }),
    day: PropTypes.string.isRequired,
    smbgDay: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number.isRequired,
    })),
    smbgPositions: PropTypes.arrayOf(PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    })),
  }),
  focusSmbg: PropTypes.func.isRequired,
  unfocusSmbg: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default SMBGDaysAnimationContainer;

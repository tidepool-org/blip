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


// import _ from 'lodash';
import React, { PropTypes } from 'react';
// import { TransitionMotion, spring } from 'react-motion';

import SMBGDayPoints from '../../components/trends/smbg/SMBGDayPoints';
import SMBGDayLine from '../../components/trends/smbg/SMBGDayLine';

const SMBGDayAnimationContainer = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }
  const { xScale, yScale, day, focusSmbg, unfocusSmbg, grouped, lines } = props;

  const getDayLine = () => {
    if (lines) {
      return (
        <SMBGDayLine
          day={day}
          data={data}
          xScale={xScale}
          yScale={yScale}
          grouped={grouped}
        />
      );
    }
    return null;
  };

  return (
    <g id={`smbgDayAnimationContainer-${day}`}>
      <SMBGDayPoints
        day={day}
        data={data}
        xScale={xScale}
        yScale={yScale}
        focusSmbg={focusSmbg}
        unfocusSmbg={unfocusSmbg}
        grouped={grouped}
      />
      {getDayLine()}
    </g>
  );
};

SMBGDayAnimationContainer.propTypes = {
  day: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    // here only documenting the properties we actually use rather than the *whole* data model!
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  focusSmbg: PropTypes.func.isRequired,
  unfocusSmbg: PropTypes.func.isRequired,
  grouped: PropTypes.bool.isRequired,
  lines: PropTypes.bool.isRequired,
  // focusDayLine: PropTypes.func.isRequired,
  // unfocusDayLine: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default SMBGDayAnimationContainer;

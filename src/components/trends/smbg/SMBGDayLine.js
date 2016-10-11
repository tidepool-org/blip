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

// TODO: this component should render a line connecting the smbgs from a single day
// it has two or three potential states:
// - grouping on: the y-position of each point on the line segment
//   is the average of all the smbgs in the group
//   NB: when grouping is on, no line hover interaction
// - grouping off: just connect the dots!
//   but also include a 2nd, fatter invisible line with onMouseOver & onMouseOut handlers
//   for the line to "focus" the whole day
//   (there seems to be a regression on prod re: the rendering of the fatter invisible lines)
// - [maybe] day is focused (through hover) fatter & solid line connecting the dots
//   this style also applies when a single smbg is focused

import React, { PropTypes } from 'react';
import { line } from 'd3-shape';

const SMBGDayLine = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const { day, xScale, yScale } = props;

  const dayLine = line(data)
    .x((d) => { xScale(d.msPer24); })
    .y((d) => { yScale(d.value); });

  return (
    <g id={`smbgDayLine-${day}`}>
      <path d={dayLine} />
    </g>
  );
};

SMBGDayLine.propTypes = {
  day: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default SMBGDayLine;

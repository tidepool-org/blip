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

class SMBGDaysAnimationContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = { selected: null };
    this.handleSMBGFocus = this.handleSMBGFocus.bind(this);
    this.handleSMBGUnfocus = this.handleSMBGUnfocus.bind(this);
  }

  handleSMBGFocus(smbg, position, data, positions) {
    this.setState({ selected: { smbgs: data, date: _.find(data, 'localDate').localDate } });
    this.props.focusSmbg(smbg, position, data, positions);
  }

  handleSMBGUnfocus() {
    this.setState({ selected: null });
    this.props.unfocusSmbg();
  }

  render() {
    const { data, xScale, yScale, grouped, lines } = this.props;
    const { selected } = this.state;
    const smbgsByDate = _.groupBy(data, 'localDate');
    const smbgFocus = this.handleSMBGFocus;
    const smbgUnfocus = this.handleSMBGUnfocus;

    function getLines() {
      if (!lines) {
        if (!selected) {
          return null;
        }
        return (
          <SMBGDayLineAnimated
            day={selected.date}
            data={selected.smbgs}
            xScale={xScale}
            yScale={yScale}
            grouped={grouped}
          />
        );
      }
      return _.map(smbgsByDate, (smbgs, date) => (
        <SMBGDayLineAnimated
          day={date}
          data={smbgs}
          xScale={xScale}
          yScale={yScale}
          grouped={grouped}
        />
      ));
    }

    function getPoints() {
      return _.map(smbgsByDate, (smbgs, date) => (
        <SMBGDayPointsAnimated
          day={date}
          data={smbgs}
          xScale={xScale}
          yScale={yScale}
          focusSmbg={smbgFocus}
          unfocusSmbg={smbgUnfocus}
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
  }
}

SMBGDaysAnimationContainer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    // here only documenting the properties we actually use rather than the *whole* data model!
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  grouped: PropTypes.bool.isRequired,
  lines: PropTypes.bool.isRequired,
  focusSmbg: PropTypes.func.isRequired,
  unfocusSmbg: PropTypes.func.isRequired,
  // focusDayLine: PropTypes.func.isRequired,
  // unfocusDayLine: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default SMBGDaysAnimationContainer;

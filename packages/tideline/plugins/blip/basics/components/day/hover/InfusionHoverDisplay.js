/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
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

import PropTypes from "prop-types";
import React from "react";
import moment from "moment";

import format from "../../../../../../js/data/util/format";

function InfusionHoverDisplay(props) {
  var times = props.data.dataByDate[props.date].data;
  var timesList = times.slice(0,3).map(function(time) {
    return (<li key={time.id}>{format.timestamp(time.normalTime, moment.tz(time.timezone).utcOffset())}</li>);
  });

  return (
    <ul className="Calendar-day-reservoirChange-times">
      {timesList}
    </ul>
  );
}

InfusionHoverDisplay.propTypes = {
  data: PropTypes.object,
  date: PropTypes.string.isRequired,
};

export default InfusionHoverDisplay;

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

var _ = require('lodash');
var PropTypes = require('prop-types');
var React = require('react');
var format = require('../../../../../../js/data/util/format');

class InfusionHoverDisplay extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    date: PropTypes.string.isRequired,
    trackMetric: PropTypes.func.isRequired,
  };

  render() {
    var times = this.props.data.dataByDate[this.props.date].data;
    var timesList = times.slice(0,3).map(function(time) {
      return (<li key={time.guid}>{format.timestamp(time.normalTime, time.displayOffset)}</li>);
    });

    this.props.trackMetric('Hovered over Infusion Site');

    return (
      <ul className='Calendar-day-reservoirChange-times'>
        {timesList}
      </ul>
    );
  }
}

module.exports = InfusionHoverDisplay;
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
var d3 = require('d3');
var React = require('react');

var TotalDailyDose = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },
  render: function() {
    return (
      <div className='TotalDailyDose'>
        <p className='TotalDailyDose-main'>
          <span className='TotalDailyDose-text TotalDailyDose-text--large'>
            {d3.format('.1f')(this.props.data.totalDailyDose)}
          </span>
          <span className='TotalDailyDose-text TotalDailyDose-text--small'>
            &nbsp;units/day
          </span>
        </p>
      </div>
    );
  }
});

module.exports = TotalDailyDose;
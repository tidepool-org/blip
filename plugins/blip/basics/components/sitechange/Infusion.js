/** @jsx React.DOM */
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
var React = require('react');

var Infusion = React.createClass({
  propTypes: {
    daysSince: React.PropTypes.number.isRequired
  },
  render: function() {
    var daysText = (this.props.daysSince === 1) ? 'day' : 'days';
    return (
      <div className='Infusion'>
        <div className='Infusion-daysSince-count'>{this.props.daysSince}</div>
        <div className='Infusion-daysSince-text'>{daysText}</div>
        <div className='Infusion-line-end'></div>
        <div className='Infusion-line-stop'></div>
        <div className='Infusion-line-start'></div>
        <div className='Infusion-line-mark'></div>
      </div>
    );
  },
});

module.exports = Infusion;
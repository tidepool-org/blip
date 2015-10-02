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

var siteChangeImg = require('./sitechange.png');

var Change = React.createClass({
  propTypes: {
    daysSince: React.PropTypes.number.isRequired,
    count: React.PropTypes.number
  },
  render: function() {
    var daysText = (this.props.daysSince === 1) ? 'day' : 'days';
    var countElement = null;

    if (this.props.count > 1) {
      countElement = <div className='Change-count-text'>
        x{this.props.count}
      </div>;
    }

    return (
      <div className='Change'>
        <div className='Change-daysSince-text'>
          <span className='Change-daysSince-count'>{this.props.daysSince}</span>
          {daysText}
        </div>
        <div className='Change-line-end'></div>
        <div className='Change-line-stop'></div>
        {countElement}
        <div className='Change-line-start'></div>
        <div className='Change-line-mark'></div>
      </div>
    );
  },
});

module.exports = Change;
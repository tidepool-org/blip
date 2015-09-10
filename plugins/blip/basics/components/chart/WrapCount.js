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

var WrapCount = React.createClass({
  propTypes: {
    data: React.PropTypes.object,
    date: React.PropTypes.string.isRequired
  },
  render: function() {
    var dots = this.renderDots();
    return (
      <div className='WrapCount'>
        {dots}
      </div>
    );
  },
  renderDots: function() {
    var dots = [];
    var count = this.getCount();
    for (var i = 1; i <= 9; ++i) {
      if (i <= count) {
        dots.push(
          <svg key={i} width='18px' height='18px'>
            <circle cx='9px' cy='9px' r='7px'/>
          </svg>
        );
      }
      else {
        dots.push(
          <svg key={i} width='18px' height='18px'></svg>
        );
      }
    }
    return dots;
  },
  getCount: function() {
    if (_.isEmpty(this.props.data)) {
      return 0;
    }
    return this.props.data.countByDate[this.props.date];
  }
});

module.exports = WrapCount;
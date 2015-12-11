/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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
var bows = require('bows');
var React = require('react');

var Empty = React.createClass({
  chartType: 'empty',
  log: bows('Empty View'),
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineMain" className="grid">
        <div className="tidelineNav grid"></div>
        <div id="tidelineOuterContainer">
          <div id="fetchAndProcess">
            <p>Fetching and validating data...</p>
            <div className="spinner">
              <div className="double-bounce1"></div>
              <div className="double-bounce2"></div>
            </div>
          </div>
        </div>
        <div className="tidelineNav grid"></div>
      </div>
      );
    /* jshint ignore:end */
  }
});

module.exports = Empty;

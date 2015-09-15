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
var cx = require('react/lib/cx');
var d3 = require('d3');
var React = require('react');

var bgBars = require('./BGBars');
var constants = require('../../logic/constants');

var BGDistribution = React.createClass({
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired
  },
  componentDidMount: function() {
    var data = this.props.data;
    var bgClasses = this.props.bgClasses;
    var bgUnits = this.props.bgUnits;
    if (!_.isEmpty(data.bgDistribution)) {
      var distribution = data.bgDistribution.cbg ?
        data.bgDistribution.cbg : data.bgDistribution.smbg;
      
      var chartNode = this.refs.chart.getDOMNode();
      bgBars.create(chartNode)
        .render(distribution, {
          bgClasses: bgClasses,
          bgUnits: bgUnits
        });
    }
  },
  render: function() {
    var data = this.props.data;
    if (!_.isEmpty(data.bgDistribution)) {
      return (
        <div className='BGDistribution'>
          {this.renderCgmStatus()}
          <div ref='chart' className='BGDistribution-chart'></div>
        </div>
      );
    }
    return null;
  },
  renderCgmStatus: function() {
    var cgmStatus = this.props.data.bgDistribution.cgmStatus;
    var displayText = {};
    displayText[constants.NO_CGM] = 'Showing BGM data (no CGM)';
    displayText[constants.NOT_ENOUGH_CGM] = 'Showing BGM data (not enough CGM)';
    displayText[constants.CGM_CALCULATED] = 'Showing CGM data';
    return (
      <p className='BGDistribution-text BGDistribution-cgmStatus'>
        {displayText[cgmStatus]}
        <br/>
      </p>
    );
  }
});

module.exports = BGDistribution;
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

var constants = require('../../logic/constants');

var BGDistribution = React.createClass({
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired
  },
  render: function() {
    var data = this.props.data;
    var bgClasses = this.props.bgClasses;
    var bgUnits = this.props.bgUnits;
    function formatBGBoundary(boundary) {
      if (bgUnits === 'mg/dL') {
        return boundary;
      }
      else {
        return d3.format('.1f')(boundary);
      }
    }
    if (!_.isEmpty(data.bgDistribution)) {
      var distribution = data.bgDistribution.cbg ?
        data.bgDistribution.cbg : data.bgDistribution.smbg;
      var categories = new Array(5);
      var positions = {
        veryhigh: 0,
        high: 1,
        target: 2,
        low: 3,
        verylow: 4
      };
      for (var category in distribution) {
        var isHigh = category.search('high') !== -1;
        var isTarget = category.search('target') !== -1;
        var isLow = category.search('low') !== -1;
        var percentClass = cx({
          'BGDistribution-text': true,
          'BGDistribution-text--percentage': true,
          'BGDistribution-text--high': isHigh,
          'BGDistribution-text--target': isTarget,
          'BGDistribution-text--low': isLow
        });
        var labelClass = cx({
          'BGDistribution-text': true,
          'BGDistribution-category': true,
          'BGDistribution-text--high': isHigh,
          'BGDistribution-text--target': isTarget,
          'BGDistribution-text--low': isLow
        });
        var categoryDescription = {
          veryhigh: 'above ' + formatBGBoundary(bgClasses.high.boundary),
          high: 'between ' + formatBGBoundary(bgClasses.target.boundary) +
            ' - ' + formatBGBoundary(bgClasses.high.boundary),
          target: 'between ' + formatBGBoundary(bgClasses.low.boundary) +
            ' - ' + formatBGBoundary(bgClasses.target.boundary),
          low: 'between ' + formatBGBoundary(bgClasses['very-low'].boundary) +
            ' - ' + formatBGBoundary(bgClasses.low.boundary),
          verylow: 'below ' + formatBGBoundary(bgClasses['very-low'].boundary)
        };
        categories[positions[category]] = (
          <div className='BGDistribution-section' key={category}>
            <p className={percentClass} key={category}>
              {d3.format('%')(distribution[category])}
            </p>
            <p className={labelClass}>
              {categoryDescription[category] + ' ' + this.props.bgUnits}
            </p>
          </div>
        );
      }
      return (
        <div className='BGDistribution'>
          {categories}
          {this.renderCgmStatus()}
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
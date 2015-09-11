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
        var textClass = cx({
          'BGDistribution-text': true,
          'BGDistribution-text--percentage': true,
          'BGDistribution-text--high': isHigh,
          'BGDistribution-text--target': isTarget,
          'BGDistribution-text--low': isLow
        });
        var categoryDescription = {
          veryhigh: 'above ' + bgClasses.high.boundary,
          high: 'between ' + bgClasses.target.boundary + ' - ' + bgClasses.high.boundary,
          target: 'between ' + bgClasses.low.boundary + ' - ' + bgClasses.target.boundary,
          low: 'between ' + bgClasses['very-low'].boundary + ' - ' + bgClasses.low.boundary,
          verylow: 'below ' + bgClasses['very-low'].boundary
        };
        categories[positions[category]] = (
          <div className='BGDistribution-section' key={category}>
            <p className={textClass} key={category}>
              {d3.format('%')(distribution[category])}
            </p>
            <p className='BGDistribution-text BGDistribution-category'>
              {'readings ' + categoryDescription[category] + ' ' + this.props.bgUnits}
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
    var displayText = {};
    displayText[constants.NO_CGM] = 'No CGM data in this time period';
    displayText[constants.NOT_ENOUGH_CGM] = 'Not enough CGM data in this period; Distribution based on fingerstick data';
    displayText[constants.CGM_CALCULATED] = 'Distribution based on CGM data';
    return (
      <p className='BGDistribution-text BGDistribution-cgmStatus'>
        {displayText[this.props.data.bgDistribution.cgmStatus]}
      </p>
    );
  }
});

module.exports = BGDistribution;
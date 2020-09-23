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
var createReactClass = require('create-react-class');
var nestedShrinkFactor = 4;

var BasicsUtils = require('../BasicsUtils');

var WrapCount = createReactClass({
  displayName: 'WrapCount',
  mixins: [BasicsUtils],

  propTypes: {
    chartWidth: PropTypes.number.isRequired,
    data: PropTypes.object,
    date: PropTypes.string.isRequired,
    subtotalType: PropTypes.string,
  },

  render: function() {
    var dots = this.renderDots();
    return (
      <div className='WrapCount'>
        {dots}
      </div>
    );
  },

  generateDots: function(start, end, dotSize) {
    var count = this.getCount(this.props.subtotalType);
    var dots = [];

    dotSize = Math.round(dotSize);

    for (var i = start; i <= end; ++i) {
      if (i <= count) {
        dots.push(
          <svg key={i} width={dotSize} height={dotSize}>
            <circle cx={dotSize/2} cy={dotSize/2} r={dotSize/2}/>
          </svg>
        );
      }
    }

    return dots;
  },

  renderDots: function() {
    var count = this.getCount(this.props.subtotalType);
    var dots = [];

    if (this.props.chartWidth) {
      var dotSize = this.props.chartWidth / 56;

      if (count > 9) {
        dots = this.generateDots(1, 8, dotSize);
        dots.push(<div key='nested' className='NestedCount'>
          {this.generateDots(9, 17, dotSize / nestedShrinkFactor)}
        </div>);
      } else {
        dots = this.generateDots(1, 9, dotSize);
      }
    }

    return dots;
  },
});

module.exports = WrapCount;

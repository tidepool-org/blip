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
var d3 = window.d3;

d3.chart('Basics-BGBars', {
  initialize: function() {
    var chart = this;

    this.width = this.base.attr('width');
    this.height = this.base.attr('height');

    var barScale = d3.scale.ordinal()
      .domain(['verylow', 'low', 'target', 'high', 'veryhigh'])
      .rangeRoundBands([this.height, 0], 0.25, 0.2);

    var xScale = d3.scale.linear()
      .domain([0,1])
      .range([0, chart.width]);

    this.layer('bars', this.base.append('g').attr('class', 'BGDistribution-bars'), {
      dataBind: function(data) {
        return this.selectAll('rect.BGDistribution-bar')
          .data(data, function(d) { return d.key; });
      },
      insert: function() {
        return this.append('rect')
          .attr({
            x: xScale.range()[0],
            height: barScale.rangeBand(),
            stroke: 'none'
          });
      },
      events: {
        enter: function() {
          this.attr({
            y: function(d) { return barScale(d.key); },
            width: function(d) { return xScale(d.value); },
            'class': function(d) {
              return 'BGDistribution-bar BGDistribution--' + d.category;
            }
          });
        },
        update: function() {
          this.transition()
            .attr({
              width: function(d) { return xScale(d.value); }
            });
        }
      }
    });

    this.layer('remainders', this.base.append('g').attr('class', 'BGDistribution-remainders'), {
      dataBind: function(data) {
        return this.selectAll('rect.BGDistribution-remainder')
          .data(data, function(d) { return d.key; });
      },
      insert: function() {
        return this.append('rect')
          .attr({
            height: barScale.rangeBand(),
            stroke: 'none'
          });
      },
      events: {
        enter: function() {
          this.attr({
            x: function(d) { return xScale(d.value); },
            y: function(d) { return barScale(d.key); },
            width: function(d) { return xScale.range()[1] - xScale(d.value); },
            'class': function(d) {
              return 'BGDistribution-remainder BGDistribution--' + d.category;
            }
          });
        },
        update: function() {
          this.transition()
            .attr({
              x: function(d) { return xScale(d.value); },
              width: function(d) { return xScale.range()[1] - xScale(d.value); }
            });
        }
      }
    });

    this.layer('percentages', this.base.append('g').attr('class', 'BGDistribution-percents'), {
      dataBind: function(data) {
        return this.selectAll('text.BGDistribution-text--percentage')
          .data(data, function(d) { return d.key; });
      },
      insert: function() {
        return this.append('text')
          .attr({
            x: chart.width/2
          });
      },
      events: {
        enter: function() {
          this.attr({
            y: function(d) { return barScale(d.key) + 30; },
            'class': function(d) {
              return 'BGDistribution-text--percentage BGDistribution-text--' + d.category;
            }
          })
          .text(function(d) { return d3.format('%')(d.value); });
        },
        update: function() {
          this.text(function(d) { return d3.format('%')(d.value); });
        }
      }
    });

    this.layer('categories', this.base.append('g').attr('class', 'BGDistribution-categories'), {
      dataBind: function(data) {
        return this.selectAll('text.BGDistribution-category')
          .data(data, function(d) { return d.key; });
      },
      insert: function() {
        return this.append('text')
          .attr({
            x: chart.width/2
          });
      },
      events: {
        enter: function() {
          this.attr({
            y: function(d) { return barScale(d.key) + 50; },
            'class': function(d) {
              return 'BGDistribution-category BGDistribution-text--category BGDistribution-text--' + d.category;
            }
          })
          .text(function(d) {
            var bgClasses = chart.bgClasses();
            var bgUnits = ' ' + chart.bgUnits();
            switch(d.key) {
              case 'veryhigh':
                return 'above ' + bgClasses.high.boundary + bgUnits;
              case 'high':
                return 'between ' + bgClasses.target.boundary + ' - ' + bgClasses.high.boundary + bgUnits;
              case 'target':
                return 'between ' + bgClasses.low.boundary + ' - ' + bgClasses.target.boundary + bgUnits;
              case 'low':
                return 'between ' + bgClasses['very-low'].boundary + ' - ' + bgClasses.low.boundary + bgUnits;
              case 'verylow':
                return 'below ' + bgClasses['very-low'].boundary + bgUnits;
            }
          });
        }
      }
    });
  },
  bgClasses: function(bgClasses) {
    if (!arguments.length) { return this._bgClasses; }
    this._bgClasses = bgClasses;
    return this;
  },
  bgUnits: function(bgUnits) {
    if (!arguments.length) { return this._bgUnits; }
    this._bgUnits = bgUnits;
    return this;
  },
  remove: function() {
    this.base.remove();
    return this;
  },
  transform: function(data) {
    var reshapedData = _.map(Object.keys(data), function(category) {
      var bgCategory = category.search('high') !== -1 ?
        'high' : (category.search('low') !== -1 ? 'low' : 'target');
      return {
        category: bgCategory,
        key: category,
        value: data[category]
      };
    });
    return reshapedData;
  }
});

var chart;

module.exports = {
  create: function(el, opts) {
    chart = d3.select(el)
      .append('svg')
      .attr({
        width: el.offsetWidth,
        height: el.offsetHeight
      })
      .chart('Basics-BGBars');

    return this;
  },
  render: function(data, opts) {
    chart.bgClasses(opts.bgClasses)
      .bgUnits(opts.bgUnits)
      .draw(data);

    return this;
  },
  update: function(data) {
    chart.draw(data);

    return this;
  },
  destroy: function() {
    chart.remove();

    return this;
  }
};
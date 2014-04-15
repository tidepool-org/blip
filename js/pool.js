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

var d3 = require('./lib/').d3;
var _ = require('./lib/')._;

var log = require('./lib/').bows('Pool');
 
function Pool (container) {

  var data,
    id, label,
    index, weight, yPosition,
    height, minHeight = 20, maxHeight = 300,
    group,
    mainSVG = d3.select(container.id()),
    xScale,
    imagesBaseUrl = container.imagesBaseUrl(),
    yAxis = [],
    plotTypes = [],
    annotations,
    tooltips;

  this.render = function(selection, poolData) {
    var pool = this;
    plotTypes.forEach(function(plotType) {
      if (container.dataFill[plotType.type]) {
        plotType.data = _.where(poolData, {'type': plotType.type});
        var dataGroup = group.selectAll('#' + id + '_' + plotType.type).data([plotType.data]);
        dataGroup.enter().append('g').attr('id', id + '_' + plotType.type);
        if (plotType.data.length !== 0 || plotType.type === 'message') {
          dataGroup.call(plotType.plot);
        }
      }
      else if (plotType.type === 'stats') {
        var statsGroup = group.selectAll('#' + id + '_stats').data([null]);
        statsGroup.enter().append('g').attr('id', id + '_stats').call(plotType.plot);
      }
      else {
        pool.noDataFill(plotType);
      }
    });
    this.drawAxis();
    this.drawLabel();
  };

  this.clear = function() {
    plotTypes.forEach(function(plotType) {
      if (container.dataFill[plotType.type])  {
        group.select('#' + id + '_' + plotType.type).remove();
      }
    });
  };

  // non-chainable methods
  this.pan = function(e) {
    container.latestTranslation(e.translate[0]);
    plotTypes.forEach(function(plotType) {
      if (plotType.panBoolean) {
        d3.select('#' + id + '_' + plotType.type).attr('transform', 'translate(' + e.translate[0] + ',0)');
      }
    });
  };

  this.scroll = function(e) {
    container.latestTranslation(e.translate[1]);
    plotTypes.forEach(function(plotType) {
      d3.select('#' + id + '_' + plotType.type).attr('transform', 'translate(0,' + e.translate[1] + ')');
    });
  };

  // getters only
  this.group = function() {
    return group;
  };

  this.width = function() {
    return container.width() - container.axisGutter();
  };

  this.imagesBaseUrl = function() {
    return imagesBaseUrl;
  };

  // only once methods
  this.drawLabel = _.once(function() {
    var labelGroup = d3.select('#tidelineLabels');
    labelGroup.append('text')
      .attr({
        'id': 'pool_' + id + '_label',
        'class': 'd3-pool-label',
        'transform': 'translate(' + container.axisGutter() + ',' + yPosition + ')'
      })
      .text(label);
    return this;
  });

  this.drawAxis = _.once(function() {
    var axisGroup = d3.select('#tidelineYAxes');
    yAxis.forEach(function(axis, i) {
      axisGroup.append('g')
        .attr('class', 'd3-y d3-axis')
        .attr('id', 'pool_' + id + '_yAxis_' + i)
        .attr('transform', 'translate(' + (container.axisGutter() - 1) + ',' + yPosition + ')')
        .call(axis);
    });
    return this;
  });

  this.noDataFill = _.once(function(plotType) {
    d3.select('#' + id).append('g').attr('id', id + '_' + plotType.type).call(plotType.plot);
    return this;
  });

  // getters & setters
  this.id = function(x, selection) {
    if (!arguments.length) return id;
    id = x;
    group = selection.append('g').attr('id', id);
    return this;
  };

  this.label = function(x) {
    if (!arguments.length) return label;
    label = x;
    return this;
  };

  this.index = function(x) {
    if (!arguments.length) return index;
    index = x;
    return this;
  };

  this.weight = function(x) {
    if (!arguments.length) return weight;
    weight = x;
    return this;
  };

  this.height = function(x) {
    if (!arguments.length) return height;
    x = x * this.weight();
    if (x <= maxHeight) {
      if (x >= minHeight) {
        height = x;
      }
      else {
        height = minHeight;
      }
    }
    else {
      height = maxHeight;
    }
    return this;
  };

  this.yPosition = function(x) {
    if (!arguments.length) return yPosition;
    yPosition = x;
    return this;
  };

  this.annotations = function(f) {
    if (!arguments.length) return annotations;
    annotations = f;
    return this;
  };

  this.tooltips = function(f) {
    if (!arguments.length) return tooltips;
    tooltips = f;
    return this;
  };

  this.xScale = function(f) {
    if (!arguments.length) return xScale;
    xScale = f;
    return this;
  };

  this.yAxis = function(x) {
    if (!arguments.length) return yAxis;
    yAxis.push(x);
    return this;
  };

  this.addPlotType = function (dataType, plotFunction, dataFillBoolean, panBoolean) {
    plotTypes.push({
      type: dataType,
      plot: plotFunction,
      panBoolean: panBoolean
    });
    if (dataFillBoolean) {
      container.dataFill[dataType] = true;
    }
    return this;
  };

  return this;
}

module.exports = Pool;

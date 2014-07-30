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

var legend = require('./plot/util/legend');

var log = require('./lib/').bows('Pool');

function Pool (container) {

  var id, label, legends = [],
    index, weight, gutterWeight, hidden = false, yPosition,
    height, minHeight = 20, maxHeight = 300,
    group,
    mainSVG = d3.select('#' + container.id()),
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
        if (plotType.data.length !== 0) {
          dataGroup.call(plotType.plot);
        }
      }
      else if (plotType.type === 'stats') {
        var statsGroup = group.selectAll('#' + id + '_stats').data([null]);
        statsGroup.enter().append('g').attr('id', id + '_stats').call(plotType.plot);
      }
      else {
        log('WARNING: I am confused: the only plot type not classified as dataFill should be stats.');
      }
    });

    this.drawAxes();
    this.updateAxes();
    this.drawLabel();
    this.drawLegend();
  };

  this.clear = function() {
    plotTypes.forEach(function(plotType) {
      if (container.dataFill[plotType.type])  {
        group.select('#' + id + '_' + plotType.type).remove();
      }
    });
    group.select('#' + id + '_guidelines').remove();
  };

  // non-chainable methods
  this.pan = function(e) {
    container.latestTranslation(e.translate[0]);
    plotTypes.forEach(function(plotType) {
      if (plotType.panBoolean) {
        mainSVG.select('#' + id + '_' + plotType.type).attr('transform', 'translate(' + e.translate[0] + ',0)');
      }
    });
  };

  this.scroll = function(e) {
    container.latestTranslation(e.translate[1]);
    plotTypes.forEach(function(plotType) {
      mainSVG.select('#' + id + '_' + plotType.type).attr('transform', 'translate(0,' + e.translate[1] + ')');
    });
  };

  // getters only
  this.group = function() {
    return group;
  };

  this.parent = function() {
    return mainSVG;
  };

  this.width = function() {
    return container.width() - container.axisGutter();
  };

  this.imagesBaseUrl = function() {
    return imagesBaseUrl;
  };

  // only once methods
  this.drawLabel = _.once(function() {
    label = label || [];
    var labels = [], widths = [];
    if (label.length > 0) {
      _.each(label, function(l, i) {
        labels.push(
          mainSVG.select('#tidelineLabels')
          .append('text')
          .attr({
            'id': id + '_label_' + i,
            'class': 'd3-pool-label'
          })
          .text(l.main));
      });
      var currentX = container.axisGutter();
      _.each(labels, function(l, i) {
        l.append('tspan')
          .text(label[i].light)
          .each(function() {
            widths.push(this.getBBox().width);
          });
        if (widths[i - 1]) {
          currentX = currentX + widths[i - 1];
        }
        l.attr({
          'xml:space': 'preserve',
          'transform': 'translate(' + currentX  + ',' + yPosition + ')'
        });
      });
    }

    return this;
  });

  this.drawLegend = _.once(function() {
    if (legends.length === 0) {
      return;
    }
    var w = this.width() + container.axisGutter();
    _.each(legends, function(l) {
      var legendGroup = mainSVG.select('#tidelineLabels')
        .append('g')
        .attr({
          'id': id + '_legend_' + l,
          'transform': 'translate(' + w + ',' + yPosition + ')'
        });
      w -= legend.draw(legendGroup, l).width + legend.SHAPE_MARGIN*2;
    });

  });

  this.drawAxes = _.once(function() {
    var axisGroup = mainSVG.select('#tidelineYAxes');
    yAxis.forEach(function(axis, i) {
      axisGroup.append('g')
        .attr('class', 'd3-y d3-axis')
        .attr('id', 'pool_' + id + '_yAxis_' + i)
        .attr('transform', 'translate(' + (container.axisGutter() - 1) + ',' + yPosition + ')');
    });
    return this;
  });

  this.updateAxes = function() {
    var axisGroup = mainSVG.select('#tidelineYAxes');
    yAxis.forEach(function(axis, i) {
      axisGroup.select('#pool_' + id + '_yAxis_' + i)
        .call(axis);
    });
    return this;
  };

  // getters & setters
  this.id = function(x, selection) {
    if (!arguments.length) return id;
    id = x;
    group = selection.append('g').attr('id', id);
    return this;
  };

  this.label = function(o) {
    if (!arguments.length) return label;
    label = o;
    return this;
  };

  this.legend = function(a) {
    if (!arguments.length) return legends;
    legends = a;
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

  this.gutterWeight = function(x) {
    if (!arguments.length) return gutterWeight;
    gutterWeight = x;
    return this;
  };

  this.hidden = function(x) {
    if (!arguments.length) return hidden;
    if (x === true) {
      hidden = true;
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

  this.highlight = function(background, opts) {
    opts = _.defaults(opts || {}, {
      subdueOpacity: 0.6
    });

    return {
      on: function(el) {
        background.attr('opacity', opts.subdueOpacity);
        el.attr('opacity', 1);
      },
      off: function() {
        background.attr('opacity', 1);
      }
    };
  };

  return this;
}

module.exports = Pool;

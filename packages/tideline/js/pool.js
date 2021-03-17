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

import _ from 'lodash';

import legend from './plot/util/legend';

/**
 * @typedef {import('./tidelinedata').default} TidelineData
 * @typedef {{ type: string, plot: function, panBoolean: boolean }} PlotType
 * @typedef { import('d3').Axis } Axis
 * @typedef { import('d3').ScaleContinuousNumeric<number, number> } ScaleContinuousNumeric
 *
 * @typedef {(tidelineData: TidelineData, pool: Pool) => { axis: Axis, scale: ScaleContinuousNumeric }} AxisScaleFunc
 */

/**
 * A pool: An horizontal graph for the daily view
 * @param {function} container OneDay container
 */
function Pool(container) {
  const d3 = window.d3;

  const minHeight = 20;
  const maxHeight = 300;

  let mainSVG = d3.select('#' + container.id());
  var id, labelBaseline = 4, legends = [],
    index, heightRatio, gutterWeight, hidden = false, yPosition,
    group;

  let height = minHeight;
  let label = null;
  /** @type {ScaleContinuousNumeric} */
  let xScale = null;
  let yScale = null;
  /** @type {Axis} */
  let yAxis = null;
  /** @type {PlotType[]} */
  let plotTypes = [];
  let annotations = null;
  let tooltips = null;
  /** @type {AxisScaleFunc} */
  let defaultAxisScaleFn = null;

  this.destroy = function() {
    plotTypes.forEach((plotType) => {
      if (typeof plotType.plot.destroy === 'function') {
        plotType.plot.destroy();
      }
    });
    mainSVG = null;
    legends = null;
    group = null;
    xScale = null;
    yScale = null;
    yAxis = null;
    plotTypes = null;
    annotations = null;
    tooltips = null;
    container = null;
  };

  this.render = function(_selection, poolData, updateScale = false) {
    if (updateScale && _.isFunction(defaultAxisScaleFn)) {
      const axisScale = defaultAxisScaleFn(container.tidelineData, this);
      yScale = axisScale.scale;
      yAxis = axisScale.axis;
    }

    plotTypes.forEach(function(plotType) {
      if (plotType.type in container.dataFill) {
        plotType.data = _.filter(poolData, { type: plotType.type });
        var dataGroup = group.selectAll('#' + id + '_' + plotType.type).data([plotType.data]);
        dataGroup.enter().append('g').attr('id', id + '_' + plotType.type);
        if (plotType.data.length > 0) {
          dataGroup.call(plotType.plot);
        }
      } else {
        console.warn(`Pool: ${plotType.type} not in dataFill`, { plotType, dataFill: container.dataFill});
      }
    });

    this.drawAxes();
    this.updateAxes();
    this.drawLabel();
    this.drawLegend();
  };

  this.clear = function() {
    plotTypes.forEach(function(plotType) {
      if (container.dataFill[plotType.type]) {
        group.select('#' + id + '_' + plotType.type).remove();
      }
    });
    group.select('#' + id + '_guidelines').remove();
  };

  // non-chainable methods
  this.pan = function(translateX) {
    plotTypes.forEach(function(plotType) {
      if (plotType.panBoolean) {
        mainSVG.select('#' + id + '_' + plotType.type).attr('transform', `translate(${translateX},0)`);
      }
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

  // only once methods
  this.drawLabel = _.once(function() {
    if (Array.isArray(label) && label.length > 0) {
      var labelGroup = mainSVG.select('#tidelineLabels').append('text')
        .attr({
          id: id + '_label',
          'class': 'd3-pool-label',
          'transform': 'translate(' + container.axisGutter() + ',' + (yPosition-labelBaseline) + ')'
        });
      _.forEach(label, (l) => {
        labelGroup.append('tspan')
          .attr('class', 'main')
          .text(l.main);
        labelGroup.append('tspan')
          .attr('class', 'light')
          .text(l.light);
      });
    }
  });

  this.drawLegend = _.once(function() {
    if (legends.length === 0) {
      return;
    }
    var w = this.width() + container.axisGutter();
    _.forEach(legends, (l) => {
      var legendGroup = mainSVG.select('#tidelineLabels')
        .append('g')
        .attr({
          'id': id + '_legend_' + l,
          'transform': 'translate(' + w + ',' + (yPosition-labelBaseline) + ')'
        });
      w -= legend.draw(legendGroup, l).width + legend.SHAPE_MARGIN*2;
    });
  });

  this.drawAxes = _.once(function() {
    if (yAxis) {
      const axisGroup = mainSVG.select('#tidelineYAxes');
      axisGroup.append('g')
        .attr('class', 'd3-y d3-axis')
        .attr('id', `pool-${id}-yAxis`)
        .attr('transform', 'translate(' + (container.axisGutter() - 1) + ',' + yPosition + ')');
    }
  });

  this.updateAxes = function() {
    if (yAxis) {
      const axisGroup = mainSVG.select('#tidelineYAxes');
      axisGroup.select(`#pool-${id}-yAxis`).call(yAxis);
    }
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

  this.labelBaseline = function(x) {
    if (!arguments.length) return labelBaseline;
    labelBaseline = x;
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

  this.heightRatio = function(x) {
    if (!arguments.length) return heightRatio;
    heightRatio = x;
    return this;
  };

  this.height = function(x) {
    if (!arguments.length) return height;
    x = x * this.heightRatio();
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

  /**
   * @param {ScaleContinuousNumeric} scale
   * @returns {ScaleContinuousNumeric}
   */
  this.xScale = (scale = null) => {
    if (scale !== null) {
      xScale = scale;
    }
    return xScale;
  };

  /**
   * Default pool scaling. Most (all) of them have only
   * one main scaling (outide fixed size, like pool height)
   * @returns {ScaleContinuousNumeric}
   */
  this.yScale = () => {
    if (yScale === null) {
      throw new Error(`yScale === null (${id})`);
    }
    return yScale;
  };

  /**
   * @param {AxisScaleFunc} fn
   * @returns {AxisScaleFunc}
   */
  this.axisScaleFn = function(fn = null) {
    if (fn !== null) {
      defaultAxisScaleFn = fn;
      const axisScale = fn(container.tidelineData, this);
      yScale = axisScale.scale;
      yAxis = axisScale.axis;
    }
    return defaultAxisScaleFn;
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
        if(_.isString(background)) {
          background = mainSVG.selectAll(background);
        }

        background.attr('opacity', opts.subdueOpacity);
        el.attr('opacity', 1);
      },
      off: function() {
        if(_.isString(background)) {
          background = mainSVG.selectAll(background);
        }

        background.attr('opacity', 1);
      }
    };
  };

  return this;
}

export default Pool;

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

import legendDefs from './plot/util/legend';

/**
 * @typedef {import('./tidelinedata').default} TidelineData
 * @typedef {import('./tidelinedata').Datum} Datum
 * @typedef {{ type: string, plot: function, panBoolean: boolean }} PlotType
 * @typedef { import('d3').Axis } Axis
 * @typedef { import('d3').ScaleContinuousNumeric<number, number> } ScaleContinuousNumeric
 *
 * @typedef {(tidelineData: TidelineData, pool: Pool) => { axis: Axis, scale: ScaleContinuousNumeric }} AxisScaleFunc
 * @typedef {{ spans: { text: string; className: string; }[]; baseline: number}[]} Labels
 * @typedef {{ name: string; baseline: number }[]} Legends
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
  let id = '';
  let yPosition = 0;
  let gutterWeight = 0;
  /** @type {Labels} Chart name for the user */
  let labels = null;
  /** @type {Legends} */
  let legends = null;
  let heightRatio = 0;
  let hidden = false;
  let group = null;

  let height = minHeight;
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
    labels = null;
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
    if (!Array.isArray(labels) || labels.length < 1) {
      return;
    }

    const x = container.axisGutter().toString(10);
    labels.forEach((label, labelIndex) => {
      const y = (yPosition - label.baseline).toString(10);
      const labelGroup = mainSVG.select('#tidelineLabels').append('text');
      labelGroup.attr({
        id: `${id}_label_${labelIndex}`,
        'class': 'd3-pool-label',
        transform: `translate(${x},${y})`
      });
      label.spans.forEach((tspan, spanIndex) => {
        labelGroup.append('tspan')
          .attr('class', tspan.className)
          .attr('id', `${id}_label_${labelIndex}_span_${spanIndex}`)
          .text(tspan.text);
      });
    });
  });

  this.drawLegend = _.once(function() {
    if (!Array.isArray(legends) || legends.length < 1) {
      return;
    }
    legends.forEach((legend) => {
      const x = (this.width() + container.axisGutter()).toString(10);
      const y = (yPosition - legend.baseline).toString(10);
      const legendGroup = mainSVG.select('#tidelineLabels')
        .append('g')
        .attr({
          id: `${id}_legend_${legend.name}`,
          transform: `translate(${x},${y})`,
        });
      legendDefs.draw(legendGroup, legend.name);
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

  this.labels = function(/** @type {Labels} */ l) {
    if (!arguments.length) return labels;
    labels = l;
    return this;
  };

  this.legends = function(a) {
    if (!arguments.length) return legends;
    legends = a;
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

  /**
   * Filter for special data. Do like updateRenderedData().
   * Used for zenMode, physicalActivities...
   * @param {Datum[]} data Array of tideline datum
   * @returns {Datum[]} A filtered array of datum to be displayed
   */
  this.filterDataForRender = function filterDataForRender(data) {
    return container.filterDataForRender(data);
  };

  return this;
}

export default Pool;

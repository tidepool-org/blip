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

/* jshint esversion:6 */

var d3 = require('d3');
var _ = require('lodash');

var log = require('bows')('Stats');
var scales = require('../util/scales')();
var dt = require('../../data/util/datetime');
var format = require('../../data/util/format');
var Puddle = require('./puddle');
var bgBoundaryClass = require('../util/bgboundary');
var {
  MGDL_UNITS,
  AUTOMATED_BASAL_LABELS,
  SCHEDULED_BASAL_LABELS
} = require('../../data/util/constants');

module.exports = function(pool, opts) {

  var annotation = pool.annotations();

  opts = opts || {};

  var basalLabels = {
    automated: _.get(AUTOMATED_BASAL_LABELS, opts.manufacturer, AUTOMATED_BASAL_LABELS.default),
    manual: _.get(SCHEDULED_BASAL_LABELS, opts.manufacturer, SCHEDULED_BASAL_LABELS.default),
  };

  var defaults = {
    classes: {
      'very-low': { boundary: 55 },
      low: { boundary: 70 },
      target: { boundary: 180 },
      high: { boundary: 300 },
      'very-high': { boundary: 600 },
    },
    twoWeekOptions: {
      exclusionThreshold: 7
    },
    size: 16,
    pieRadius: pool.height() * 0.5,
    bgUnits: MGDL_UNITS,
    activeBasalRatio: 'basalBolus',
    ratioLabels: {
      basalBolus: 'Basal : Bolus',
      timeInAuto: `Time In ${basalLabels.automated}`,
    },
    ratioLeads: {
      basalBolus: 'Basal to bolus insulin ratio',
      timeInAuto: `${basalLabels.manual} to ${basalLabels.automated} ratio`,
    },
    PTiRLabels: {
      cbg: 'Time in Target Range',
      smbg: 'Readings in Range',
    },
    puddleWeights: {
      ratio: 1.0,
      range: 1.0,
      average: 1.0
    }
  };

  _.defaults(opts, defaults);

  var data = {
    ratio: [],
    range: [],
    average: [],
    bgReadings: 0,
    bgType: 'smbg'
  };

  var pies = [], pie, arc;

  var currentIndices = {};

  opts.emitter.on('currentDomain', function(domain) {
    stats.getStats(domain);
    stats.draw();
  });

  var getBgBoundaryClass = bgBoundaryClass(opts.classes, opts.bgUnits);
  var widgetGroup, rectScale;

  var puddles = [];

  function stats(selection) {
    widgetGroup = selection;
    stats.initialize();
  }

  stats.initialize = _.once(function() {
    // move this group inside the container's axisGutter
    widgetGroup.attr({
      transform: 'translate(' + opts.xPosition + ',' + opts.yPosition + ')'
    });

    var pw = opts.puddleWeights;
    var lowBound = opts.bgUnits === MGDL_UNITS ? opts.classes.low.boundary : opts.classes.low.boundary.toFixed(1);
    var highBound = opts.bgUnits === MGDL_UNITS ? opts.classes.target.boundary : opts.classes.target.boundary.toFixed(1);
    var targetRangeString = 'Target range: ' + lowBound + ' - ' + highBound + ' ';

    // create basal-to-bolus ratio puddle
    var ratioOpts = {
      id: 'Ratio',
      head: opts.ratioLabels[opts.activeBasalRatio],
      lead: opts.ratioLeads[opts.activeBasalRatio],
      weight: pw.ratio,
      pieBoolean: true,
      annotationOpts: {
        lead: 'stats-how-calculated',
        d: {annotations: [{code: 'stats-how-calculated-ratio'}]}
      }
    };
    stats.newPuddle(ratioOpts);
    // create time-in-range puddle
    var rangeOpts = {
      id: 'Range',
      head: opts.PTiRLabels.cbg,
      lead: targetRangeString + opts.bgUnits,
      weight: pw.range,
      pieBoolean: true,
      annotationOpts: {
        lead: 'stats-how-calculated',
        d: {annotations: [{code: 'stats-how-calculated-range'}]}
      }
    };
    stats.newPuddle(rangeOpts);
    // create average BG puddle
    var averageOpts = {
      id: 'Average',
      head: 'Average BG',
      lead: opts.averageLabel,
      weight: pw.average,
      pieBoolean: false,
      annotationOpts: {
        lead: 'stats-how-calculated',
        d: {annotations: [{code: 'stats-how-calculated-average'}]}
      }
    };
    stats.newPuddle(averageOpts);
    stats.arrangePuddles();
  });

  stats.arrangePuddles = function() {
    var cumWeight = _.reduce(puddles, function(memo, puddle) { return memo + puddle.weight; }, 0);
    var currentWeight = 0;
    var currX = 0;
    puddles.forEach(function(puddle, i) {
      currentWeight += puddle.weight;
      puddle.width((puddle.weight/cumWeight) * pool.width());
      puddle.height(pool.height());
      var puddleGroup = widgetGroup.append('g')
        .attr({
          transform: 'translate(' + currX + ',0)',
          class: 'd3-stats',
          id: 'puddle_' + puddle.id
        })
        // This is needed to capture hover events from the hidden
        // rectangle in the puddle.
        .style('pointer-events', 'all');
      puddle.xPosition(currX);
      currX = (currentWeight / cumWeight) * pool.width();
      puddleGroup.call(puddle);
    });
  };

  stats.draw = function() {
    puddles.forEach(function(puddle) {
      var puddleGroup = pool.group().select('#puddle_' + puddle.id);
      if (puddle.pie) {
        var thisPie = _.find(pies, function(p) {
          return p.id === puddle.id;
        });
        // change the label in this PTiR puddle when fell back to SMBG stats
        if (puddle.id === 'Range' && data.bgType === 'smbg') {
          puddleGroup.select('.d3-stats-head').text(opts.PTiRLabels.smbg);
        }
        else if (puddle.id === 'Range' && data.bgType === 'cbg') {
          puddleGroup.select('.d3-stats-head').text(opts.PTiRLabels.cbg);
        }
        var createAPie = function(puddleGroup, data) {
          var slices = stats.createPie(puddle, puddleGroup, data[puddle.id.toLowerCase()]);
          pies.push({
            id: puddle.id,
            slices: slices
          });
        };
        // when NaN(s) present, create a no data view
        if (stats.hasNaN(data[puddle.id.toLowerCase()])) {
          pies = _.reject(pies, function(pie) {
            return _.isEqual(pie, thisPie);
          });
          createAPie(puddleGroup, data);
        }
        // or if good data, but no pie yet, create a pie
        else if (!thisPie) {
          createAPie(puddleGroup, data);
        }
        else {
          // or if no data view is the existing "pie", recreate a real pie
          if (thisPie.slices === null) {
            pies = _.reject(pies, function(pie) {
              return _.isEqual(pie, thisPie);
            });
            createAPie(puddleGroup, data);
          }
          // or just update the current pie
          else {
            stats.updatePie(thisPie, data[puddle.id.toLowerCase()]);
            stats.updatePieAnnotation(puddle, puddleGroup, false);
          }
        }
      }
      else {
        if (!stats.rectGroup) {
          stats.createRect(puddle, puddleGroup, data[puddle.id.toLowerCase()]);
        }
        else {
          stats.updateAverage(puddle, puddleGroup, data[puddle.id.toLowerCase()]);
        }
      }
      var display = stats.getDisplay(puddle.id);
      puddle.dataDisplay(puddleGroup, display);
    });
  };

  stats.createRect = function(puddle, puddleGroup, data) {
    var rectGroup = puddleGroup.append('g')
      .attr('id', 'd3-stats-rect-group');

    puddle.height(pool.height() * (4/5));

    rectGroup.append('rect')
      .attr({
        x: puddle.width() / 16,
        y: 0,
        width: puddle.width() * (5/32),
        height: pool.height(),
        class: 'd3-stats-rect rect-left'
      });

    rectGroup.append('rect')
      .attr({
        x: puddle.width() * (7/32),
        y: 0,
        width: puddle.width() * (5/32),
        height: pool.height(),
        class: 'd3-stats-rect rect-right'
      });

    // scales expects 2nd arg to have a .height() function
    var rect = {
      height: function() { return pool.height() * 4/5; }
    };

    rectScale = scales.bgClamped([opts.classes['very-low'].boundary, opts.classes['very-high'].boundary], rect, opts.size/2);

    rectGroup.append('line')
      .attr({
        x1: puddle.width() / 16,
        x2: puddle.width() * (3/8),
        y1: rectScale(opts.classes.low.boundary) + (pool.height() / 10),
        y2: rectScale(opts.classes.low.boundary) + (pool.height() / 10),
        class: 'd3-line-guide d3-line-bg-threshold'
      });

    rectGroup.append('line')
      .attr({
        x1: puddle.width() / 16,
        x2: puddle.width() * (3/8),
        y1: rectScale(opts.classes.target.boundary) + (pool.height() / 10),
        y2: rectScale(opts.classes.target.boundary) + (pool.height() / 10),
        'class': 'd3-line-guide d3-line-bg-threshold'
      });

    var imageY = rectScale(data.value) + (pool.height() / 10);

    rectGroup.append('circle')
      .attr({
        cx: (puddle.width() * (7/32)),
        cy: isFinite(imageY) ? imageY : 0,
        r: 7,
        'class': getBgBoundaryClass(data)
      })
      .classed({
        'd3-image': true,
        'd3-stats-circle': true,
        'd3-smbg': true,
        'd3-circle-smbg': true,
        hidden: !isFinite(imageY)
      });

    stats.rectGroup = rectGroup;

    if (isNaN(data.value)) {
      puddleGroup.classed('d3-insufficient-data', true);
      stats.rectGroup.selectAll('.d3-stats-circle').classed('hidden', true);
      stats.updateRectAnnotation(puddle, puddleGroup, true);
    }
    else {
      puddleGroup.classed('d3-insufficient-data', false);
      stats.rectGroup.selectAll('.d3-stats-circle').classed('hidden', false);
      stats.updateRectAnnotation(puddle, puddleGroup, false);
    }
  };

  stats.updateAverage = function(puddle, puddleGroup, data) {
    if (isNaN(data.value)) {
      puddleGroup.classed('d3-insufficient-data', true);
      stats.rectGroup.selectAll('.d3-stats-circle').classed('hidden', true);
      stats.updateRectAnnotation(puddle, puddleGroup, true);
    }
    else {
      puddleGroup.classed('d3-insufficient-data', false);
      stats.updateRectAnnotation(puddle, puddleGroup, false);
    }

    var imageY = rectScale(data.value) + (puddle.height() / 10);

    if (isFinite(imageY)) {
      stats.rectGroup.selectAll('.d3-stats-circle')
        .attr({
          'class': getBgBoundaryClass(data),
          cy: imageY
        })
        .classed({'d3-stats-circle': true, 'd3-smbg': true, 'd3-circle-smbg': true, 'hidden': false});
    }
  };

  stats.updateAnnotation = function(annotationOpts, puddle, insufficientData) {
    if (insufficientData) {
      annotationOpts.lead = 'stats-insufficient-data';
      annotationOpts.d.annotations[0].code = 'stats-insufficient-data';
      pool.parent().select('#tidelineAnnotations_stats').call(annotation, annotationOpts);
    }
    else {
      annotationOpts.lead = puddle.annotationOpts.lead;
      annotationOpts.d.annotations[0].code = puddle.annotationOpts.d.annotations[0].code;
      // For range and average, display will be different for smbg and cbg.
      // The possible resulting code options are (placed here for searchability):
      // stats-how-calculated-range-cbg
      // stats-how-calculated-range-smbg
      // stats-how-calculated-average-cbg
      // stats-how-calculated-average-smbg
      if (puddle.id === 'Range' || puddle.id === 'Average') {
        annotationOpts.d.annotations[0].code += ('-'+data.bgType);
      }
      pool.parent().select('#tidelineAnnotations_stats').call(annotation, annotationOpts);
    }
  };

  function removeMouseListeners(selection) {
    selection.on('mouseover', null);
    selection.on('mouseout', null);
  }

  stats.updateRectAnnotation = function(puddle, puddleGroup, insufficientData) {
    removeMouseListeners(puddleGroup);
    var annotationOpts = {
      x: puddle.width() * (7/32) + puddle.xPosition(),
      y: pool.height() / 2,
      hoverTarget: puddleGroup,
      lead: 'stats-insufficient-data',
      d: {annotations: [{code: 'stats-insufficient-data'}]},
      orientation: {up: true}
    };

    stats.updateAnnotation(annotationOpts, puddle, insufficientData);
  };

  stats.updatePieAnnotation = function(puddle, puddleGroup, insufficientData) {
    removeMouseListeners(puddleGroup);
    var xOffset = (pool.width()/3) * (1/6);
    var yOffset = pool.height() / 2;
    var annotationOpts = {
      x: xOffset + puddle.xPosition(),
      y: yOffset,
      hoverTarget: puddleGroup,
      lead: 'stats-insufficient-data',
      d: {annotations: [{code: 'stats-insufficient-data'}]},
      orientation: {up: true}
    };

    stats.updateAnnotation(annotationOpts, puddle, insufficientData);
  };

  stats.createPie = function(puddle, puddleGroup, data) {
    var xOffset = (pool.width()/3) * (1/6);
    var yOffset = pool.height() / 2;
    puddleGroup.selectAll('.d3-stats-pie').remove();
    var pieGroup = puddleGroup.append('g')
      .attr({
        transform: 'translate(' + xOffset + ',' + yOffset + ')',
        'class': 'd3-stats-pie'
      });

    if (stats.hasNaN(data)) {
      puddleGroup.classed('d3-insufficient-data', true);
      pieGroup.append('circle')
        .attr({
          cx: 0,
          cy: 0,
          r: opts.pieRadius
        });

      stats.updatePieAnnotation(puddle, puddleGroup, true);

      return null;
    }
    else {
      stats.updatePieAnnotation(puddle, puddleGroup, false);

      puddleGroup.classed('d3-insufficient-data', false);
      pie = d3.layout.pie().value(function(d) {
          return d.value;
        })
        .sort(null);

      arc = d3.svg.arc()
        .innerRadius(0)
        .outerRadius(opts.pieRadius);

      var slices = pieGroup.selectAll('g.d3-stats-slice')
        .data(pie(data))
        .enter()
        .append('path')
        .attr({
          d: arc,
          'class': function(d) {
            return 'd3-stats-slice d3-' + d.data.type;
          }
        });

      return slices;
    }
  };

  stats.updatePie = function(thisPie, data) {
    thisPie.slices.data(pie(data))
      .attr({
        d: arc
      });
  };

  stats.hasNaN = function(a) {
    var found = false;
    a.forEach(function(obj) {
      if (isNaN(obj.value)) {
        found = true;
      }
    });
    return found;
  };

  stats.newPuddle = function(opts) {
    var p = new Puddle({
      id: opts.id,
      head: opts.head,
      lead: opts.lead,
      width: pool.width()/3,
      height: pool.height(),
      weight: opts.weight,
      xOffset: function() {
        if (opts.pieBoolean) {
          return (pool.width()/3) / 3;
        }
        else {
          return (pool.width()/3) * (2 / 5);
        }
      },
      pie: opts.pieBoolean,
      annotationOpts: opts.annotationOpts
    });
    puddles.push(p);
  };

  stats.getDisplay = function(id) {
    switch (id) {
    case 'Ratio':
      return stats.ratioDisplay();
    case 'Range':
      return stats.rangeDisplay();
    case 'Average':
      return stats.averageDisplay();
    }
  };

  stats.ratioDisplay = function() {
    if (opts.activeBasalRatio === 'timeInAuto') {
      var basalAutomatedDuration = _.findWhere(data.ratio, {type: 'basalAutomatedDuration'}).value;
      var basalManualDuration = _.findWhere(data.ratio, {type: 'basalManualDuration'}).value;
      var totalDuration = basalAutomatedDuration + basalManualDuration;
      return [
        {
          text: format.percentage(basalManualDuration / totalDuration) + ' : ',
          'class': 'd3-stats-basalManualDuration',
        },
        {
          text: format.percentage(basalAutomatedDuration / totalDuration),
          'class': 'd3-stats-basalAutomatedDuration',
        },
      ];
    }

    var bolus = _.findWhere(data.ratio, {type: 'bolus'}).value;
    var basal = _.findWhere(data.ratio, {type: 'basal'}).value;
    var total = bolus + basal;
    return [
      {
        text: format.percentage(basal / total) + ' : ',
        'class': 'd3-stats-basal',
      },
      {
        text: format.percentage(bolus / total),
        'class': 'd3-stats-bolus',
      },
    ];
  };

  stats.rangeDisplay = function() {
    var target = _.findWhere(data.range, {type: 'bg-target'}).value;
    var total = parseFloat(data.bgReadings);
    return [{text: format.percentage(target/total), 'class': 'd3-stats-percentage'}];
  };

  stats.averageDisplay = function() {
    if (isNaN(data.average.value)) {
      return [{text: '--- ' + opts.bgUnits, 'class': 'd3-stats-' + data.average.category}];
    }
    else {
      return [{text: data.average.value + ' ' + opts.bgUnits, 'class': 'd3-stats-' + data.average.category}];
    }
  };

  stats.getStats = function(domainObj) {
    var start = domainObj.domain[0].valueOf(), end = domainObj.domain[1].valueOf();
    opts.twoWeekOptions.startIndex = domainObj.startIndex;

    if (opts.activeBasalRatio === 'timeInAuto') {
      var groupDurations = opts.basal.getGroupDurations(start, end);
      data.ratio = [
        {
          type: 'basalManualDuration',
          value: groupDurations.manual,
        },
        {
          type: 'basalAutomatedDuration',
          value: groupDurations.automated,
        },
      ];
    }
    else {
      var basalData = opts.basal.totalBasal(start, end, opts.twoWeekOptions);
      var excluded = basalData.excluded;
      data.ratio = [
        {
          type: 'bolus',
          value: opts.bolus.totalBolus(start, end, {excluded: excluded}),
        },
        {
          type: 'basal',
          value: basalData.total,
        },
      ];
    }
    var bgStats = opts.cbg.getStats(start, end, opts.twoWeekOptions);
    if (isNaN(bgStats.breakdown.total)) {
      log('Unable to calculate CBG stats; fell back to SMBG stats.');
      bgStats = opts.smbg.getStats(start, end, opts.twoWeekOptions);
    }
    var range = bgStats.breakdown;
    data.bgType = range.type;
    data.range = [
      {
        type: 'bg-low',
        value: range.low
      },
      {
        type: 'bg-target',
        value: range.target
      },
      {
        type: 'bg-high',
        value: range.high
      }
    ];
    data.bgReadings = range.total;
    data.average = bgStats.average;
  };

  return stats;
};

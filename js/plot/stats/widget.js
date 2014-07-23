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

var d3 = require('../../lib/').d3;
var _ = require('../../lib/')._;

var log = require('../../lib/').bows('Stats');
var scales = require('../util/scales')();
var dt = require('../../data/util/datetime');
var format = require('../../data/util/format');
var Puddle = require('./puddle');
var bgBoundaryClass = require('../util/bgBoundaryClass');

module.exports = function(pool, opts) {

  var annotation = pool.annotations();

  opts = opts || {};

  var defaults = {
    classes: {
      'very-low': {boundary: 60},
      low: {boundary: 80},
      target: {boundary: 180},
      high: {boundary: 200},
      'very-high': {boundary: 300}
    },
    twoWeekOptions: {
      exclusionThreshold: 7
    },
    imagesBaseUrl: pool.imagesBaseUrl(),
    size: 16,
    pieRadius: pool.height() * 0.45,
    defaultAnnotationOpts: {
      lead: 'stats-insufficient-data',
      d: {annotations: [{code: 'stats-insufficient-data'}]},
      orientation: {up: true}
    },
    bgUnits: 'mg/dL',
    PTiRLabels: {
      cbg: 'Time in Target Range',
      smbg: 'Readings in Range'
    },
    puddleWeights: {
      ratio: 1.0,
      range: 1.0,
      average: 1.0
    }
  };

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

  opts = _.defaults(opts, defaults);

  var getBgBoundaryClass = bgBoundaryClass(opts);
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

    var targetRangeString = 'Target range: ' + opts.classes.low.boundary + ' - ' + opts.classes.target.boundary + ' ';

    // create basal-to-bolus ratio puddle
    stats.newPuddle('Ratio', 'Basal : Bolus', 'Basal to bolus insulin ratio', pw.ratio, true);
    // create time-in-range puddle
    stats.newPuddle('Range', opts.PTiRLabels.cbg, targetRangeString + opts.bgUnits, pw.range, true);
    // create average BG puddle
    stats.newPuddle('Average', 'Average BG', opts.averageLabel, pw.average, false);
    stats.arrangePuddles();
  });

  stats.arrangePuddles = function() {
    var cumWeight = _.reduce(puddles, function(memo, puddle) { return memo + puddle.weight; }, 0);
    var currentWeight = 0;
    var currX = 0;
    puddles.forEach(function(puddle, i) {
      currentWeight += puddle.weight;
      puddle.width((puddle.weight/cumWeight) * pool.width());
      var puddleGroup = widgetGroup.append('g')
        .attr({
          transform: 'translate(' + currX + ',0)',
          class: 'd3-stats',
          id: 'puddle_' + puddle.id
        });
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
        y: pool.height() / 10,
        width: puddle.width() / 8,
        height: pool.height() * (4/5),
        class: 'd3-stats-rect rect-left'
      });

    rectGroup.append('rect')
      .attr({
        x: puddle.width() * (3/16),
        y: pool.height() / 10,
        width: puddle.width() / 8,
        height: pool.height() * (4/5),
        class: 'd3-stats-rect rect-right'
      });

    var allBG = opts.smbg.data.concat(opts.cbg.data);
    // scales expects 2nd arg to have a .height() function
    var rect = {
      height: function() { return pool.height() * 4/5; }
    };

    rectScale = scales.bgLog(allBG, rect, opts.size/2);

    rectGroup.append('line')
      .attr({
        x1: puddle.width() / 16,
        x2: puddle.width() * (5/16),
        y1: rectScale(80) + (pool.height() / 10),
        y2: rectScale(80) + (pool.height() / 10),
        class: 'd3-line-guide d3-line-bg-threshold'
      });

    rectGroup.append('line')
      .attr({
        x1: puddle.width() / 16,
        x2: puddle.width() * (5/16),
        y1: rectScale(180) + (pool.height() / 10),
        y2: rectScale(180) + (pool.height() / 10),
        class: 'd3-line-guide d3-line-bg-threshold'
      });

    var imageY = rectScale(data.value) + (pool.height() / 10);

    rectGroup.append('circle')
      .attr({
        cx: (puddle.width() * (3/16)),
        cy: isFinite(imageY) ? imageY : 0,
        r: 7,
        class: getBgBoundaryClass(data)
      })
      .classed({
        'd3-image': true,
        'd3-stats-circle': true,
        'd3-smbg': true,
        'd3-circle-smbg': true,
        'hidden': !isFinite(imageY)
      });

    stats.rectGroup = rectGroup;

    if (isNaN(data.value)) {
      puddleGroup.classed('d3-insufficient-data', true);
      stats.rectGroup.selectAll('.d3-stats-circle').classed('hidden', true);
      stats.rectAnnotation(puddle, puddleGroup);
    }
    else {
      puddleGroup.on('mouseover', null);
      puddleGroup.on('mouseout', null);
      puddleGroup.classed('d3-insufficient-data', false);
      stats.rectGroup.selectAll('.d3-stats-circle').classed('hidden', false);
    }
  };

  stats.updateAverage = function(puddle, puddleGroup, data) {
    if (isNaN(data.value)) {
      puddleGroup.classed('d3-insufficient-data', true);
      stats.rectGroup.selectAll('.d3-stats-circle').classed('hidden', true);
      stats.rectAnnotation(puddle, puddleGroup);
    }
    else {
      puddleGroup.on('mouseover', null);
      puddleGroup.on('mouseout', null);
      puddleGroup.classed('d3-insufficient-data', false);
    }

    var imageY = rectScale(data.value) + (puddle.height() / 10);

    if (isFinite(imageY)) {
      stats.rectGroup.selectAll('.d3-stats-circle')
        .attr({
          class: getBgBoundaryClass(data),
          cy: imageY
        })
        .classed({'d3-stats-circle': true, 'd3-smbg': true, 'd3-circle-smbg': true, 'hidden': false});
    }
  };

  stats.rectAnnotation = function(puddle, puddleGroup) {
    var annotationOpts = {
      x: puddle.width() * (3/16) + puddle.xPosition(),
      y: puddle.height() / 2,
      hoverTarget: puddleGroup
    };
    _.defaults(annotationOpts, opts.defaultAnnotationOpts);
    pool.parent().select('#tidelineAnnotations_stats').call(annotation, annotationOpts);
  };

  stats.createPie = function(puddle, puddleGroup, data) {
    var xOffset = (pool.width()/3) * (1/6);
    var yOffset = pool.height() / 2;
    puddleGroup.selectAll('.d3-stats-pie').remove();
    var pieGroup = puddleGroup.append('g')
      .attr({
        transform: 'translate(' + xOffset + ',' + yOffset + ')',
        class: 'd3-stats-pie'
      });
    if (stats.hasNaN(data)) {
      puddleGroup.classed('d3-insufficient-data', true);
      pieGroup.append('circle')
        .attr({
          cx: 0,
          cy: 0,
          r: opts.pieRadius
        });

      var annotationOpts = {
        x: xOffset + puddle.xPosition(),
        y: yOffset,
        hoverTarget: puddleGroup
      };
      _.defaults(annotationOpts, opts.defaultAnnotationOpts);
      pool.parent().select('#tidelineAnnotations_stats').call(annotation, annotationOpts);

      return null;
    }
    else {
      puddleGroup.on('mouseover', null);
      puddleGroup.on('mouseout', null);
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
          class: function(d) {
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

  stats.newPuddle = function(id, head, lead, weight, pieBoolean) {
    var p = new Puddle({
      id: id,
      head: head,
      lead: lead,
      width: pool.width()/3,
      height: pool.height(),
      weight: weight,
      xOffset: function() {
        if (pieBoolean) {
          return (pool.width()/3) / 3;
        }
        else {
          return (pool.width()/3) * (2 / 5);
        }
      },
      pie: pieBoolean
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
    var bolus = _.findWhere(data.ratio, {type: 'bolus'}).value;
    var basal = _.findWhere(data.ratio, {type: 'basal'}).value;
    var total = bolus + basal;
    return [{
        text: format.percentage(basal/total) + ' : ',
        class: 'd3-stats-basal'
      },
      {
        text: format.percentage(bolus/total),
        class: 'd3-stats-bolus'
      }];
  };

  stats.rangeDisplay = function() {
    var target = _.findWhere(data.range, {type: 'bg-target'}).value;
    var total = parseFloat(data.bgReadings);
    return [{text: format.percentage(target/total), class: 'd3-stats-percentage'}];
  };

  stats.averageDisplay = function() {
    if (isNaN(data.average.value)) {
      return [{text: '--- mg/dL', class: 'd3-stats-' + data.average.category}];
    }
    else {
      return [{text: data.average.value + ' mg/dL', class: 'd3-stats-' + data.average.category}];
    }
  };

  stats.getStats = function(domainObj) {
    var start = domainObj.domain[0].valueOf(), end = domainObj.domain[1].valueOf();
    opts.twoWeekOptions.startIndex = domainObj.startIndex;
    var basalData = opts.basal.totalBasal(start, end, opts.twoWeekOptions);
    var excluded = basalData.excluded;
    data.ratio = [
      {
        type: 'bolus',
        value: opts.bolus.totalBolus(start, end, {excluded: excluded})
      },
      {
        type: 'basal',
        value: basalData.total
      }
    ];
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

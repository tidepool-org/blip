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
var scales = require('../util/scales');
var dt = require('../../data/util/datetime');
var format = require('../../data/util/format');

module.exports = function(pool, opts) {

  var Puddle = require('./puddle');

  opts = opts || {};

  var defaults = {
    classes: {
      'very-low': {'boundary': 60},
      'low': {'boundary': 80},
      'target': {'boundary': 180},
      'high': {'boundary': 200},
      'very-high': {'boundary': 300}
    },
    twoWeekOptions: {
      'exclusionThreshold': 0
    },
    imagesBaseUrl: pool.imagesBaseUrl(),
    size: 16,
    'pieRadius': pool.height() * 0.45
  };

  var data = {
    'ratio': [],
    'range': [],
    'average': [],
    'cbgReadings': 0
  };

  var pies = [], pie, arc;

  opts.emitter.on('currentDomain', function(domain) {
    var start = domain[0].toISOString(), end = domain[1].toISOString();
    stats.getStats(start, end);
    stats.draw();
  });

  _.defaults(opts, defaults);

  var widgetGroup, rectScale;

  var puddles = [];

  function stats(selection) {
    widgetGroup = selection;
    stats.initialize();
  }

  stats.initialize = _.once(function() {
    // move this group inside the container's axisGutter
    widgetGroup.attr({
      'transform': 'translate(' + opts.xPosition + ',' + opts.yPosition + ')'
    });
    if (opts.oneDay) {
      // create basal-to-bolus ratio puddle
      stats.newPuddle('Ratio', 'Basal : Bolus', 'Basal to bolus insulin ratio', 1.0, true);
      // create time-in-range puddle
      stats.newPuddle('Range', 'Time in Target Range', 'Target range: 80 - 180 mg/dL', 1.2, true);
      // create average BG puddle
      stats.newPuddle('Average', 'Average BG', 'This day', 0.9, false);
    }
    else {
      // create basal-to-bolus ratio puddle
      stats.newPuddle('Ratio', 'Basal : Bolus', 'Basal to bolus insulin ratio', 1.1, true);
      // create time-in-range puddle
      stats.newPuddle('Range', 'Time in Target Range', 'Target range: 80 - 180 mg/dL', 1.2, true);
      // create average BG puddle
      stats.newPuddle('Average', 'Average BG', 'These two weeks', 1.0, false);
    }
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
          'transform': 'translate(' + currX + ',0)',
          'class': 'd3-stats',
          'id': 'puddle_' + puddle.id
        });
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
        var createAPie = function(puddleGroup, data) {
          var slices = stats.createPie(puddleGroup, data[puddle.id.toLowerCase()]);
          pies.push({
            'id': puddle.id,
            'slices': slices
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
        'x': puddle.width() / 16,
        'y': pool.height() / 10,
        'width': puddle.width() / 8,
        'height': pool.height() * (4/5),
        'class': 'd3-stats-rect rect-left'
      });

    rectGroup.append('rect')
      .attr({
        'x': puddle.width() * (3/16),
        'y': pool.height() / 10,
        'width': puddle.width() / 8,
        'height': pool.height() * (4/5),
        'class': 'd3-stats-rect rect-right'
      });

    rectScale = scales.bgLog(opts.cbg.data, puddle, 0);

    rectGroup.append('line')
      .attr({
        'x1': puddle.width() / 16,
        'x2': puddle.width() * (5/16),
        'y1': rectScale(80) + (pool.height() / 10),
        'y2': rectScale(80) + (pool.height() / 10),
        'class': 'd3-stats-rect-line'
      });

    rectGroup.append('line')
      .attr({
        'x1': puddle.width() / 16,
        'x2': puddle.width() * (5/16),
        'y1': rectScale(180) + (pool.height() / 10),
        'y2': rectScale(180) + (pool.height() / 10),
        'class': 'd3-stats-rect-line'
      });
    var imageY = rectScale(data.value) - (opts.size / 2) + (puddle.height() / 10);
    // don't append an image if imageY is NaN or Infinity
    if (isFinite(imageY)) {
      rectGroup.append('image')
        .attr({
          'xlink:href': function() {
            if (data.value <= opts.classes['very-low'].boundary) {
              return opts.imagesBaseUrl + '/smbg/very_low.svg';
            }
            else if ((data.value > opts.classes['very-low'].boundary) && (data.value <= opts.classes.low.boundary)) {
              return opts.imagesBaseUrl + '/smbg/low.svg';
            }
            else if ((data.value > opts.classes.low.boundary) && (data.value <= opts.classes.target.boundary)) {
              return opts.imagesBaseUrl + '/smbg/target.svg';
            }
            else if ((data.value > opts.classes.target.boundary) && (data.value <= opts.classes.high.boundary)) {
              return opts.imagesBaseUrl + '/smbg/high.svg';
            }
            else if (data.value > opts.classes.high.boundary) {
              return opts.imagesBaseUrl + '/smbg/very_high.svg';
            }
          },
          'x': (puddle.width() * (3/16)) - (opts.size / 2),
          'y': imageY,
          'width': opts.size,
          'height': opts.size,
          'class': 'd3-image d3-stats-image'
        });
    }
    else {
      rectGroup.append('image')
        .attr({
          'xlink:href': function() {
            if (data.value <= opts.classes['very-low'].boundary) {
              return opts.imagesBaseUrl + '/smbg/very_low.svg';
            }
            else if ((data.value > opts.classes['very-low'].boundary) && (data.value <= opts.classes.low.boundary)) {
              return opts.imagesBaseUrl + '/smbg/low.svg';
            }
            else if ((data.value > opts.classes.low.boundary) && (data.value <= opts.classes.target.boundary)) {
              return opts.imagesBaseUrl + '/smbg/target.svg';
            }
            else if ((data.value > opts.classes.target.boundary) && (data.value <= opts.classes.high.boundary)) {
              return opts.imagesBaseUrl + '/smbg/high.svg';
            }
            else if (data.value > opts.classes.high.boundary) {
              return opts.imagesBaseUrl + '/smbg/very_high.svg';
            }
            else {
              return opts.imagesBaseUrl + '/ux/scroll_thumb.svg';
            }
          },
          'x': (puddle.width() * (3/16)) - (opts.size / 2),
          'y': rectScale(100) - (opts.size / 2) + (puddle.height() / 10),
          'width': opts.size,
          'height': opts.size,
          'class': 'd3-image d3-stats-image hidden'
        });
    }

    stats.rectGroup = rectGroup;

    if (isNaN(data.value)) {
      puddleGroup.classed('d3-insufficient-data', true);
      stats.rectGroup.selectAll('.d3-stats-image').classed('hidden', true);
    }
    else {
      puddleGroup.classed('d3-insufficient-data', false);
      stats.rectGroup.selectAll('.d3-stats-image').classed('hidden', false);
    }
  };

  stats.updateAverage = function(puddle, puddleGroup, data) {
    if (isNaN(data.value)) {
      puddleGroup.classed('d3-insufficient-data', true);
      stats.rectGroup.selectAll('.d3-stats-image').classed('hidden', true);
    }
    else {
      puddleGroup.classed('d3-insufficient-data', false);
    }
    var imageY = rectScale(data.value) - (opts.size / 2) + (puddle.height() / 10);
    if (isFinite(imageY)) {
      stats.rectGroup.selectAll('.d3-stats-image')
        .attr({
          'xlink:href': function() {
            if (data.value <= opts.classes['very-low'].boundary) {
              return opts.imagesBaseUrl + '/smbg/very_low.svg';
            }
            else if ((data.value > opts.classes['very-low'].boundary) && (data.value <= opts.classes.low.boundary)) {
              return opts.imagesBaseUrl + '/smbg/low.svg';
            }
            else if ((data.value > opts.classes.low.boundary) && (data.value <= opts.classes.target.boundary)) {
              return opts.imagesBaseUrl + '/smbg/target.svg';
            }
            else if ((data.value > opts.classes.target.boundary) && (data.value <= opts.classes.high.boundary)) {
              return opts.imagesBaseUrl + '/smbg/high.svg';
            }
            else if (data.value > opts.classes.high.boundary) {
              return opts.imagesBaseUrl + '/smbg/very_high.svg';
            }
          },
          'y': imageY
        })
        .classed('hidden', false);
    }
  };

  stats.createPie = function(puddleGroup, data) {
    var xOffset = (pool.width()/3) * (1/6);
    var yOffset = pool.height() / 2;
    puddleGroup.selectAll('.d3-stats-pie').remove();
    var pieGroup = puddleGroup.append('g')
      .attr({
        'transform': 'translate(' + xOffset + ',' + yOffset + ')',
        'class': 'd3-stats-pie'
      });
    if (stats.hasNaN(data)) {
      puddleGroup.classed('d3-insufficient-data', true);
      pieGroup.append('circle')
        .attr({
          'cx': 0,
          'cy': 0,
          'r': opts.pieRadius
        });

      return null;
    }
    else {
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
          'd': arc,
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
        'd': arc
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
      'id': id,
      'head': head,
      'lead': lead,
      'width': pool.width()/3,
      'height': pool.height(),
      'weight': weight,
      'xOffset': function() {
        if (pieBoolean) {
          return (pool.width()/3) / 3;
        }
        else {
          return (pool.width()/3) * (2 / 5);
        }
      },
      'pie': pieBoolean
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
    var bolus = _.findWhere(data.ratio, {'type': 'bolus'}).value;
    var basal = _.findWhere(data.ratio, {'type': 'basal'}).value;
    var total = bolus + basal;
    return [{
        'text': format.percentage(basal/total) + ' : ',
        'class': 'd3-stats-basal'
      },
      {
        'text': format.percentage(bolus/total),
        'class': 'd3-stats-bolus'
      }];
  };

  stats.rangeDisplay = function() {
    var target = _.findWhere(data.range, {'type': 'bg-target'}).value;
    var total = parseFloat(data.cbgReadings);
    return [{'text': format.percentage(target/total), 'class': 'd3-stats-percentage'}];
  };

  stats.averageDisplay = function() {
    if (isNaN(data.average.value)) {
      return [{'text': '--- mg/dL', 'class': 'd3-stats-' + data.average.category}];
    }
    else {
      return [{'text': data.average.value + ' mg/dL', 'class': 'd3-stats-' + data.average.category}];
    }
  };

  stats.getStats = function(start, end) {
    var basalData = opts.basal.totalBasal(start, end, opts.twoWeekOptions);
    var excluded = basalData.excluded;
    var cbgStats = opts.cbg.getStats(start, end, opts.twoWeekOptions);
    data.ratio = [
      {
        'type': 'bolus',
        'value': opts.bolus.totalBolus(start, end, {'excluded': excluded})
      },
      {
        'type': 'basal',
        'value': basalData.total
      }
    ];
    var range = cbgStats.breakdown;
    data.range = [
      {
        'type': 'bg-low',
        'value': range.low,
      },
      {
        'type': 'bg-target',
        'value': range.target,
      },
      {
        'type': 'bg-high',
        'value': range.high
      }
    ];
    data.cbgReadings = range.total;
    data.average = cbgStats.average;
  };

  return stats;
};
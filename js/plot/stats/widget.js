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

var log = require('../../lib/bows')('Stats');

module.exports = function(pool, opts) {

  var puddle = require('./puddle');

  opts = opts || {};

  var defaults = {
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
    var start = domain[0].valueOf(), end = domain[1].valueOf();
    stats.getData(start, end);
    stats.draw();
  });

  _.defaults(opts, defaults);

  var widgetGroup;

  var puddles = [];

  function stats(selection) {
    widgetGroup = selection;
    stats.initialize();
  }

  stats.initialize = _.once(function() {
    // move this group inside the container's axisGutter
    widgetGroup.attr({
      'transform': 'translate(' + opts.xPosition + ",0)"
    });
    // create basal-to-bolus ratio puddle
    stats.newPuddle('Ratio', 'Basal : Bolus', 'Basal to bolus insulin ratio', true);
    // create time-in-range puddle
    stats.newPuddle('Range', 'Time in Target Range', 'Target range: 80 - 180 mg/dL', true);
    // create average BG puddle
    stats.newPuddle('Average', 'Average BG', 'For these two weeks', false);
    puddles.forEach(function(puddle, i) {
      var puddleGroup = widgetGroup.append('g')
        .attr({
          'transform': 'translate(' + ((pool.width() / 3) * i) + ',0)',
          'class': 'd3-stats',
          'id': 'puddle_' + puddle.id
        });
      puddleGroup.call(puddle);
    });
  });

  stats.draw = function() {
    puddles.forEach(function(puddle) {
      var puddleGroup = d3.select('#puddle_' + puddle.id);
      if (puddle.pie) {
        var thisPie = _.find(pies, function(p) {
          return p.id === puddle.id;
        });
        if (!thisPie) {
          var slices = stats.createPie(puddleGroup, data[puddle.id.toLowerCase()]);
          pies.push({
            'id': puddle.id,
            'slices': slices
          });
        }
        else {
          log('Updating pie...');
          stats.updatePie(thisPie, data[puddle.id.toLowerCase()]);
        }
      }
      var display = stats.getDisplay(puddle.id);
      puddle.dataDisplay(puddleGroup, display);
    });
  };

  stats.createPie = function(puddleGroup, data) {
    var xOffset = (pool.width()/3) * (1/6);
    var yOffset = pool.height() / 2;
    var pieGroup = puddleGroup.append('g')
      .attr({
        'transform': 'translate(' + xOffset + ',' + yOffset + ')',
        'class': 'd3-stats-pie'
      });

    pie = d3.layout.pie().value(function(d) {
      return d.value;
    });

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
  };

  stats.updatePie = function(thisPie, data) {
    thisPie.slices.data(pie(data))
      .attr({
        'd': arc
      });
  };

  stats.newPuddle = function(id, head, lead, pieBoolean) {
    var p = new puddle({
      'id': id,
      'head': head,
      'lead': lead,
      'width': pool.width()/3,
      'height': pool.height(),
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
        'text': stats.formatPercentage(basal/total) + ' : ',
        'class': 'd3-stats-basal'
      },
      {
        'text': stats.formatPercentage(bolus/total),
        'class': 'd3-stats-bolus'
      }];
  };

  stats.rangeDisplay = function() {
    var target = _.findWhere(data.range, {'type': 'bg-target'}).value;
    var total = parseFloat(data.cbgReadings);
    return [{'text': stats.formatPercentage(target/total), 'class': 'd3-stats-percentage'}];
  };

  stats.averageDisplay = function() {
    return [{'text': data.average.value + ' mg/dL', 'class': 'd3-stats-' + data.average.category}];
  };

  stats.getData = function(start, end) {
    data.ratio = [
      {
        'type': 'bolus',
        'value': opts.bolus.totalBolus(start, end)
      },
      {
        'type': 'basal',
        'value': opts.basal.totalBasal(start, end)
      }];
    var range = opts.cbg.rangeBreakdown(start, end);
    data.range = [
      {
        'type': 'bg-low',
        'value': range.low || 0,
      },
      {
        'type': 'bg-target',
        'value': range.target || 0,
      },
      {
        'type': 'bg-high',
        'value': range.high || 0
      }];
    data.cbgReadings = range.total;
    data.average = opts.cbg.average(start, end);
  };

  stats.formatPercentage = function(f) {
    return parseInt(f.toFixed(2) * 100, 10) + '%';
  };

  return stats;
};
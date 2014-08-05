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

var d3 = require('d3');
var _ = require('lodash');

var format = require('../data/util/format');
var log = require('bows')('Basal');

module.exports = function(pool, opts) {
  opts = opts || {};

  var defaults = {};

  function rowHeightFn(numSchedules) {
    return function() {
      return pool.height() / numSchedules;
    };
  }

  opts = _.defaults(opts, defaults);

  var mainGroup = pool.parent();

  function basaltab(selection) {
    opts.xScale = pool.xScale().copy();

    if (pool.hidden()) {
      return;
    }

    selection.each(function(currentData) {
      var data = _.groupBy(currentData, 'schedule');
      var numSchedules = Object.keys(data).length;
      opts.rowHeight = rowHeightFn(numSchedules)();
      var index = 0;
      var schedules = Object.keys(data);
      // remove 'Standard' from array if present and put it at the beginning instead
      var standardIndex = _.findIndex(schedules, basaltab.isStandard);
      if (standardIndex !== -1) {
        var standard = schedules[standardIndex];
        schedules.splice(standardIndex, 1);
        schedules.sort();
        schedules.unshift(standard);
      }
      else {
        schedules.sort();
      }
      var actualSchedules = [];
      for (var i = 0; i < schedules.length; ++i) {
        var key = schedules[i];
        // must check that schedule actually exists
        // schedule names come through for empty schedules
        if (data[key] != null) {
          actualSchedules.push(key);
          var type = data[key][0].type;
          var tabsGroup = selection.selectAll('#' + pool.id() + '_' + type + '_' + basaltab.scheduleName(key)).data([key]);
          tabsGroup.enter().append('g').attr('id', pool.id() + '_' + type + '_' + basaltab.scheduleName(key))
            .attr('transform', selection.attr('transform'));
          var tabs = tabsGroup.selectAll('g.d3-cell-group.d3-' + basaltab.scheduleName(key))
            .data(data[key], basaltab.id);
          var cellGroups = tabs.enter().append('g')
            .attr({
              'class': 'd3-cell-group d3-' + basaltab.scheduleName(key),
              'clip-path': 'url(#mainClipPath)',
              id: function(d) { return 'cell_group_' + d.id; }
            });

          cellGroups.append('rect')
            .attr({
              x: basaltab.xPosition,
              y: index * opts.rowHeight,
              width: basaltab.width,
              height: opts.rowHeight,
              'class': basaltab.matchClass,
              id: function(d) { return 'cell_rect_' + d.id; }
            })
            .classed('d3-cell-rect', true);

          cellGroups.append('text')
            .attr({
              x: function(d) {
                return basaltab.xPosition(d) + (basaltab.width(d) / 2);
              },
              y: (index * opts.rowHeight) + (opts.rowHeight/2),
              'class': basaltab.matchClass,
              id: function(d) { return 'cell_label_' + d.id; }
            })
            .classed('d3-cell-label', true)
            .text(function(d) {
              if (String(d.value).indexOf('.') === -1) {
                return d.value.toFixed(1);
              }
              else return d.value;
            })
            .each(function(d) {
              if (this.getBBox().width > basaltab.width(d)) {
                d3.select(this).attr('display', 'none');
              }
            });

          tabs.exit().remove();
          index++;
        }
      }
      basaltab.addLabels(actualSchedules);
    });
  }

  basaltab.id = function(d) {
    return d.id;
  };

  basaltab.scheduleName = function(key) {
    return key.replace(' ', '_').toLowerCase();
  };

  basaltab.matchClass = function(d) {
    if (d.actualized) {
      return 'd3-matched';
    }
    else {
      return 'd3-unmatched';
    }
  };

  basaltab.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  basaltab.width = function(d) {
    var s = Date.parse(d.normalTime), e = Date.parse(d.normalEnd);
    return opts.xScale(e) - opts.xScale(s);
  };

  basaltab.isStandard = function(str) {
    var str = str.toLowerCase();
    if (str === 'standard') {
      return true;
    }
    return false;
  };

  basaltab.addLabels = function(names) {
    var printNames = [];
    for (var i = 0; i < names.length; ++i) {
      if (basaltab.isStandard(names[i])) {
        printNames.push('Std-');
      }
      else if (names[i].toLowerCase().search('program') !== -1) {
        printNames.push(names[i].toLowerCase().replace('program', '').trim().toUpperCase() + '-');
      }
      else if (names[i].toLowerCase().search('pattern') !== -1) {
        printNames.push(names[i].toLowerCase().replace('pattern', '').trim().toUpperCase() + '-');
      }
    }
    var labelsGroup = mainGroup.select('#' + pool.id()).selectAll('#' + pool.id() + '_labels').data([names]);
    labelsGroup.enter().append('g').attr('id', pool.id() + '_labels');
    var labels = labelsGroup.selectAll('text').data(printNames);
    labels.enter()
      .append('text')
      .attr({
        // this retrieves the container axisGutter...something of a hack
        x: mainGroup.select('#mainClipPath').select('rect').attr('x'),
        y: function(d, i) { return i * opts.rowHeight + (opts.rowHeight/2); },
        'class': 'd3-row-label',
        'xml:space': 'preserve'
      })
      .text(function(d) { return d; });
  };

  return basaltab;
};
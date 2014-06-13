/* 
 * == BSD2 LICENSE ==
 */

var d3 = require('../lib/').d3;
var _ = require('../lib/')._;

var format = require('../data/util/format');
var log = require('../lib/').bows('Basal');

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

    selection.each(function(currentData) {
      var data = _.groupBy(currentData, 'schedule');
      var numSchedules = Object.keys(data).length;
      opts.rowHeight = rowHeightFn(numSchedules)();
      var index = 0;
      var schedules = Object.keys(data);
      // remove 'Standard' from array if present and put it at the beginning instead
      schedules.splice(_.findIndex(schedules, basaltab.isStandard), 1);
      schedules.sort();
      schedules.unshift('Standard');
      for (var i = 0; i < schedules.length; ++i) {
        var key = schedules[i];
        var tabsGroup = selection.selectAll('#' + pool.id() + '_' + key.replace(' ', '_')).data([data[key]]);
        tabsGroup.enter().append('g').attr('id', pool.id() + '_' + key.replace(' ', '_'))
          .attr('transform', selection.attr('transform'));
        var tabs = tabsGroup.selectAll('g.d3-cell-group.d3-' + key.replace(' ','-').toLowerCase())
          .data(data[key], basaltab.id);

        var cellGroups = tabs.enter().append('g')
          .attr({
            'class': 'd3-cell-group ' + key.replace(' ','-').toLowerCase(),
            id: function(d) { return 'd3-cell-group_' + d.id; }
          });

        cellGroups.append('rect')
          .attr({
            x: basaltab.xPosition,
            y: index * opts.rowHeight,
            width: basaltab.width,
            height: opts.rowHeight,
            'class': basaltab.matchClass,
            id: function(d) { return 'd3-cell-rect_' + d.id; }
          })
          .classed('d3-cell-rect', true);

        cellGroups.append('text')
          .attr({
            x: function(d) {
              return basaltab.xPosition(d) + (basaltab.width(d) / 2);
            },
            y: (index * opts.rowHeight) + (opts.rowHeight/2),
            'class': basaltab.matchClass,
            id: function(d) { return 'd3-cell-label_' + d.id; }
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
    });
  }

  basaltab.matchClass = function(d) {
    // TODO: change this when matching against actual basals
    // just using `active` property for now to test viz
    if (d.active) {
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

  basaltab.isStandard = function(el) {
    if (el === 'Standard') {
      return true;
    }
    return false;
  };

  return basaltab;
};
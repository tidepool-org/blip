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

var d3 = require('../lib/').d3;
var _ = require('../lib/')._;

var Duration = require('../lib/').Duration;
var format = require('../data/util/format');
var log = require('../lib/').bows('Basal');

module.exports = function(pool, opts) {

  var QUARTER = ' ¼', HALF = ' ½', THREE_QUARTER = ' ¾', THIRD = ' ⅓', TWO_THIRDS = ' ⅔';

  opts = opts || {};

  var defaults = {
    classes: {
      'reg': {'tooltip': 'basal_tooltip_reg.svg', 'height': 20},
      'temp': {'tooltip': 'basal_tooltip_temp_large.svg', 'height': 40}
    },
    tooltipWidth: 180,
    pathStroke: 1.5,
    opacity: 0.3,
    opacityDelta: 0.1
  };

  _.defaults(opts, defaults);

  function basal(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      // to prevent blank rectangle at beginning of domain
      var index = opts.data.indexOf(currentData[0]);
      // when near left edge currentData[0] will have index 0, so we don't want to decrement it
      if (index !== 0) {
        index--;
      }
      while ((index >= 0) && (opts.data[index].vizType !== 'actual')) {
        index--;
      }
      // when index === 0 might catch a non-basal
      if (opts.data[index].type === 'basal-rate-segment') {
        currentData.unshift(opts.data[index]);
      }

      var originalLength = currentData.length;

      // remove a basal segment if it has an invalid value attribute
      var removed = [];
      currentData = _.filter(currentData, function(d) {
        if (!(d.value >= 0)) {
          removed.push(d);
        }
        return d.value >= 0;
      });
      if (originalLength !== currentData.length) {
        log(originalLength - currentData.length, 'basal segment(s) removed because of an invalid value attribute.', removed);
        log('Basal/bolus ratio killed due to ^^^');
      }

      var line = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate('step-after');

      var actual = _.where(currentData, {'vizType': 'actual'});
      var undelivered = _.where(opts.data, {'vizType': 'undelivered', 'deliveryType': 'scheduled'});

      // TODO: remove this when we have guaranteed unique IDs for each basal rate segment again
      currentData.forEach(function(d) {
        if ((d._id.search('_actual') === -1) && (d._id.search('_undelivered') === -1)) {
          d._id = d._id + '_' + d.start.replace(/:/g, '') + '_' + d.vizType;
        }
      });

      basal.addAnnotations(_.filter(currentData, function(d) { return d.annotations; }));

      var rects = d3.select(this)
        .selectAll('g')
        .data(currentData, function(d) {
          return d._id;
        });
      var rectGroups = rects.enter()
        .append('g')
        .attr('class', 'd3-basal-group')
        .attr('id', function(d) {
          return 'basal_group_' + d._id;
        });
      // add actual basal fill rects
      rectGroups.filter(function(d){
        if (d.vizType === 'actual') {
          return d;
        }
      })
        .append('rect')
        .attr({
          'width': function(d) {
            return basal.width(d);
          },
          'height': function(d) {
            var height = pool.height() - opts.yScale(d.value);
            if (height < 0) {
              return 0;
            }
            else {
              return height;
            }
          },
          'x': function(d) {
            return opts.xScale(new Date(d.normalTime));
          },
          'y': function(d) {
            return opts.yScale(d.value);
          },
          'opacity': '0.3',
          'class': function(d) {
            var classes;
            if (d.deliveryType === 'temp') {
              classes = 'd3-basal d3-rect-basal d3-basal-temp';
            }
            else {
              classes = 'd3-basal d3-rect-basal';
            }
            if (d.delivered !== 0) {
              classes += ' d3-rect-basal-nonzero';
            }
            return classes;
          },
          'id': function(d) {
            return 'basal_' + d._id;
          }
        });

      // add invisible rect for tooltips based on all scheduleds
      // (otherwise can't hover on a temp of 0 to get info)
      rectGroups.filter(function(d) {
        if (d.deliveryType !== 'temp') {
          return d;
        }
      })
        .append('rect')
        .attr({
          'width': function(d) {
            return basal.width(d);
          },
          'height': pool.height(),
          'x': function(d) {
            return opts.xScale(new Date(d.normalTime));
          },
          'y': function(d) {
            return opts.yScale.range()[1];
          },
          'class': function(d) {
            if (d.vizType === 'undelivered') {
              return 'd3-basal d3-basal-invisible d3-basal-temp';
            }
            else {
              return 'd3-basal d3-basal-invisible';
            }
          },
          'id': function(d) {
            return 'basal_invisible_' + d._id;
          }
        });

      // it turns out for Animas the assumption that the actuals stream is complete
      // is wrong because there can be missing undelivereds
      // so we need another target (i.e., more invisible rects)
      rectGroups.filter(function(d) {
        // select all basal groups that only have a regular rect in them, missing an invisi-rect
        if (d3.select('#basal_group_' + d._id).selectAll('.d3-basal-invisible')[0][0] == null) {
          return d;
        }
      })
        .append('rect')
        .attr({
          'width': function(d) {
            return basal.width(d);
          },
          'height': pool.height(),
          'x': function(d) {
            return opts.xScale(new Date(d.normalTime));
          },
          'y': function(d) {
            return opts.yScale.range()[1];
          },
          'class': function(d) {
            return 'd3-basal d3-basal-invisible d3-basal-without-undelivered';
          },
          'id': function(d) {
            return 'basal_invisible_' + d._id;
          }
        });

      rectGroups.filter(function(d) {
          if (d.delivered !== 0) {
            return d;
          }
        })
        .selectAll('.d3-basal-invisible')
        .classed('d3-basal-nonzero', true);

      // remove stale rects
      rects.exit().remove();

      var basalGroup = d3.select(this);

      var actualPaths = [[]], actualPathsIndex = 0;

      var pushPoints = function(d, actualPathsIndex) {
        actualPaths[actualPathsIndex].push({
          'x': opts.xScale(new Date(d.normalTime)),
          'y': opts.yScale(d.value) - opts.pathStroke / 2
        },
        {
          'x': opts.xScale(new Date(d.normalEnd)),
          'y': opts.yScale(d.value) - opts.pathStroke / 2
        });
      };

      _.map(actual, function(d, i, segments) {
        // if the segment is any one but the last
        // current segment's normalEnd should === next segment's normalTime
        if ((i < actual.length - 1) && (d.normalEnd === segments[i + 1].normalTime)) {
          pushPoints(d, actualPathsIndex);
        }
        else {
          pushPoints(d, actualPathsIndex);
          actualPaths.push([]);
          actualPathsIndex += 1;
        }
      });

      d3.selectAll('.d3-path-basal').remove();
      // don't draw an actual path if you've removed any segments for having an invalid value attribute
      if (originalLength === currentData.length) {
        actualPaths.forEach(function(path) {
          d3.select(this).append('path')
            .attr({
            'd': line(path),
            'class': 'd3-basal d3-path-basal'
          });
        }, this);
      }
      else {
        log('Not drawing actual basal path because there were one or more basal segments with an invalid value attribute.');
      }

      if (undelivered.length !== 0) {
        var undeliveredSequences = [];
        var contiguous = [];
        undelivered.forEach(function(segment, i, segments) {
          if ((i < (segments.length - 1)) && (segment.end === segments[i + 1].start)) {
            segment.contiguousWith = 'next';
          }
          else if ((i !== 0) && (segments[i - 1].end === segment.start)) {
            segment.contiguousWith = 'previous';
          }
          else {
            segment.contiguousWith = 'none';
            undeliveredSequences.push([segment]);
          }
        });
        undelivered = undelivered.reverse();

        var anchors = _.where(undelivered, {'contiguousWith': 'previous'});

        anchors.forEach(function(anchor) {
          var index = undelivered.indexOf(anchor);
          contiguous.push(undelivered[index]);
          index++;
          while (undelivered[index].contiguousWith === 'next') {
            contiguous.push(undelivered[index]);
            index++;
            if (index > (undelivered.length - 1)) {
              break;
            }
          }
          undeliveredSequences.push(contiguous);
          contiguous = [];
        });

        undeliveredSequences.forEach(function(seq) {
          seq = seq.reverse();
          var pathPoints = _.map(seq, function(segment) {
            return [{
              'x': opts.xScale(new Date(segment.normalTime)),
              'y': opts.yScale(segment.value)
            },
            {
              'x': opts.xScale(new Date(segment.normalEnd)),
              'y': opts.yScale(segment.value)
            }];
          });
          pathPoints = _.flatten(pathPoints);
          pathPoints = _.uniq(pathPoints, function(point) {
            return JSON.stringify(point);
          });

          basalGroup.append('path')
            .attr({
              'd': line(pathPoints),
              'class': 'd3-basal d3-path-basal d3-path-basal-undelivered'
            });
        });

        basal.linkTemp(_.where(actual, {'deliveryType': 'temp'}), undelivered);
      }

      // tooltips
      // only try to make tooltips if we're not excluding any segments due to invalid value attribute
      if (originalLength === currentData.length) {
        d3.selectAll('.d3-basal-invisible').on('mouseover', function() {
          var invisiRect = d3.select(this);
          var id = invisiRect.attr('id').replace('basal_invisible_', '');
          var d = d3.select('#basal_group_' + id).datum();
          if (invisiRect.classed('d3-basal-temp')) {
            var tempD = _.clone(_.findWhere(actual, {'deliveryType': 'temp', '_id': d.link.replace('link_', '')}));
            tempD._id = d._id;
            basal.addTooltip(tempD, 'temp', d);
          }
          else {
            basal.addTooltip(d, 'reg');
          }
          if (invisiRect.classed('d3-basal-nonzero')) {
            if (invisiRect.classed('d3-basal-temp')) {
              d3.select('#basal_' + d.link.replace('link_', '')).attr('opacity', opts.opacity + opts.opacityDelta);
            }
            else {
              d3.select('#basal_' + id).attr('opacity', opts.opacity + opts.opacityDelta);
            }
          }
        });
        d3.selectAll('.d3-basal-invisible').on('mouseout', function() {
          var invisiRect = d3.select(this);
          var id = invisiRect.attr('id').replace('basal_invisible_', '');
          var d = d3.select('#basal_group_' + id).datum();
          d3.select('#tooltip_' + id).remove();
          if (invisiRect.classed('d3-basal-temp')) {
            d3.select('#basal_' + d.link.replace('link_', '')).attr('opacity', opts.opacity);
          }
          else {
            d3.select('#basal_' + id).attr('opacity', opts.opacity);
          }
        });
      }
      else {
        log('Tooltips suppressed because segment(s) with invalid value attribute present.');
      }
    });
  }

  basal.linkTemp = function(toLink, referenceArray) {
    referenceArray = referenceArray.slice(0);
    referenceArray = _.sortBy(referenceArray, function(segment) {
      return Date.parse(segment.normalTime);
    });
    toLink.forEach(function(segment, i, segments) {
      var start = _.findWhere(referenceArray, {'normalTime': segment.normalTime});
      if (start === undefined) {
        return;
      }
      var startIndex = referenceArray.indexOf(start);
      if ((startIndex < (referenceArray.length - 1)) && (start.end === referenceArray[startIndex + 1].start)) {
        var end = _.findWhere(referenceArray, {'normalEnd': segment.normalEnd});
        var endIndex = referenceArray.indexOf(end);
        var index = startIndex;
        while (index <= endIndex) {
          referenceArray[index].link = 'link_' + segment._id;
          index++;
        }
      }
      else {
        referenceArray[startIndex].link = 'link_' + segment._id;
      }
    });
  };

  basal.timespan = function(d) {
    var start = Date.parse(d.normalTime);
    var end = Date.parse(d.normalEnd);
    var diff = end - start;
    var dur = Duration.parse(diff + 'ms');
    var hours = dur.hours();
    var minutes = dur.minutes() - (hours * 60);
    if (hours !== 0) {
      if (hours === 1) {
        switch(minutes) {
        case 0:
          return 'over ' + hours + ' hr';
        case 15:
          return 'over ' + hours + QUARTER + ' hr';
        case 20:
          return 'over ' + hours + THIRD + ' hr';
        case 30:
          return 'over ' + hours + HALF + ' hr';
        case 40:
          return 'over ' + hours + TWO_THIRDS + ' hr';
        case 45:
          return 'over ' + hours + THREE_QUARTER + ' hr';
        default:
          // zero-pad minutes when displaying as clock
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          return 'over ' + hours + ':' + minutes;
        }
      }
      else {
        switch(minutes) {
        case 0:
          return 'over ' + hours + ' hrs';
        case 15:
          return 'over ' + hours + QUARTER + ' hrs';
        case 20:
          return 'over ' + hours + THIRD + ' hrs';
        case 30:
          return 'over ' + hours + HALF + ' hrs';
        case 40:
          return 'over ' + hours + TWO_THIRDS + ' hrs';
        case 45:
          return 'over ' + hours + THREE_QUARTER + ' hrs';
        default:
          // zero-pad minutes when displaying as clock
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          return 'over ' + hours + ':' + minutes;
        }
      }
    }
    else {
      return 'over ' + minutes + ' min';
    }
  };

  basal.width = function(d) {
    return opts.xScale(new Date(d.normalEnd)) - opts.xScale(new Date(d.normalTime));
  };

  basal.addTooltip = function(d, category, unD) {
    var tooltipHeight = opts.classes[category].height;

    // TODO: if we decide to keep same formatValue for basal and bolus, factor this out into a util/ module
    var formatValue = function(x) {
      var formatted = d3.format('.3f')(x);
      // remove zero-padding on the right
      while (formatted[formatted.length - 1] === '0') {
        formatted = formatted.slice(0, formatted.length - 1);
      }
      if (formatted[formatted.length - 1] === '.') {
        formatted = formatted + '0';
      }
      return formatted;
    };

    d3.select('#tidelineTooltips_basal')
      .call(pool.tooltips(),
        d,
        // tooltipXPos
        opts.xScale(Date.parse(d.normalTime)),
        'basal',
        // timestamp
        false,
        opts.classes[category].tooltip,
        opts.tooltipWidth,
        tooltipHeight,
        // imageX
        opts.xScale(Date.parse(d.normalTime)) - opts.tooltipWidth / 2 + basal.width(d) / 2,
        // imageY
        function() {
          var y = opts.yScale(d.value) - tooltipHeight * 2;
          if (y < 0) {
            return 0;
          }
          else {
            return y;
          }
        },
        // textX
        opts.xScale(Date.parse(d.normalTime)) + basal.width(d) / 2,
        // textY
        function() {
          var y = opts.yScale(d.value) - tooltipHeight * 2;
          if (category === 'temp') {
            if (y < 0) {
              return tooltipHeight * (3 / 10);
            }
            else {
              return opts.yScale(d.value) - tooltipHeight * 1.7;
            }
          }
          else {
            if (y < 0) {
              return tooltipHeight / 2;
            }
            else {
              return opts.yScale(d.value) - tooltipHeight * 1.5;
            }
          }
        },
        // customText
        (function() {
          if (d.value === 0) {
            return '0.0U/hr';
          }
          else {
            if (d.percent) {
              return format.percentage(d.percent);
            }
            return formatValue(d.value) + 'U/hr';
          }
        }()),
        // tspan
        basal.timespan(d));
    if (category === 'temp') {
      d3.select('#tooltip_' + d._id).select('.d3-tooltip-text-group').append('text')
        .attr({
          'class': 'd3-tooltip-text d3-basal',
          'x': opts.xScale(Date.parse(d.normalTime)) + basal.width(d) / 2,
          'y': function() {
            var y = opts.yScale(d.value) - tooltipHeight * 2;
            if (y < 0) {
              return tooltipHeight * (7 / 10);
            }
            else {
              return opts.yScale(d.value) - tooltipHeight * 1.3;
            }
          }
        })
        .append('tspan')
        .text('(' + formatValue(unD.value) + 'U/hr sched.)');
    }
  };

  basal.addAnnotations = function(data, selection) {
    _.each(data, function(d) {
      var annotationOpts = {
        'x': opts.xScale(Date.parse(d.normalTime)),
        'y': opts.yScale(0),
        'xMultiplier': 2,
        'yMultiplier': 2.5,
        'orientation': {
          'up': true
        },
        'd': d
      };
      if (d3.select('#annotation_for_' + d._id)[0][0] == null) {
        d3.select('#tidelineAnnotations_basal-rate-segment').call(pool.annotations(), annotationOpts);
      }
    });
  };

  return basal;
};

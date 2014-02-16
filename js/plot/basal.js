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

var log = require('bows')('Basal');

var Duration = require('duration-js');

module.exports = function(pool, opts) {

  var QUARTER = ' ¼', HALF = ' ½', THREE_QUARTER = ' ¾', THIRD = ' ⅓', TWO_THIRDS = ' ⅔';

  opts = opts || {};

  var defaults = {
    classes: {
      'reg': {'tooltip': 'basal_tooltip_reg.svg', 'height': 20},
      'temp': {'tooltip': 'basal_tooltip_temp_large.svg', 'height': 40}
    },
    tooltipWidth: 144,
    xScale: pool.xScale().copy(),
    pathStroke: 1.5
  };

  _.defaults(opts, defaults);

  function basal(selection) {
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

      var line = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate('step-after');

      var actual = _.where(currentData, {'vizType': 'actual'});
      var undelivered = _.where(opts.data, {'vizType': 'undelivered', 'deliveryType': 'scheduled'});

      // TODO: remove this when we have guaranteed unique IDs for each basal rate segment again
      currentData.forEach(function(d) {
        if ((d.id.search('_actual') === -1) && (d.id.search('_undelivered') === -1)) {
          d.id = d.id + '_' + d.start.replace(/:/g, '') + '_' + d.vizType;
        }
      });

      var rects = d3.select(this)
        .selectAll('g')
        .data(currentData, function(d) {
          return d.id;
        });
      var rectGroups = rects.enter()
        .append('g')
        .attr('class', 'd3-basal-group')
        .attr('id', function(d) {
          return 'basal_group_' + d.id;
        });
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
            return 'basal_' + d.id;
          }
        });
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
            return 'basal_invisible_' + d.id;
          }
        });
      rectGroups.filter(function(d) {
          if (d.delivered !== 0) {
            return d;
          }
        })
        .selectAll('.d3-basal-invisible')
        .classed('d3-basal-nonzero', true);
      rects.exit().remove();

      var basalGroup = d3.select(this);

      var actualPoints = [];

      actual.forEach(function(d) {
        actualPoints.push({
          'x': opts.xScale(new Date(d.normalTime)),
          'y': opts.yScale(d.value) - opts.pathStroke / 2,
        },
        {
          'x': opts.xScale(new Date(d.normalEnd)),
          'y': opts.yScale(d.value) - opts.pathStroke / 2,
        });
      });

      d3.selectAll('.d3-path-basal').remove();

      d3.select(this).append('path')
        .attr({
        'd': line(actualPoints),
        'class': 'd3-basal d3-path-basal'
      });

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

        basal.link_temp(_.where(actual, {'deliveryType': 'temp'}), undelivered);
      }

      // tooltips
      d3.selectAll('.d3-basal-invisible').on('mouseover', function() {
        var invisiRect = d3.select(this);
        var id = invisiRect.attr('id').replace('basal_invisible_', '');
        var d = d3.select('#basal_group_' + id).datum();
        if (invisiRect.classed('d3-basal-temp')) {
          var tempD = _.clone(_.findWhere(actual, {'deliveryType': 'temp', 'id': d.link.replace('link_', '')}));
          tempD.id = d.id;
          basal.addTooltip(tempD, 'temp', d);
        }
        else {
          basal.addTooltip(d, 'reg');
        }
        if (invisiRect.classed('d3-basal-nonzero')) {
          if (invisiRect.classed('d3-basal-temp')) {
            d3.select('#basal_' + d.link.replace('link_', '')).attr('opacity', '0.35');
          }
          else {
            d3.select('#basal_' + id).attr('opacity', '0.35');
          }
        }
      });
      d3.selectAll('.d3-basal-invisible').on('mouseout', function() {
        var invisiRect = d3.select(this);
        var id = invisiRect.attr('id').replace('basal_invisible_', '');
        var d = d3.select('#basal_group_' + id).datum();
        d3.select('#tooltip_' + id).remove();
        if (invisiRect.classed('d3-basal-temp')) {
          d3.select('#basal_' + d.link.replace('link_', '')).attr('opacity', '0.3');
        }
        else {
          d3.select('#basal_' + id).attr('opacity', '0.3');
        }
      });
    });
  }

  basal.link_temp = function(toLink, referenceArray) {
    referenceArray = referenceArray.slice(0);
    referenceArray = _.sortBy(referenceArray, function(segment) {
      return Date.parse(segment.normalTime);
    });
    toLink.forEach(function(segment, i, segments) {
      var start = _.findWhere(referenceArray, {'normalTime': segment.normalTime});
      if (start === undefined) {
        log(segment, referenceArray);
      }
      var startIndex = referenceArray.indexOf(start);
      if ((startIndex < (referenceArray.length - 1)) && (start.end === referenceArray[startIndex + 1].start)) {
        var end = _.findWhere(referenceArray, {'normalEnd': segment.normalEnd});
        var endIndex = referenceArray.indexOf(end);
        var index = startIndex;
        while (index <= endIndex) {
          referenceArray[index].link = 'link_' + segment.id;
          index++;
        }
      }
      else {
        referenceArray[startIndex].link = 'link_' + segment.id;
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
          case 0: return 'over ' + hours + ' hr';
          case 15: return 'over ' + hours + QUARTER + ' hr';
          case 20: return 'over ' + hours + THIRD + ' hr';
          case 30: return 'over ' + hours + HALF + ' hr';
          case 40: return 'over ' + hours + TWO_THIRDS + ' hr';
          case 45: return 'over ' + hours + THREE_QUARTER + ' hr';
          default: return 'over ' + hours + ' hr ' + minutes + ' min';
        }
      }
      else {
        switch(minutes) {
          case 0: return 'over ' + hours + ' hrs';
          case 15: return 'over ' + hours + QUARTER + ' hrs';
          case 20: return 'over ' + hours + THIRD + ' hrs';
          case 30: return 'over ' + hours + HALF + ' hrs';
          case 40: return 'over ' + hours + TWO_THIRDS + ' hrs';
          case 45: return 'over ' + hours + THREE_QUARTER + ' hrs';
          default: return 'over ' + hours + ' hrs ' + minutes + ' min';
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
    d3.select('#' + 'd3-tooltip-group_basal').call(tooltips,
        d,
        // tooltipXPos
        opts.xScale(Date.parse(d.normalTime)),
        'basal',
        // timestamp
        false,
        opts.classes[category]['tooltip'],
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
        function() {
          if (d.value === 0) {
            return '0.0 U';
          }
          else {
            return d.value + ' U';
          }
        }(),
        basal.timespan(d));
    if (category === 'temp') {
      d3.select('#tooltip_' + d.id).append('text')
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
        .text('(' + unD.value + ' U scheduled)');
    }
  };

  return basal;
};

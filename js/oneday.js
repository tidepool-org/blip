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

var Pool = require('./pool');
var annotation = require('./plot/util/annotations/annotation');
var Tooltips = require('./plot/util/tooltips/tooltip');
var dt = require('./data/util/datetime');

var log = require('bows')('One Day');

module.exports = function(emitter, opts) {

  opts = opts || {};
  var defaults = {
    timePrefs: {
      timezoneAware: false,
      timezoneName: dt.getBrowserTimezone(),
    }
  };
  _.defaults(opts, defaults);

  // constants
  var MS_IN_24 = 86400000;

  // basic attributes
  var id,
    minWidth = 300, minHeight = 400,
    width = minWidth, height = minHeight,
    poolScaleHeight,
    nav = {
      scrollNav: true,
      scrollNavHeight: 50,
      scrollGutterHeight: 20,
      scrollThumbRadius: 24,
      currentTranslation: 0
    },
    axisGutter = 40, gutter = 40,
    buffer = 2,
    pools = [], poolGroup,
    xScale = d3.time.scale.utc(),
    currentCenter, data, tidelineData, renderedData = [], endpoints,
    mainSVG, mainGroup,
    scrollNav, scrollHandleTrigger = true, mostRecent = false, annotations, tooltips;

  container.dataFill = {};

  emitter.on('clickInPool', function(offset) {
    var leftEdge = xScale(xScale.domain()[0]);
    var date = xScale.invert(leftEdge + offset - container.axisGutter());
    if (!opts.timePrefs.timezoneAware) {
      var offsetMinutes = new Date(date).getTimezoneOffset();
      date.setUTCMinutes(date.getUTCMinutes() + offsetMinutes);
      emitter.emit('clickTranslatesToDate', date);
    }
    else {
      emitter.emit('clickTranslatesToDate', date);
    }
  });

  function container(selection) {
    mainSVG = selection.append('svg');

    mainGroup = mainSVG.append('g').attr('id', 'tidelineMain');

    // update SVG dimenions and ID
    mainSVG.attr({
      'id': id,
      'width': width,
      'height': height
    });

    poolGroup = mainGroup.append('g').attr('id', 'tidelinePools').attr('clip-path', 'url(#mainClipPath)');

    mainGroup.append('g')
      .attr('id', 'tidelineLabels');

    mainGroup.append('g')
      .attr('id', 'tidelineYAxes');

    if (nav.scrollNav) {
      scrollNav = mainGroup.append('g')
        .attr('class', 'x scroll')
        .attr('id', 'tidelineScrollNav');
    }

    mainSVG.insert('clipPath', '#tidelineMain')
      .attr('id', 'mainClipPath')
      .append('rect')
      .attr({
        'x': container.axisGutter(),
        'y': 0,
        'width': container.width() - container.axisGutter(),
        'height': container.height()
      });
  }

  // non-chainable methods
  container.panForward = function() {
    log('Jumped forward a day.');
    nav.currentTranslation -= width - axisGutter;
    var n = 0;
    emitter.emit('inTransition', true);
    mainGroup.transition()
      .duration(500).tween('zoom', function() {
      var ix = d3.interpolate(nav.currentTranslation + width - axisGutter, nav.currentTranslation);
      return function(t) {
        nav.pan.translate([ix(t), 0]);
        nav.pan.event(mainGroup);
      };
    })
      .each(function() { ++n; })
      .each('end', function() {
        // this ugly solution courtesy of the man himself: https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
        if (!--n) {
          emitter.emit('inTransition', false);
        }
      });
  };

  container.panBack = function() {
    log('Jumped back a day.');
    nav.currentTranslation += width - axisGutter;
    var n = 0;
    emitter.emit('inTransition', true);
    mainGroup.transition().duration(500).tween('zoom', function() {
      var ix = d3.interpolate(nav.currentTranslation - width + axisGutter, nav.currentTranslation);
      return function(t) {
        nav.pan.translate([ix(t), 0]);
        nav.pan.event(mainGroup);
      };
    })
      .each(function() { ++n; })
      .each('end', function() {
        // this ugly solution courtesy of the man himself: https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
        if (!--n) {
          emitter.emit('inTransition', false);
        }
      });
  };

  container.newPool = function() {
    var p = new Pool(container);
    pools.push(p);
    return p;
  };

  container.poolScaleHeight = function(pools) {
    if (!arguments.length) return poolScaleHeight;
    var cumHeightRatio = 0, cumGutterWeight = 0;
    pools.forEach(function(pool) {
      cumHeightRatio += pool.heightRatio();
      cumGutterWeight += pool.gutterWeight();
    });
    gutter = 0.25 * (container.height() / cumHeightRatio);
    var totalPoolsHeight =
      container.height() - nav.scrollNavHeight - (cumGutterWeight * gutter);
    poolScaleHeight = totalPoolsHeight/cumHeightRatio;
    return container;
  };

  container.arrangePools = function() {
    var visiblePools = _.reject(pools, function(pool) {
      return pool.hidden();
    });
    container.poolScaleHeight(visiblePools);
    visiblePools.forEach(function(pool) {
      pool.height(poolScaleHeight);
    });
    var currentYPosition = 0;
    visiblePools.forEach(function(pool) {
      currentYPosition += gutter * pool.gutterWeight();
      pool.yPosition(currentYPosition);
      currentYPosition += pool.height();
      pool.group().attr('transform', 'translate(0,' + pool.yPosition() + ')');
      if (pool.hidden()) {
        pool.group().attr('display', 'none');
      }
    });
  };

  container.getCurrentDomain = function() {
    var currentDomain = xScale.domain();
    var d = new Date(xScale.domain()[0]);
    return {
      'start': new Date(currentDomain[0]),
      'end': new Date(currentDomain[1]),
      'center': new Date(d.setUTCHours(d.getUTCHours() + 12))
    };
  };

  container.navString = function(a) {
    var currentDomain = container.getCurrentDomain();
    var beginning = a[0];
    var end = a[1];
    emitter.emit('currentDomain', {
      'domain': a
    });
    emitter.emit('navigated', [currentDomain, currentDomain.center.toISOString()]);
    if (a[1].valueOf() === endpoints[1].valueOf()) {
      emitter.emit('mostRecent', true);
    }
    else {
      emitter.emit('mostRecent', false);
    }
  };

  // getters only
  container.svg = function() {
    return mainSVG;
  };

  container.pools = function() {
    return pools;
  };

  container.poolGroup = function() {
    return poolGroup;
  };

  container.annotations = function() {
    return annotations;
  };

  container.tooltips = function() {
    return tooltips;
  };

  container.axisGutter = function() {
    return axisGutter;
  };

  container.dateAtCenter = function() {
    return dt.toISODateString(new Date(container.currentCenter().toISOString()));
  };

  // chainable methods
  container.setAxes = function() {
    // set the domain and range for the main tideline x-scale
    xScale.domain([container.initialEndpoints[0], container.initialEndpoints[1]])
      .range([axisGutter, width]);

    container.currentCenter(container.getCurrentDomain().center);

    if (nav.scrollNav) {
      nav.scrollScale = d3.time.scale.utc()
        .domain([endpoints[0], container.initialEndpoints[0]])
        .range([axisGutter + nav.scrollThumbRadius, width - nav.scrollThumbRadius]);
    }

    pools.forEach(function(pool) {
      pool.xScale(xScale.copy());
    });

    return container;
  };

  container.setNav = function() {
    var maxTranslation = -xScale(endpoints[0]) + axisGutter;
    var minTranslation = -(xScale(endpoints[1])) + width;
    nav.pan = d3.behavior.zoom()
      .scaleExtent([1, 1])
      .x(xScale)
      .on('zoomstart', function() {
        emitter.emit('zoomstart');
      })
      .on('zoom', function() {
        if (dt.toISODateString(container.getCurrentDomain().center) !== container.dateAtCenter()) {
          container.renderedData(xScale.domain());
          if (!mostRecent) {
            for (var j = 0; j < pools.length; j++) {
              pools[j].render(poolGroup, container.renderedData());
            }
          }
          container.currentCenter(container.getCurrentDomain().center);
        }
        var e = d3.event;
        if (e.translate[0] < minTranslation) {
          e.translate[0] = minTranslation;
        }
        else if (e.translate[0] > maxTranslation) {
          e.translate[0] = maxTranslation;
        }
        nav.pan.translate([e.translate[0], 0]);
        for (var i = 0; i < pools.length; i++) {
          pools[i].pan(e);
        }
        mainGroup.select('#tidelineTooltips').attr('transform', 'translate(' + e.translate[0] + ',0)');
        mainGroup.select('#tidelineAnnotations').attr('transform', 'translate(' + e.translate[0] + ',0)');
        if (scrollHandleTrigger) {
          mainGroup.select('.scrollThumb').transition().ease('linear').attr('x', function(d) {
            d.x = nav.scrollScale(xScale.domain()[0]);
            return d.x - nav.scrollThumbRadius;
          });
        }
        else {
          mainGroup.select('.scrollThumb').attr('x', function(d) {
            d.x = nav.scrollScale(xScale.domain()[0]);
            return d.x - nav.scrollThumbRadius;
          });
        }
      })
      .on('zoomend', function() {
        emitter.emit('zoomend');
        container.currentTranslation(nav.latestTranslation);
        // must only call navString *after* updating currentTranslation
        // because of translation adjustment on stats widget no data annotations
        container.navString(xScale.domain());
        if (!scrollHandleTrigger) {
          mainGroup.select('.scrollThumb').attr('x', function(d) {
            return nav.scrollScale(xScale.domain()[0]) - nav.scrollThumbRadius;
          });
        }
        scrollHandleTrigger = true;
      });

    mainGroup.call(nav.pan);

    return container;
  };

  container.setScrollNav = function() {
    var translationAdjustment = axisGutter;
    scrollNav.selectAll('line').remove();
    scrollNav.attr('transform', 'translate(0,'  + (height - (nav.scrollNavHeight * 2/5)) + ')')
      .insert('line', '.scrollThumb')
      .attr({
        'stroke-width': nav.scrollGutterHeight,
        // add and subtract 1/2 of scrollGutterHeight because radius of linecap is 1/2 of stroke-width
        'x1': axisGutter + nav.scrollGutterHeight/2,
        'x2': width - nav.scrollGutterHeight/2,
        'y1': 0,
        'y2': 0
      });

    var dxRightest = nav.scrollScale.range()[1];
    var dxLeftest = nav.scrollScale.range()[0];

    var drag = d3.behavior.drag()
      .origin(function(d) {
        return d;
      })
      .on('dragstart', function() {
        d3.event.sourceEvent.stopPropagation(); // silence the click-and-drag listener
      })
      .on('drag', function(d) {
        d.x += d3.event.dx;
        if (d.x > dxRightest) {
          d.x = dxRightest;
        }
        else if (d.x < dxLeftest) {
          d.x = dxLeftest;
        }
        d3.select(this).attr('x', function(d) { return d.x - nav.scrollThumbRadius; });
        var date = nav.scrollScale.invert(d.x);
        nav.currentTranslation += -xScale(date) + translationAdjustment;
        scrollHandleTrigger = false;
        nav.pan.translate([nav.currentTranslation, 0]);
        nav.pan.event(mainGroup);
      });

    scrollNav.selectAll('rect')
      .data([{'x': nav.scrollScale(container.initialEndpoints[0]), 'y': 0}])
      .enter()
      .append('rect')
      .attr({
        'x': function(d) {
          return d.x - nav.scrollThumbRadius;
        },
        'y': -nav.scrollThumbRadius/3,
        'width': nav.scrollThumbRadius * 2,
        'height': nav.scrollThumbRadius/3 * 2,
        'rx': nav.scrollThumbRadius/3,
        'class': 'scrollThumb'
      })
      .call(drag);

    return container;
  };

  container.setAnnotation = function() {
    var annotationGroup = mainGroup.append('g')
      .attr({
        id: 'tidelineAnnotationsOuter',
        'clip-path': 'url(#mainClipPath)'
      })
      .append('g')
      .attr('id', 'tidelineAnnotations');

    annotations = annotation(container, annotationGroup).id(annotationGroup.attr('id'));
    pools.forEach(function(pool) {
      pool.annotations(annotations);
    });
    return container;
  };

  container.setTooltip = function() {
    var tooltipGroup = mainGroup.append('g')
      .attr('id', 'tidelineTooltips');
    tooltips = new Tooltips(container, tooltipGroup).id(tooltipGroup.attr('id'));
    return container;
  };

  container.setAtDate = function (date, mostRecent) {
    if (!mostRecent) {
      scrollHandleTrigger = false;
      container.currentTranslation(-xScale(date) + axisGutter);
      nav.pan.translate([nav.currentTranslation, 0]);
      nav.pan.event(mainGroup);
    }
    else {
      scrollHandleTrigger = true;
      nav.pan.translate([0,0]);
      nav.pan.event(mainGroup);
      mostRecent = false;
    }

    return container;
  };

  container.destroy = function() {
    emitter.removeAllListeners();
    mainSVG.remove();

    return container;
  };

  // getters and setters
  container.id = function(x) {
    if (!arguments.length) return id;
    if (x.search('tideline') !== -1) {
      id = x.replace('tideline', 'tidelineSVGOneDay');
    }
    else {
      id = 'tidelineSVGOneDay';
    }
    return container;
  };

  container.width = function(x) {
    if (!arguments.length) return width;
    if (x >= minWidth) {
      width = x;
    }
    else {
      width = minWidth;
    }
    return container;
  };

  container.height = function(x) {
    if (!arguments.length) return height;
    var totalHeight = x;
    if (nav.scrollNav) {
      totalHeight += nav.scrollNavHeight;
    }
    if (totalHeight >= minHeight) {
      height = x;
    }
    else {
      height = minHeight;
    }
    return container;
  };

  container.latestTranslation = function(x) {
    if (!arguments.length) return nav.latestTranslation;
    nav.latestTranslation = x;
    return container;
  };

  container.currentTranslation = function(x) {
    if (!arguments.length) return nav.currentTranslation;
    nav.currentTranslation = x;
    return container;
  };

  container.currentCenter = function(x) {
    if (!arguments.length) return currentCenter;
    currentCenter = new Date(x.toISOString());
    return container;
  };

  container.buffer = function(x) {
    if (!arguments.length) return buffer;
    buffer = x;
    return container;
  };

  container.data = function(a) {
    if (!arguments.length) return data;

    if (! (a && Array.isArray(a.data) && a.data.length > 0)) {
      /* jshint ignore:start */
      throw new Error("Sorry, I can't render anything without /some/ data.");
      /* jshint ignore:end */
    }
    else if (a.data.length === 1) {
      /* jshint ignore:start */
      throw new Error("Sorry, I can't render anything with only *one* datapoint.");
      /* jshint ignore:end */
    }

    tidelineData = a;

    data = a.data;

    var first = new Date(data[0].normalTime);
    var lastObj = _.sortBy(data, function(d) {
      return d.normalEnd ? d.normalEnd : d.normalTime;
    }).reverse()[0];
    var last = lastObj.normalEnd ? new Date(lastObj.normalEnd) : new Date(lastObj.normalTime);

    var minusOne = new Date(last);
    minusOne.setUTCHours(minusOne.getUTCHours() - 24);
    container.initialEndpoints = [minusOne, last];

    endpoints = [first, last];
    if (last.valueOf() - first.valueOf() < dt.MS_IN_24) {
      /* jshint ignore:start */
      throw new Error("Sorry, I can't render anything when the endpoints of your data are less than 24 hours apart.");
      /* jshint ignore:end */
    }
    container.endpoints = endpoints;

    return container;
  };

  container.renderedData = function(a) {
    if (!arguments.length) return renderedData;
    var start = new Date(dt.addDays(a[0], -buffer)).toISOString();
    var end = new Date(dt.addDays(a[1], buffer)).toISOString();
    var filtered = tidelineData.dataByDate.filter([start, end]);
    renderedData = filtered.top(Infinity).reverse();

    return container;
  };

  return container;
};

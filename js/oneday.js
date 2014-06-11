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

var d3 = require('./lib/').d3;
var _ = require('./lib/')._;

var Pool = require('./pool');
var annotation = require('./plot/util/annotation');
var tooltip = require('./plot/util/tooltip');
var dt = require('./data/util/datetime');

var log = require('./lib/').bows('One Day');

module.exports = function(emitter) {

  // constants
  var MS_IN_24 = 86400000;

  // basic attributes
  var id,
    minWidth = 400, minHeight = 400,
    width = minWidth, height = minHeight,
    imagesBaseUrl = 'img',
    nav = {
      axisHeight: 30,
      scrollNav: true,
      scrollNavHeight: 50,
      scrollGutterHeight: 20,
      scrollThumbRadius: 24,
      currentTranslation: 0
    },
    axisGutter = 40, gutter = 40,
    buffer = 2,
    pools = [], poolGroup,
    xScale = d3.time.scale.utc(), xAxis,
    currentCenter, data, tidelineData, renderedData = [], endpoints,
    mainGroup,
    scrollNav, scrollHandleTrigger = true, mostRecent = false, annotations, tooltips;

  container.dataFill = {};

  emitter.on('clickInPool', function(offset) {
    var leftEdge = xScale(xScale.domain()[0]);
    var date = xScale.invert(leftEdge + offset - container.axisGutter());
    var offsetMinutes = new Date().getTimezoneOffset();
    date.setUTCMinutes(date.getUTCMinutes() + offsetMinutes);
    emitter.emit('clickTranslatesToDate', date);
  });

  function container(selection) {
    var mainSVG = selection.append('svg');

    mainGroup = mainSVG.append('g').attr('id', 'tidelineMain');

    // update SVG dimenions and ID
    mainSVG.attr({
      'id': id,
      'width': width,
      'height': height
    });

    mainGroup.append('rect')
      .attr({
        'id': 'poolsInvisibleRect',
        'width': width,
        'height': function() {
          if (nav.scrollNav) {
            return (height - nav.scrollNavHeight);
          }
          else {
            return height;
          }
        },
        'opacity': 0.0
      });

    mainGroup.append('g')
      .attr('class', 'd3-x d3-axis')
      .attr('id', 'tidelineXAxis')
      .attr('transform', 'translate(0,' + (nav.axisHeight - 1) + ')');

    poolGroup = mainGroup.append('g').attr('id', 'tidelinePools');

    mainGroup.append('g')
      .attr('id', 'tidelineLabels');

    mainGroup.append('g')
      .attr('id', 'tidelineYAxes')
      .append('rect')
      .attr({
        'id': 'yAxesInvisibleRect',
        'height': function() {
          if (nav.scrollNav) {
            return (height - nav.scrollNavHeight);
          }
          else {
            return height;
          }
        },
        'width': axisGutter,
        'fill': 'white'
      });

    if (nav.scrollNav) {
      scrollNav = mainGroup.append('g')
        .attr('class', 'x scroll')
        .attr('id', 'tidelineScrollNav');
    }
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

  container.arrangePools = function() {
    var numPools = pools.length;
    var cumWeight = 0;
    pools.forEach(function(pool) {
      cumWeight += pool.weight();
    });
    gutter = 0.25 * (container.height() / cumWeight);
    var totalPoolsHeight =
      container.height() - nav.axisHeight - nav.scrollNavHeight - (numPools - 1) * gutter;
    var poolScaleHeight = totalPoolsHeight/cumWeight;
    var actualPoolsHeight = 0;
    pools.forEach(function(pool) {
      pool.height(poolScaleHeight);
      actualPoolsHeight += pool.height();
    });
    actualPoolsHeight += (numPools - 1) * gutter;
    var currentYPosition = nav.axisHeight;
    pools.forEach(function(pool) {
      pool.yPosition(currentYPosition);
      currentYPosition += pool.height() + gutter;
      pool.group().attr('transform', 'translate(0,' + pool.yPosition() + ')');
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
    var navString;
    if (beginning.getUTCHours() <= 11) {
      navString = beginning.toISOString();
    }
    else {
      navString = end.toISOString();
    }
    if (!d3.select('#' + id).classed('hidden')) {
      emitter.emit('currentDomain', {
        'domain': a
      });
      emitter.emit('navigated', [navString, currentDomain.center.toISOString()]);
      if (a[1].valueOf() === endpoints[1].valueOf()) {
        emitter.emit('mostRecent', true);
      }
      else {
        emitter.emit('mostRecent', false);
      }
    }
  };

  // getters only
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

    var tickFormat = d3.time.format.utc.multi([
      ['%b %-d', function(d) { return d.getUTCHours() === 0; }],
      ['%-I am', function(d) { return d.getUTCHours() < 11; }],
      ['%-I pm', function(d) { return true; }],
    ]);

    xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('top')
      .outerTickSize(0)
      .innerTickSize(15)
      .tickFormat(tickFormat);

    mainGroup.select('#tidelineXAxis').call(xAxis);

    mainGroup.selectAll('#tidelineXAxis g.tick text').style('text-anchor', 'start').attr('transform', 'translate(5,15)');

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
        d3.select('#annotationsClipPath rect').attr('transform', 'translate(' + -e.translate[0] + ',0)');
        mainGroup.select('.d3-x.d3-axis').call(xAxis);
        mainGroup.selectAll('#tidelineXAxis g.tick text').style('text-anchor', 'start').attr('transform', 'translate(5,15)');
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
    d3.select('#' + id).insert('clipPath', '#tidelineMain')
      .attr('id', 'annotationsClipPath')
      .append('rect')
      .attr({
        'x': container.axisGutter(),
        'y': 0,
        'width': container.width() - container.axisGutter(),
        'height': container.height()
      });

    var annotationGroup = mainGroup.append('g')
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
    tooltips = tooltip(container, tooltipGroup).id(tooltipGroup.attr('id'));
    pools.forEach(function(pool) {
      pool.tooltips(tooltips);
    });
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

  container.stopListening = function() {
    emitter.removeAllListeners('carbTooltipOn')
      .removeAllListeners('carbTooltipOff')
      .removeAllListeners('bolusTooltipOn')
      .removeAllListeners('bolusTooltipOff')
      .removeAllListeners('noCarbTimestamp');

    return container;
  };

  container.clear = function() {
    pools.forEach(function(pool) {
      pool.clear();
    });
    container.currentTranslation(0).latestTranslation(0);
    renderedData = [];

    return container;
  };

  container.hide = function() {
    d3.select('#' + id).classed('hidden', true);

    return container;
  };

  container.show = function() {
    d3.select('#' + id).classed('hidden', false);

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
    var totalHeight = x + nav.axisHeight;
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

  container.imagesBaseUrl = function(x) {
    if (!arguments.length) return imagesBaseUrl;
    imagesBaseUrl = x;
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
      throw new Error("Sorry, I can't render anything without /some/ data.");
    }
    else if (a.data.length === 1) {
      throw new Error("Sorry, I can't render anything with only *one* datapoint.");
    }

    tidelineData = a;

    data = a.data;

    var first = new Date(data[0].normalTime);
    var lastObj = _.sortBy(data, function(d) {
      return d.normalEnd ? d.normalEnd : d.normalTime;
    }).reverse()[0];
    var last = lastObj.normalEnd ? new Date(lastObj.normalEnd) : new Date(lastObj.normalTime);

    var minusOne = new Date(last);
    minusOne.setDate(minusOne.getDate() - 1);
    container.initialEndpoints = [minusOne, last];

    endpoints = [first, last];
    if (last.valueOf() - first.valueOf() < dt.MS_IN_24) {
      throw new Error("Sorry, I can't render anything when the endpoints of your data are less than 24 hours apart.");
    }
    container.endpoints = endpoints;

    return container;
  };

  container.renderedData = function(a) {
    if (!arguments.length) return renderedData;
    var start = new Date(dt.addDays(a[0], -buffer));
    var end = new Date(dt.addDays(a[1], buffer));
    var filtered = tidelineData.dataByDate.filter([start, end]);
    renderedData = filtered.top(Infinity).reverse();

    return container;
  };

  return container;
};

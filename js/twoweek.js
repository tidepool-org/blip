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
var legend = require('./plot/util/legend');

var log = require('./lib/').bows('Two Week');

module.exports = function(emitter) {
  // constants
  var MS_IN_24 = 86400000;

  // basic attributes
  var id = 'tidelineSVGTwoWeek',
    minWidth = 400, minHeight = 400,
    width = minWidth, height = minHeight,
    imagesBaseUrl = 'img',
    nav = {
      axisHeight: 60,
      navGutter: 30,
      scrollThumbRadius: 24,
      scrollGutterWidth: 20,
      currentTranslation: 0
    },
    axisGutter = 52, dataGutter, dayTickSize = 0,
    statsHeight = 100,
    pools = [], poolGroup, days, daysGroup,
    xScale = d3.scale.linear(), xAxis, yScale = d3.time.scale.utc(), yAxis,
    tidelineData, data, endpoints, viewEndpoints, dataStartNoon, dataEndNoon, poolScaleHeight,
    lessThanTwoWeeks = false,
    sortReverse = true, viewIndex,
    mainGroup, scrollNav, scrollHandleTrigger = true,
    annotations, tooltips,
    cachedDomain;

  container.dataFill = {};

  function container(selection) {
    var mainSVG = selection.append('svg');

    mainGroup = mainSVG.append('g').attr('id', 'tidelineMain');

    // update SVG dimenions and ID
    mainSVG.attr({
      'id': id,
      'width': width,
      'height': height,
      'class': 'hidden'
    });

    mainGroup.append('rect')
      .attr({
        'id': 'poolsInvisibleRect',
        'width': width - nav.navGutter,
        'height': height,
        'opacity': 0.0
      });
  }

  // non-chainable methods
  container.panForward = function() {
    log('Jumped forward two weeks.');
    var n = 0;
    if (sortReverse) {
      nav.currentTranslation += height - nav.axisHeight - statsHeight;
      emitter.emit('inTransition', true);
      mainGroup.transition().duration(500).tween('zoom', function() {
        var iy = d3.interpolate(nav.currentTranslation - height + nav.axisHeight + statsHeight, nav.currentTranslation);
        return function(t) {
          nav.scroll.translate([0, iy(t)]);
          nav.scroll.event(mainGroup);
        };
      })
      .each(function() { ++n; })
      .each('end', function() {
        // this ugly solution courtesy of the man himself: https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
        if (!--n) {
          emitter.emit('inTransition', false);
        }
      });
    }
    else {
      nav.currentTranslation -= height - nav.axisHeight - statsHeight;
      emitter.emit('inTransition', true);
      mainGroup.transition().duration(500).tween('zoom', function() {
        var iy = d3.interpolate(nav.currentTranslation + height - nav.axisHeight - statsHeight, nav.currentTranslation);
        return function(t) {
          nav.scroll.translate([0, iy(t)]);
          nav.scroll.event(mainGroup);
        };
      })
      .each(function() { ++n; })
      .each('end', function() {
        // this ugly solution courtesy of the man himself: https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
        if (!--n) {
          emitter.emit('inTransition', false);
        }
      });
    }
  };

  container.panBack = function() {
    log('Jumped back two weeks.');
    var n = 0;
    if (sortReverse) {
      nav.currentTranslation -= height - nav.axisHeight - statsHeight;
      emitter.emit('inTransition', true);
      mainGroup.transition().duration(500).tween('zoom', function() {
        var iy = d3.interpolate(nav.currentTranslation + height - nav.axisHeight - statsHeight, nav.currentTranslation);
        return function(t) {
          nav.scroll.translate([0, iy(t)]);
          nav.scroll.event(mainGroup);
        };
      })
      .each(function() { ++n; })
      .each('end', function() {
        // this ugly solution courtesy of the man himself: https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
        if (!--n) {
          emitter.emit('inTransition', false);
        }
      });
    }
    else {
      nav.currentTranslation += height - nav.axisHeight - statsHeight;
      emitter.emit('inTransition', true);
      mainGroup.transition().duration(500).tween('zoom', function() {
        var iy = d3.interpolate(nav.currentTranslation - height + nav.axisHeight + statsHeight, nav.currentTranslation);
        return function(t) {
          nav.scroll.translate([0, iy(t)]);
          nav.scroll.event(mainGroup);
        };
      })
      .each(function() { ++n; })
      .each('end', function() {
        // this ugly solution courtesy of the man himself: https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
        if (!--n) {
          emitter.emit('inTransition', false);
        }
      });
    }
  };

  container.newPool = function() {
    var p = new Pool(container);
    pools.push(p);
    return p;
  };

  container.arrangePools = function() {
    // 14 days = 2 weeks
    var numPools = 14;
    // all two-week pools have a weight of 1.0
    var weight = 1.0;
    var cumWeight = weight * numPools;
    var totalPoolsHeight =
      container.height() - nav.axisHeight - statsHeight;
    poolScaleHeight = totalPoolsHeight/cumWeight;
    var actualPoolsHeight = 0;
    pools.forEach(function(pool) {
      pool.height(poolScaleHeight);
      actualPoolsHeight += pool.height();
      poolScaleHeight = pool.height();
    });
    var currentYPosition, nextBatchYPosition, pool;
    if (sortReverse) {
      currentYPosition = nav.axisHeight;
      nextBatchYPosition = currentYPosition - poolScaleHeight;
      for (var i = viewIndex; i >= 0; i--) {
        pool = pools[i];
        pool.yPosition(currentYPosition);
        currentYPosition += pool.height();
        pool.group().attr('transform', 'translate(0,' + pool.yPosition() + ')');
      }
      currentYPosition = nextBatchYPosition;
      for (var j = viewIndex + 1; j < pools.length; j++) {
        pool = pools[j];
        pool.yPosition(currentYPosition);
        currentYPosition -= pool.height();
        pool.group().attr('transform', 'translate(0,' + pool.yPosition() + ')');
      }
    }
    else {
      currentYPosition = container.height() - statsHeight - poolScaleHeight;
      nextBatchYPosition = currentYPosition + poolScaleHeight;
      for (var k = viewIndex; k < pools.length; k++) {
        pool = pools[k];
        pool.yPosition(currentYPosition);
        currentYPosition -= pool.height();
        pool.group().attr('transform', 'translate(0,' + pool.yPosition() + ')');
      }
      currentYPosition = nextBatchYPosition;
      for (var l = viewIndex - 1; l >= 0; l--) {
        pool = pools[l];
        pool.yPosition(currentYPosition);
        currentYPosition += pool.height();
        pool.group().attr('transform', 'translate(0,' + pool.yPosition() + ')');
      }
    }

    // setup stats group
    container.poolStats = new Pool(container);
    container.poolStats.id('poolStats', poolGroup).weight(1.0).height(statsHeight * (4/5));
    container.poolStats.group().attr({
      'transform': 'translate(' + axisGutter + ',' + (height - statsHeight) + ')'
    });
    container.poolStats.group().append('rect')
      .attr({
        'x': 0,
        'y': 0,
        'width': width - axisGutter - nav.navGutter,
        'height': statsHeight,
        'fill': 'white'
      });
  };

  container.clear = function() {
    emitter.removeAllListeners('numbers');
    container.currentTranslation(0).latestTranslation(0);
    var ids = ['#tidelinePools', '#tidelineXAxisGroup', '#tidelineYAxisGroup', '#tidelineScrollNav', '#tidelineTooltips', '#tidelineAnnotations'];
    ids.forEach(function(id) {
      mainGroup.select(id).remove();
    });
    data = [];
    pools = [];

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

  container.navString = function(a) {
    if (!arguments.length) {
      a = yScale.domain();
      cachedDomain = a;
    }
    if (sortReverse) {
      if (a[0].toISOString().slice(0,10) === days[days.length - 1]) {
        emitter.emit('mostRecent', true);
      }
      else {
        emitter.emit('mostRecent', false);
      }
    }
    else {
      if (a[1].toISOString().slice(0,10) === days[0]) {
        emitter.emit('mostRecent', true);
      }
      else {
        emitter.emit('mostRecent', false);
      }
    }
    if (sortReverse) {
      a.reverse();
      a[0].setUTCDate(a[0].getUTCDate() + 1);
    }
    else {
      a[0].setUTCDate(a[0].getUTCDate() + 1);
    }
    if (!d3.select('#' + id).classed('hidden')) {
      emitter.emit('navigated', [a[0].toISOString(), a[1].toISOString()]);
      // domain should go from midnight to midnight, not noon to noon
      a[0].setUTCHours(a[0].getUTCHours() - 12);
      var topDate = a[0].toISOString().slice(0,10);
      a[1].setUTCHours(a[1].getUTCHours() + 12);
      var bottomDate = a[1].toISOString().slice(0,10);
      var midnight = 'T00:00:00.000Z';
      if ((topDate !== cachedDomain[0]) || (bottomDate !== cachedDomain[1])) {
        cachedDomain = [new Date(topDate + midnight), new Date(bottomDate + midnight)];
        emitter.emit('currentDomain', {
          'domain': cachedDomain
        });
      }
    }
  };

  container.legend = function(l) {
    var y = 30;
    var labelHolder = d3.select('#tidelineWeeklyLabels');

    var labelGroup = labelHolder.append('text')
      .attr({
        'class': 'd3-pool-label',
        'transform': 'translate('+ axisGutter +','+ nav.navGutter +')'
      })
      .text(l.main);

    labelGroup.append('tspan')
      .text(' (' + l.light + ')')

    var legendGroup = labelHolder.append('g')
      .attr({
        'transform': 'translate(930'+ nav.navGutter +')'
      });

    legend.draw(legendGroup, 'bg');
  };

  // getters only
  container.pools = function() {
    return pools;
  };

  container.poolGroup = function() {
    return poolGroup;
  };

  container.days = function() {
    return days;
  };

  container.daysGroup = function() {
    return daysGroup;
  };

  container.id = function() {
    return id;
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

  container.navGutter = function() {
    return nav.navGutter;
  };

  // chainable methods
  container.setup = function() {
    poolGroup = mainGroup.append('g').attr('id', 'tidelinePools');

    mainGroup.append('g')
      .attr('id', 'tidelineXAxisGroup')
      .append('rect')
      .attr({
        'id': 'xAxisInvisibleRect',
        'x': axisGutter,
        'height': nav.axisHeight,
        'width': width - axisGutter,
        'fill': 'white'
      });

    mainGroup.append('g')
      .attr('id', 'tidelineYAxisGroup')
      .append('rect')
      .attr({
        'id': 'yAxisInvisibleRect',
        'x': 0,
        'height': height,
        'width': axisGutter,
        'fill': 'white'
      });

    daysGroup = poolGroup.append('g').attr('id', 'daysGroup');

    scrollNav = mainGroup.append('g')
      .attr('class', 'y scroll')
      .attr('id', 'tidelineScrollNav');

    mainGroup.append('g').attr('id', 'tidelineWeeklyLabels');

    return container;
  };

  container.setAxes = function() {
    // set the domain and range for the two-week x-scale
    xScale.domain([0, MS_IN_24])
      .range([axisGutter + dataGutter, width - nav.navGutter - dataGutter]);
    xAxis = d3.svg.axis().scale(xScale).orient('top').outerTickSize(0).innerTickSize(15)
      .tickValues(function() {
        var a = [];
        for (var i = 0; i < 8; i++) {
          a.push((MS_IN_24/8) * i);
        }
        return a;
      })
      .tickFormat(function(d) {
        var hour = d/(MS_IN_24/24);
        if ((hour > 0) && (hour < 12)) {
          return hour + ' am';
        }
        else if (hour > 12) {
          return (hour - 12) + ' pm';
        }
        else if (hour === 0) {
          return '12 am';
        }
        else {
          return '12 pm';
        }
      });

    mainGroup.select('#tidelineXAxisGroup')
      .append('g')
      .attr('class', 'd3-x d3-axis')
      .attr('id', 'tidelineXAxis')
      .attr('transform', 'translate(0,' + (nav.axisHeight - 1) + ')')
      .call(xAxis);

    mainGroup.selectAll('#tidelineXAxis g.tick text').style('text-anchor', 'start').attr('transform', 'translate(5,15)');

    // set the domain and range for the main two-week y-scale
    yScale.domain(viewEndpoints)
      .range([nav.axisHeight, height - statsHeight])
      .ticks(d3.time.day.utc, 1);

    yAxis = d3.svg.axis().scale(yScale)
      .orient('left')
      .outerTickSize(0)
      .innerTickSize(dayTickSize)
      .tickFormat(d3.time.format.utc('%a'));

    mainGroup.select('#tidelineYAxisGroup')
      .append('g')
      .attr('class', 'd3-y d3-axis d3-day-axis')
      .attr('id', 'tidelineYAxis')
      .attr('transform', 'translate(' + (axisGutter - 1) + ',0)')
      .call(yAxis);

    container.dayAxisHacks();

    if (sortReverse) {
      var start = new Date(dataStartNoon);
      start.setUTCDate(start.getUTCDate() - 1);
      nav.scrollScale = d3.time.scale.utc()
          .domain([dataEndNoon, start])
          .range([nav.axisHeight + nav.scrollThumbRadius, height - statsHeight - nav.scrollThumbRadius]);
    }
    else {
      nav.scrollScale = d3.time.scale.utc()
        .domain([dataStartNoon, dataEndNoon])
        .range([nav.axisHeight + nav.scrollThumbRadius, height - statsHeight - nav.scrollThumbRadius]);
    }

    pools.forEach(function(pool) {
      pool.xScale(xScale.copy());
    });

    return container;
  };

  container.dayAxisHacks = function() {
    // TODO: demagicify all the magic numbers in this function
    var tickLabels = mainGroup.selectAll('.d3-day-axis').selectAll('.tick');

    tickLabels.selectAll('.d3-date').remove();

    var xPos = tickLabels.select('text').attr('x'), dy = tickLabels.select('text').attr('dy');

    tickLabels.append('text')
      .text(function(d) {
        return d3.time.format.utc('%b %-d')(d);
      })
      .attr({
        'x': xPos,
        'y': 0,
        'dy': dy,
        'class': 'd3-date',
        'text-anchor': 'end'
      });

    tickLabels.selectAll('text')
      .attr({
        'transform': function() {
          if (d3.select(this).classed('d3-date')) {
            return 'translate(' + (dayTickSize - 6) + ',8)';
          }
          else {
            return 'translate(' + (dayTickSize - 6) + ',-6)';
          }
        }
      })
      .classed('d3-weekend', function(d) {
        // Sunday is 0
        var date = d.getUTCDay();
        if ((date === 0) || (date === 6)) {
          return true;
        }
        else {
          return false;
        }
      });

    return container;
  };

  container.setNav = function() {
    var maxTranslation, minTranslation;
    if (sortReverse) {
      maxTranslation = yScale(dataStartNoon) - yScale(dataEndNoon) + poolScaleHeight + (14 - (viewIndex + 1)) * poolScaleHeight;
      minTranslation = (14 - (viewIndex + 1)) * poolScaleHeight;
    }
    else {
      maxTranslation = -yScale(dataStartNoon) + nav.axisHeight;
      minTranslation = -yScale(dataEndNoon) + nav.axisHeight;
    }
    nav.scroll = d3.behavior.zoom()
      .scaleExtent([1, 1])
      .y(yScale)
      .on('zoom', function() {
        var e = d3.event;
        if (e.translate[1] < minTranslation) {
          e.translate[1] = minTranslation;
        }
        else if (e.translate[1] > maxTranslation) {
          e.translate[1] = maxTranslation;
        }
        nav.scroll.translate([0, e.translate[1]]);
        mainGroup.select('#tidelineTooltips').attr('transform', 'translate(0,' + e.translate[1] + ')');
        mainGroup.select('#tidelineAnnotations').attr('transform', 'translate(0,' + e.translate[1] + ')');
        mainGroup.select('.d3-y.d3-axis').call(yAxis);
        container.dayAxisHacks();
        d3.selectAll('.d3-data-annotation-group').remove();
        for (var i = 0; i < pools.length; i++) {
          pools[i].scroll(e);
        }
        if (scrollHandleTrigger) {
          mainGroup.select('.scrollThumb').transition().ease('linear').attr('y', function(d) {
            if (sortReverse) {
              d.y = nav.scrollScale(yScale.domain()[1]);
            }
            else {
              d.y = nav.scrollScale(yScale.domain()[0]);
            }
            return d.y - nav.scrollThumbRadius;
          });
        }
      })
      .on('zoomend', function() {
        container.currentTranslation(nav.latestTranslation);
        container.navString(yScale.domain());
        scrollHandleTrigger = true;
      });

    mainGroup.call(nav.scroll);

    return container;
  };

  container.setScrollNav = function() {
    if (!lessThanTwoWeeks) {
      var translationAdjustment, yStart, xPos;
      if (sortReverse) {
        yStart = nav.scrollScale(viewEndpoints[1]);
        translationAdjustment = height - statsHeight;

        scrollNav.append('rect')
        .attr({
          'x': 0,
          'y': nav.scrollScale(dataEndNoon) - nav.scrollThumbRadius,
          'width': nav.navGutter,
          'height': height - nav.axisHeight,
          'fill': 'white',
          'id': 'scrollNavInvisibleRect'
        });

        xPos = 2 * nav.navGutter / 3;


        var start = new Date(dataStartNoon);
        start.setUTCDate(start.getUTCDate() - 1);

        scrollNav.attr('transform', 'translate(' + (width - nav.navGutter) + ',0)')
          .append('line')
          .attr({
            'x1': xPos,
            'x2': xPos,
            'y1': nav.axisHeight + nav.scrollGutterWidth/2,
            'y2': height - statsHeight - nav.scrollGutterWidth/2,
            'stroke-width': nav.scrollGutterWidth,
            'class': 'scroll'
          });
      }
      else {
        yStart = nav.scrollScale(viewEndpoints[0]);
        translationAdjustment = nav.axisHeight;

        scrollNav.append('rect')
        .attr({
          'x': 0,
          'y': nav.scrollScale(dataStartNoon) - nav.scrollThumbRadius,
          'width': nav.navGutter,
          'height': height - nav.axisHeight,
          'fill': 'white',
          'id': 'scrollNavInvisibleRect'
        });

        xPos = nav.navGutter / 2;

        scrollNav.attr('transform', 'translate(' + (width - nav.navGutter) + ',0)')
          .append('line')
          .attr({
            'x1': xPos,
            'x2': xPos,
            'y1': nav.axisHeight + nav.scrollGutterWidth/2,
            'y2': height - statsHeight - nav.scrollGutterWidth/2,
            'stroke-width': nav.scrollGutterWidth,
            'class': 'scroll'
          });
      }

      var dyLowest = nav.scrollScale.range()[1];
      var dyHighest = nav.scrollScale.range()[0];

      var drag = d3.behavior.drag()
        .origin(function(d) {
          return d;
        })
        .on('dragstart', function() {
          d3.event.sourceEvent.stopPropagation(); // silence the click-and-drag listener
        })
        .on('drag', function(d) {
          d.y += d3.event.dy;
          if (d.y > dyLowest) {
            d.y = dyLowest;
          }
          else if (d.y < dyHighest) {
            d.y = dyHighest;
          }
          d3.select(this).attr('y', function(d) { return d.y - nav.scrollThumbRadius; });
          var date = nav.scrollScale.invert(d.y);
          nav.currentTranslation -= yScale(date) - translationAdjustment;
          scrollHandleTrigger = false;
          nav.scroll.translate([0, nav.currentTranslation]);
          nav.scroll.event(mainGroup);
        });

      scrollNav.selectAll('rect.scrollThumb')
        .data([{'x': 0, 'y': yStart}])
        .enter()
        .append('rect')
        .attr({
          'x': xPos - nav.scrollThumbRadius/3,
          'y': function(d) {
            return d.y - nav.scrollThumbRadius;
          },
          'width': 2 * nav.scrollThumbRadius/3,
          'height': 2 * nav.scrollThumbRadius,
          'rx': nav.scrollThumbRadius/3,
          'class': 'scrollThumb'
        })
        .call(drag);
    }

    return container;
  };

  container.setAnnotation = function() {
    var annotationGroup = mainGroup.append('g')
      .attr('id', 'tidelineAnnotations');
    annotations = annotation(container, annotationGroup).id(annotationGroup.attr('id'));
    pools.forEach(function(pool) {
      pool.annotations(annotations);
    });
    container.poolStats.annotations(annotations);
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

  // getters and setters
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

  container.dataGutter = function(x) {
    if (!arguments.length) return dataGutter;
    dataGutter = x;
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

  container.sortReverse = function(b) {
    if (!arguments.length) return sortReverse;
    if (b === (true || false)) {
      sortReverse = b;
    }
    return container;
  };

  // data getters and setters
  container.data = function(a, viewEndDate) {
    if (!arguments.length) return data;

    data = a;

    var first;
    var last;
    if (!(data && data.length)) {
      last = new Date();
      if (viewEndDate) {
        last = new Date(viewEndDate);
      }
      first = new Date(last);
      first.setUTCDate(first.getUTCDate() - 28);
    }
    else {
      first = new Date(data[0].normalTime);
      last = new Date(data[data.length - 1].normalTime);
    }

    endpoints = [first, last];
    container.endpoints = endpoints;

    function createDay(d) {
      return new Date(d.toISOString().slice(0,11) + '00:00:00Z');
    }
    days = [];
    var firstDay = createDay(new Date(container.endpoints[0]));
    var lastDay = createDay(new Date(container.endpoints[1]));
    days.push(firstDay.toISOString().slice(0,10));
    var currentDay = firstDay;
    while (currentDay < lastDay) {
      var newDay = new Date(currentDay);
      newDay.setUTCDate(newDay.getUTCDate() + 1);
      days.push(newDay.toISOString().slice(0,10));
      currentDay = newDay;
    }

    if (days.length < 14) {
      var day = new Date(firstDay);
      // fill in previous days if less than two weeks data
      while (days.length < 14) {
        day.setUTCDate(day.getUTCDate() - 1);
        days.unshift(day.toISOString().slice(0,10));
        currentDay = day;
      }
      first = days[0];
      lessThanTwoWeeks = true;
    }

    dataStartNoon = new Date(first);
    dataStartNoon.setUTCHours(12);
    dataStartNoon.setUTCMinutes(0);
    dataStartNoon.setUTCSeconds(0);
    if (!sortReverse) {
      dataStartNoon.setUTCDate(dataStartNoon.getUTCDate() - 1);
    }

    var noon = '12:00:00Z';

    dataEndNoon = new Date(last);
    dataEndNoon.setUTCDate(dataEndNoon.getUTCDate() - 14);
    dataEndNoon = new Date(dataEndNoon.toISOString().slice(0,11) + noon);

    if (!viewEndDate) {
      viewEndDate = new Date(days[days.length - 1]);
    } else {
      viewEndDate = new Date(viewEndDate);
    }

    var viewBeginning = new Date(viewEndDate);
    viewBeginning.setUTCDate(viewBeginning.getUTCDate() - 14);
    var firstDayInView;

    if (sortReverse) {
      this.days = days;

      firstDayInView = new Date(days[0]);
    }
    else {
      this.days = days.reverse();

      firstDayInView = new Date(days[days.length - 1]);
    }

    if (viewBeginning < firstDayInView) {
      firstDayInView.setUTCDate(firstDayInView.getUTCDate() - 1);
      viewBeginning = new Date(firstDayInView);
      viewEndDate = new Date(firstDayInView);
      viewEndDate.setUTCDate(viewEndDate.getUTCDate() + 14);
    }
    viewEndpoints = [new Date(viewBeginning.toISOString().slice(0,11) + noon), new Date(viewEndDate.toISOString().slice(0,11) + noon)];
    if (sortReverse) {
      viewEndpoints = viewEndpoints.reverse();
    }
    viewIndex = days.indexOf(viewEndDate.toISOString().slice(0,10));

    container.dataPerDay = [];

    this.days.forEach(function(day) {
      var thisDay = {
        'year': day.slice(0,4),
        'month': day.slice(5,7),
        'day': day.slice(8,10)
      };
      container.dataPerDay.push(_.filter(data, function(d) {
        var date = new Date(d.normalTime);
        if ((date.getUTCFullYear() === parseInt(thisDay.year, 10)) &&
          (date.getUTCMonth() + 1 === parseInt(thisDay.month, 10)) &&
          (date.getUTCDate() === parseInt(thisDay.day, 10))) {
          return d;
        }
      }));
    });

    return container;
  };

  return container;
};

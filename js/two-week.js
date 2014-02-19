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

var log = require('./lib/bows')('Two Week');

module.exports = function(emitter) {
  var pool = require('./pool');

  var MS_IN_24 = 86400000;

  var bucket,
    id,
    width, minWidth,
    height, minHeight,
    imagesBaseUrl,
    statsHeight,
    axisGutter,
    nav = {},
    pools = [],
    xScale = d3.scale.linear(),
    xAxis = d3.svg.axis().scale(xScale).orient('top').outerTickSize(0).innerTickSize(15)
      .tickValues(function() {
        a = []
        for (i = 0; i < 8; i++) {
          a.push((MS_IN_24/8) * i);
        }
        return a;
      })
      .tickFormat(function(d) {
        hour = d/(MS_IN_24/24);
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
      }),
    yScale = d3.time.scale.utc(),
    yAxis = d3.svg.axis().scale(yScale).orient('left').outerTickSize(0).tickFormat(d3.time.format.utc("%a %-d")),
    data, allData = [], endpoints, viewEndpoints, dataStartNoon, viewIndex,
    mainGroup, scrollNav, scrollHandleTrigger = true;

  container.dataFill = {};

  var defaults = {
    bucket: $('#tidelineContainer'),
    id: 'tidelineSVG',
    minWidth: 400,
    minHeight: 400,
    imagesBaseUrl: 'img',
    nav: {
      minNavHeight: 30,
      latestTranslation: 0,
      currentTranslation: 0,
      scrollThumbRadius: 8,
      navGutter: 20
    },
    axisGutter: 60,
    statsHeight: 50
  };

  function container(selection) {
    selection.each(function(currentData) {
      // select the SVG if it already exists
      var mainSVG = selection.selectAll('svg').data([currentData]);
      // otherwise create a new SVG and enter   
      mainGroup = mainSVG.enter().append('svg').append('g').attr('id', 'tidelineMain');

      // update SVG dimenions and ID
      mainSVG.attr({
        'id': id,
        'width': width,
        'height': height
      });

      mainGroup.append('rect')
        .attr({
          'id': 'poolsInvisibleRect',
          'width': width - nav.navGutter,
          'height': height,
          'opacity': 0.0
        });

      container.poolGroup = mainGroup.append('g').attr('id', 'tidelinePools');

      // set the domain and range for the two-week x-scale
      xScale.domain([0, MS_IN_24])
        .range([container.axisGutter(), width - nav.navGutter]);

      mainGroup.append('g')
        .attr('id', 'tidelineXAxisGroup')
        .append('rect')
        .attr({
          'id': 'xAxisInvisibleRect',
          'x': container.axisGutter(),
          'height': nav.axisHeight - 2,
          'width': width - axisGutter,
          'fill': 'white'
        });

      d3.select('#tidelineXAxisGroup')
        .append('g')
        .attr('class', 'd3-x d3-axis')
        .attr('id', 'tidelineXAxis')
        .attr('transform', 'translate(0,' + (nav.axisHeight - 1) + ')')
        .call(xAxis);

      d3.selectAll('#tidelineXAxis g.tick text').style('text-anchor', 'start').attr('transform', 'translate(5,15)');

      // set the domain and range for the main two-week y-scale
      yScale.domain(viewEndpoints)
        .range([nav.axisHeight, height - statsHeight])
        .ticks(d3.time.day.utc, 1);

      container.navString(yScale.domain());

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

      d3.select('#tidelineYAxisGroup')
        .append('g')
        .attr('class', 'd3-y d3-axis d3-day-axis')
        .attr('id', 'tidelineYAxis')
        .attr('transform', 'translate(' + (axisGutter - 1) + ',0)')
        .call(yAxis);

      container.daysGroup = container.poolGroup.append('g').attr('id', 'daysGroup');

      statsGroup = container.poolGroup.append('g').attr('id', 'poolStats')
        .attr('transform', 'translate(' + container.axisGutter() + ',' + (height - container.statsHeight()) + ')')
        .append('rect')
        .attr({
          'x': 0,
          'y': 0,
          'width': width - container.axisGutter() - container.navGutter(),
          'height': container.statsHeight(),
          'fill': 'white'
        });

      scrollNav = mainGroup.append('g')
        .attr('class', 'y scroll')
        .attr('id', 'tidelineScrollNav');

      nav.scrollScale = d3.time.scale.utc()
        .domain([dataStartNoon, dataEndNoon])
        .range([nav.axisHeight + nav.scrollThumbRadius, height - statsHeight - nav.scrollThumbRadius]);
    });
  }

  // non-chainable methods
  container.newPool = function() {
    var p = new pool(container);
    pools.push(p);
    return p;
  };

  container.arrangePools = function() {
    // 14 days = 2 weeks
    // TODO: eventually factor this out so that this view could be generalized to another time period
    var numPools = 14;
    // all two-week pools have a weight of 1.0
    var weight = 1.0;
    var cumWeight = weight * numPools;
    var totalPoolsHeight = 
      container.height() - container.axisHeight() - container.statsHeight();
    var poolScaleHeight = totalPoolsHeight/cumWeight;
    var actualPoolsHeight = 0;
    pools.forEach(function(pool) {
      pool.height(poolScaleHeight);
      actualPoolsHeight += pool.height();
      poolScaleHeight = pool.height();
    });
    var currentYPosition = container.height() - container.statsHeight() - poolScaleHeight;
    var nextBatchYPosition = currentYPosition + poolScaleHeight;
    for (var i = viewIndex; i < pools.length; i++) {
      pool = pools[i];
      pool.yPosition(currentYPosition);
      currentYPosition -= pool.height();
    }
    currentYPosition = nextBatchYPosition;
    for (var i = viewIndex - 1; i >= 0; i--) {
      pool = pools[i];
      pool.yPosition(currentYPosition);
      currentYPosition += pool.height();
    }
  };

  container.destroy = function() {
    $('#' + this.id()).remove();
    emitter.removeAllListeners('numbers');
  };

  container.navString = function(a) {
    var monthDay = d3.time.format.utc("%B %-d");
    var navString = monthDay(new Date(a[0].setUTCDate(a[0].getUTCDate() + 1))) + ' - ' + monthDay(a[1]);
    emitter.emit('navigated', navString);
  };

  // chainable methods
  container.defaults = function(obj) {
    if (!arguments.length) {
      properties = defaults;
    }
    else {
      properties = obj;
    }
    this.bucket(properties.bucket);
    this.id(properties.id);
    this.minWidth(properties.minWidth).width(properties.width);
    this.minNavHeight(properties.nav.minNavHeight).axisHeight(properties.nav.minNavHeight)
      .scrollThumbRadius(properties.nav.scrollThumbRadius)
      .navGutter(properties.nav.navGutter);
    this.minHeight(properties.minHeight).height(properties.minHeight).statsHeight(properties.statsHeight);
    this.latestTranslation(properties.nav.latestTranslation)
      .currentTranslation(properties.nav.currentTranslation);
    this.axisGutter(properties.axisGutter);
    this.imagesBaseUrl(properties.imagesBaseUrl);

    return container;
  };

  container.setNav = function() {
    var maxTranslation = -yScale(dataStartNoon) + yScale.range()[1] - (height - nav.axisHeight - statsHeight);
    var minTranslation = -yScale(dataEndNoon) + yScale.range()[1] - (height - nav.axisHeight - statsHeight);
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
        d3.select('.d3-y.d3-axis').call(yAxis);
        for (var i = 0; i < pools.length; i++) {
          pools[i].scroll(e);
        }
        container.navString(yScale.domain());
        if (scrollHandleTrigger) {
          d3.select('#scrollThumb').transition().ease('linear').attr('y', function(d) {
            d.y = nav.scrollScale(yScale.domain()[0]);
            return d.y - nav.scrollThumbRadius;
          });       
        }
      })
      .on('zoomend', function() {
        container.currentTranslation(nav.latestTranslation);
        scrollHandleTrigger = true;
      });

    mainGroup.call(nav.scroll);

    return container;
  };

  container.setScrollNav = function() {
    var translationAdjustment = yScale.range()[1] - (height - nav.axisHeight - statsHeight);
    var xPos = nav.navGutter / 2;

    scrollNav.append('rect')
    .attr({
      'x': 0,
      'y': nav.scrollScale(dataStartNoon) - nav.scrollThumbRadius,
      'width': nav.navGutter,
      'height': height - nav.axisHeight,
      'fill': 'white',
      'id': 'scrollNavInvisibleRect'
    });

    scrollNav.attr('transform', 'translate(' + (width - nav.navGutter) + ',0)')
      .append('line')
      .attr({
        'x1': xPos,
        'x2': xPos,
        'y1': nav.scrollScale(dataStartNoon) - nav.scrollThumbRadius,
        'y2': nav.scrollScale(dataEndNoon) + nav.scrollThumbRadius
      });

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

    scrollNav.selectAll('image')
      .data([{'x': 0, 'y': nav.scrollScale(viewEndpoints[0])}])
      .enter()
      .append('image')
      .attr({
        'xlink:href': imagesBaseUrl + '/ux/scroll_thumb.svg',
        'x': xPos - nav.scrollThumbRadius,
        'y': function(d) { return d.y - nav.scrollThumbRadius; },
        'width': 2 * nav.scrollThumbRadius,
        'height': 2 * nav.scrollThumbRadius,
        'id': 'scrollThumb'
      })
      .call(drag);

    return container;
  };

  // getters and setters
  container.bucket = function(x) {
    if (!arguments.length) return bucket;
    bucket = x;
    return container;
  };

  container.id = function(x) {
    if (!arguments.length) return id;
    id = x;
    return container;
  };

  container.width = function(x) {
    if (!arguments.length) return width;
    if (x >= minWidth) {
      if (x > bucket.width()) {
        width = bucket.width();
      }
      else {
        width = x;
      }
    }
    else {
      width = minWidth;
    }
    return container;
  };

  container.minWidth = function(x) {
    if (!arguments.length) return minWidth;
    minWidth = x;
    return container;
  };

  container.height = function(x) {
    if (!arguments.length) return height;
    var totalHeight = x + container.axisHeight();
    if (nav.scrollNav) {
      totalHeight += container.scrollNavHeight();
    }
    if (totalHeight >= minHeight) {
      if (totalHeight > bucket.height()) {
        height = bucket.height() - container.axisHeight();
        if (nav.scrollNav) {
          height -= container.scrollNavHeight();
        }
      }
      else {
        height = x; 
      }
    }
    else {
      height = minHeight;
    }
    return container;
  };

  container.minHeight = function(x) {
    if (!arguments.length) return height;
    minHeight = x;
    return container;
  };

  container.imagesBaseUrl = function(x) {
    if (!arguments.length) return imagesBaseUrl;
    imagesBaseUrl = x;
    return container;
  };

  container.statsHeight = function(x) {
    if (!arguments.length) return statsHeight;
    statsHeight = x;
    return container;
  };

  // nav getters and setters
  container.axisHeight = function(x) {
    if (!arguments.length) return nav.axisHeight;
    if (x >= nav.minNavHeight) {
      nav.axisHeight = x;
    }
    else {
      nav.axisHeight = nav.minNavHeight;
    }
    return container;
  };

  container.minNavHeight = function(x) {
    if (!arguments.length) return nav.minNavHeight;
    nav.minNavHeight = x;
    return container;
  };

  container.scrollThumbRadius = function(x) {
    if (!arguments.length) return nav.scrollThumbRadius;
    nav.scrollThumbRadius = x;
    return container
  };

  container.navGutter = function(x) {
    if (!arguments.length) return nav.navGutter;
    nav.navGutter = x;
    return container;
  };

  container.scroll = function(f) {
    if (!arguments.length) return nav.scroll;
    nav.scroll = f;
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

  // pools getter and setter
  container.pools = function(a) {
    if (!arguments.length) return pools;
    pools = a;
    return container;
  };

  container.axisGutter = function(x) {
    if (!arguments.length) return axisGutter;
    axisGutter = x;
    return container;
  };

  // scales and axes getters and setters
  container.xScale = function(f) {
    if (!arguments.length) return xScale;
    xScale = f;
    return container;
  };

  container.xAxis = function(f) {
    if (!arguments.length) return xAxis;
    xAxis = f;
    return container;
  };

  container.viewEndpoints = function(a) {
    if (!arguments.length) return viewEndpoints;
    viewEndpoints = a;
    return container;
  };

  // data getters and setters
  container.data = function(a, viewEndDate) {
    if (!arguments.length) return data;
    data = a;

    var first = new Date(a[0].normalTime);
    var last = new Date(a[a.length - 1].normalTime);
    
    endpoints = [first, last];
    container.endpoints = endpoints;

    function createDay(d) {
      return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0);
    }
    var days = [];
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

    this.days = days.reverse();

    dataStartNoon = new Date(first);
    dataStartNoon.setUTCHours(12);
    dataStartNoon.setUTCMinutes(0);
    dataStartNoon.setUTCSeconds(0);
    dataStartNoon.setUTCDate(dataStartNoon.getUTCDate() - 1);

    var noon = '12:00:00Z';

    dataEndNoon = new Date(last);
    dataEndNoon.setUTCDate(dataEndNoon.getUTCDate() - 14);
    dataEndNoon = new Date(dataEndNoon.toISOString().slice(0,11) + noon);

    if (!viewEndDate) {
      viewEndDate = new Date(days[0]);
    } else {
      viewEndDate = new Date(viewEndDate);
    }

    var viewBeginning = new Date(viewEndDate);
    viewBeginning.setUTCDate(viewBeginning.getUTCDate() - 14);
    viewEndpoints = [new Date(viewBeginning.toISOString().slice(0,11) + noon), new Date(viewEndDate.toISOString().slice(0,11) + noon)];
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
        if ((date.getUTCFullYear() === parseInt(thisDay.year))
          && (date.getUTCMonth() + 1 === parseInt(thisDay.month))
          && (date.getUTCDate() === parseInt(thisDay.day))) {
          return d;
        }
      }));
    });
    
    return container;
  };

  return container;
};
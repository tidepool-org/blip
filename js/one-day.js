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

var log = require('./lib/bows')('One Day');

module.exports = function(emitter) {
  var pool = require('./pool');

  var tooltip = require('./plot/tooltip');

  var MS_IN_24 = 86400000;

  var bucket,
    id,
    width, minWidth,
    height, minHeight,
    imagesBaseUrl,
    gutter,
    axisGutter,
    nav = {},
    pools = [], gutter,
    xScale = d3.time.scale.utc(),
    xAxis = d3.svg.axis().scale(xScale).orient('top').outerTickSize(0).innerTickSize(15).tickFormat(d3.time.format.utc("%-I %p")),
    beginningOfData, endOfData, data, allData = [], buffer, endpoints,
    mainGroup, scrollHandleTrigger = true, tooltips;

  container.dataFill = {};

  var defaults = {
    bucket: $('#tidelineContainer'),
    id: 'tidelineSVG',
    minWidth: 400,
    minHeight: 400,
    imagesBaseUrl: 'img',
    nav: {
      minNavHeight: 30,
      scrollNav: true,
      scrollNavHeight: 40,
      scrollThumbRadius: 8,
      latestTranslation: 0,
      currentTranslation: 0
    },
    axisGutter: 40,
    gutter: 40,
    buffer: 5,
    tooltip: true
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
        'height': function() {
          height += + nav.axisHeight;
          if (nav.scrollNav) {
            height += nav.scrollNavHeight;
          }
          return height;
        }
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

      // set the domain and range for the main tideline x-scale
      xScale.domain([container.initialEndpoints[0], container.initialEndpoints[1]])
        .range([container.axisGutter(), width]);

      mainGroup.append('g')
        .attr('class', 'd3-x d3-axis')
        .attr('id', 'tidelineXAxis')
        .attr('transform', 'translate(0,' + (nav.axisHeight - 1) + ')')
        .call(xAxis);

      d3.selectAll('#tidelineXAxis g.tick text').style('text-anchor', 'start').attr('transform', 'translate(5,15)');

      container.poolGroup = mainGroup.append('g').attr('id', 'tidelinePools');

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
          'width': container.axisGutter(),
          'fill': 'white'
        });

      if (nav.scrollNav) {
        scrollNav = mainGroup.append('g')
          .attr('class', 'x scroll')
          .attr('id', 'tidelineScrollNav');

        nav.scrollScale = d3.time.scale.utc()
          .domain([endpoints[0], container.currentEndpoints[0]])
          .range([container.axisGutter() + nav.scrollThumbRadius, width - nav.scrollThumbRadius]);
      }
    });
  }

  // non-chainable methods
  container.getData = function(endpoints, direction) {
    if (!arguments.length) {
      endpoints = container.initialEndpoints;
      direction = 'both';
    }

    var start = new Date(endpoints[0]);
    var end = new Date(endpoints[1]);

    container.currentEndpoints = [start, end];

    readings = _.filter(data, function(datapoint) {
      t = Date.parse(datapoint.normalTime);
      if (direction == 'both') {
        if ((t >= start) && (t <= end)) {
          return datapoint;
        }
      }
      else if (direction == 'left') {
        if ((t >= start) && (t < end)) {
          return datapoint;
        }
      }
      else if (direction == 'right') {
        if ((t > start) && (t <= end)) {
          return datapoint;
        }
      }
    });

    return readings;
  };

  container.panForward = function() {
    log('Jumped forward a day.');
    nav.currentTranslation -= width - container.axisGutter();
    mainGroup.transition().duration(500).tween('zoom', function() {
      var ix = d3.interpolate(nav.currentTranslation + width - container.axisGutter(), nav.currentTranslation);
      return function(t) {
        nav.pan.translate([ix(t), 0]);
        nav.pan.event(mainGroup);
      };
    });
  };

  container.panBack = function() {
    log('Jumped back a day.');
    nav.currentTranslation += width - container.axisGutter();
    mainGroup.transition().duration(500).tween('zoom', function() {
      var ix = d3.interpolate(nav.currentTranslation - width + container.axisGutter(), nav.currentTranslation);
      return function(t) {
        nav.pan.translate([ix(t), 0]);
        nav.pan.event(mainGroup);
      };
    });
  };

  container.newPool = function() {
    var p = new pool(container);
    pools.push(p);
    return p;
  };

  container.arrangePools = function() {
    var numPools = pools.length;
    var cumWeight = 0;
    pools.forEach(function(pool) {
      cumWeight += pool.weight();
    });
    // TODO: adjust for when no scrollNav
    var totalPoolsHeight = 
      container.height() - container.axisHeight() - container.scrollNavHeight() - (numPools - 1) * container.gutter();
    var poolScaleHeight = totalPoolsHeight/cumWeight;
    var actualPoolsHeight = 0;
    pools.forEach(function(pool) {
      pool.height(poolScaleHeight);
      actualPoolsHeight += pool.height();
    });
    actualPoolsHeight += (numPools - 1) * container.gutter();
    var currentYPosition = container.axisHeight();
    pools.forEach(function(pool) {
      pool.yPosition(currentYPosition);
      currentYPosition += pool.height() + container.gutter();
    });
  };

  container.stopListening = function() {
    emitter.removeAllListeners('carbTooltipOn');
    emitter.removeAllListeners('carbTooltipOff');
    emitter.removeAllListeners('bolusTooltipOn');
    emitter.removeAllListeners('bolusTooltipOff');
    emitter.removeAllListeners('noCarbTimestamp');

    return container;
  };

  container.destroy = function() {
    $('#' + this.id()).remove();
    delete pool;
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
    this.scrollNav(properties.nav.scrollNav);
    this.minNavHeight(properties.nav.minNavHeight)
      .axisHeight(properties.nav.minNavHeight)
      .scrollThumbRadius(properties.nav.scrollThumbRadius)
      .scrollNavHeight(properties.nav.scrollNavHeight);
    this.minHeight(properties.minHeight).height(properties.minHeight);
    this.latestTranslation(properties.nav.latestTranslation)
      .currentTranslation(properties.nav.currentTranslation);
    this.axisGutter(properties.axisGutter);
    this.gutter(properties.gutter);
    this.buffer(properties.buffer);
    this.tooltips(properties.tooltips);
    this.imagesBaseUrl(properties.imagesBaseUrl);

    return container;
  };

  container.setNav = function() {
    var maxTranslation = -xScale(endpoints[0]) + axisGutter;
    var minTranslation = -xScale(endpoints[1]) + width;
    nav.pan = d3.behavior.zoom()
      .scaleExtent([1, 1])
      .x(xScale)
      .on('zoom', function() {
        if ((endOfData - xScale.domain()[1] < MS_IN_24) && !(endOfData.getTime() === endpoints[1])) {
          log('Rendering new data! (right)');
          var plusOne = new Date(container.endOfData());
          plusOne.setDate(plusOne.getDate() + 1);
          var newData = container.getData([endOfData, plusOne], 'right');
          // update endOfData
          if (plusOne <= endpoints[1]) {
            container.endOfData(plusOne); 
          }
          else {
            container.endOfData(endpoints[1]);
          }
          container.allData(newData);
          for (j = 0; j < pools.length; j++) {
            pools[j](container.poolGroup, container.allData());
          }
        }
        if ((xScale.domain()[0] - beginningOfData < MS_IN_24) && !(beginningOfData.getTime() === endpoints[0])) {
          log('Rendering new data! (left)');
          var plusOne = new Date(container.beginningOfData());
          plusOne.setDate(plusOne.getDate() - 1);
          var newData = container.getData([plusOne, beginningOfData], 'left');
          // update beginningOfData
          if (plusOne >= endpoints[0]) {
            container.beginningOfData(plusOne);
          }
          else {
            container.beginningOfData(endpoints[0]);
          }
          container.allData(newData);
          for (j = 0; j < pools.length; j++) {
            pools[j](container.poolGroup, container.allData());
          }
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
        // TODO: check if container has tooltips before transforming them
        d3.select('#d3-tooltip-group').attr('transform', 'translate(' + e.translate[0] + ',0)');
        d3.select('.d3-x.d3-axis').call(xAxis);
        d3.selectAll('#tidelineXAxis g.tick text').style('text-anchor', 'start').attr('transform', 'translate(5,15)');
        if (scrollHandleTrigger) {
          d3.select('#scrollThumb').transition().ease('linear').attr('x', function(d) {
            d.x = nav.scrollScale(xScale.domain()[0]);
            return d.x - nav.scrollThumbRadius;
          });       
        }
        container.navString(xScale.domain());
      })
      .on('zoomend', function() {
        container.currentTranslation(nav.latestTranslation);
        scrollHandleTrigger = true;
      });

    mainGroup.call(nav.pan);

    return container;
  };

  container.setScrollNav = function() {
    var translationAdjustment = axisGutter;
    scrollNav.attr('transform', 'translate(0,'  + (height - (nav.scrollNavHeight / 2)) + ')')
      .append('line')
      .attr({
        'x1': nav.scrollScale(endpoints[0]) - nav.scrollThumbRadius,
        'x2': nav.scrollScale(container.initialEndpoints[0]) + nav.scrollThumbRadius,
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

    scrollNav.selectAll('image')
      .data([{'x': nav.scrollScale(container.currentEndpoints[0]), 'y': 0}])
      .enter()
      .append('image')
      .attr({
        'xlink:href': imagesBaseUrl + '/ux/scroll_thumb.svg',
        'x': function(d) { return d.x - nav.scrollThumbRadius; },
        'y': -nav.scrollThumbRadius,
        'width': nav.scrollThumbRadius * 2,
        'height': nav.scrollThumbRadius * 2,
        'id': 'scrollThumb'
      })
      .call(drag);

    return container;
  };

  container.setAtDate = function (date) {
    nav.currentTranslation = -xScale(date) + axisGutter;
    nav.pan.translate([nav.currentTranslation, 0]);
    nav.pan.event(mainGroup);

    container.navString(xScale.domain());

    return container;
  };

  container.navString = function(a) {
    var formatDate = d3.time.format.utc("%A %-d %B");
    var beginning = formatDate(a[0]);
    var end = formatDate(a[1]);
    var navString;
    if (beginning === end) {
      navString = beginning;
    }
    else {
      navString = beginning + ' - ' + end;
    }
    emitter.emit('navigated', navString);
  };

  container.setTooltip = function() {
    var tooltipGroup = mainGroup.append('g')
      .attr('id', 'd3-tooltip-group');
    container.tooltips = new tooltip(container, tooltipGroup).id(tooltipGroup.attr('id'));
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

  // nav.scrollNav getters and setters
  container.scrollNav = function(b) {
    if (!arguments.length) return nav.scrollNav;
    nav.scrollNav = b;
    return container;
  };

  container.scrollThumbRadius = function(x) {
    if (!arguments.length) return nav.scrollThumbRadius;
    nav.scrollThumbRadius = x;
    return container;
  };

  container.scrollNavHeight = function(x) {
    if (!arguments.length) return nav.scrollNavHeight;
    if (x >= nav.minNavHeight) {
      nav.scrollNavHeight = x;
    }
    else {
      nav.scrollNavHeight = nav.minNavHeight;
    }
    return container;
  };

  container.scrollScale = function(f) {
    if (!arguments.length) return nav.scrollScale;
    nav.scrollScale = f;
    return container;
  };

  container.pan = function(f) {
    if (!arguments.length) return nav.pan;
    nav.pan = f;
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

  container.gutter = function(x) {
    if (!arguments.length) return gutter;
    gutter = x;
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

  // data getters and setters
  container.beginningOfData = function(d) {
    if (!arguments.length) return beginningOfData;
    beginningOfData = new Date(d);
    return container;
  };

  container.endOfData = function(d) {
    if (!arguments.length) return endOfData;
    endOfData = new Date(d);
    return container;
  };

  container.data = function(a) {
    if (!arguments.length) return data;

    data = a;

    var first = Date.parse(a[0].normalTime);
    var last = Date.parse(a[a.length - 1].normalTime);

    var minusOne = new Date(last);
    minusOne.setDate(minusOne.getDate() - 1);
    container.initialEndpoints = [minusOne, last];
    container.currentEndpoints = container.initialEndpoints;

    container.beginningOfData(minusOne).endOfData(last);

    endpoints = [first, last];
    container.endpoints = endpoints;

    return container;
  };

  container.allData = function(x, a) {
    if (!arguments.length) return allData;
    if (!a) {
      a = xScale.domain();
    }
    allData = allData.concat(x);
    log('Length of allData array is', allData.length);
    var plus = new Date(a[1]);
    plus.setDate(plus.getDate() + container.buffer());
    var minus = new Date(a[0]);
    minus.setDate(minus.getDate() - container.buffer());
    if (beginningOfData < minus) {
      container.beginningOfData(minus); 
      allData = _.filter(allData, function(datapoint) {
        var t = Date.parse(datapoint.normalTime);
        if (t >= minus) {
          return t;
        }
      });
    }
    if (endOfData > plus) {
      container.endOfData(plus);
      allData = _.filter(allData, function(datapoint) {
        var t = Date.parse(datapoint.normalTime);
        if (t <= plus) {
          return t;
        }
      });
    }
    allData = _.sortBy(allData, function(d) {
      return new Date(d.normalTime).valueOf();
    });
    allData = _.uniq(allData, true);
    return container;
  };

  container.buffer = function(x) {
    if (!arguments.length) return buffer;
    buffer = x;
    return container;
  };

  container.tooltips = function(b) {
    if (!arguments.length) return tooltips;
    tooltips = b;
    return container;
  };

  return container;
};
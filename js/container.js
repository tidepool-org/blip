var pool = require('./pool');

module.exports = function() {

  var MS_IN_24 = 86400000;

  var bucket,
    id,
    width, minWidth,
    height, minHeight,
    gutter,
    axisGutter,
    pad,
    nav = {},
    pools = [], gutter,
    xScale = d3.time.scale.utc(),
    xAxis = d3.svg.axis().scale(xScale).orient('top').outerTickSize(0),
    beginningOfData, endOfData, data, allData = [], buffer, endpoints, outerEndpoints, initialEndpoints,
    mainGroup, poolGroup, scrollNav, scrollHandleTrigger = true;

  var defaults = {
    bucket: $('#tidelineContainer'),
    id: 'tidelineSVG',
    minWidth: 400,
    minHeight: 400,
    pad: 10,
    nav: {
      minNavHeight: 30,
      scrollNav: true,
      scrollNavHeight: 40,
      latestTranslation: 0,
      currentTranslation: 0
    },
    axisGutter: 40,
    gutter: 30,
    buffer: 5
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
          height += pad * 2 + nav.axisHeight;
          if (nav.scrollNav) {
            height += nav.scrollNavHeight;
          }
          return height;
        }
      });

      // set the domain and range for the main tideline x-scale
      xScale.domain([container.initialEndpoints[0], container.initialEndpoints[1]])
        .range([container.axisGutter(), width]);

      mainGroup.append('g')
        .attr('class', 'd3-x d3-axis')
        .attr('id', 'tidelineXAxis')
        .attr('transform', 'translate(0,' + nav.axisHeight + ')')
        .call(xAxis);

      poolGroup = mainGroup.append('g').attr('id', 'tidelinePools');

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
          'opacity': 1,
          'fill': 'white'
        });

      if (nav.scrollNav) {
        scrollNav = mainGroup.append('g')
          .attr('class', 'x scroll')
          .attr('id', 'tidelineScrollNav');

        nav.scrollScale = d3.time.scale.utc()
          .domain([Date.parse(data[0].deviceTimestamp), Date.parse(currentData[0].deviceTimestamp)])
          .range([container.axisGutter(), width]);
      }
    });
  }

  // non-chainable methods
  container.getData = function(endpoints, direction) {
    if (!arguments.length) {
      endpoints = initialEndpoints;
      direction = 'both';
    }
    var start = new Date(endpoints[0]);
    var end = new Date(endpoints[1]);

    readings = _.filter(data, function(datapoint) {
      t = Date.parse(datapoint.deviceTimestamp);
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
    console.log('Jumped forward a day.');
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
    console.log('Jumped back a day.');
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
    var totalPoolsHeight = 
      container.height() - container.axisHeight() - container.scrollNavHeight() - numPools * container.gutter();
    var poolScaleHeight = totalPoolsHeight/cumWeight;
    var actualPoolsHeight = 0;
    pools.forEach(function(pool) {
      pool.height(poolScaleHeight);
      actualPoolsHeight += pool.height();
    });
    actualPoolsHeight += (numPools - 1) * container.gutter();
    var baseline = container.height() - container.scrollNavHeight();
    var topline = container.axisHeight() + container.gutter();
    var content = baseline - topline;
    var meridian = content/2 + topline;
    var difference = content - actualPoolsHeight;
    var offset = difference/2;
    if (offset < 0) {
      offset = 0;
    }
    var currentYPosition = topline;
    pools.forEach(function(pool) {
      pool.yPosition(offset + currentYPosition);
      currentYPosition += offset + pool.height() + container.gutter();
    });
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
    this.pad(properties.pad);
    this.scrollNav(properties.nav.scrollNav);
    this.minNavHeight(properties.nav.minNavHeight)
      .axisHeight(properties.nav.minNavHeight)
      .scrollNavHeight(properties.nav.scrollNavHeight);
    this.minHeight(properties.minHeight).height(properties.minHeight);
    this.latestTranslation(properties.nav.latestTranslation)
      .currentTranslation(properties.nav.currentTranslation);
    this.axisGutter(properties.axisGutter);
    this.gutter(properties.gutter);
    this.buffer(properties.buffer);

    return container;
  };

  container.setNav = function() {
    nav.pan = d3.behavior.zoom()
      .scaleExtent([1, 1])
      .x(xScale)
      .on('zoom', function() {
        if ((endOfData - xScale.domain()[1] < MS_IN_24) && !(endOfData.getTime() === endpoints[1])) {
          console.log('Fetching new data! (right)');
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
            pools[j](poolGroup, container.allData());
          }
        }
        if ((xScale.domain()[0] - beginningOfData < MS_IN_24) && !(beginningOfData.getTime() === endpoints[0])) {
          console.log('Fetching new data! (left)');
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
            pools[j](poolGroup, container.allData());
          }
        }
        for (var i = 0; i < pools.length; i++) {
          pools[i].pan(d3.event);
        }
        d3.select('.d3-x.d3-axis').call(xAxis);
        if (scrollHandleTrigger) {
          d3.select('#scrollHandle').transition().ease('linear').attr('cx', function(d) {
            d.x = nav.scrollScale(xScale.domain()[0]);
            return d.x;
          });       
        }
      })
      .on('zoomend', function() {
        container.currentTranslation(nav.latestTranslation);
        scrollHandleTrigger = true;
      });

    mainGroup.call(nav.pan);

    return container;
  };

  container.setScrollNav = function() {
    scrollNav.attr('transform', 'translate(0,' + (height - nav.scrollNavHeight/4) + ')')
      .append('line')
      .attr({
        'x1': nav.scrollScale(endpoints[0]),
        'x2': nav.scrollScale(endpoints[1]),
        'y1': 0,
        'y2': 0,
        'stroke-width': 1,
        // TODO: move to LESS
        'stroke': '#989897',
        'shape-rendering': 'crispEdges'
      });

    var drag = d3.behavior.drag()
      .origin(function(d) {
        return d;
      })
      .on('dragstart', function() {
        d3.event.sourceEvent.stopPropagation(); // silence the click-and-drag listener
      })
      .on('drag', function(d) {
        d.x += d3.event.dx;
        d3.select(this).attr('cx', function(d) { return d.x; });
        var date = nav.scrollScale.invert(d.x);
        nav.currentTranslation += -xScale(date);
        scrollHandleTrigger = false;
        nav.pan.translate([nav.currentTranslation, 0]);
        nav.pan.event(mainGroup);
      });

    scrollNav.selectAll('circle')
      .data([{'x': nav.scrollScale(beginningOfData), 'y': 0}])
      .enter()
      .append('circle')
      .attr({
        'cx': function(d) { return d.x; },
        'r': 5,
        'fill': '#989897',
        'id': 'scrollHandle'
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
    var totalHeight = x + container.pad() * 2 + container.axisHeight();
    if (nav.scrollNav) {
      totalHeight += container.scrollNavHeight();
    }
    if (totalHeight >= minHeight) {
      if (totalHeight > bucket.height()) {
        height = bucket.height() - container.axisHeight() - container.pad() * 2;
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

  container.pad = function(x) {
    if (!arguments.length) return pad;
    pad = x;
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
    var first = Date.parse(a[0].deviceTimestamp);
    var last = Date.parse(a[a.length - 1].deviceTimestamp);
    var minusOne = new Date(last);
    minusOne.setDate(minusOne.getDate() - 1);
    initialEndpoints = [minusOne, last];
    container.beginningOfData(minusOne).endOfData(last);
    endpoints = [first, last];
    container.endpoints = endpoints;
    var outerBeg = new Date(endpoints[0]);
    outerBeg.setDate(outerBeg.getDate() - 1);
    var outerEnd = new Date(endpoints[1]);
    outerEnd.setDate(outerEnd.getDate() + 1);
    outerEndpoints = [outerBeg, outerEnd];
    container.initialEndpoints = initialEndpoints;
    return container;
  };

  container.allData = function(x) {
    if (!arguments.length) return allData;
    allData = allData.concat(x);
    console.log('Length of allData array is', allData.length);
    var plus = new Date(xScale.domain()[1]);
    plus.setDate(plus.getDate() + container.buffer());
    var minus = new Date(xScale.domain()[0]);
    minus.setDate(minus.getDate() - container.buffer());
    if (beginningOfData < minus) {
      container.beginningOfData(minus); 
      allData = _.filter(allData, function(datapoint) {
        var t = Date.parse(datapoint.deviceTimestamp);
        if (t >= minus) {
          return t;
        }
      });
    }
    if (endOfData > plus) {
      container.endOfData(plus);
      allData = _.filter(allData, function(datapoint) {
        var t = Date.parse(datapoint.deviceTimestamp);
        if (t <= plus) {
          return t;
        }
      });
    }
    allData = _.sortBy(allData, 'deviceTimestamp');
    return pool;
  };

  container.buffer = function(x) {
    if (!arguments.length) return buffer;
    buffer = x;
    return pool;
  };

  return container;
};
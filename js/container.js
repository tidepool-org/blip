var pool = require('./pool');

module.exports = function() {

  var MS_IN_24 = 86400000;

  var id = 'tidelineSVG',
    endpoints,
    width = 960,
    height = 580,
    pad = 0,
    pools = [],
    xScale = d3.time.scale(),
    xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
    pan,
    scrollScale = d3.time.scale(),
    xScroll = d3.svg.axis().scale(scrollScale).orient("bottom"),
    horizon,
    beginningOfData,
    endOfData,
    currentPosition = 0;

  container.newPool = function() {
    var p = pool(container);
    pools.push(p);
    return p;
  };

  function container(selection) {
    selection.each(function(data) {
      // select the SVG if it already exists
      var mainSVG = selection.selectAll('svg').data([data]);
      // otherwise create a new SVG and enter   
      var mainGroup = mainSVG.enter().append('svg').append('g').attr('id', 'tidelineMain');

      var poolGroup = mainGroup.append('g').attr('id', 'tidelinePools');

      // update SVG dimenions and ID
      mainSVG.attr({
        'id': id,
        'width': width,
        'height': height
      });

      container.updateXScale(data);

      mainGroup.append('g')
        .attr('class', 'x axis')
        .attr('id', 'tidelineXAxis')
        // TODO: remove magic number 50
        .attr('transform', 'translate(0,' + (height - 50) + ')')
        .call(xAxis);

      mainGroup.append('rect')
        .attr({
          'id': 'poolsInvisibleRect',
          'width': width,
          'height': height,
          'opacity': 0.0
        });

      mainGroup.append('g')
        .attr('id', 'tidelineLabels');

      var xNav = mainGroup.append('g')
        .attr('class', 'x')
        .attr('id', 'tidelineNav')
        .attr('transform', 'translate(' + (width / 2) + ',0)');

      xNav.append('path')
        .attr({
          // TODO: remove magic numbers, colors
          'd': 'M -100 10 L -140 25 -100 40 Z',
          'fill': 'white',
          'stroke': 'black',
          'id': 'd3NavBack'
        });

      xNav.append('path')
        .attr({
          // TODO: remove magic numbers, colors
          'd': 'M 100 10 L 140 25 100 40 Z',
          'fill': 'white',
          'stroke': 'black',
          'id': 'd3NavForward'
        });

      mainGroup.append('g')
        // TODO: change later when not (re-)using .axis CSS class
        .attr('class', 'x scroll')
        .attr('id', 'tidelineScroll');

      // TODO: update inner group dimensions if decide to have a margin
      // mainGroup.attr('transform', 'translate(' + margin.left + "," + margin.top + ')');   
    });
  }

  container.setNav = function() {
    var mainGroup = d3.select('#tidelineMain');
    var poolGroup = d3.select('#tidelinePools');

    pan = d3.behavior.zoom()
      .scaleExtent([1, 1])
      .x(xScale)
      .on('zoom', function() {
        // update horizon
        horizon.start = xScale.domain()[0];
        horizon.end = xScale.domain()[1];
        if (endOfData - horizon.end < MS_IN_24) {
          console.log('Creating new data! (right)');
          for (j = 0; j < pools.length; j++) {
            var plusOne = new Date(container.endOfData());
            plusOne.setDate(plusOne.getDate() + 1);
            pools[j](poolGroup, [endOfData, plusOne]);
          }
          // update endOfData
          container.endOfData(plusOne);
        }
        else if (horizon.start - beginningOfData < MS_IN_24) {
          console.log('Creating new data! (left)');
          for (j = 0; j < pools.length; j++) {
            var plusOne = new Date(container.beginningOfData());
            plusOne.setDate(plusOne.getDate() - 1);
            pools[j](poolGroup, [plusOne, beginningOfData]);
          }
          // update beginningOfData
          container.beginningOfData(plusOne);
        }
        for (var i = 0; i < pools.length; i++) {
          pools[i].pan(d3.event);
        }
        d3.select('.x.axis').call(xAxis);
      });

    mainGroup.call(pan);

    $('#d3NavForward').on('click', function() {
      console.log('Jumped forward a day.');
      currentPosition = currentPosition - width;
      pan.translate([currentPosition, 0]);
      pan.event(mainGroup.transition().duration(500));
    });

    $('#d3NavBack').on('click', function() {
      console.log('Jumped back a day.');
      currentPosition = currentPosition + width;
      pan.translate([currentPosition, 0]);
      pan.event(mainGroup.transition().duration(500));
    });
  };

  container.updateXScale = function(_) {
    if (!arguments.length) return xScale;
    container.horizon(_[0].timestamp);
    container.beginningOfData(_[0].timestamp);
    container.endOfData(_[_.length - 1].timestamp);
    xScale.domain([horizon.start, horizon.end]).range([pad, width - pad]);
    return container;
  };

  container.updateScrollScale = function(_) {
    if (!arguments.length) return scrollScale;
    scrollScale.domain(endpoints).range([pad, width - pad]);
    return container;
  };

  container.setScrollbar = function() {

    var mainGroup = d3.select('#tidelineMain');
    var scrollBar = d3.select('#tidelineScroll');

    // TODO: remove magic number 20
    scrollBar.attr('transform', 'translate(0,' + (height - 20) + ')')
      .append('line')
      .attr({
        'x1': scrollScale(endpoints[0]),
        'x2': scrollScale(endpoints[1]),
        'y1': 0,
        'y2': 0,
        'stroke-width': 3,
        'stroke': 'black'
      });

    var drag = d3.behavior.drag()
      .origin(function(d) {
        return d;
      })
      .on('dragstart', function() {
        d3.event.sourceEvent.stopPropagation(); // silence other listeners
      })
      .on('drag', function(d) {
        d.x += d3.event.dx;
        d3.select(this).attr('cx', function(d) { return d.x; });
        var date = scrollScale.invert(d.x);
        console.log(date);
        currentPosition = currentPosition - xScale(date) + width;
        pan.translate([currentPosition, 0]);
        pan.event(mainGroup);
      });

    scrollBar.selectAll('circle')
      .data([{'x': scrollScale(endpoints[0]), 'y': 0}])
      .enter()
      .append('circle')
      .attr({
        'cx': function(d) { return d.x; },
        'r': 5,
        'fill': 'gray',
        'id': 'scrollHandle'
      })
      .call(drag);
  };

  container.id = function(_) {
    if (!arguments.length) return id;
    id = _;
    return container;
  };

  container.endpoints = function(x) {
    if (!arguments.length) return endpoints;
    endpoints = x;
    container.updateScrollScale(endpoints);
    container.setScrollbar();
    return container;
  };

  container.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return container;
  };

  container.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return container;
  };

  container.horizon = function(d) {
    if (!arguments.length) return horizon;
    horizon = {
      start: new Date(d),
      end: new Date(d)
    };
    horizon.end.setDate(horizon.end.getDate() + 1);
    return container;
  }

  container.beginningOfData = function(d) {
    if (!arguments.length) return beginningOfData;
    beginningOfData = new Date(d);
    return container;
  }

  container.endOfData = function(d) {
    if (!arguments.length) return endOfData;
    endOfData = new Date(d);
    return container;
  }

  container.pad = function(_) {
    if (!arguments.length) return pad;
    pad = _;
    return container;
  };

  container.pools = function(_) {
    if (!arguments.length) return pools;
    pools = _;
    return container;
  };

  return container;
};
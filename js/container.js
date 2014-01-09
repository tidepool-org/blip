var pool = require('./pool');

module.exports = function(data) {

  var MS_IN_24 = 86400000;

  var id = 'tidelineSVG',
    width = 960,
    height = 580,
    pad = 0,
    pools = [],
    xScale = d3.time.scale(),
    xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
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
    // select the SVG if it already exists
    var mainSVG = selection.selectAll('svg').data([data]);
    // otherwise create a new SVG
    var mainGroup = mainSVG.enter().append('svg').append('g').attr('id', 'tidelineMain');

    // update SVG dimenions and ID
    mainSVG.attr({
      'id': id,
      'width': width,
      'height': height
    });

    container.updateXScale(data);

    mainSVG.append('g')
      .attr('class', 'x axis')
      .attr('id', 'tidelineXAxis')
      .attr('transform', 'translate(0,' + (height - 50) + ')')
      .call(xAxis);

    var xNav = mainSVG.append('g')
      .attr('class', 'x')
      .attr('id', 'tidelineNav')
      .attr('transform', 'translate(' + (width / 2) + ',0)');

    xNav.append('path')
      .attr({
        'd': 'M -100 10 L -140 25 -100 40 Z',
        'fill': 'white',
        'stroke': 'black',
        'id': 'd3NavBack'
      });

    xNav.append('path')
      .attr({
        'd': 'M 100 10 L 140 25 100 40 Z',
        'fill': 'white',
        'stroke': 'black',
        'id': 'd3NavForward'
      });

    var pan = d3.behavior.zoom()
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
            pools[j](mainGroup, [endOfData, plusOne]);
          }
          // update endOfData
          container.endOfData(plusOne);
        }
        else if (horizon.start - beginningOfData < MS_IN_24) {
          console.log('Creating new data! (left)');
          for (j = 0; j < pools.length; j++) {
            var plusOne = new Date(container.beginningOfData());
            plusOne.setDate(plusOne.getDate() - 1);
            pools[j](mainGroup, [plusOne, beginningOfData]);
          }
          // update beginningOfData
          container.beginningOfData(plusOne);
        }
        for (var i = 0; i < pools.length; i++) {
          pools[i].pan(d3.event);
        }
        d3.select('.x.axis').call(xAxis);
      });

    mainSVG.call(pan);

    $('#d3NavForward').on('click', function() {
      console.log('Jumped forward a day.');
      currentPosition = currentPosition - width;
      pan.translate([currentPosition, 0]);
      pan.event(mainSVG.transition().duration(500));
    });

    $('#d3NavBack').on('click', function() {
      console.log('Jumped back a day.');
      currentPosition = currentPosition + width;
      pan.translate([currentPosition, 0]);
      pan.event(mainSVG.transition().duration(500));
    });

    // TODO: update inner group dimensions if decide to have a margin
    // mainGroup.attr('transform', 'translate(' + margin.left + "," + margin.top + ')');
  }

  container.updateXScale = function(_) {
    if (!arguments.length) return xScale;
    container.horizon(_[0].timestamp);
    container.beginningOfData(_[0].timestamp);
    container.endOfData(_[_.length - 1].timestamp);
    xScale.domain([horizon.start, horizon.end]).range([pad, width - pad]);
    return container;
  };

  container.id = function(_) {
    if (!arguments.length) return id;
    id = _;
    return container;
  }

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
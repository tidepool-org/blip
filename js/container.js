var pool = require('./pool');

module.exports = function(data) {

  var MS_IN_24 = 86400000;

  var id = 'mainSVG',
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
    var mainGroup = mainSVG.enter().append('svg').append('g').attr('id', 'mainGroup');

    // update SVG dimenions and ID
    mainSVG.attr({
      'id': id,
      'width': width,
      'height': height
    });

    container.updateXScale(data);

    mainSVG.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (height - 50) + ')')
      .call(xAxis);

    var xNav = mainSVG.append('g')
      .attr('class', 'x d3-nav')
      .attr('transform', 'translate(' + (width / 2) + ',0)');

    xNav.append('path')
      .attr({
        'd': 'M -100 10 L -140 25 -100 40 Z',
        'fill': 'white',
        'stroke': 'black',
        'id': 'd3-nav-back'
      });

    xNav.append('path')
      .attr({
        'd': 'M 100 10 L 140 25 100 40 Z',
        'fill': 'white',
        'stroke': 'black',
        'id': 'd3-nav-forward'
      });

    var pan = d3.behavior.zoom()
      .scaleExtent([1, 1])
      .x(xScale)
      .on('zoom', function() {
        // update horizon
        horizon = xScale.domain()[1];
        if (endOfData - horizon < MS_IN_24) {
          console.log('Creating new data!');
          for (j = 0; j < pools.length; j++) {
            var plusTwo = new Date(container.endOfData());
            plusTwo.setDate(plusTwo.getDate() + 2);
            pools[j](mainGroup, [container.endOfData(), plusTwo]);
          }
          // update endOfData
          container.endOfData(plusTwo);
        }
        for (var i = 0; i < pools.length; i++) {
          pools[i].pan(d3.event);
        }
        d3.select('.x.axis').call(xAxis);
      });

    mainSVG.call(pan);

    $('#d3-nav-forward').on('click', function() {
      console.log('Jumped forward a day.');
      currentPosition = currentPosition - width;
      pan.translate([currentPosition, 0]);
      pan.event(d3.transition(mainSVG));
    });

    // TODO: update inner group dimensions if decide to have a margin
    // mainGroup.attr('transform', 'translate(' + margin.left + "," + margin.top + ')');
  }

  container.updateXScale = function(_) {
    if (!arguments.length) return xScale;
    container.horizon(_[0].timestamp);
    container.endOfData(_[_.length - 1].timestamp);
    xScale.domain([_[0].timestamp, horizon]).range([pad, width - pad]);
    container.xScale = xScale;
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
    horizon = new Date(d);
    horizon.setDate(horizon.getDate() + 1);
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
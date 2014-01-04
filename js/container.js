var pool = require('./pool');

module.exports = function() {

  var id = 'mainSVG',
    width = 960,
    height = 530,
    pad = 0,
    pools = [],
    xScale = d3.time.scale(),
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

  container.newPool = function() {
    var p = pool(container);
    pools.push(p);
    return p;
  };

  function container(selection) {
    selection.each(function(data) {
      // select the SVG if it already exists
      var mainSVG = d3.select(this).selectAll('svg').data([data]);
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

      var pan = d3.behavior.zoom()
        .scaleExtent([1, 1])
        .x(xScale)
        .on('zoom', function() {
          for (var i = 0; i < pools.length; i++) {
            pools[i].pan(d3.event);
            d3.select('.x.axis').call(xAxis);
          }
          console.log(xScale.domain());
        });

      mainSVG.call(pan);

      // TODO: update inner group dimensions if decide to have a margin
      // mainGroup.attr('transform', 'translate(' + margin.left + "," + margin.top + ')');
    });
  }

  container.updateXScale = function(_) {
    if (!arguments.length) return xScale;
    xScale.domain([_[0].timestamp, _[288].timestamp]).range([pad, width - pad]);
    xScale.ticks(d3.time.hour, 1);
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
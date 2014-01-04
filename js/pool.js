module.exports = function(container) {

  // TMP: colors, etc. for demo-ing
  var colors = d3.scale.category20(),
    grays = ['#f7f7f7', '#d9d9d9', '#bdbdbd', '#969696', '#636363', '#252525'];

  var id, yPosition, group,
    mainSVG = d3.select('#mainSVG'),
    yScale = d3.scale.linear(),
    width = 78,
    height = 60,
    pad = 5;

  function pool(selection) {
    selection.each(function(data) {
      // select the pool group if it already exists
      var mainGroup = d3.select(this).selectAll('#' + id).data([data]);
      // otherwise create a new pool group
      group = mainGroup.enter().append('g').attr({
        'id': id,
        'transform': 'translate(0,' + yPosition + ')'
      });
      pool.updateYScale(data).fillPool().plotPool();
    });
  }

  pool.fillPool = function(init) {
    if (!arguments.length) { init = 0; }
    for (var i = 0; i < 24; i++) {
      group.append('rect')
        .attr({
          'width': width,
          'height': height,
          'x': init + (i * (width + 2)) + 1,
          'y': 0,
          'fill': grays[j],
          'class': 'd3-rect'
        });
    }
    return pool;
  };

  pool.plotPool = function() {
    var plotGroup = group.append('g').attr('id', id + '_random');
    plotGroup.selectAll('circle')
      .data(plotGroup.data()[0])
      .enter()
      .append('circle')
      .attr({
        'cx': function(d) {
          return container.xScale(d.timestamp);
        },
        'cy': function(d) {
          return yScale(d.value);
        },
        'r': 3,
        'fill': function(d) {
          return colors(d.value);
        },
        'class': 'd3-circle'
      });
    return pool;
  };

  pool.pan = function(e) {
    d3.selectAll('.d3-circle').attr('transform', 'translate(' + e.translate[0] + ',0)');
    d3.selectAll('.d3-rect').attr('transform', 'translate(' + e.translate[0] + ',0)');
  };

  // getters & setters
  pool.id = function(_) {
    if (!arguments.length) return id;
    id = _;
    return pool;
  };

  pool.yPosition = function(_) {
    if (!arguments.length) return yPosition;
    yPosition = _;
    return pool;
  };

  pool.updateYScale = function(_) {
    if (!arguments.length) return yScale;
    yScale.domain(d3.extent(_, function(d) { return d.value; })).range([height - pad, pad]);
    return pool;
  };

  pool.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return pool;
  };

  pool.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return pool;
  };

  pool.pad = function(_) {
    if (!arguments.length) return pad;
    pad = _;
    return pool;
  };

  return pool;
};
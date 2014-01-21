module.exports = function(container) {

  // TMP: colors, etc. for demo-ing
  var colors = d3.scale.category20(),
    grays = ['#f7f7f7', '#d9d9d9', '#bdbdbd', '#969696', '#636363', '#252525'];

  var allData = [],
    id, yPosition, label, group,
    mainSVG = d3.select('#tidelineSVG'),
    xScale,
    yScale = d3.scale.linear(),
    fillGap = 1,
    width,
    height = 60,
    pad = 5;

  function pool(selection, poolData) {
    pool.allData(poolData);
    // select the pool group if it already exists
    group = selection.selectAll('#' + id).data([allData]);
    // otherwise create a new pool group
    group.enter().append('g').attr({
      'id': id,
      'transform': 'translate(0,' + yPosition + ')'
    });
    pool.updateYScale(allData).fillPool(xScale(poolData[0].timestamp)).plotPool();
  }

  pool.fillPool = function(init) {
    var rectGroup = group.selectAll('#' + id + '_fill').data(group.data());
    rectGroup.enter().append('g').attr('id', id + '_fill');
    for (var i = 0; i < 12; i++) {
      rectGroup.append('rect')
        .attr({
          'width': width,
          'height': height,
          'x': init + (i * (width + fillGap)) + fillGap/2,
          'y': 0,
          'fill': grays[j],
          'class': 'd3-rect on-deck'
        });
    }
    return pool;
  };

  pool.plotPool = function() {
    var plotGroup = group.selectAll('#' + id + '_random').data(group.data());
    plotGroup.enter().append('g').attr('id', id + '_random');
    plotGroup.selectAll('circle')
      .data(plotGroup.data()[0])
      .enter()
      .append('circle')
      .attr({
        'cx': function(d) {
          return xScale(d.timestamp);
        },
        'cy': function(d) {
          return yScale(d.value);
        },
        'r': 3,
        'fill': function(d) {
          return colors(d.value);
        },
        'class': 'd3-circle on-deck'
      });
    return pool;
  };

  pool.pan = function(e) {
    container.latestTranslation(e.translate[0]);
    d3.selectAll('.d3-circle').attr('transform', 'translate(' + e.translate[0] + ',0)');
    d3.selectAll('.d3-rect').attr('transform', 'translate(' + e.translate[0] + ',0)');
  };

  pool.drawLabel = function() {
    var labelGroup = d3.select('#tidelineLabels');
    labelGroup.append('text')
      .attr({
        'id': 'pool_' + id + '_label',
        'class': 'd3-pool-label',
        'transform': 'translate(0,' + yPosition + ')'
      })
      .text(label);
    return pool;
  };

  // getters & setters
  pool.allData = function(_) {
    if (!arguments.length) return allData;
    allData = allData.concat(_);
    return pool;
  }

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

  pool.label = function(_) {
    if (!arguments.length) return label;
    label = _;
    return pool;
  }

  pool.updateYScale = function(_) {
    if (!arguments.length) return yScale;
    yScale.domain(d3.extent(_, function(d) { return d.value; })).range([height - pad, pad]);
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

  pool.xScale = function(_) {
    if (!arguments.length) return xScale;
    xScale = _;
    // width is equivalent to a duration of 2 hours minus the pixels for the gap in fill between sections
    width = xScale(new Date(2014, 0, 1, 2, 0, 0, 0)) - fillGap;
    return pool;
  }

  return pool;
};
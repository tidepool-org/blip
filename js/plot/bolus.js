module.exports = function(pool, opts) {

  var opts = opts || {};

  var defaults = {
    xScale: pool.xScale().copy(),
    width: 8
  };

  _.defaults(opts, defaults);

  function bolus(selection) {
    selection.each(function(currentData) {
      var boluses = d3.select(this)
        .selectAll('g')
        .data(currentData, function(d) {
          // leveraging the timestamp of each datapoint as the ID for D3's binding
          return d.normalTime;
        });
      var bolusGroups = boluses.enter()
        .append('g')
        .attr({
          'class': 'd3-bolus-group'
        });
      var top = opts.yScale.range()[0];
      bolusGroups.append('rect')
        .attr({
          'x': function(d) {
            return bolus.x(d);
          },
          'y': function(d) {
            return opts.yScale(d.value);
          },
          'width': opts.width,
          'height': function(d) {
            return top - opts.yScale(d.value);
          },
          'class': 'd3-rect-bolus d3-bolus',
          'id': function(d) {
            return d.normalTime + ' ' + d.value + ' ' + d.recommended + ' recommended';
          }
        });
      boluses.exit().remove();
    });
  }
  
  bolus.x = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - opts.width/2;
  };

  return bolus; 
};
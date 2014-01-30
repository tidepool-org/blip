module.exports = function(pool, opts) {

  var opts = opts || {};

  var defaults = {
    classes: {
      'low': 80,
      'target': 180,
      'high': 200
    },
    xScale: pool.xScale().copy()
  };

  _.defaults(opts, defaults);

  function cbg(selection) {
    selection.each(function(currentData) {
      var circles = d3.select(this)
        .selectAll('circle')
        .data(currentData, function(d) {
          // leveraging the timestamp of each datapoint as the ID for D3's binding
          return d.deviceTime;
        });
      circles.enter()
        .append('circle')
        .attr({
          'cx': function(d) {
            return opts.xScale(Date.parse(d.deviceTime));
          },
          'class': function(d) {
            if (d.value < opts.classes['low']) {
              return 'd3-bg-low';
            }
            else if (d.value < opts.classes['target']) {
              return 'd3-bg-target';
            }
            else {
              return 'd3-bg-high'
            }
          },
          'cy': function(d) {
            return opts.yScale(d.value);
          },
          'r': 2.5,
          'id': function(d) {
            return d.deviceTime + ' ' + d.value;
          }
        })
        .classed({'d3-circle': true, 'd3-cbg': true});
      circles.exit().remove();
    });
  }

  return cbg; 
};
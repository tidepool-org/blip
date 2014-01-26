module.exports = function(pool, opts) {

  var opts = opts || {};

  var defaults = {
    classes: {
      'low': 80,
      'target': 180,
      'high': 200
    },
    xScale: pool.xScale().copy(),
    yScale: d3.scale.linear().domain([0, 400]).range([pool.height(), 0])
  };

  _.defaults(opts, defaults);

  function cbg(selection) {
    selection.each(function(currentData) {
      var circles = d3.select(this)
        .selectAll('circle')
        .data(currentData, function(d) {
          // leveraging the timestamp of each datapoint as the ID for D3's binding
          return d.time;
        });
      circles.enter()
        .append('circle')
        .attr({
          'cx': function(d) {
            return opts.xScale(Date.parse(d.time));
          },
          'class': function(d) {
            if (d.value < opts.classes['low']) {
              return 'low';
            }
            else if (d.value < opts.classes['target']) {
              return 'target';
            }
            else {
              return 'high'
            }
          },
          'cy': function(d) {
            return opts.yScale(d.value);
          },
          'r': 2.5,
          'id': function(d) {
            return d.time + ' ' + d.value;
          }
        })
        .classed({'d3-circle': true, 'cbg': true});
      circles.exit().remove();
    });
  }

  return cbg; 
};
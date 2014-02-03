module.exports = function(pool, opts) {

  var opts = opts || {};

  var defaults = {
    classes: {
      'very-low': 60,
      'low': 80,
      'target': 180,
      'high': 200,
      'very-high': 300
    },
    size: 16,
    xScale: pool.xScale().copy(),
    yScale: d3.scale.linear().domain([0, 400]).range([pool.height(), 0])
  };

  _.defaults(opts, defaults);

  function smbg(selection) {
    selection.each(function(currentData) {
      var circles = d3.select(this)
        .selectAll('image')
        .data(currentData, function(d) {
          // leveraging the timestamp of each datapoint as the ID for D3's binding
          return d.normalTime;
        });
      circles.enter()
        .append('image')
        .attr({
          'xlink:href': function(d) {
            if (d.value <= opts.classes['very-low']) {
              return '../img/smbg/very_low.svg';
            }
            else if ((d.value > opts.classes['very-low']) && (d.value <= opts.classes['low'])) {
              return '../img/smbg/low.svg';
            }
            else if ((d.value > opts.classes['low']) && (d.value <= opts.classes['target'])) {
              return '../img/smbg/target.svg';
            }
            else if ((d.value > opts.classes['target']) && (d.value <= opts.classes['high'])) {
              return '../img/smbg/high.svg';
            }
            else if (d.value > opts.classes['high']) {
              return '../img/smbg/very_high.svg';
            }
          },
          'x': function(d) {
            return opts.xScale(Date.parse(d.normalTime)) - opts.size / 2;
          },
          'y': function(d) {
            return opts.yScale(d.value) - opts.size / 2;
          },
          'width': opts.size,
          'height': opts.size,
          'id': function(d) {
            return d.normalTime + ' ' + d.value;
          }
        })
        .classed({'d3-image': true, 'd3-smbg': true, 'd3-smbg-image': true});
      circles.exit().remove();
    });
  }

  return smbg; 
};
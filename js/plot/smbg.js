module.exports = function(pool, opts) {

  var opts = opts || {};

  var defaults = {
    classes: {
      'very-low': {'boundary': 60},
      'low': {'boundary': 80, 'tooltip': 'smbg_tooltip_low.svg'},
      'target': {'boundary': 180, 'tooltip': 'smbg_tooltip_target.svg'},
      'high': {'boundary': 200, 'tooltip': 'smbg_tooltip_high.svg'},
      'very-high': {'boundary': 300}
    },
    size: 16,
    xScale: pool.xScale().copy(),
    yScale: d3.scale.linear().domain([0, 400]).range([pool.height(), 0]),
    tooltipWidth: 70,
    tooltipHeight: 24
  };

  _.defaults(opts, defaults);

  var tooltips = pool.tooltips();

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
            if (d.value <= opts.classes['very-low']['boundary']) {
              return '../img/smbg/very_low.svg';
            }
            else if ((d.value > opts.classes['very-low']['boundary']) && (d.value <= opts.classes['low']['boundary'])) {
              return '../img/smbg/low.svg';
            }
            else if ((d.value > opts.classes['low']['boundary']) && (d.value <= opts.classes['target']['boundary'])) {
              return '../img/smbg/target.svg';
            }
            else if ((d.value > opts.classes['target']['boundary']) && (d.value <= opts.classes['high']['boundary'])) {
              return '../img/smbg/high.svg';
            }
            else if (d.value > opts.classes['high']['boundary']) {
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
            return 'smbg_' + d.id;
          },
          'class': function(d) {
            if (d.value <= opts.classes['low']['boundary']) {
              return 'd3-bg-low';
            }
            else if ((d.value > opts.classes['low']['boundary']) && (d.value <= opts.classes['target']['boundary'])) {
              return 'd3-bg-target';
            }
            else if (d.value > opts.classes['target']['boundary']) {
              return 'd3-bg-high';
            }
          }
        })
        .classed({'d3-image': true, 'd3-smbg': true, 'd3-image-smbg': true});
      circles.exit().remove();

      // tooltips
      d3.selectAll('.d3-image-smbg').on('mouseover', function() {
        if (d3.select(this).classed('d3-bg-low')) {
          smbg.addTooltip(d3.select(this).datum(), 'low'); 
        }
        else if (d3.select(this).classed('d3-bg-target')) {
          smbg.addTooltip(d3.select(this).datum(), 'target'); 
        }
        else {
          smbg.addTooltip(d3.select(this).datum(), 'high'); 
        }
      });
      d3.selectAll('.d3-image-smbg').on('mouseout', function() {
        var id = d3.select(this).attr('id').replace('smbg_', 'tooltip_');
        d3.select('#' + id).remove();
      });
    });
  }

  smbg.addTooltip = function(d, category) {
    d3.select('#' + 'd3-tooltip-group_smbg')
      .call(tooltips, 
        d,
        // tooltipXPos
        opts.xScale(Date.parse(d.normalTime)),
        'smbg',
        // timestamp
        true,
        opts.classes[category]['tooltip'], 
        opts.tooltipWidth,
        opts.tooltipHeight, 
        // imageX
        opts.xScale(Date.parse(d.normalTime)), 
        // imageY
        function() {
          if ((category === 'low') || (category === 'target')) {
            return opts.yScale(d.value) - opts.tooltipHeight; 
          }
          else {
            return opts.yScale(d.value);
          }
        },
        // textX
        opts.xScale(Date.parse(d.normalTime)) + opts.tooltipWidth / 2,
        // textY
        function() {
          if ((category === 'low') || (category === 'target')) {
            return opts.yScale(d.value) - opts.tooltipHeight / 2; 
          }
          else {
            return opts.yScale(d.value) + opts.tooltipHeight / 2;
          }
        });
  };

  return smbg; 
};
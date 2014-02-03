module.exports = function(pool, opts) {

  var opts = opts || {};

  var defaults = {
    xScale: pool.xScale().copy(),
    width: 12,
    bolusStroke: 2,
    triangleSize: 6
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
      // boluses where delivered = recommended
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
      // boluses where recommendation and delivery differ
      var bottom = top - opts.bolusStroke / 2;
      // boluses where recommended > delivered
      var underride = bolusGroups.filter(function(d) {
        if (d.recommended > d.value) {
          return d;
        }
      });
      underride.append('rect')
        .attr({
          'x': function(d) {
            return bolus.x(d);
          },
          'y': function(d) {
            return opts.yScale(d.recommended);
          },
          'width': opts.width,
          'height': function(d) {
            return opts.yScale(d.value) - opts.yScale(d.recommended);
          },
          'class': 'd3-rect-recommended d3-bolus',
          'id': function(d) {
            return d.normalTime + ' ' + d.value + ' ' + d.recommended + ' recommended';
          }
        });
      // boluses where delivered > recommended
      var override = bolusGroups.filter(function(d) {
        if (d.value > d.recommended) {
          return d;
        }
      });
      override.append('rect')
        .attr({
          'x': function(d) {
            return bolus.x(d);
          },
          'y': function(d) {
            return opts.yScale(d.recommended);
          },
          'width': opts.width,
          'height': function(d) {
            return top - opts.yScale(d.recommended);
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-rect-recommended d3-bolus',
          'id': function(d) {
            return d.normalTime + ' ' + d.value + ' ' + d.recommended + ' recommended';
          }
        });
      override.append('path')
        .attr({
          'd': function(d) {
            var leftEdge = bolus.x(d) + opts.bolusStroke / 2;
            var rightEdge = leftEdge + opts.width - opts.bolusStroke;
            var bolusHeight = opts.yScale(d.value) + opts.bolusStroke / 2;
            return "M" + leftEdge + ' ' + bottom + "L" + rightEdge + ' ' + bottom + "L" + rightEdge + ' ' + bolusHeight + "L" + leftEdge + ' ' + bolusHeight + "Z";
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-path-bolus d3-bolus',
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
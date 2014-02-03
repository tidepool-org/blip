var watson = require('../../example/watson');

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
      // square- and dual-wave boluses
      var extendedBoluses = bolusGroups.filter(function(d) {
        if (d.extended) {
          return d;
        }
      });
      extendedBoluses.append('path')
        .attr({
          'd': function(d) {
            var rightEdge = bolus.x(d) + opts.width;
            var doseHeight = opts.yScale(d.extendedDelivery) + opts.bolusStroke / 2;
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.duration) - opts.triangleSize / 2;
            return "M" + rightEdge + ' ' + doseHeight + "L" + doseEnd + ' ' + doseHeight;
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-path-extended d3-bolus',
          'id': function(d) {
            return d.normalTime + ' ' + d.extendedDelivery + ' ' + ' ended at ' + watson.strip(new Date(opts.xScale.invert(opts.xScale(Date.parse(d.normalTime) + d.duration))));
          }
        });
      extendedBoluses.append('path')
        .attr({
          'd': function(d) {      
            var doseHeight = opts.yScale(d.extendedDelivery) + opts.bolusStroke / 2;
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.duration) - opts.triangleSize / 2;
            return bolus.triangle(doseEnd, doseHeight);
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-path-extended-triangle d3-bolus',
          'id': function(d) {
            return d.normalTime + ' ' + d.extendedDelivery + ' ' + ' ended at ' + watson.strip(new Date(opts.xScale.invert(opts.xScale(Date.parse(d.normalTime) + d.duration))));
          }
        });
      boluses.exit().remove();
    });
  }
  
  bolus.x = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - opts.width/2;
  };

  bolus.triangle = function(x, y) {
    var top = (x + opts.triangleSize) + ' ' + (y + opts.triangleSize/2);
    var bottom = (x + opts.triangleSize) + ' ' + (y - opts.triangleSize/2);
    var point = x + ' ' + y;
    return "M" + top + "L" + bottom + "L" + point + "Z";
  };

  return bolus; 
};
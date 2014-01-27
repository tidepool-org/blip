module.exports = function(pool, opts) {

  var first = new Date(opts.endpoints[0]),
    last = new Date(opts.endpoints[1]),
    nearest, fills = [];

  first.setMinutes(first.getMinutes() + first.getTimezoneOffset());
  last.setMinutes(last.getMinutes() + last.getTimezoneOffset());

  var defaults = {
    classes: {
      0: 'darkest',
      3: 'dark',
      6: 'lighter',
      9: 'light',
      12: 'lightest',
      15: 'lighter',
      18: 'dark',
      21: 'darkest'
    },
    duration: 3,
    scale: pool.xScale().copy()
  };

  _.defaults(opts || {}, defaults);

  function fill(selection) {
    fill.findNearest(opts.endpoints[1]);
    var otherNear = new Date(nearest);
    otherNear.setMinutes(otherNear.getMinutes() - otherNear.getTimezoneOffset());
    fills.push({
      width: opts.scale(last) - opts.scale(nearest),
      x: opts.scale(otherNear),
      fill: opts.classes[nearest.getHours()]
    });
    current = new Date(nearest);
    while (current > first) {
      var next = new Date(current);
      next.setHours(current.getHours() - opts.duration);
      var otherNext = new Date(next);
      otherNext.setMinutes(otherNext.getMinutes() - otherNext.getTimezoneOffset());
      fills.push({
        width: opts.scale(current) - opts.scale(next),
        x: opts.scale(otherNext),
        fill: opts.classes[next.getHours()]
      });
      current = next;
    }
    selection.selectAll('rect')
      .data(fills)
      .enter()
      .append('rect')
      .attr({
        'x': function(d) {
          return d.x;
        },
        'y': 0,
        'width': function(d) {
          return d.width;
        },
        'height': pool.height(),
        'class': function(d) {
          return 'd3-rect-fill ' + d.fill;
        }
      });
  }

  fill.findNearest = function(d) {
    var date = new Date(d);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    var hourBreaks = [];
    var i = 0;
    while (i <= 24) {
      hourBreaks.push(i);
      i += opts.duration;
    }
    for(var i = 0; i < hourBreaks.length; i++) {
      var br = hourBreaks[i];
      var nextBr = hourBreaks[i + 1];
      if ((date.getHours() >= br) && (date.getHours() < nextBr)) {
        nearest = new Date(date.getFullYear(), date.getMonth(), date.getDate(), br, 0, 0);
      }
    }
  };
  
  return fill;  
};
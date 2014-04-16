var d3 = require('../../lib/').d3;

var log = require('../../lib/').bows('AnnotationIcon');

module.exports = function(container, annotationsGroup) {

  var id, r = 8;

  function annotation(selection, opts) {
    opts = opts || {};

    if (!(opts.x && opts.y)) {
      log('Sorry, I need x and y coordinates to plot an annotation icon.');
      return;
    }

    var x = annotation.xOffset(opts), y = annotation.yOffset(opts);

    selection.append('circle')
      .attr({
        'cx': x,
        'cy': y,
        'r': r,
        'class': 'd3-circle-data-annotation',
      });
    selection.append('text')
      .attr({
        'x': x,
        'y': y,
        'class': 'd3-text-data-annotation'
      })
      .text('?');
  }

  annotation.xOffset = function(opts, multiplier) {
    if (multiplier != null) {
      return opts.x;
    }
    return opts.x + (r * opts.xMultiplier);
  };

  annotation.yOffset = function(opts, multiplier) {
    if (multiplier != null) {
      return opts.y;
    }
    return opts.y - (r * opts.yMultiplier);
  };

  annotation.addGroup = function(pool, type) {
    annotationsGroup.append('g')
      .attr('id', annotation.id() + '_' + type)
      .attr('transform', pool.attr('transform'));
  };

  // getters & setters
  annotation.id = function(x) {
    if (!arguments.length) return id;
    id = annotationsGroup.attr('id');
    return annotation;
  };

  return annotation;
};
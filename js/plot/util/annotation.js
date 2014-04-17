var d3 = require('../../lib/').d3;
var _ = require('../../lib/')._;

var shapes = require('./shapes');

var log = require('../../lib/').bows('AnnotationIcon');

module.exports = function(container, annotationsGroup) {

  var id, r = 8;

  var defaults = {
    'foWidth': 200,
    'triangleWidth': 18,
    'triangleHeight': 12,
    'mainText': "We can't be 100% certain of the data displayed here because of how the device maker reports the data."
  };

  function annotation(selection, opts) {
    opts = opts || {};

    _.defaults(opts, defaults);

    if (!(opts.x && opts.y)) {
      log('Sorry, I need x and y coordinates to plot an annotation icon.');
      return;
    }

    selection = selection.append('g')
      .attr('class', 'd3-data-annotation-group');

    var x = annotation.xOffset(opts), y = annotation.yOffset(opts);

    var hoverTarget = selection.append('circle')
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

    if (opts.hoverTarget != null) {
      hoverTarget = opts.hoverTarget;
    }
    annotation.tooltip(x, y, opts, selection, hoverTarget);
  }

  annotation.tooltip = function(x, y, opts, selection, hoverTarget) {
    hoverTarget.on('mouseover', function() {
      console.log('Hi there :D');
      var fo = selection.append('foreignObject')
        .attr({
          'x': x,
          'y': y,
          'width': opts.foWidth,
          'transform': 'translate(' + (0-(3/2*opts.triangleWidth)) +
            ',' + opts.triangleHeight + ')',
          'class': 'd3-tooltip-data-annotation'
        });
      var div = fo.append('xhtml:body')
        .append('div')
        .attr('class', 'd3-div-data-annotation');
      div.append('p')
        .attr('class', 'd3-data-annotation-lead')
        .html('Why is there a question mark here?');
      div.append('p')
        .html(opts.mainText);
      var foHeight = div[0][0].getBoundingClientRect().height;
      fo.attr('height', foHeight);
      selection.insert('polygon', '.d3-tooltip-data-annotation')
        .attr({
          'points': shapes.tooltipPolygon({
            'w': opts.foWidth,
            'h': foHeight,
            't': opts.triangleWidth,
            'k': opts.triangleHeight
          }),
          'transform': 'translate(' + x + ',' + y + ')',
          'width': opts.foWidth,
          'height': opts.triangleHeight + foHeight,
          'class': 'd3-polygon-data-annotation'
        });
    });
    hoverTarget.on('mouseout', function() {
      selection.selectAll('.d3-tooltip-data-annotation').remove();
      selection.selectAll('.d3-polygon-data-annotation').remove();
    });
  };

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
var d3 = require('../../lib/').d3;
var _ = require('../../lib/')._;

var shapes = require('./shapes');
var defs = require('./annotationdefinitions');
var dt = require('../../data/util/datetime');

var log = require('../../lib/').bows('AnnotationIcon');

module.exports = function(container, annotationsGroup) {

  var id, r = 8;

  var defaults = {
    'foWidth': 200,
    'triangleWidth': 18,
    'triangleHeight': 12,
    'orientation': {}
  };

  function annotation(selection, opts) {
    opts = opts || {};

    _.defaults(opts, defaults);

    if (!((opts.x != null) && (opts.y != null))) {
      log('Sorry, I need x and y coordinates to plot an annotation icon.');
      return;
    }

    var hoverTarget;

    if (opts.d.annotations[0].code !== 'stats') {
      var iconGroup = selection.append('g')
        .attr('class', 'd3-data-annotation-group')
        .attr('clip-path', 'url(#annotationsClipPath)')
        .attr('id', 'annotation_for_' + opts.d._id);

      opts.x = annotation.xOffset(opts);
      opts.y = annotation.yOffset(opts);

      hoverTarget = iconGroup.append('circle')
        .attr({
          'cx': opts.x,
          'cy': opts.y,
          'r': r,
          'class': 'd3-circle-data-annotation',
        });
      iconGroup.append('text')
        .attr({
          'x': opts.x,
          'y': opts.y,
          'class': 'd3-text-data-annotation'
        })
        .text('?');

      if (opts.hoverTarget != null) {
        hoverTarget = opts.hoverTarget;
      }
      annotation.tooltip(opts, selection, hoverTarget);
    }
    else {
      if (opts.hoverTarget != null) {
        hoverTarget = opts.hoverTarget;
      }
      annotation.tooltip(opts, selection, hoverTarget);
    }
  }

  annotation.tooltip = function(opts, selection, hoverTarget) {
    opts = opts || {};

    if (opts.d.annotations[0].code === 'stats') {
      if (container.type === 'daily') {
        opts.x = opts.x - (container.currentTranslation() - container.axisGutter());
      }
      else if (container.type === 'weekly') {
        opts.y = opts.y - container.currentTranslation();
      }
    }

    _.defaults(opts, defaults);

    hoverTarget.on('mouseover', function() {

      try {
        var edge = container.getCurrentDomain().end;
        opts.orientation.left = dt.isNearRightEdge(opts.d, edge);
      }
      catch (TypeError) {}

      var fo = selection.append('foreignObject')
        .attr({
          'x': opts.x,
          'y': opts.y,
          'width': opts.foWidth,
          'class': 'd3-tooltip-data-annotation'
        });
      var div = fo.append('xhtml:body')
        .append('div')
        .attr('class', 'd3-div-data-annotation');

      // append lead text, if any
      var lead = defs.lead(opts.lead);
      if (lead) {
        div.append('p')
          .attr('class', 'd3-data-annotation-lead')
          .html(lead);
      }

      // append all annotation texts
      var codes = opts.d.annotations;
      _.each(codes, function(code) {
        div.append('p')
          .html(defs.main(code, opts.d.source));
      });

      // get height of HTML
      var foHeight = div[0][0].getBoundingClientRect().height;
      var anchorX = opts.orientation.left ? (3/2*opts.triangleWidth) - opts.foWidth : (0-(3/2*opts.triangleWidth));
      var anchorY = opts.orientation.up ? -(foHeight + opts.triangleHeight) : opts.triangleHeight;

      fo.attr({
        'height': foHeight,
        'transform': 'translate(' + anchorX + ',' + anchorY + ')'
      });
      var polygon = shapes.tooltipPolygon({
          'w': opts.foWidth,
          'h': foHeight,
          't': opts.triangleWidth,
          'k': opts.triangleHeight
        });
      if (opts.orientation.up) {
        polygon = shapes.mirrorImageX(polygon);
      }
      // not an else if because orientation can be both up & left
      if (opts.orientation.left) {
        polygon = shapes.mirrorImageY(polygon);
      }

      selection.insert('polygon', '.d3-tooltip-data-annotation')
        .attr({
          'points': polygon,
          'transform': 'translate(' + opts.x + ',' + opts.y + ')',
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
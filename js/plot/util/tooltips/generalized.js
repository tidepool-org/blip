/* 
 * == BSD2 LICENSE ==
 */

var _ = require('lodash');
var d3 = require('d3');

var shapes = require('./shapes');
var shapeutil = require('../shapeutil');

module.exports = {
  add: function(d, opts) {
    opts = opts || {};
    if (!opts.group) {
      console.log(new Error('A base group for tooltips is required!'));
      return;
    }
    var defaults = {
      classes: [],
      orientation: {
        'default': 'normal'
      },
      shape: 'generic',
      translation: 'translate(0,0)'
    };
    _.defaults(opts, defaults);

    var shape = shapes[opts.shape];

    var classString = '';
    _.each(opts.classes, function(cls) {
      classString += cls + ' ';
    });

    var tooltipGroup = opts.group.append('g')
      .attr({
        id: 'tooltip_' + d.id,
        'class': classString + 'd3-tooltip d3-' + d.type,
        transform: opts.translation
      });

    var foGroup = tooltipGroup.append('foreignObject')
      .attr({
        // need to set an initial width to give the HTML something to shape itself in relation to
        width: 200,
        // hide the foreignObject initially so that the resizing isn't visible
        visibility: 'hidden',
        'class': 'svg-tooltip-fo'
      })
      .append('xhtml:div')
      .attr({
        'class': 'tooltip-div'
      });

    function anchor() {
      var widths = [];
      foGroup.selectAll('span')
        .each(function() {
          widths.push(d3.select(this)[0][0].getBoundingClientRect().width);
        });
      var foWidth = d3.max(widths), foHeight = foGroup[0][0].offsetHeight;
      opts.w = foWidth + 20;
      opts.h = foHeight;
      opts.y = -foHeight;
      var foItself = tooltipGroup.select('.svg-tooltip-fo')
        .attr({
          width: opts.w,
          height: opts.h,
          visibility: 'visible'
        });
      var offsetVal = shape.offset();
      switch(opts.orientation) {
        case 'rightAndDown':
          shape.offset(foItself, {x: offsetVal, y: offsetVal});
          break;
        case 'leftAndDown':
          shape.offset(foItself, {x: -opts.w - offsetVal, y: offsetVal});
          break;
        case 'leftAndUp':
          shape.offset(foItself, {x: -opts.w - offsetVal, y: opts.y - offsetVal});
          break;
        default:
          shape.offset(foItself, {x: offsetVal, y: opts.y - offsetVal});
      }
    }

    function makeShape() {
      var selection = d3.select(foGroup.node().parentNode);
      var atRightEdge = opts.edge === 'right';
      var atLeftEdge = opts.edge === 'left';
      var tooltipGroup = d3.select(selection.node().parentNode);
      _.each(shape.els, function(el) {
        var attrs = _.clone(el.attrs);
        for (var prop in attrs) {
          // polygons have a pointsFn to generate the proper size polygon given the input dimensions
          if (typeof attrs[prop] === 'function') {
            var res = attrs[prop](opts);
            if (shape.orientations) {
              res = shape.orientations[opts.orientation](res);
            }
            // pointsFn isn't a proper SVG attribute, of course, so must be deleted
            delete attrs[prop];
            attrs[prop.replace('Fn', '')] = res;
          }
        }
        tooltipGroup.insert(el.el, '.svg-tooltip-fo')
          .attr(attrs);
      });
    }

    return {
      anchor: anchor,
      foGroup: foGroup,
      makeShape: makeShape,
      tooltipGroup: tooltipGroup
    };
  },
  remove: function(d) {
    d3.select('#tooltip_' + d.id).remove();
  }
};
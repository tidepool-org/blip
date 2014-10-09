var _ = require('lodash');
var d3 = window.d3;
var moment = require('moment');

var format = require('../../js/data/util/format');
var shapes = require('../../js/plot/util/tooltips/shapes');

d3.chart('SMBGDay', {
  initialize: function() {
    var chart = this;

    var xPosition = function(d) {
      var msPer24Pos = Date.parse(d.normalTime) - d3.time.day.utc.floor(new Date(d.normalTime));
      return chart.xScale()(msPer24Pos);
    };

    var yPosition = function(d) {
      return chart.yScale()(d.value);
    };

    this.layer('smbgLines', this.base.append('g').attr('class', 'smbgLines'), {
      dataBind: function(data) {
        var pathData = _.map(_.sortBy(data, function(d) { return d.normalTime; }), function(d) {
          return [
            xPosition(d),
            yPosition(d)
          ];
        });
        return this.selectAll('path')
          .data([pathData]);
      },
      insert: function() {
        return this.append('path')
          .attr('class', 'smbgPath');
      },
      events: {
        enter: function() {
          var line = d3.svg.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .interpolate('linear');
          this.attr({
            d: function(d) {
              return line(d);
            },
            'stroke-width': chart.smbgOpts().stroke,
            visibility: chart.showingLines() ? 'visible': 'hidden'
          });
        },
        exit: function() {
          this.remove();
        }
      }
    });

    this.layer('smbgCircles', this.base.append('g').attr('class', 'smbgCircles'), {
      dataBind: function(data) {
        return this.selectAll('circle')
          .data(data, function(d) { return d.id; });
      },
      insert: function() {
        return this.append('circle')
          .attr('class', 'smbgCircle');
      },
      events: {
        enter: function() {
          this.attr({
            cx: xPosition,
            cy: yPosition,
            r: chart.smbgOpts().r
          })
          .on('mouseover', function(d) {
            chart.base.select('.smbgPath').attr('visibility', 'visible');
            var day = chart.base.attr('class').replace('modalDay ', '');
            var tooltipGroup = d3.select('#modalHighlightGroup').append('g')
              .attr({
                id: 'tooltip_' + d.id,
                'class': 'd3-tooltip d3-smbg svg-tooltip-smbg ' + day,
                transform: 'translate(' + xPosition(d) + ',' + yPosition(d) + ')'
              });
            var foGroup = tooltipGroup.append('foreignObject')
              .attr({
                // need to set an initial width to give the HTML something to shape itself in relation to
                width: 200,
                // hide the foreignObject initially so that the resizing isn't visible
                visibility: 'hidden',
                'class': 'svg-tooltip-fo svg-tooltip-left-and-up'
              })
              .append('xhtml:div')
              .attr({
                'class': 'tooltip-div'
              });
            foGroup.append('p')
              .append('span')
              .attr('class', 'secondary')
              .html('<span class="fromto">at</span> ' + format.timestamp(d.normalTime));
            foGroup.append('p')
              .attr('class', 'value')
              .append('span')
              .html(format.tooltipBG(d, chart.smbgOpts().units));
            var widths = [];
            foGroup.selectAll('span')
              .each(function() {
                widths.push(d3.select(this)[0][0].getBoundingClientRect().width);
              });
            var foWidth = d3.max(widths), foHeight = foGroup[0][0].offsetHeight;
            var opts = {w: foWidth + 20, h: foHeight, y:-foHeight, orientation: {
              'default': 'normal'
            }};
            var foItself = tooltipGroup.select('.svg-tooltip-fo')
              .attr({
                width: opts.w,
                height: opts.h,
                visibility: 'visible'
              });
            var shape = 'smbg';
            var offsetVal = shapes[shape].offset();
            shapes[shape].offset(foItself, {x: offsetVal, y: opts.y - offsetVal});
            _.each(shapes[shape].els, function(el) {
              var attrs = _.clone(el.attrs);
              for (var prop in attrs) {
                // polygons have a pointsFn to generate the proper size polygon given the input dimensions
                if (typeof attrs[prop] === 'function') {
                  var res = attrs[prop](opts);
                  if (shapes[shape].orientations) {
                    res = shapes[shape].orientations[opts.orientation['default']](res);
                  }
                  // pointsFn isn't a proper SVG attribute, of course, so must be deleted
                  delete attrs[prop];
                  attrs[prop.replace('Fn', '')] = res;
                }
              }
              tooltipGroup.insert(el.el, '.svg-tooltip-fo')
                .attr(attrs);
            });
          })
          .on('mouseout', function(d) {
            chart.base.select('.smbgPath').attr('visibility', chart.showingLines() ? 'visible': 'hidden');
            d3.select('#tooltip_' + d.id).remove();
          });
        },
        exit: function() {
          this.remove();
        }
      }
    });
  },
  showingLines: function(showingLines) {
    if (!arguments.length) { return this._showingLines; }
    this._showingLines = showingLines;
    return this;
  },
  smbgOpts: function(smbgOpts) {
    if (!arguments.length) { return this._smbgOpts; }
    this._smbgOpts = smbgOpts;
    return this;
  },
  xScale: function(xScale) {
    if (!arguments.length) { return this._xScale; }
    this._xScale = xScale;
    return this;
  },
  yScale: function(yScale) {
    if (!arguments.length) { return this._yScale; }
    this._yScale = yScale;
    return this;
  }
});

var chart;

module.exports = {
  create: function(el, scales, opts) {
    opts = opts || {};
    var defaults = {
      smbg: {
        r: 5,
        stroke: 3,
        units: 'mg/dL'
      }
    };
    _.defaults(opts, defaults);

    chart = d3.select(el)
      .chart('SMBGDay')
      .showingLines(opts.showingLines)
      .smbgOpts(opts.smbg)
      .xScale(scales.x)
      .yScale(scales.y);

    return this;
  },
  render: function(data, opts) {
    opts = opts || {};
    var defaults = {};
    _.defaults(opts, defaults);

    chart.draw(data);

    return this;
  }
};
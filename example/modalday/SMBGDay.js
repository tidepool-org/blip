var _ = require('lodash');
var d3 = window.d3;
var moment = require('moment');

var format = require('../../js/data/util/format');
var shapes = require('../../js/plot/util/tooltips/shapes');

d3.chart('SMBGDay', {
  initialize: function() {
    var chart = this;

    function getMsPer24(d) {
      return Date.parse(d.normalTime) - d3.time.day.utc.floor(new Date(d.normalTime));
    }

    var xPositionGrouped = function(d) {
      var msPer24 = getMsPer24(d);
      var binSize = 108e5; // 3 hrs
      var thresholds = {
        0: binSize,
        3: binSize * 2,
        6: binSize * 3,
        9: binSize * 4,
        12: binSize * 5,
        15: binSize * 6,
        18: binSize * 7,
        21: binSize * 8
      };
      for (var key in thresholds) {
        var val = thresholds[key];
        if (msPer24 < val) {
          msPer24 = val;
          return chart.xScale()(thresholds[key]-(108e5/2));
        }
      }
    };

    var xPosition = function(d) {
      var msPer24 = getMsPer24(d);
      return chart.xScale()(msPer24);
    };

    var yPosition = function(d) {
      return chart.yScale()(d.value);
    };

    var createTooltip = function(d) {
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
        .html(moment.utc(d.normalTime).format('ddd, MMM Do'));
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
    };

    var removeTooltip = function(d) {
      chart.base.select('.smbgPath').attr('visibility', chart.showingLines() ? 'visible': 'hidden');
      d3.select('#tooltip_' + d.id).remove();
    };

    this.layer('smbgLines', this.base.append('g').attr('class', 'smbgLines'), {
      dataBind: function(data) {
        var xFn = chart.grouped() ? xPositionGrouped : xPosition;
        var pathData = _.map(_.sortBy(data, function(d) { return d.normalTime; }), function(d) {
          return [
            xFn(d),
            yPosition(d)
          ];
        });
        return this.selectAll('path')
          .data([pathData]);
      },
      insert: function() {
        return this.append('path')
          .attr({
            'class': 'smbgPath',
            'stroke-width': chart.smbgOpts().stroke
          });
      },
      events: {
        merge: function() {
          var line = d3.svg.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .interpolate('linear');
          this.attr({
            d: function(d) {
              var byX = _.groupBy(d, function(p) { return p[0]; });
              for (var key in byX) {
                var haveSameX = byX[key].length;
                if (haveSameX > 1) {
                  var newPoint = [parseFloat(key)];
                  newPoint.push(_.reduce(byX[key], function(sum, num) { return sum + num[1]; }, 0)/haveSameX);
                  byX[key] = [newPoint];
                }
              }
              d = _.map(Object.keys(byX), function(key) { return byX[key][0]; });
              return line(d);
            },
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
          var grouped = chart.grouped();
          this.attr({
            cy: yPosition,
            r: chart.smbgOpts().r
          });
        },
        'merge:transition': function() {
          this.attr({
            cx: chart.grouped() ? xPositionGrouped : xPosition
          });
        },
        merge: function() {
          var grouped = chart.grouped();
          this.on('mouseover', grouped ? null : createTooltip)
            .on('mouseout', grouped ? null : removeTooltip);
        },
        exit: function() {
          this.remove();
        }
      }
    });
  },
  grouped: function(grouped) {
    if (!arguments.length) { return this._grouped; }
    this._grouped = grouped;
    return this;
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

module.exports = function() {
  var chart;

  return {
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
        .smbgOpts(opts.smbg)
        .xScale(scales.x)
        .yScale(scales.y);

      return this;
    },
    render: function(data, opts) {
      opts = opts || {};
      var defaults = {
        grouped: false,
        showingLines: true
      };
      _.defaults(opts, defaults);

      chart.grouped(opts.grouped)
        .showingLines(opts.showingLines)
        .draw(data);

      return this;
    }
  };
};
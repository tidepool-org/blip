var _ = require('lodash');
var d3 = window.d3;
var moment = require('moment-timezone');
var tideline = require('../../../js/index');
var bgBoundaryClass = tideline.plot.util.bgboundary;
var format = tideline.data.util.format;
var dt = tideline.data.util.datetime;
var tooltips = tideline.plot.util.tooltips.generalized;

var THREE_HRS = 10800000, NINE_HRS = 75600000;

d3.chart('SMBGBoxOverlay', {
  initialize: function() {
    var chart = this;

    var boxPlotsGroup = this.base.insert('g', '#modalDays').attr('id', 'overlayUnderneath');
    var meanCirclesGroup = this.base.append('g').attr('id', 'overlayOnTop');

    function getMsPer24(d) {
      return dt.getMsPer24(d.msX, chart.timezone());
    }

    /**
     * Get the coordinates of the mean point given a record
     * 
     * @param  {Object} d the record
     * @return {Array}   coordinates
     */
    function getMeanPosition(d) {
      var mean = d3.select('#meanCircle-'+d.id);
      return [mean.attr('cx'), mean.attr('cy')];
    }

    var tooltipHtml = function(tooltip, d) {
      var rectOpts = chart.opts().infoRects;
      var xScale = chart.xScale();
      var yScale = chart.yScale();

      var parent = d3.select(tooltip.tooltipGroup.node().parentNode);

      var rangeLabels = parent.append('g')
        .attr('class', 'smbgRangeInfo modalDay');

      var maxYRect = yScale(d.max) - rectOpts.height - rectOpts.pad;
      var maxYText = yScale(d.max) - (rectOpts.height/2);
      var minYRect = yScale(d.min) + rectOpts.pad;
      var minYText = yScale(d.min) + rectOpts.height;

      if (d.max > 385) {
        maxYRect = yScale(d.max) + rectOpts.pad;
        maxYText = yScale(d.max) + rectOpts.height;
      }

      if (d.min < 60) {
        minYRect = yScale(d.min) - rectOpts.height - rectOpts.pad;
        minYText = yScale(d.min) - (rectOpts.height/2);
      }

      appendRangeLabel(rangeLabels, maxYRect, maxYText, d.max);
      appendRangeLabel(rangeLabels, minYRect, minYText, d.min);

      console.log(d);

      tooltip.foGroup
        .append('p')
        .append('span')
        .attr('class', 'secondary')
        .html('<span class="fromto">avg of</span> <span class="value">'+ Math.round(d.mean) + '</span>');

      tooltip.foGroup
        .append('p')
        .append('span')
        .attr('class', 'secondary')
        .html('<span class="fromto">from</span> ' + format.timestamp(d.fromDate) +  ' <span class="fromto">to</span> ' + format.timestamp(d.toDate));

      /**
       * Add a label to either end of the range
       * 
       * @param  {Object} elem  a d3 selection
       * @param  {Number} yRect
       * @param  {Number} yText
       * @param  {Number|String} val
       */
      function appendRangeLabel(elem, yRect, yText, val) {
        elem.append('rect')
        .attr({
          x: xScale(d.msX) - (rectOpts.width/2),
          y: yRect,
          width: rectOpts.width,
          height: rectOpts.height
        });
        elem.append('text')
          .attr({
            x: xScale(d.msX),
            y: yText
          })
          .text(val);
      }
    };

    var tooltipOrientation = function(d) {
      d.value = d.mean; // need to make datum have a value field - a bit hacky :/
      var cssClass = chart.getBgBoundaryClass(d);
      var high = (cssClass.search('d3-bg-high') !== -1);
      var msPer24 = getMsPer24(d);
      var left = msPer24 <= THREE_HRS;
      var right = msPer24 >= NINE_HRS;
      if (high) {
        if (left) {
          return 'rightAndDown';
        }
        else {
          return 'leftAndDown';
        }
      }
      else {
        if (right) {
          return 'leftAndUp';
        }
        else {
          return 'normal';
        }
      }
    };

    var createTooltip = function(d) {
      var coords = getMeanPosition(d);
      var tooltip = tooltips.add(d, {
        group: d3.select('#modalHighlightGroup'),
        classes: ['svg-tooltip-range'],
        orientation: tooltipOrientation(d),
        translation: 'translate(' + coords[0] + ',' + coords[1] + ')'
      });
      tooltipHtml(tooltip, d);
      tooltip.anchor();
      tooltip.makeShape();
      d3.select('#rangeBox-'+d.id).classed('hover', true);
    };

    var removeTooltip = function(d) {
      tooltips.remove(d);
      d3.select('.smbgRangeInfo').remove();
      d3.select('#rangeBox-'+d.id).classed('hover', false);
    };

    this.layer('rangeBoxes', boxPlotsGroup.append('g').attr('id', 'rangeBoxes'), {
      dataBind: function(data) {
        return this.selectAll('rect.rangeBox')
          .data(data, function(d) { return d.msX; });
      },
      insert: function() {
        return this.append('rect')
          .attr({
            'class': 'rangeBox',
            width: chart.opts().rectWidth,
            id: function(d) { return 'rangeBox-' + d.id; }
          });
      },
      events: {
        enter: function() {
          var xScale = chart.xScale(), yScale = chart.yScale();
          var halfRect = chart.opts().rectWidth/2;
          this.attr({
              x: function(d) { return xScale(d.msX) - halfRect; }
            });
        },
        merge: function() {
          var xScale = chart.xScale(), yScale = chart.yScale();
          this.attr({
              y: function(d) { return yScale(d.max); },
              height: function(d) {
                return yScale(d.min) - yScale(d.max);
              }
            });
          this.on('mouseover', createTooltip);
          this.on('mouseout', removeTooltip);
        },
        exit: function() {
          this.remove();
        }
      }
    }); 

    this.layer('meanCircles', meanCirclesGroup.append('g').attr('id', 'meanCircles'), {
      dataBind: function(data) {
        return this.selectAll('circle.meanCircle')
          .data(data, function(d) { return d.msX; });
      },
      insert: function() {
        return this.append('circle')
          .attr({
            'class': 'meanCircle',
            r: chart.opts().rectWidth/2,
            id: function(d) { return 'meanCircle-' + d.id; }
          });
      },
      events: {
        enter: function() {
          var xScale = chart.xScale(), yScale = chart.yScale();
          this.attr({
              cx: function(d) { return xScale(d.msX); }
            });
        },
        merge: function() {
          var xScale = chart.xScale(), yScale = chart.yScale();
          this.attr({
              cy: function(d) { return yScale(d.mean); },
            });
          this.on('mouseover', createTooltip);
          this.on('mouseout', removeTooltip);
        },
        exit: function() {
          this.remove();
        }
      }
    });
  },
  opts: function(opts) {
    if (!arguments.length) { return this._opts; }
    this._opts = opts;
    return this;
  },
  remove: function() {
    this.base.select('#overlayUnderneath').remove();
    this.base.select('#overlayOnTop').remove();
    return this;
  },
  transform: function(data) {
    var timezone = this.timezone();
    var binSize = THREE_HRS;
    var binned = _.groupBy(data, function(d) {
      var msPer24 = Date.parse(d.normalTime) - moment.utc(d.normalTime).tz(timezone).startOf('day');
      return Math.ceil(msPer24/binSize) * binSize - (binSize/2);
    });
    var binKeys = Object.keys(binned);
    var retData = [];
    var value = function(d) { return d.value; };
    var normalTime = function(d) { return new Date(d.normalTime); };
    var reduceForMean = function(s, n) { return s + n.value; };
    for (var i = 0; i < binKeys.length; ++i) {
      retData.push({
        id: i,
        fromDate: d3.min(binned[binKeys[i]], normalTime),
        toDate: d3.max(binned[binKeys[i]], normalTime),
        max: d3.max(binned[binKeys[i]], value),
        mean: _.reduce(binned[binKeys[i]], reduceForMean, 0)/binned[binKeys[i]].length,
        min: d3.min(binned[binKeys[i]], value),
        msX: parseInt(binKeys[i], 10),
        values: binned[binKeys[i]]
      });
    }
    return retData;
  },
  bgClasses: function(bgClasses) {
    if (!arguments.length) { return this._bgClasses; }
    this._bgClasses = bgClasses;
    this.getBgBoundaryClass = bgBoundaryClass(bgClasses);
    return this;
  },
  timezone: function(timezone) {
    if (!arguments.length) { return this._timezone; }
    this._timezone = timezone;
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
      opts: {
        infoRects: {
          pad: 5,
          height: 20,
          width: 30
        },
        rectWidth: 18
      }
    };
    _.defaults(opts, defaults);

    chart = el.chart('SMBGBoxOverlay')
      .opts(opts.opts)
      .bgClasses(opts.bgClasses)
      .timezone(opts.timezone)
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
  },
  destroy: function() {
    chart.remove();

    return this;
  }
};
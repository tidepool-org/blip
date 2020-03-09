/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

var i18next = require('i18next');
var _ = require('lodash');
var t = i18next.t.bind(i18next);

var legend = {
  SHAPE_MARGIN: 3,
  SHAPE_WIDTH: 15.5,
  basal: [
    {
      create: function(opts) {
        const radius = 7;
        opts.widths.push(2*radius + legend.SHAPE_MARGIN);
        const g = opts.selection.append('g').attr({ class: 'd3-basal d3-basal-loop-mode' });
        g.append('circle').attr({
          class: 'd3-basal-circle',
          cx: -radius,
          cy: -5,
          r: radius,
        });
        g.append('text').attr({
          class: 'd3-basal-label',
          transform: `translate(${-radius}, -5)`
        }).text(t('A_Label').charAt(0));
        return g;
      },
      type: 'group'
    },
    {
      create: function(opts) {
        return opts.selection.append('text')
          .attr({
            class: 'd3-pool-legend'
          })
          .text(t('Loop mode'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width + legend.SHAPE_MARGIN);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    },
    {
      create: function(opts) {
        const radius = 7;
        opts.widths.push(2*radius);
        const g = opts.selection.append('g').attr({ class: 'd3-basal d3-basal-loop-mode-off' });
        g.append('circle').attr({
          class: 'd3-basal-circle',
          cx: -radius,
          cy: -5,
          r: radius,
        });
        g.append('text').attr({
          class: 'd3-basal-label',
          transform: `translate(${-radius}, -5)`
        }).text(t('M_Label').charAt(0));
        return g;
      },
      type: 'group'
    },
    {
      create: function(opts) {
        return opts.selection.append('text')
          .attr({
            class: 'd3-pool-legend'
          })
          .text(t('Loop mode off'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width);
          });
      },
      type: 'text'
    }
  ],
  bg: [
    {
      create: function(opts) {
        return opts.selection.append('text')
          .attr({
            'class': 'd3-pool-legend'
          })
          .text(t('high'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    },
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('circle')
          .attr({
            'class': 'd3-smbg d3-circle-smbg d3-bg-very-high'
          });
      },
      type: 'circle'
    },
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('circle')
          .attr({
            'class': 'd3-smbg d3-circle-smbg d3-bg-high'
          });
      },
      type: 'circle'
    },
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('circle')
          .attr({
            'class': 'd3-smbg d3-circle-smbg d3-bg-target'
          });
      },
      type: 'circle'
    },
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('circle')
          .attr({
            'class': 'd3-smbg d3-circle-smbg d3-bg-low'
          });
      },
      type: 'circle'
    },
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('circle')
          .attr({
            'class': 'd3-smbg d3-circle-smbg d3-bg-very-low'
          });
      },
      type: 'circle'
    },
    {
      create: function(opts) {
        return opts.selection.append('text')
          .attr({
            'class': 'd3-pool-legend'
          })
          .text(t('low'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width);
          });
      },
      type: 'text'
    },
  ],
  bolus: [
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('rect')
          .attr({
            'class': 'd3-bolus d3-rect-bolus-legend'
          });
      },
      type: 'rect'
    },
    {
      create: function(opts) {
        return opts.selection.append('text')
          .attr({
            'class': 'd3-pool-legend'
          })
          .text(t('delivered'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    },
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('rect')
          .attr({
            'class': 'd3-bolus d3-rect-recommended-legend'
          });
      },
      type: 'rect'
    },
    {
      create: function(opts) {
        return opts.selection.append('text')
          .attr({
            'class': 'd3-pool-legend'
          })
          .text(t('undelivered'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    }
  ],
  carbs: [
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('rect')
          .attr({
            'class': 'd3-rect-carbs-legend'
          });
      },
      type: 'rect'
    },
    {
      create: function(opts) {
        return opts.selection.append('text')
          .attr({
            'class': 'd3-pool-legend'
          })
          .text(t('carbs'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    }
  ],
  rescuecarbs: [
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('rect')
          .attr({
            'class': 'd3-rect-rescuecarbs-legend'
          });
      },
      type: 'rect'
    },
    {
      create: function(opts) {
        return opts.selection.append('text')
          .attr({
            'class': 'd3-pool-legend'
          })
          .text(t('rescuecarbs'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    }
  ],
  cumWidth: function(a, i) {
    var b = a.slice();
    b.splice(i);
    return _.reduce(b, function(sum, num) { return sum + num; });
  },
  draw: function(selection, type) {
    var opts = {
      selection: selection,
      widths: [],
      SHAPE_WIDTH: this.SHAPE_WIDTH
    };
    var typeFns = this[type];
    _.each(typeFns, _.bind(function(fn, i) {
      var created = fn.create(opts), w;
      if (fn.type === 'text' || fn.type === 'group') {
        if (opts.widths[i - 1]) {
          w = this.cumWidth(opts.widths, i);
          if ((i === typeFns.length - 1) && (i !== 1)) {
            var s = this.SHAPE_WIDTH - this.SHAPE_MARGIN*2;
            created.attr('transform', 'translate(' + (-(w + s/2)) + ',0)');
          }
          else {
            created.attr('transform', 'translate(' + (-w) + ',0)');
          }
        }
      }
      else if (fn.type === 'circle') {
        if (opts.widths[i - 1]) {
          w = this.cumWidth(opts.widths, i);
          var r = (this.SHAPE_WIDTH - this.SHAPE_MARGIN*2)/2;
          created.attr({
            'cx': -(w + 2*r),
            'cy': -opts.textHeight/4,
            'r': r
          });
        }
      }
      else if (fn.type === 'rect') {
        var side = this.SHAPE_WIDTH - this.SHAPE_MARGIN*2;
        created.attr({
          'width': side,
          'height': side
        });
        if (opts.widths[i - 1]) {
          w = this.cumWidth(opts.widths, i);
          created.attr({
            'x': -w - this.SHAPE_WIDTH
          });
        }
        else {
          created.attr({
            'x': -side - 1.5
          });
        }
      }
    }, this));
    if (type !== 'bg') {
      // a y-attribute of 0 would put the top of the rects *at* the text baseline
      // so an upward (negative) shift of half the shape width works well
      var baselineShift = -(this.SHAPE_WIDTH/2 + this.SHAPE_MARGIN);
      selection.selectAll('rect')
        .attr('y', baselineShift);
    }
    var w;
    selection.each(function() { w = this.getBoundingClientRect(); });
    return w;
  }
};

module.exports = legend;

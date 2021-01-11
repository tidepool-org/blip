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

import i18next from 'i18next';
const _ = require('lodash');

const t = i18next.t.bind(i18next);

const rectLoopMode = 7;

const legend = {
  SHAPE_MARGIN: 3,
  SHAPE_WIDTH: 15.5,
  basal: [
    {
      create: (opts) => {
        opts.widths.push(4 * rectLoopMode + legend.SHAPE_MARGIN);
        const g = opts.selection.append('g').attr({ class: 'd3-basal d3-basal-loop-mode-off' });
        g.append('rect').attr({
          class: 'd3-basal-background',
          x: -rectLoopMode * 4,
          y: -rectLoopMode,
          width: rectLoopMode * 4,
          height: rectLoopMode * 2,
          rx: rectLoopMode / 2.0,
        });
        g.append('text').attr({
          class: 'd3-basal-label',
          transform: `translate(${-rectLoopMode * 2}, ${-rectLoopMode / 2.0})`
        }).text(t('M_Label'));
        return g;
      },
      type: 'group'
    },
    {
      create: (opts) => {
        opts.widths.push(4 * rectLoopMode + legend.SHAPE_MARGIN);
        const g = opts.selection.append('g').attr({ class: 'd3-basal d3-basal-loop-mode' });
        g.append('rect').attr({
          class: 'd3-basal-background',
          x: -rectLoopMode * 4,
          y: -rectLoopMode,
          width: rectLoopMode * 4,
          height: rectLoopMode * 2,
          rx: rectLoopMode / 2.0,
        });
        g.append('text').attr({
          class: 'd3-basal-label',
          transform: `translate(${-rectLoopMode * 2}, ${-rectLoopMode / 2.0})`
        }).text(t('A_Label'));
        return g;
      },
      type: 'group'
    },
    {
      create: (opts) => {
        return opts.selection.append('text')
          .attr({
            class: 'd3-pool-legend'
          })
          .text(t('Loop mode status'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width + legend.SHAPE_MARGIN);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    },
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
    // Bolus Text
    {
      create: (opts) => {
        return opts.selection.append('text')
          .attr({
            'class': 'd3-pool-legend'
          })
          .text(t('Bolus Legend'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width - legend.SHAPE_MARGIN);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    },
    // Meal Bolus
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH * 1.5);
        return opts.selection.append('rect')
          .attr({
            'class': 'd3-bolus d3-rect-bolus-legend d3-bolus-meal'
          });
      },
      type: 'rect'
    },
    {
      create: (opts) => {
        return opts.selection.append('text')
          .attr({
            'class': 'd3-pool-legend'
          })
          .text(t('Meal Bolus'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width - legend.SHAPE_MARGIN);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    },
    // Micro Bolus
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH * 1.5);
        return opts.selection.append('rect')
          .attr({
            'class': 'd3-bolus d3-rect-bolus-legend d3-bolus-micro'
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
          .text(t('Micro Bolus'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width - legend.SHAPE_MARGIN);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    },
    // Manual Bolus
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH * 1.5);
        return opts.selection.append('rect')
          .attr({
            'class': 'd3-bolus d3-rect-bolus-legend d3-bolus-manual'
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
          .text(t('Manual Bolus'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width - legend.SHAPE_MARGIN);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    },
    // Undelivered
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH * 1.5);
        return opts.selection.append('rect')
          .attr({
            'class': 'd3-bolus d3-rect-bolus-legend d3-bolus-undelivered'
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
          .text(t('Undelivered'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width - legend.SHAPE_MARGIN);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    },
    // Override (technically an Underride)
    {
      create: function(opts) {
        opts.widths.push(25);
        const g = opts.selection.append('g').attr({'class': 'd3-bolus d3-rect-bolus-legend'});
        g.append('rect')
          .attr({
            'class': 'd3-bolus-underride',
            transform: 'translate(-5, -5) rotate(45) translate(-10,10)',
            width: 10,
            height: 10,
          });
        g.append('rect')
          .attr({
            width: 14.5,
            height: 1,
            fill: 'var(--bkgrnd,white)',
            stroke: 'transparent',
            x: -19,
            y: -5.875,
            transform: 'translate(0,4.9)',
          });
        return g;
      },
      type: 'group'
    },
    {
      create: function(opts) {
        return opts.selection.append('text')
          .attr({
            'class': 'd3-pool-legend'
          })
          .text(t('Override'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width - legend.SHAPE_MARGIN);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    }
  ].reverse(),
  carbs: [
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('circle')
          .attr({
            'class': 'd3-circle-carbs-legend'
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
          .text(t('Carbs'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    }
  ].reverse(),
  rescuecarbs: [
    {
      create: function(opts) {
        opts.widths.push(opts.SHAPE_WIDTH);
        return opts.selection.append('circle')
          .attr({
            'class': 'd3-circle-rescuecarbs-legend'
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
          .text(t('Rescuecarbs'))
          .each(function() {
            opts.widths.push(this.getBoundingClientRect().width);
            opts.textHeight = this.getBoundingClientRect().height;
          });
      },
      type: 'text'
    }
  ].reverse(),
  cumWidth: function(a, i) {
    var b = a.slice();
    b.splice(i);
    return _.reduce(b, function(sum, num) { return sum + num; });
  },
  draw: function(selection, type) {
    const opts = {
      selection: selection,
      widths: [],
      SHAPE_WIDTH: this.SHAPE_WIDTH
    };
    const typeFns = this[type];
    _.forEach(typeFns, _.bind(function(fn, i) {
      const created = fn.create(opts);
      if (fn.type === 'text' || fn.type === 'group') {
        if (opts.widths[i - 1]) {
          const w = this.cumWidth(opts.widths, i);
          if ((i === typeFns.length - 1) && (i !== 1)) {
            const s = this.SHAPE_WIDTH - this.SHAPE_MARGIN*2;
            created.attr('transform', 'translate(' + (-(w + s/2)) + ',0)');
          } else {
            created.attr('transform', 'translate(' + (-w) + ',0)');
          }
        }
      }
      else if (fn.type === 'circle') {
        if (opts.widths[i - 1]) {
          const w = this.cumWidth(opts.widths, i);
          const r = (this.SHAPE_WIDTH - this.SHAPE_MARGIN*2)/2;
          created.attr({
            'cx': -(w + 2*r),
            'cy': -opts.textHeight/4,
            'r': r
          });
        }
      }
      else if (fn.type === 'rect') {
        const side = this.SHAPE_WIDTH - this.SHAPE_MARGIN*2;
        created.attr({
          'width': side,
          'height': side
        });
        if (opts.widths[i - 1]) {
          const w = this.cumWidth(opts.widths, i);
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

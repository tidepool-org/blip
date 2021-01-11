/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
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
const d3 = require('d3');
const _ = require('lodash');

const moment = require('moment-timezone');

const constants = require('../data/util/constants');
const format = require('../data/util/format');

const timeChangeImage = require('../../img/timechange/timechange.svg');

const t = i18next.t.bind(i18next);

/**
 * Module for adding timechange markers to a chart pool
 *
 * @param  {Object} pool the chart pool
 * @param  {Object|null} opts configuration options
 * @return {Object}      time change object
 */
module.exports = function(pool, opts) {
  opts = opts || {};
  /**
   * Default configuration for this component
   */
  var defaults = {
    tooltipPadding: 20
  };

  _.defaults(opts, defaults);

  function timechange(selection) {
    selection.each(function(currentData) {
      var filteredData = _.filter(currentData, {subType: 'timeChange'});

      var timechanges = d3.select(this)
        .selectAll('g.d3-timechange-group')
        .data(filteredData, function(d) {
          return d.id;
        });

      var timechangeGroup = timechanges.enter()
        .append('g')
        .attr({
          'class': 'd3-timechange-group',
          id: function(d) {
            return 'timechange_' + d.id;
          }
        });

      timechange.addTimeChangeToPool(timechangeGroup);

      timechanges.exit().remove();
    });
  }

  timechange.addTimeChangeToPool = function(selection) {
    opts.xScale = pool.xScale().copy();
    selection.append('image')
      .attr({
        'xlink:href': timeChangeImage,
        x: timechange.xPositionCorner,
        y: timechange.yPositionCorner,
        width: opts.size,
        height: opts.size
      })
      .classed({'d3-image': true, 'd3-timechange': true});

    selection.on('mouseover', timechange._displayTooltip);
    selection.on('mouseout', timechange._removeTooltip);
  };

  timechange._removeTooltip = function(d) {
    var elem = d3.select('#tooltip_' + d.id).remove();
  };

  timechange._displayTooltip = (d) => {
    if (d.source === 'Diabeloop') {
      timechange._diplayDblgTooltip(d);
    } else {
      timechange._diplayTidepoolTooltip(d);
    }
  };

  timechange._diplayDblgTooltip = (d) => {
    const mFrom = moment.tz(d.from.time, d.from.timeZoneName);
    const mTo = moment.tz(d.to.time, d.to.timeZoneName);

    let format = 'h:mm a';
    if (mFrom.year() !== mTo.year()) {
      format = constants.MMM_D_YYYY_H_MM_A_FORMAT;
    } else if (mFrom.month() !== mTo.month()) {
      format = constants.MMM_D_H_MM_A_FORMAT;
    } else if (mFrom.date() !== mTo.date()) {
      format = constants.DDDD_H_MM_A;
    } else {
      format = constants.H_MM_A_FORMAT;
    }

    const fromDate = mFrom.format(format);
    const toDate = mTo.format(format);

    const tooltips = pool.tooltips();
    const tooltip = tooltips.addForeignObjTooltip({
      cssClass: 'svg-tooltip-timechange',
      datum: d,
      shape: 'generic',
      xPosition: timechange.xPositionCenter,
      yPosition: timechange.yPositionCenter
    });

    const { foGroup } = tooltip;
    let fromHTML = `<span class="fromto">${t('from')}</span> ${fromDate}`;
    let toHTML = `<span class="fromto">${t('to')}</span> ${toDate}`;
    let changeType;
    if (d.from.timeZoneName !== d.to.timeZoneName) {
      fromHTML = `${fromHTML} - ${d.from.timeZoneName}`;
      toHTML = `${toHTML} - ${d.to.timeZoneName}`;
      changeType = t('Timezone Change');
    } else {
      changeType = t('Time Change');
    }

    foGroup.append('p')
      .append('span')
      .attr('class', 'secondary')
      .html(fromHTML);
    foGroup.append('p')
      .append('span')
      .attr('class', 'secondary')
      .html(toHTML);
    foGroup.append('p')
      .append('span')
      .attr('class', 'mainText')
      .html(changeType);

    const dims = tooltips.foreignObjDimensions(foGroup);

    // foGroup.node().parentNode is the <foreignObject> itself
    // because foGroup is actually the top-level <xhtml:div> element
    tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
      w: dims.width + opts.tooltipPadding,
      h: dims.height,
      x: timechange.xPositionCenter(d),
      y: -dims.height,
      orientation: {
        'default': 'leftAndDown',
        leftEdge: 'rightAndDown',
        rightEdge: 'leftAndDown'
      },
      shape: 'generic',
      edge: tooltip.edge
    });
  };

  timechange._diplayTidepoolTooltip = (d) => {
    // Need to check if time is coming from the current data model, or the deprecated `change` property
    var fromTime = _.get(d, 'from.time', _.get(d, 'change.from'));
    var toTime = _.get(d, 'to.time', _.get(d, 'change.to'));

    var fromTimeZoneName = _.get(d, 'from.timeZoneName');
    var toTimeZoneName = _.get(d, 'to.timeZoneName');

    if (toTime || toTimeZoneName) {
      var tooltips = pool.tooltips();

      var tooltip = tooltips.addForeignObjTooltip({
        cssClass: 'svg-tooltip-timechange',
        datum: d,
        shape: 'generic',
        xPosition: timechange.xPositionCenter,
        yPosition: timechange.yPositionCenter
      });

      var foGroup = tooltip.foGroup;

      if (toTime) {
        // Render time change
        var timeChange = format.timeChangeInfo(fromTime, toTime);

        if (timeChange.format === 'h:mm a' && !toTimeZoneName) {
          // No time zone change and time change is on the same day so we display on one line.
          /* jshint laxbreak: true */
          var html = timeChange.from
            ? '<span class="fromto">from</span> ' + timeChange.from + ' <span class="fromto">to</span> ' + timeChange.to
            : '<span class="fromto">to</span> ' + timeChange.to;

          tooltip.foGroup.append('p')
            .append('span')
            .attr('class', 'secondary')
            .html(html);
        } else {
          // Render time change on 2 lines, appended by time zone change if present
          var fromTimeZoneText = '';
          var toTimeZoneText = '';

          if (toTimeZoneName && toTimeZoneName !== fromTimeZoneName) {
            fromTimeZoneText = fromTimeZoneName ? ' ' + fromTimeZoneName : '';
            toTimeZoneText = ' ' + toTimeZoneName;
          }

          var fromHTML = '<span class="fromto">from</span> ' + timeChange.from + fromTimeZoneText;
          var toHTML = '<span class="fromto">to</span> ' + timeChange.to + toTimeZoneText;

          if (fromTime) {
            tooltip.foGroup.append('p')
              .append('span')
              .attr('class', 'secondary')
              .html(fromHTML);
          }
          tooltip.foGroup.append('p')
            .append('span')
            .attr('class', 'secondary')
            .html(toHTML);
        }
        foGroup.append('p')
          .append('span')
          .attr('class', 'mainText')
          .html(timeChange.type);
      } else {
        // Render time zone change
        if (fromTimeZoneName) {
          tooltip.foGroup.append('p')
            .append('span')
            .attr('class', 'secondary')
            .html('<span class="fromto">from</span> ' + fromTimeZoneName);
        }
        tooltip.foGroup.append('p')
          .append('span')
          .attr('class', 'secondary')
          .html('<span class="fromto">to</span> ' + toTimeZoneName);

        foGroup.append('p')
          .append('span')
          .attr('class', 'mainText')
          .html('Time Zone Change');
      }

      var dims = tooltips.foreignObjDimensions(foGroup);

      // foGroup.node().parentNode is the <foreignObject> itself
      // because foGroup is actually the top-level <xhtml:div> element
      tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
        w: dims.width + opts.tooltipPadding,
        h: dims.height,
        x: timechange.xPositionCenter(d),
        y: -dims.height,
        orientation: {
          'default': 'leftAndDown',
          leftEdge: 'rightAndDown',
          rightEdge: 'leftAndDown'
        },
        shape: 'generic',
        edge: tooltip.edge
      });
    }
  };

  timechange.xPositionCorner = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - opts.size / 2;
  };

  timechange.yPositionCorner = function(d) {
    return pool.height() / 2 - opts.size / 2;
  };

  timechange.xPositionCenter = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  timechange.yPositionCenter = function(d) {
    return pool.height() / 2;
  };

  return timechange;
};

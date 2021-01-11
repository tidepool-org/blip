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
const moment = require('moment-timezone');
const d3 = require('d3');
const _ = require('lodash');


const { AUTOMATED_BASAL_LABELS, SCHEDULED_BASAL_LABELS, H_MM_A_FORMAT } = require('../data/util/constants');
const format = require('../data/util/format');
const BasalUtil = require('../data/basalutil');

const t = i18next.t.bind(i18next);
const basalUtil = new BasalUtil();

module.exports = function(pool, opts) {
  opts = opts || {};

  const defaults = {
    opacity: 0.6,
    opacityDelta: 0.2,
    pathStroke: 1.5,
    timezoneAware: false,
    timezoneName: 'UTC',
    timezoneOffset: 0,
    tooltipPadding: 20,
  };

  opts = _.defaults(opts, defaults);

  const mainGroup = pool.parent();

  function getDeliverySuppressed(supp) {
    if (_.includes(['scheduled', 'automated'], supp.deliveryType)) {
      return supp;
    }
    else if (supp.suppressed) {
      return getDeliverySuppressed(supp.suppressed);
    }
    else {
      return;
    }
  }

  function getUndelivereds(data) {
    const undelivereds = [];

    for (let i = 0; i < data.length; ++i) {
      const d = data[i];
      if (d.suppressed) {
        const scheduled = getDeliverySuppressed(d.suppressed);
        if (scheduled) {
          undelivereds.push(scheduled);
        }
      }
    }
    return undelivereds;
  }

  function basal(selection) {
    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {

      basal.addAnnotations(_.filter(currentData, 'annotations'));

      const basalSegments = d3.select(this)
        .selectAll('.d3-basal-group')
        .data(currentData, function(d) {
          return d.id;
        });

      const basalSegmentGroups = basalSegments.enter()
        .append('g')
        // @ts-ignore
        .attr({
          'class': 'd3-basal-group',
          id: (d) => `basal_group_${d.id}`,
        });

      const nonZero = basalSegmentGroups.filter((d) => d.rate > 0);
      basal.addRectToPool(nonZero);

      // add invisible rects as hover targets for all basals
      basal.addRectToPool(basalSegmentGroups, true);

      // split data into groups when delivery type changes to generate unique path elements for each group
      const basalPathGroups = basalUtil.getBasalPathGroups(currentData);
      const renderGroupMarkers = basalPathGroups.length > 1;

      const basalPathsGroup = selection
        .selectAll('.d3-basal-path-group')
        .data(['d3-basal-path-group']);

      basalPathsGroup
        .enter()
        .append('g')
        .attr('class', 'd3-basal-path-group');

      _.forEach(basalPathGroups, (data /*, index */) => {
        const id = data[0].id;
        const pathType = basalUtil.getBasalPathGroupType(data[0]);

        const paths = basalPathsGroup
          .selectAll(`.d3-basal.d3-path-basal.d3-path-basal-${pathType}-${id}`)
          .data([`d3-basal d3-path-basal d3-path-basal-${pathType}-${id}`]);

        paths
          .enter()
          .append('path')
          .attr({
            'class': (d) => d
          });

        paths.exit().remove();

        // d3.selects are OK here because `paths` is a chained selection
        const path = d3.select(paths[0][0]);
        basal.updatePath(path, data);
      });

      const undeliveredPaths = basalPathsGroup
        .selectAll('.d3-basal.d3-path-basal.d3-path-basal-undelivered')
        .data(['d3-basal d3-path-basal d3-path-basal-undelivered']);

      undeliveredPaths
        .enter()
        .append('path')
        .attr({
          'class': (d) => d
        });

        const undeliveredPath = d3.select(undeliveredPaths[0][0]);
      basal.updatePath(undeliveredPath, getUndelivereds(currentData), true);

      basalSegments.exit().remove();

      // tooltips
      basalSegmentGroups.on('mouseover', function() {
        basal.addTooltip(d3.select(this).datum(), renderGroupMarkers);
        d3.select(this).selectAll('.d3-basal.d3-rect-basal').attr('opacity', opts.opacity + opts.opacityDelta);
      });
      basalSegmentGroups.on('mouseout', function() {
        const id = d3.select(this).attr('id').replace('basal_group_', 'tooltip_');
        mainGroup.select(`#${id}`).remove();
        const datum = d3.select(this).datum();
        if (datum.deliveryType === 'temp' && datum.rate > 0) {
          d3.select(this).selectAll('.d3-basal.d3-rect-basal').attr('opacity', opts.opacity - opts.opacityDelta);
        } else {
          d3.select(this).selectAll('.d3-basal.d3-rect-basal').attr('opacity', opts.opacity);
        }
      });
    });
  }

  basal.addRectToPool = function(selection, invisible) {
    opts.xScale = pool.xScale().copy();

    var heightFn = invisible ? basal.invisibleRectHeight : basal.height;
    var yPosFn = invisible ? basal.invisibleRectYPosition : basal.yPosition;

    selection.append('rect')
      .attr({
        x: basal.xPosition,
        y: yPosFn,
        opacity: function(d) {
          if (d.deliveryType === 'temp' && d.rate > 0) {
            return opts.opacity - opts.opacityDelta;
          }
          return opts.opacity;
        },
        width: basal.width,
        height: heightFn,
        'class': function(d) {
          return invisible ? 'd3-basal d3-basal-invisible' : `d3-basal d3-rect-basal d3-basal-${d.deliveryType}`;
        }
      });
  };

  basal.updatePath = function(selection, data, isUndelivered) {
    opts.xScale = pool.xScale().copy();

    var pathDef = basal.pathData(data, isUndelivered);

    if (pathDef !== '') {
      selection.attr({
        d: pathDef,
      });
    }
  };

  basal.pathData = function(data, isUndelivered) {
    opts.xScale = pool.xScale().copy();

    function stringCoords(datum) {
      return basal.xPosition(datum) + ',' + basal.pathYPosition(datum) + ' ';
    }

    var d = '';
    for (var i = 0; i < data.length; ++i) {
      if (i === 0) {
        // start with a moveto command
        d += 'M' + stringCoords(data[i]);
      }
      else if (isUndelivered && data[i].deliveryType === 'automated') {
        // For automated suppressed delivery, we always render at the baseline
        var suppressed = _.clone(data[i]);
        suppressed.rate = 0;
        d += 'M' + stringCoords(suppressed);
      }
      else if (data[i].normalTime === data[i - 1].normalEnd) {
        // if segment is contiguous with previous, draw a vertical line connecting their values
        d += 'V' + basal.pathYPosition(data[i]) + ' ';
      }
      // TODO: maybe a robust check for a gap in time here instead of just !==?
      else if (data[i].normalTime !== data[i - 1].normalEnd) {
        // if segment is not contiguous with previous, skip to beginning of segment
        d += 'M' + stringCoords(data[i]);
      }
      // always add a horizontal line corresponding to current segment
      d += 'H' + basal.segmentEndXPosition(data[i]) + ' ';
    }
    return d;
  };

  basal.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  basal.segmentEndXPosition = function(d) {
    return opts.xScale(Date.parse(d.normalEnd));
  };

  basal.tooltipXPosition = function(d) {
    return basal.xPosition(d) + (basal.segmentEndXPosition(d) - basal.xPosition(d))/2;
  };

  basal.yPosition = function(d) {
    return opts.yScale(d.rate);
  };

  basal.pathYPosition = function(d) {
    return opts.yScale(d.rate) - opts.pathStroke/2;
  };

  basal.invisibleRectYPosition = function(d) {
    return 0;
  };

  basal.width = function(d) {
    return opts.xScale(Date.parse(d.normalEnd)) - opts.xScale(Date.parse(d.normalTime));
  };

  basal.height = function(d) {
    return pool.height() - opts.yScale(d.rate);
  };

  basal.invisibleRectHeight = function(d) {
    return pool.height();
  };

  basal.rateString = function(d, cssClass) {
    return format.tooltipValue(d.rate) + ' <span class="' + cssClass + '">U/hr</span>';
  };

  basal.tempPercentage = function(d) {
    if (typeof d.percent === 'number') {
      return format.percentage(d.percent);
    }
    else {
      return format.tooltipValue(d.rate) + ' <span class="plain">U/hr</span>';
    }
  };

  basal.tooltipHtml = function(group, datum, showSheduledLabel) {
    const defaultSource = _.get(window, 'config.BRANDING', 'tidepool') === 'diabeloop' ? 'Diabeloop' : 'default';
    /** @type {string} */
    const source = _.get(datum, 'source', defaultSource);
    switch (datum.deliveryType) {
    case 'temp':
      group.append('p')
        .append('span')
        .html('<span class="plain">'+t('Temp basal of')+'</span> ' + basal.tempPercentage(datum));
      if (datum.suppressed) {
        group.append('p')
          .append('span')
          .attr('class', 'secondary')
          .html(basal.rateString(getDeliverySuppressed(datum.suppressed), 'secondary') + ' '+ t('scheduled'));
      }
      break;
    case 'suspend':
      group.append('p')
        .append('span')
        .html('<span class="plain">Pump suspended</span>');
      if (datum.suppressed) {
        group.append('p')
          .append('span')
          .attr('class', 'secondary')
          .html(basal.rateString(getDeliverySuppressed(datum.suppressed), 'secondary') + ' '+ t('scheduled'));
      }
      break;
    case 'automated':
      group.append('p')
        .append('span')
        .html('<span class="plain muted">' + _.get(AUTOMATED_BASAL_LABELS, source, AUTOMATED_BASAL_LABELS.default) + ':</span> ' +
          basal.rateString(datum, 'plain'));
      break;
    default:
      {
        const label = showSheduledLabel ? '<span class="plain muted">' + _.get(SCHEDULED_BASAL_LABELS, source, SCHEDULED_BASAL_LABELS.default) + ':</span> ' : '';
        group.append('p')
          .append('span')
          .html(label + basal.rateString(datum, 'plain'));
      }
    }

    let begin = '';
    let end = '';
    if (source === 'Diabeloop') {
      const mBegin = moment.tz(datum.normalTime, datum.timezone);
      begin = mBegin.format(H_MM_A_FORMAT);
      end = moment.tz(datum.normalEnd, datum.timezone).format(H_MM_A_FORMAT);
      if (datum.timezone !== opts.timezoneName) {
        end = `${end}<br />UTC${mBegin.format('Z')}`;
      } else if (mBegin.utcOffset() !== opts.timezoneOffset) {
        end = `${end}<br />UTC${mBegin.format('Z z')}`;
      }
    } else {
      begin = format.timestamp(datum.normalTime, datum.displayOffset);
      end = format.timestamp(datum.normalEnd, datum.displayOffset);
    }
    const html = `<span class="fromto">${t('from')}</span> ${begin} <span class="fromto">${t('to')}</span> ${end}`;
    group.append('p')
      .append('span')
      .attr('class', 'secondary')
      .html(html);
  };

  basal.addTooltip = function(d, showSheduledLabel) {
    var datum = _.clone(d);
    datum.type = 'basal';
    var tooltips = pool.tooltips();
    var cssClass = (d.deliveryType === 'temp' || d.deliveryType === 'suspend') ? 'd3-basal-undelivered' : '';
    var res = tooltips.addForeignObjTooltip({
      cssClass: cssClass,
      datum: datum,
      shape: 'basal',
      xPosition: basal.tooltipXPosition,
      yPosition: function() { return 0; }
    });
    var foGroup = res.foGroup;
    basal.tooltipHtml(foGroup, d, showSheduledLabel);
    var dims = tooltips.foreignObjDimensions(foGroup);
    // foGroup.node().parentNode is the <foreignObject> itself
    // because foGroup is actually the top-level <xhtml:div> element
    tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
      w: dims.width + opts.tooltipPadding,
      h: dims.height,
      shape: 'basal',
      edge: res.edge
    });
  };

  basal.addAnnotations = function(data) {
    for (var i = 0; i < data.length; ++i) {
      var d = data[i];
      var annotationOpts = {
        x: basal.xPosition(d),
        y: opts.yScale(0),
        xMultiplier: 2,
        yMultiplier: 1,
        orientation: {
          up: true
        },
        d: d
      };
      if (mainGroup.select('#annotation_for_' + d.id)[0][0] == null) {
        mainGroup.select('#tidelineAnnotations_basal')
          .call(pool.annotations(), annotationOpts);
      }
    }
  };

  return basal;
};

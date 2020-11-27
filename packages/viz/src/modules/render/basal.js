/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

import _ from 'lodash';

/**
 * calculateBasalPath
 * @param {Array} basalSequence - an array of Tidepool basal events to be rendered as one
 * @param {Function} xScale - xScale preconfigured with domain & range
 * @param {Function} yScale - yScale preconfigured with domain & range
 * @param {Object} opts - basal sequence rendering options such as whether filled
 *
 * @return {String} path - basal sequence SVG path
 */

export function calculateBasalPath(basalSequence, xScale, yScale, {
  endAtZero,
  flushBottomOffset = 0,
  isFilled,
  startAtZero,
}) {
  let path = '';
  const zeroBasal = yScale.range()[0];
  const flushWithBottomOfScale = zeroBasal + flushBottomOffset;

  function handleDiscontinuousEnd(basal) {
    path += `L ${xScale(basal.utc + basal.duration)},${flushWithBottomOfScale} `;
  }

  function handleDiscontinuousStart(basal) {
    path += `M ${xScale(basal.utc)},${flushWithBottomOfScale} `;
  }


  const first = basalSequence[0];
  const startX = xScale(first.utc);
  const startY = _.every(basalSequence, (d) => (d.rate === 0)) ?
    flushWithBottomOfScale :
    yScale(first.rate);
  if (startAtZero || isFilled) {
    path += `M ${startX},${zeroBasal} L `;
  } else {
    path += 'M ';
  }
  path += `${startX},${startY}
    L ${xScale(first.utc + first.duration)},${startY} `;

  if (!isFilled && first.discontinuousEnd) {
    handleDiscontinuousEnd(first);
  }

  _.each(basalSequence.slice(1), (basal) => {
    const thisBasalY = (basal.rate > 0) ? yScale(basal.rate) : flushWithBottomOfScale;
    if (!isFilled && basal.discontinuousStart) {
      handleDiscontinuousStart(basal);
    }

    path += `L ${xScale(basal.utc)},${thisBasalY}
      L ${xScale(basal.utc + basal.duration)},${thisBasalY} `;

    if (!isFilled && basal.discontinuousEnd) {
      handleDiscontinuousEnd(basal);
    }
  });

  const last = basalSequence[basalSequence.length - 1];
  const endX = xScale(last.utc + last.duration);
  path += `L ${endX},${yScale(last.rate)}`;

  if (endAtZero || isFilled) {
    path += ` L ${endX},${zeroBasal}`;
  }

  if (isFilled) {
    path += ' Z';
  }

  // PDFKit will not render path definitions with line breaks properly
  // do NOT forget to remove the newlines!
  return path.replace(/\n/g, '').replace(/\s\s+/g, ' ');
}

/**
  * getBasalSequencePaths
  * @param {Array} basalSequence - an array of Tidepool basal events to be rendered as one
  * @param {Function} xScale - xScale preconfigured with domain & range
  * @param {Function} yScale - yScale preconfigured with domain & range
  *
  * @return {Array} paths - Array of Objects, each specifying component paths to draw a bolus
  */
export function getBasalSequencePaths(basalSequence, xScale, yScale) {
  const first = basalSequence[0];
  const last = basalSequence[basalSequence.length - 1];
  const paths = [];
  let type;

  const types = _.uniq(
    _.reject(
      _.map(
        basalSequence, 'subType'
      ),
      (d) => (!_.isString(d))
    )
  );
  if (types.length === 0) {
    throw new Error('Cannot determine `subType` of basal sequence!');
  } else if (types.length > 1) {
    throw new Error('A basal sequence may contain only *one* `subType` of basal event.');
  } else {
    type = types[0];
  }

  if (_.some(basalSequence, (d) => (d.rate > 0))) {
    paths.push({
      d: calculateBasalPath(
        basalSequence, xScale, yScale, {
          endAtZero: last.discontinuousEnd,
          isFilled: true,
          startAtZero: first.discontinuousStart,
        },
      ),
      basalType: type,
      key: `basalFill-${first.id}`,
      renderType: 'fill',
      type: `fill--${type}`,
    });
  }

  const suppresseds = [];
  let undeliveredType = 'border--undelivered';
  _.each(basalSequence, (basal) => {
    if (basal.suppressed) {
      const suppressed = _.clone(basal.suppressed);
      if (_.get(suppressed, 'subType', suppressed.deliveryType) === 'automated') {
        undeliveredType = 'border--undelivered--automated';
        // For automated suppressed delivery, we always render at the baseline
        suppressed.rate = 0;
      }
      suppresseds.push(_.assign({}, suppressed, _.pick(basal, ['duration', 'utc'])));
    }
  });

  if (!_.isEmpty(suppresseds)) {
    paths.push({
      d: calculateBasalPath(
        suppresseds, xScale, yScale, {
          endAtZero: false,
          isFilled: false,
          startAtZero: false,
        },
      ),
      basalType: type,
      key: `basalPathUndelivered-${first.id}`,
      renderType: 'stroke',
      type: undeliveredType,
    });
  }

  return paths;
}

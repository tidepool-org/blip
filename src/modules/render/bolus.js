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

export function isInterruptedBolus(bolus) {
  return bolus.normal &&
    bolus.expectedNormal &&
    bolus.expectedNormal > 0 &&
    bolus.normal !== bolus.expectedNormal;
}

export function makeBolusRectanglePath(bolusWidth, bolusCenter, bolusBottom, bolusHeight) {
  const halfWidth = bolusWidth / 2;

  const leftX = bolusCenter - halfWidth;
  const rightX = bolusCenter + halfWidth;

  return `
    M ${leftX},${bolusBottom}
    L ${leftX},${bolusHeight}
    L ${rightX},${bolusHeight}
    L ${rightX},${bolusBottom} Z
  `;
}

/**
 * getBolusPaths
 * @param {Object} bolus - Tidepool bolus datum
 * @param {Function} xScale - xScale preconfigured with domain & range
 * @param {Function} yScale - yScale preconfigured with domain & range
 * @param {Object} opts - bolus rendering options such as width
 *
 * @return {Array} paths - Object of component paths to draw a bolus
 */
export default function getBolusPaths(bolus, xScale, yScale, {
  bolusWidth, interruptedLineThickness,
}) {
  const paths = [];

  const bolusBottom = yScale.range()[0];
  const bolusCenter = xScale(bolus.msPer24);

  // the backmost layer is any undelivered bolus insulin (in the case of interruption or underride)
  if (isInterruptedBolus(bolus)) {
    const undeliveredY = yScale(bolus.expectedNormal);
    const path = makeBolusRectanglePath(bolusWidth, bolusCenter, bolusBottom, undeliveredY);

    paths.push({
      d: path,
      key: `undeliveredNormal-${bolus.id}`,
      type: 'undelivered',
    });
  }

  if (bolus.normal && bolus.normal > 0) {
    const maxY = yScale(bolus.normal);
    const path = makeBolusRectanglePath(bolusWidth, bolusCenter, bolusBottom, maxY);

    paths.push({
      d: path,
      key: `normal-${bolus.id}`,
      type: 'normal',
    });
  }

  // the red line indicating interruption appears on top
  if (isInterruptedBolus(bolus)) {
    const bottomOfInterruptedLine = yScale(bolus.normal);
    const path = makeBolusRectanglePath(
      bolusWidth,
      bolusCenter,
      bottomOfInterruptedLine,
      bottomOfInterruptedLine + interruptedLineThickness,
    );

    paths.push({
      d: path,
      key: `interruptedNormal-${bolus.id}`,
      type: 'interrupted',
    });
  }

  return paths;
}

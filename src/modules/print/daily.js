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

/* eslint-disable no-console */

/* global PDFDocument, blobStream */

import _ from 'lodash';
import moment from 'moment-timezone';
import { scaleLinear } from 'd3-scale';

import { calcCbgTimeInCategories, classifyBgValue } from '../../utils/bloodglucose';

import { displayPercentage } from '../../utils/format';

import styles from '../../styles/colors.css';

import getBolusPaths from '../render/bolus';

// dimensions of portrait-oriented 8.5" x 11" PDF are 612 x 792 at 72 dpi
// usable area with default 1" margins is 468 x 648
const DPI = 72;
const MARGIN = 72 / 2;
const DIMS = {
  WIDTH: 8.5 * DPI - (2 * MARGIN),
  HEIGHT: 11 * DPI - (2 * MARGIN),
};

const SUMMARY_WIDTH = DPI * 1.5;


/**
 * renderDateSummary
 * @param {PDFDocument} doc - the PDF target for rendering
 * @param {Number} yPos - the y-coordinate at which to start rendering
 * @param {Object} dateData - object containing String date and type-grouped Tidepool diabetes data
 * @param {Object} ops - object containing { bgBounds }
 */
export function renderDateSummary(doc, yPos, { date, data }, { bgBounds }) {
  doc.font('Helvetica-Bold')
    .fontSize(10)
    .text(moment(date, 'YYYY-MM-DD').format('dddd M/D'), MARGIN, yPos);

  const lineHeight = doc.currentLineHeight();
  const separatorHeight = yPos + lineHeight * 1.5;

  doc.moveTo(MARGIN, separatorHeight)
    .lineTo(MARGIN + SUMMARY_WIDTH, separatorHeight)
    .strokeColor('#D8D8D8')
    .lineWidth(0.25)
    .stroke();

  doc.fontSize(8)
    .text('Time in Target', MARGIN, separatorHeight + lineHeight);
  const { targetUpperBound, targetLowerBound } = bgBounds;
  const cbgTimeInCategories = calcCbgTimeInCategories(data.cbg, bgBounds);
  doc.moveDown()
    .font('Helvetica')
    .text(
      `${targetLowerBound} - ${targetUpperBound}`,
      { indent: 4, continued: true, width: SUMMARY_WIDTH },
    )
    .text(`${displayPercentage(cbgTimeInCategories.target)}`, { align: 'right' });
}

/**
 * renderDateChart
 * @param {PDFDocument} doc - the PDF target for rendering
 * @param {Number} yPos - the y-coordinate at which to start rendering
 * @param {Array} selectedData - result of selectData function
 * @param {Object} ops - object containing { bgBounds }
 */
export function renderDateChart(doc, yPos, selectedData, { bgBounds, chartHeight, date }) {
  const chartLeft = MARGIN + SUMMARY_WIDTH + MARGIN;
  const chartRight = MARGIN + DIMS.WIDTH;
  const chartTop = yPos;
  // draw the x- and y- axis frames
  doc.moveTo(chartLeft, yPos)
    .lineTo(chartLeft, yPos + chartHeight)
    .lineTo(chartRight, yPos + chartHeight)
    .lineTo(chartRight, yPos)
    .stroke();

  // draw the line marking the bottom of the first "pool" in the chart for BG & bolus data
  const firstPoolHeight = yPos + 0.75 * DPI;
  doc.moveTo(chartLeft, firstPoolHeight)
    .lineTo(chartRight, firstPoolHeight)
    .stroke();

  // draw the line marking the top of the bottom "pool" in the chart for basal selectedData
  const bottomPoolTopEdge = yPos + chartHeight - 0.5 * DPI;
  doc.moveTo(chartLeft, bottomPoolTopEdge)
    .lineTo(chartRight, bottomPoolTopEdge)
    .stroke();

  const { bounds } = selectedData[date];

  const xScale = scaleLinear()
    .domain([Date.parse(bounds[0]), Date.parse(bounds[1])])
    .range([chartLeft, chartRight]);
  const bgScale = scaleLinear()
    .domain([0, selectedData.bgRange[1]])
    .range([firstPoolHeight, chartTop]);
  const bolusScale = scaleLinear()
    .domain([0, selectedData.bolusRange[1]])
    .range([firstPoolHeight, firstPoolHeight - ((firstPoolHeight - chartTop) / 2)]);

  // render cbg
  _.each(selectedData[date].data.cbg, (cbg) => {
    console.log(styles[classifyBgValue(bgBounds, cbg.value)]);
    // eslint-disable-next-line lodash/prefer-lodash-method
    doc.circle(xScale(Date.parse(cbg.normalTime)), bgScale(cbg.value), 1)
      .fill(styles[classifyBgValue(bgBounds, cbg.value)]);
  });

  // render boluses
  _.each(selectedData[date].data.bolus, (bolus) => {
    if (bolus.normal) {
      const paths = getBolusPaths(bolus, xScale, bolusScale, { bolusWidth: 3 });
      _.each(paths, (path) => {
        doc.path(path.d).fill('black'); // eslint-disable-line lodash/prefer-lodash-method
      });
    }
  });
}

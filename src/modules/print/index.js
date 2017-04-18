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

/* global PDFDocument, blobStream */

import _ from 'lodash';

import { renderDateChart, renderDateSummary } from './daily';
import DailyPrintView from './DailyPrintView';
import { selectDailyViewData as selectData } from './data';

/**
 * createAndOpenPrintPDFPackage
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Object} dataByDate - a Crossfilter dimension for querying diabetes data by normalTime
 * @param {Object} opts - an object of print options (see destructured param below)
 *
 * @return {String} url - the PDF file blog URL for opening in a new tab & printing
 */
// opts will be { bgPrefs, dateTitle, patientName, numDays, timePrefs }
export default function createAndOpenPrintPDFPackage(mostRecent, dataByDate, {
  bgPrefs, numDays, timePrefs,
}) {
  const DATES_PER_PAGE = 3;

  // DPI here is the coordinate system, not the resolution; sub-dot precision renders crisply!
  const DPI = 72;
  const MARGIN = DPI / 2;

  // TODO: refactor this from where it was c&p-ed from (blip's trends.js)
  // repeating this logic here long-term would be super dumb and non-DRY
  const { bgClasses } = bgPrefs;
  const bgBounds = {
    veryHighThreshold: bgClasses.high.boundary,
    targetUpperBound: bgClasses.target.boundary,
    targetLowerBound: bgClasses.low.boundary,
    veryLowThreshold: bgClasses['very-low'].boundary,
  };

  const data = selectData(mostRecent, dataByDate, numDays, timePrefs);
  const doc = new PDFDocument;
  const dailyPrintView = new DailyPrintView(doc, { daily: data }, {
    dpi: DPI,
    margins: {
      left: MARGIN,
      top: MARGIN,
      right: MARGIN,
      bottom: MARGIN,
    },
    width: 8.5 * DPI - (2 * MARGIN),
    height: 11 * DPI - (2 * MARGIN),
  });
  const stream = doc.pipe(blobStream());

  dailyPrintView.renderDebugGrid();
  dailyPrintView.renderHeader(14);

  // const poolHeights = [lineHeight * 4 + MARGIN];
  // const chartHeight = (DIMS.HEIGHT - poolHeights[0]) / 4;
  // // TODO: don't hardcode like this!
  // // make dependent on DATES_PER_PAGE
  // poolHeights.push(poolHeights[0] + chartHeight);
  // poolHeights.push(poolHeights[1] + chartHeight);

  // const dates = _.keys(data);

  // for (let i = 0; i < DATES_PER_PAGE; ++i) {
  //   renderDateSummary(doc, poolHeights[i], data[dates[i]], { bgBounds });
  //   renderDateChart(
  //     doc,
  //     poolHeights[i],
  //     data,
  //     { bgBounds, chartHeight: chartHeight * 0.75, date: dates[i] },
  //   );
  // }

  doc.end();

  stream.on('finish', () => {
    window.open(stream.toBlobURL('application/pdf'));
    // const printWindow = window.open(stream.toBlobURL('application/pdf'));
    // printWindow.focus();
    // printWindow.print();
  });
}

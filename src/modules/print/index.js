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

import DailyPrintView from './DailyPrintView';
import { selectDailyViewData as selectData } from './data';

// DPI here is the coordinate system, not the resolution; sub-dot precision renders crisply!
const DPI = 72;
const MARGIN = DPI / 2;

export function createDailyPrintView(doc, data, numDays) {
  const CHARTS_PER_PAGE = 3;
  const dailyPrintView = new DailyPrintView(doc, data, {
    chartsPerPage: CHARTS_PER_PAGE,
    // TODO: set this up as a Webpack Define plugin to pull from env variable
    // maybe that'll be tricky through React Storybook?
    debug: true,
    dpi: DPI,
    footerFontSize: 9,
    headerFontSize: 14,
    height: 11 * DPI - (2 * MARGIN),
    margins: {
      left: MARGIN,
      top: MARGIN,
      right: MARGIN,
      bottom: MARGIN,
    },
    numDays,
    width: 8.5 * DPI - (2 * MARGIN),
  });

  const dates = _.keys(data).slice(0, numDays);
  for (let i = 0; i < numDays; ++i) {
    const dateData = data[dates[i]];
    dailyPrintView.calculateDateChartHeight(dateData);
  }
  let page = 1;
  while (page <= dailyPrintView.pages) {
    console.log('Placing charts on page', page);
    dailyPrintView.placeChartsOnPage(page);
    ++page;
  }
  console.log(dailyPrintView.chartsByDate);
}

/**
 * createAndOpenPrintPDFPackage
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Object} dataByDate - a Crossfilter dimension for querying diabetes data by normalTime
 * @param {Object} opts - an object of print options (see destructured param below)
 *
 * @return {Void} [side effect function creates and opens PDF in new tab]
 */
export default function createAndOpenPrintPDFPackage(mostRecent, dataByDate, {
  // full opts will be { bgPrefs, dateTitle, patientName, numDays, timePrefs }
  bgPrefs, numDays, timePrefs,
}) {
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
  /* NB: if you don't set the `margin` (or `margins` if not all are the same)
     then when you are using the .text() command a new page will be added if you specify
     coordinates outside of the default margin (or outside of the margins you've specified)
   */
  const doc = new PDFDocument({ autoFirstPage: false, bufferPages: true, margin: MARGIN });
  const stream = doc.pipe(blobStream());
  createDailyPrintView(doc, data, numDays);

  doc.end();

  stream.on('finish', () => {
    window.open(stream.toBlobURL('application/pdf'));
    // const printWindow = window.open(stream.toBlobURL('application/pdf'));
    // printWindow.focus();
    // printWindow.print();
  });
}

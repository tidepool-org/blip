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
import Promise from 'bluebird';
import DailyPrintView from './DailyPrintView';
import { reshapeBgClassesToBgBounds } from '../../utils/bloodglucose';
import { selectDailyViewData } from '../../utils/print/data';

// DPI here is the coordinate system, not the resolution; sub-dot precision renders crisply!
const DPI = 72;
const MARGIN = DPI / 2;

/**
 * createDailyPrintView
 * @param {Object} doc - PDFKit document instance
 * @param {Object} data - pre-munged data for the daily print view
 * @param {Object} bgBounds - user's blood glucose thresholds & targets
 * @param {Object} timePrefs - object containing timezoneAware Boolean, timezoneName String or null
 * @param {Number} numDays - number of days of daily view to include in printout
 * @param {Object} patient - full tidepool patient object
 *
 * @return {Object} dailyPrintView instance
 */
export function createDailyPrintView(doc, data, bgPrefs, timePrefs, numDays, patient) {
  const CHARTS_PER_PAGE = 3;
  return new DailyPrintView(doc, data, {
    bgPrefs,
    chartsPerPage: CHARTS_PER_PAGE,
    // TODO: set this up as a Webpack Define plugin to pull from env variable
    // maybe that'll be tricky through React Storybook?
    debug: false,
    defaultFontSize: 8,
    dpi: DPI,
    footerFontSize: 8,
    headerFontSize: 14,
    height: 11 * DPI - (2 * MARGIN),
    margins: {
      left: MARGIN,
      top: MARGIN,
      right: MARGIN,
      bottom: MARGIN,
    },
    numDays,
    patient,
    summaryHeaderFontSize: 10,
    summaryWidthAsPercentage: 0.18,
    timePrefs,
    width: 8.5 * DPI - (2 * MARGIN),
  });
}

/**
 * createPrintPDFPackage
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Array} groupedData - Object of tideline-preprocessed Tidepool diabetes data & notes;
 *                       grouped by type
 * @param {Object} opts - an object of print options (see destructured param below)
 *
 * @return {Promise} - Promise that resolves with an object containing the pdf blob and url
 */
export function createPrintPDFPackage(mostRecent, groupedData, opts) {
  const {
    bgPrefs,
    numDays,
    patient,
    timePrefs,
  } = opts;

  return new Promise((resolve, reject) => {
    const bgBounds = reshapeBgClassesToBgBounds(bgPrefs);
    const dailyViewData = selectDailyViewData(mostRecent, groupedData, numDays, timePrefs);
    /* NB: if you don't set the `margin` (or `margins` if not all are the same)
      then when you are using the .text() command a new page will be added if you specify
      coordinates outside of the default margin (or outside of the margins you've specified)
    */
    const doc = new PDFDocument({ autoFirstPage: false, bufferPages: true, margin: MARGIN });
    const stream = doc.pipe(blobStream());

    const dailyPrintView = createDailyPrintView(doc, dailyViewData, {
      bgBounds,
      bgUnits: bgPrefs.bgUnits,
    }, timePrefs, numDays, patient);

    dailyPrintView.render();
    doc.end();

    stream.on('finish', () => {
      const pdf = {
        blob: stream.toBlob(),
        url: stream.toBlobURL('application/pdf'),
      };
      return resolve(pdf);
    });

    stream.on('error', (error) => {
      stream.end();
      return reject(error);
    });
  });
}

export default createPrintPDFPackage;

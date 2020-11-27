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
import i18next from 'i18next';
import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
import PrintView from './PrintView';
import BasicsPrintView from './BasicsPrintView';
import DailyPrintView from './DailyPrintView';
import BgLogPrintView from './BgLogPrintView';
import SettingsPrintView from './SettingsPrintView';
import { reshapeBgClassesToBgBounds } from '../../utils/bloodglucose';

import * as constants from './utils/constants';
import { arrayBufferToBase64 } from './utils/functions';

// TO_DO have a configuration variable to support specific branding or not like done e.g. in Blip
// branding should make use of artifact.sh to download specific branding artifacts such as images
import logo from './images/diabeloop/ylp_logo_small.png';
import siteChangeCannulaImage from './images/sitechange-cannula.png';
import siteChangeReservoirImage from './images/sitechange-reservoir.png';
import siteChangeTubingImage from './images/sitechange-tubing.png';
import siteChangeReservoirDiabeloopImage from './images/diabeloop/sitechange-diabeloop.png';

if (_.get(i18next, 'options.returnEmptyString') === undefined) {
  // Return key if no translation is present
  i18next.init({ returnEmptyString: false, nsSeparator: '|' });
}

const t = i18next.t.bind(i18next);

// Exporting utils for easy stubbing in tests
export const utils = {
  reshapeBgClassesToBgBounds,
  PDFDocument,
  blobStream,
  PrintView,
  BasicsPrintView,
  DailyPrintView,
  BgLogPrintView,
  SettingsPrintView,
};

async function loadImages() {
  const base64Flag = 'data:image/jpeg;base64,';
  let imageStr = '';

  if (constants.Images.logo === null) {
    if (logo.startsWith(base64Flag)) {
      imageStr = logo;
    } else {
      const response = await fetch(logo);
      const buffer = await response.arrayBuffer();
      imageStr = base64Flag + arrayBufferToBase64(buffer);

    }
    constants.Images.logo = imageStr;
  }

  if (constants.Images.siteChangeCannulaImage === null) {
    if (siteChangeCannulaImage.startsWith(base64Flag)) {
      imageStr = siteChangeCannulaImage;
    } else {
      const response = await fetch(siteChangeCannulaImage);
      const buffer = await response.arrayBuffer();
      imageStr = base64Flag + arrayBufferToBase64(buffer);
    }
    constants.Images.siteChangeCannulaImage = imageStr;
  }

  if (constants.Images.siteChangeReservoirImage === null) {
    if (siteChangeReservoirImage.startsWith(base64Flag)) {
      imageStr = siteChangeReservoirImage;
    } else {
      const response = await fetch(siteChangeReservoirImage);
      const buffer = await response.arrayBuffer();
      imageStr = base64Flag + arrayBufferToBase64(buffer);
    }
    constants.Images.siteChangeReservoirImage = imageStr;
  }

  if (constants.Images.siteChangeTubingImage === null) {
    if (siteChangeTubingImage.startsWith(base64Flag)) {
      imageStr = siteChangeTubingImage;
    } else {
      const response = await fetch(siteChangeTubingImage);
      const buffer = await response.arrayBuffer();
      imageStr = base64Flag + arrayBufferToBase64(buffer);
    }
    constants.Images.siteChangeTubingImage = imageStr;
  }

  if (constants.Images.siteChangeReservoirDiabeloopImage === null) {
    if (siteChangeReservoirDiabeloopImage.startsWith(base64Flag)) {
      imageStr = siteChangeReservoirDiabeloopImage;
    } else {
      const response = await fetch(siteChangeReservoirDiabeloopImage);
      const buffer = await response.arrayBuffer();
      imageStr = base64Flag + arrayBufferToBase64(buffer);
    }
    constants.Images.siteChangeReservoirDiabeloopImage = imageStr;
  }
}

/**
 * createPrintView
 * @param {Object} doc - PDFKit document instance
 * @param {Object} data - pre-munged data for the daily print view
 * @param {Object} opts - options
 * @param {Object} type - render type
 *
 * @return {Object} dailyPrintView instance
 */
export function createPrintView(type, data, opts, doc) {
  const {
    bgPrefs,
    patient,
    timePrefs,
    numDays,
  } = opts;

  let Renderer;
  let renderOpts = {
    bgPrefs,
    // TODO: set this up as a Webpack Define plugin to pull from env variable
    debug: false,
    defaultFontSize: constants.DEFAULT_FONT_SIZE,
    dpi: constants.DPI,
    footerFontSize: constants.FOOTER_FONT_SIZE,
    headerFontSize: constants.HEADER_FONT_SIZE,
    height: constants.HEIGHT,
    margins: constants.MARGINS,
    patient,
    smallFontSize: constants.SMALL_FONT_SIZE,
    timePrefs,
    width: constants.WIDTH,
  };

  switch (type) {
    case 'daily':
      Renderer = utils.DailyPrintView;

      renderOpts = _.assign(renderOpts, {
        chartsPerPage: 3,
        numDays: numDays.daily,
        summaryHeaderFontSize: 10,
        summaryWidthAsPercentage: 0.18,
        title: t('Daily Charts'),
      });
      break;

    case 'basics':
      Renderer = utils.BasicsPrintView;

      renderOpts = _.assign(renderOpts, {
        title: t('The Basics'),
      });
      break;

    case 'bgLog':
      Renderer = utils.BgLogPrintView;

      renderOpts = _.assign(renderOpts, {
        numDays: numDays.bgLog,
        title: t('BG Log'),
      });
      break;

    case 'settings':
      Renderer = utils.SettingsPrintView;

      renderOpts = _.assign(renderOpts, {
        title: t('Pump Settings'),
      });
      break;

    default:
      return null;
  }

  return new Renderer(doc, data, renderOpts);
}

/**
 * createPrintPDFPackage
 * @param {Object} data - Object of tideline-preprocessed Tidepool diabetes data & notes;
 *                       grouped by type
 * @param {Object} opts - an object of print options (see destructured param below)
 *
 * @return {Promise} - Promise that resolves with an object containing the pdf blob and url
 */
export function createPrintPDFPackage(data, opts) {
  return new Promise((resolve, reject) => {
    try {
      const {
        bgPrefs,
        // patient,
      } = opts;

      // if (_.get(patient, 'preferences.displayLanguageCode')) {
      //   i18next.changeLanguage(patient.preferences.displayLanguageCode);
      // }

      const pdfOpts = _.cloneDeep(opts);
      pdfOpts.bgPrefs.bgBounds = utils.reshapeBgClassesToBgBounds(bgPrefs);
      /* NB: if you don't set the `margin` (or `margins` if not all are the same)
      then when you are using the .text() command a new page will be added if you specify
      coordinates outside of the default margin (or outside of the margins you've specified)
      */
      const doc = new utils.PDFDocument({
        autoFirstPage: false,
        bufferPages: true,
        margin: constants.MARGIN,
      });
      const stream = doc.pipe(utils.blobStream());

      if (data.basics) createPrintView('basics', data.basics, pdfOpts, doc).render();
      if (data.daily) createPrintView('daily', data.daily, pdfOpts, doc).render();
      if (data.bgLog) createPrintView('bgLog', data.bgLog, pdfOpts, doc).render();
      if (data.settings) createPrintView('settings', data.settings, pdfOpts, doc).render();

      PrintView.renderPageNumbers(doc);

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
    } catch (err) {
      reject(err);
    }
  });
}

async function doPrint(data, opts) {
  await loadImages();
  return createPrintPDFPackage(data, opts);
}

export default doPrint;

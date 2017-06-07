/**
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
 */

/* global importScripts */
import bows from 'bows';

import * as actions from '../redux/actions/worker';
import * as actionTypes from '../redux/constants/actionTypes';
import createPrintPDFPackage from '../modules/print';

export default class PDFWorker {
  constructor() {
    this.log = bows('PDFWorker');
    this.log('PDFWorker constructed!');
  }

  handleMessage(msg, postMessage) {
    const { data: action } = msg;

    switch (action.type) {
      case actionTypes.GENERATE_PDF_REQUEST: {
        const { type, mostRecent, groupedData, opts } = action.payload;
        const { origin } = action.meta;

        importScripts(`${origin}/pdfkit.js`, `${origin}/blob-stream.js`);

        createPrintPDFPackage(mostRecent, groupedData, opts).then(pdf => {
          postMessage(actions.generatePDFSuccess({ [type]: pdf }));
        }).catch(error => {
          postMessage(actions.generatePDFSuccess(error));
        });
        break;
      }

      default:
        throw new Error(`Unhandled action type [${action.type}] passed to Web Worker!`);
    }
  }
}

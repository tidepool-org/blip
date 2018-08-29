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

/* global importScripts, postMessage, __DEV__ */
import '../core/language'; // Needed to load i18next config in the web worker
import bows from 'bows';
import _ from 'lodash';

import * as actions from '../redux/actions/worker';
import * as actionTypes from '../redux/constants/actionTypes';
import { createPrintPDFPackage } from '@tidepool/viz/dist/print';

export default class PDFWorker {
  constructor(importer, renderer) {
    this.log = __DEV__ ? bows('PDFWorker') : _.noop;
    this.log('Ready!');
    this.importer = importer;
    this.renderer = renderer;
  }

  handleMessage(msg, postMessage) {
    const { data: action } = msg;
    switch (action.type) {
      case actionTypes.GENERATE_PDF_REQUEST: {
        const { type, opts } = action.payload;
        const data = JSON.parse(action.payload.data);
        const { origin } = action.meta;

        const importLib = typeof this.importer !== 'undefined' ? this.importer : importScripts;
        const renderLib = typeof this.renderer !== 'undefined' ?
          this.renderer : createPrintPDFPackage;

        importLib(`${origin}/pdfkit.js`, `${origin}/blob-stream.js`);

        renderLib(data, opts).then(pdf =>
          postMessage(actions.generatePDFSuccess({ [type]: pdf }))
        ).catch(error =>
          postMessage(actions.generatePDFFailure(error))
        );
        break;
      }

      default:
        throw new Error(`Unhandled action type [${action.type}] passed to Web Worker!`);
    }
  }
}

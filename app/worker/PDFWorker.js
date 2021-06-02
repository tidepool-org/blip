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

/* global importScripts, __DEV__ */
import '../core/language'; // Needed to load i18next config in the web worker
import bows from 'bows';
import _ from 'lodash';

import * as actions from '../redux/actions/worker';
import * as actionTypes from '../redux/constants/actionTypes';
import { createPrintPDFPackage } from '@tidepool/viz/dist/print';
import { isMissingBasicsData } from '../core/data';

export default class PDFWorker {
  constructor(dataUtil, importer, renderer) {
    this.log = __DEV__ ? bows('PDFWorker') : _.noop;
    this.importer = importer;
    this.renderer = renderer;
    this.dataUtil = dataUtil;

    this.log('Ready!');
  }

  handleMessage(msg, postMessage) {
    const { data: action } = msg;

    switch (action.type) {
      case actionTypes.GENERATE_PDF_REQUEST: {
        const { type, opts, queries } = action.payload;
        const { origin } = action.meta;
        const data = {};

        if (queries) {
          _.each(queries, (query, key) => {
            this.log(key, query);
            data[key] = this.dataUtil.query(query);

            switch(key) {
              case 'basics':
                opts[key].disabled = isMissingBasicsData(_.get(data, 'basics.data.current.aggregationsByDate'));
                break;

              case 'daily':
                opts[key].disabled = !_.flatten(_.valuesIn(_.get(data, 'daily.data.current.data', {}))).length > 0;
                break;

              case 'bgLog':
                opts[key].disabled = !_.flatten(_.valuesIn(_.get(data, 'bgLog.data.current.data', {}))).length > 0;
                break;

              case 'settings':
                opts[key].disabled = !_.get(data, 'settings.metaData.latestPumpUpload.settings');
                break
            }
          });
        }

        this.log('data', data);
        this.log('opts', opts);

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

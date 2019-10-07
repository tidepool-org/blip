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

export default class DataWorker {
  constructor(importer) {
    this.log = __DEV__ ? bows('DataWorker') : _.noop;
    this.log('Ready!');
    this.importer = importer;
  }

  handleMessage(msg, postMessage) {
    const { data: action } = msg;
    switch (action.type) {
      case actionTypes.DATA_WORKER_QUERY_DATA_REQUEST: {

        break;
      }

      case actionTypes.DATA_WORKER_ADD_DATA_REQUEST: {

        break;
      }

      case actionTypes.DATA_WORKER_REMOVE_DATA_REQUEST: {

        break;
      }

      case actionTypes.DATA_WORKER_UPDATE_DATUM_REQUEST: {

        break;
      }

      default:
        throw new Error(`Unhandled action type [${action.type}] passed to Web Worker!`);
    }
  }
}

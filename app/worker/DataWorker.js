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

/* global importScripts, postMessage */
import bows from 'bows';

import * as actions from '../redux/actions/worker';
import * as actionTypes from '../redux/constants/actionTypes';

export default class DataWorker {
  constructor(importer, renderer) {
    this.log = bows('DataWorker');
    this.log('Ready!');
  }

  handleMessage(msg, postMessage) {
    const { data: action } = msg;
    switch (action.type) {
      case actionTypes.PROCESS_PATIENT_DATA_REQUEST: {
        this.log('Data to process', action);
        break;
      }

      default:
        throw new Error(`Unhandled action type [${action.type}] passed to Web Worker!`);
    }
  }
}

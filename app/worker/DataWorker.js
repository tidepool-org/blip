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
import { DataUtil } from '@tidepool/viz/dist/data';

export default class DataWorker {
  constructor(data = [], Worker = DataUtil) {
    this.log = __DEV__ ? bows('DataWorker') : _.noop;
    this.dataUtil = new Worker(data);
    this.log('Ready!');
  }

  handleMessage(msg, postMessage) {
    const { data: action } = msg;

    switch (action.type) {
      case actionTypes.DATA_WORKER_ADD_DATA_REQUEST: {
        try {
          const data = JSON.parse(action.payload.data);
          const returnData = action.payload.returnData;
          const result = this.dataUtil.addData(data, returnData);
          postMessage(actions.dataWorkerAddDataSuccess(result));
        } catch (error) {
          postMessage(actions.dataWorkerAddDataFailure(error));
        }
        break;
      }

      case actionTypes.DATA_WORKER_REMOVE_DATA_REQUEST: {
        try {
          const predicate = action.payload.predicate
            ? JSON.parse(action.payload.predicate)
            : undefined;
          this.dataUtil.removeData(predicate);
          postMessage(actions.dataWorkerRemoveDataSuccess({ success: true }));
        } catch (error) {
          postMessage(actions.dataWorkerRemoveDataFailure(error));
        }
        break;
      }

      case actionTypes.DATA_WORKER_UPDATE_DATUM_REQUEST: {
        try {
          const datum = JSON.parse(action.payload.datum);
          const result = this.dataUtil.updateDatum(datum);
          postMessage(actions.dataWorkerUpdateDatumSuccess(result));
        } catch (error) {
          postMessage(actions.dataWorkerUpdateDatumFailure(error));
        }
        break;
      }

      case actionTypes.DATA_WORKER_QUERY_DATA_REQUEST: {
        try {
          const query = JSON.parse(action.payload.query);
          const result = this.dataUtil.query(query);
          postMessage(actions.dataWorkerQueryDataSuccess(result));
        } catch (error) {
          postMessage(actions.dataWorkerQueryDataFailure(error));
        }
        break;
      }

      default:
        throw new Error(`Unhandled action type [${action.type}] passed to Web Worker!`);
    }
  }
}

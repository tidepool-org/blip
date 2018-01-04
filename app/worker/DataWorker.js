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
import bows from 'bows';
import Promise from 'bluebird';
import _ from 'lodash';
import universe from 'universe';

import * as actions from '../redux/actions/worker';
import * as actionTypes from '../redux/constants/actionTypes';
import utils from '../core/utils';

export default class DataWorker {
  constructor(processer, isDev) {
    this.log = __DEV__ ? bows('DataWorker') : _.noop;
    this.log('Ready!');
    this.processer = processer;
    this.timePrefs = {};
    this.bgPrefs = {};
    // this.initDataStore();
  }

  initDataStore(data = []) {
    this.dataStore = universe(data);
    return this.dataStore;
  }

  getDataStore() {
    return this.dataStore ? new Promise(resolve => { resolve(this.dataStore) }) : this.initDataStore();
  }

  handleMessage(msg, postMessage) {
    const { data: action } = msg;
    switch (action.type) {
      case actionTypes.PROCESS_PATIENT_DATA_REQUEST: {
        const { id, data, queryParams, settings } = action.payload;

        const processLib = typeof this.processer !== 'undefined' ?
          this.processer : utils.workerProcessPatientData;

        this.log('Data to process', action);

        processLib(data, queryParams, settings).then(result => {
          this.timePrefs = result.timePrefs;
          this.bgPrefs = result.bgPrefs;

          // const dataStore = this.dataStore ? new Promise(resolve => { resolve(this.dataStore) }) : this.initData(result.data);
          this.getDataStore()
            .then(store => {
              this.dataStore = store;
              this.dataStore.add(result.data);
              return this.dataStore.query({
                groupBy: 'type',
              });
            })
            .then(res => {
              this.log('by type', res.data);
              postMessage(actions.processPatientDataSuccess(id, result.data));
              this.log('this.dataStore after', this.dataStore);
            });
            // .add(result.data)

          // postMessage(actions.processPatientDataSuccess(id, JSON.stringify(data, (key, value) => {
          //   if (typeof value === 'function') {
          //     return value.toString();
          //   }
          //   return value;
          // })))

          // postMessage(actions.processPatientDataSuccess(id, JSON.stringify(result.data)));
        }
        ).catch(error =>
          postMessage(actions.processPatientDataFailure(error))
        );

        break;
      }

      default:
        throw new Error(`Unhandled action type [${action.type}] passed to Web Worker!`);
    }
  }
}

/**
 * Copyright (c) 2021, Diabeloop
 * Minimum Redux implementation for blip v1 compat
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import _ from 'lodash';
import bows from 'bows';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { reducers as vizReducers } from 'tidepool-viz';

/** Redux action used by viz: Init viz data */
export const FETCH_PATIENT_DATA_SUCCESS = 'FETCH_PATIENT_DATA_SUCCESS';
/** Redux action used by viz: Clean data */
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';


const log = bows('BlipRedux');
/** @type {Store} */
let store = null;

function blipReducer(state, action) {
  if ([FETCH_PATIENT_DATA_SUCCESS, LOGOUT_REQUEST].includes(action.type)) {
    log.debug(action.type);
  }

  if (_.isEmpty(state)) {
    return {
      currentPatientInViewId: null,
    };
  }

  switch (action.type) {
  case FETCH_PATIENT_DATA_SUCCESS:
    state.currentPatientInViewId = action.payload.patientId;
    break;
  case LOGOUT_REQUEST:
    state.currentPatientInViewId = null;
    break;
  }

  return state;
}


export function cleanStore() {
  if (store !== null) {
    store.dispatch({ type: LOGOUT_REQUEST });
  }
  store = null;
  delete window.cleanBlipReduxStore;
}

/**
 * Init the redux store
 *
 * @returns {Store} The redux store
 */
export function initStore() {
  if (store === null) {
    log.info('Init Redux store');
    // I love redux
    store = applyMiddleware(thunkMiddleware)(createStore)(combineReducers({ viz: vizReducers, blip: blipReducer }), {
      viz: {
        trends: {},
      },
      blip: {
        currentPatientInViewId: null,
      },
    });
    window.cleanBlipReduxStore = cleanStore;
  }

  return store;
}

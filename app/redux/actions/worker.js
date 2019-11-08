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
import * as actionTypes from '../constants/actionTypes';

/* PDF Worker */
export function generatePDFRequest(type, data, opts) {
  return {
    type: actionTypes.GENERATE_PDF_REQUEST,
    meta: { WebWorker: true, worker: 'pdf', origin: document.location.origin },
    payload: {
      type,
      data: JSON.stringify(data),
      opts,
    },
  };
}

export function generatePDFSuccess(pdf) {
  return {
    type: actionTypes.GENERATE_PDF_SUCCESS,
    payload: { pdf },
  };
}

export function generatePDFFailure(error) {
  return {
    type: actionTypes.GENERATE_PDF_FAILURE,
    error,
  };
}

export function removeGeneratedPDFS() {
  return {
    type: actionTypes.REMOVE_GENERATED_PDFS,
  };
}

/* Data Worker */
export function dataWorkerAddDataRequest(data = [], returnData, patientId, fetchedUntil ) {
  return {
    type: actionTypes.DATA_WORKER_ADD_DATA_REQUEST,
    meta: { WebWorker: true, worker: 'data', origin: document.location.origin },
    payload: {
      data: JSON.stringify(data),
      fetchedUntil,
      patientId,
      returnData,
    },
  };
}

export function dataWorkerAddDataSuccess(result) {
  return {
    type: actionTypes.DATA_WORKER_ADD_DATA_SUCCESS,
    payload: { result },
  };
}

export function dataWorkerAddDataFailure(error) {
  return {
    type: actionTypes.DATA_WORKER_ADD_DATA_FAILURE,
    error,
  };
}

export function dataWorkerRemoveDataRequest(predicate) {
  return {
    type: actionTypes.DATA_WORKER_REMOVE_DATA_REQUEST,
    meta: { WebWorker: true, worker: 'data', origin: document.location.origin },
    payload: {
      predicate: predicate ? JSON.stringify(predicate) : undefined,
    },
  };
}

export function dataWorkerRemoveDataSuccess(result) {
  return {
    type: actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS,
    payload: { result },
  };
}

export function dataWorkerRemoveDataFailure(error) {
  return {
    type: actionTypes.DATA_WORKER_REMOVE_DATA_FAILURE,
    error,
  };
}

export function dataWorkerUpdateDatumRequest(datum = {}) {
  return {
    type: actionTypes.DATA_WORKER_UPDATE_DATUM_REQUEST,
    meta: { WebWorker: true, worker: 'data', origin: document.location.origin },
    payload: {
      datum: JSON.stringify(datum),
    },
  };
}

export function dataWorkerUpdateDatumSuccess(result) {
  return {
    type: actionTypes.DATA_WORKER_UPDATE_DATUM_SUCCESS,
    payload: { result },
  };
}

export function dataWorkerUpdateDatumFailure(error) {
  return {
    type: actionTypes.DATA_WORKER_UPDATE_DATUM_FAILURE,
    error,
  };
}

export function dataWorkerQueryDataRequest(query = {}) {
  return {
    type: actionTypes.DATA_WORKER_QUERY_DATA_REQUEST,
    meta: { WebWorker: true, worker: 'data', origin: document.location.origin },
    payload: {
      query: JSON.stringify(query),
    },
  };
}

export function dataWorkerQueryDataSuccess(result) {
  return {
    type: actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
    payload: { result },
  };
}

export function dataWorkerQueryDataFailure(error) {
  return {
    type: actionTypes.DATA_WORKER_QUERY_DATA_FAILURE,
    error,
  };
}

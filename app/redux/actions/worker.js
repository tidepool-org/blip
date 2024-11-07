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
export function generatePDFRequest(type, queries, opts, id, data) {
  return {
    type: actionTypes.GENERATE_PDF_REQUEST,
    meta: { WebWorker: true, worker: 'pdf', id },
    payload: {
      type,
      queries,
      opts,
      data,
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
    meta: { WebWorker: true, worker: 'data', id: patientId },
    payload: {
      data: JSON.stringify(data),
      fetchedCount: data.length,
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

export function dataWorkerRemoveDataRequest(predicate, patientId) {
  return {
    type: actionTypes.DATA_WORKER_REMOVE_DATA_REQUEST,
    meta: { WebWorker: true, worker: 'data', id: patientId },
    payload: {
      predicate: predicate ? JSON.stringify(predicate) : undefined,
    },
  };
}

export function dataWorkerRemoveDataSuccess(result, preserveCache = false) {
  return {
    type: actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS,
    payload: { result, preserveCache },
  };
}

export function dataWorkerRemoveDataFailure(error) {
  return {
    type: actionTypes.DATA_WORKER_REMOVE_DATA_FAILURE,
    error,
  };
}

export function dataWorkerUpdateDatumRequest(datum = {}, patientId) {
  return {
    type: actionTypes.DATA_WORKER_UPDATE_DATUM_REQUEST,
    meta: { WebWorker: true, worker: 'data', id: patientId },
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

export function dataWorkerQueryDataRequest(query = {}, patientId, destination = 'redux') {
  return {
    type: actionTypes.DATA_WORKER_QUERY_DATA_REQUEST,
    meta: { WebWorker: true, worker: 'data', id: patientId, destination },
    payload: {
      query: JSON.stringify(query),
    },
  };
}

export function dataWorkerQueryDataSuccess(result, destination = 'redux') {
  return {
    type: actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
    payload: { result, destination },
  };
}

export function dataWorkerQueryDataFailure(error) {
  return {
    type: actionTypes.DATA_WORKER_QUERY_DATA_FAILURE,
    error,
  };
}

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

export function processPatientDataRequest(id, data, queryParams, settings) {
// export function processPatientDataRequest(id, data, notes) {

  // const queryParams = {};
  // _.forEach(document.location.search.replace('?', '').split('&'), paramString => {
  //   const paramArr = paramString.split('=');
  //   queryParams[paramArr[0]] = paramArr[1];
  // });

  return {
    type: actionTypes.PROCESS_PATIENT_DATA_REQUEST,
    meta: { WebWorker: true, worker: 'data' },
    // meta: { WebWorker: true, worker: 'data', queryParams },
    payload: {
      id,
      // data: JSON.stringify(data),
      data,
      queryParams,
      settings,
      // notes: JSON.stringify(notes),
    },
  };
}

export function processPatientDataSuccess(id, data) {
  // const patientData = JSON.parse(data, function (key, value) {
  //   if (value && typeof value === 'string' && value.substr(0,8) === 'function') {
  //     var startBody = value.indexOf('{') + 1;
  //     var endBody = value.lastIndexOf('}');
  //     var startArgs = value.indexOf('(') + 1;
  //     var endArgs = value.indexOf(')');
  //     if (key === 'watson') {
  //       console.log('startBody', startBody);
  //       console.log('endBody', endBody);
  //       console.log('startArgs', startArgs);
  //       console.log('endArgs', endArgs);
  //       console.log(value);
  //     }

  //     return new Function(value.substring(startArgs, endArgs), value.substring(startBody, endBody));
  //   }
  //   return value;
  // });

  return {
    type: actionTypes.PROCESS_PATIENT_DATA_SUCCESS,
    payload: {
      patientId: id,
      patientData: data,
      // patientData: JSON.parse(data),
    },
  };
}

export function processPatientDataFailure(error) {
  return {
    type: actionTypes.PROCESS_PATIENT_DATA_FAILURE,
    error,
  };
}

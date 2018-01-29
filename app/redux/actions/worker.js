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

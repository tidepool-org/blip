/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

/* global chai */
/* global describe */
/* global it */
/* global expect */

import isTSA from 'tidepool-standard-action';

import * as actionTypes from '../../../../app/redux/constants/actionTypes';
import * as worker from '../../../../app/redux/actions/worker';

describe('worker action creators', () => {
  describe('generatePDFRequest', () => {
    const payload = {
      type: 'combined',
      data: [],
      opts: {},
    };

    const {
      type,
      data,
      opts,
    } = payload;

    const action = worker.generatePDFRequest(type, data, opts);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to request a PDF generation', () => {
      expect(action).to.deep.equal({
        type: actionTypes.GENERATE_PDF_REQUEST,
        meta: { WebWorker: true, worker: 'pdf', origin: document.location.origin },
        payload: {
          type,
          data: JSON.stringify(data),
          opts,
        },
      });
    });
  });

  describe('generatePDFSuccess', () => {
    const pdf = {
      daily: {
        url: 'someURL',
        blob: 'someBlob',
      },
    };

    const action = worker.generatePDFSuccess(pdf);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to store a generated pdf', () => {
      expect(action).to.deep.equal({
        type: actionTypes.GENERATE_PDF_SUCCESS,
        payload: { pdf },
      });
    });
  });

  describe('generatePDFFailure', () => {
    const error = new Error;

    const action = worker.generatePDFFailure(error);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action notify of a pdf generation failure', () => {
      expect(action).to.deep.equal({
        type: actionTypes.GENERATE_PDF_FAILURE,
        error,
      });
    });
  });

  describe('removeGeneratedPDFS', () => {
    const action = worker.removeGeneratedPDFS();

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to remove all generated PDFs', () => {
      expect(action).to.deep.equal({
        type: actionTypes.REMOVE_GENERATED_PDFS,
      });
    });
  });
});

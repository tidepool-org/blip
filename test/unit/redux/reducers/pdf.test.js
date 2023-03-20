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
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import mutationTracker from 'object-invariant-test-helper';

import * as actionTypes from '../../../../app/redux/constants/actionTypes';
import reducer from '../../../../app/redux/reducers/pdf';

describe('pdf reducer', () => {
  it('should return the initial state of {}', () => {
    expect(reducer(undefined, {})).to.deep.equal({});
  });

  describe('GENERATE_PDF_SUCCESS', () => {
    it('should merge the pdf data recieved', () => {
      const pdfObject = {
        url: 'someUrl',
        blob: 'someBlob',
      };

      const initialState = { bgLog: pdfObject };
      const tracked = mutationTracker.trackObj(initialState);

      expect(reducer(initialState, {
        type: actionTypes.GENERATE_PDF_SUCCESS,
        payload: {
          pdf: { daily: pdfObject },
        },
      })).to.deep.equal({
        bgLog: pdfObject,
        daily: pdfObject,
      });

      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('GENERATE_AGP_IMAGES_REQUEST', () => {
    it('should merge the payload to state', () => {
      const payload = {
        query: 'someQuery',
        data: 'someData',
      };

      const initialState = { existing: 'existingState' };
      const tracked = mutationTracker.trackObj(initialState);

      expect(reducer(initialState, {
        type: actionTypes.GENERATE_AGP_IMAGES_REQUEST,
        payload,
      })).to.deep.equal({
        existing: 'existingState',
        query: 'someQuery',
        data: 'someData',
      });

      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('GENERATE_AGP_IMAGES_SUCCESS', () => {
    it('should merge the payload.images to state.opts.svgDataURLS', () => {
      const payload = {
        images: 'someImages',
      };

      const initialState = { opts: { patient: 'somePatient' } };
      const tracked = mutationTracker.trackObj(initialState);

      expect(reducer(initialState, {
        type: actionTypes.GENERATE_AGP_IMAGES_SUCCESS,
        payload,
      })).to.deep.equal({
        opts: {
          patient: 'somePatient',
          svgDataURLS: 'someImages'
        },
      });

      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('GENERATE_AGP_IMAGES_FAILURE', () => {
    it('should reset to the initial state of {}', () => {
      const pdfObject = {
        url: 'someUrl',
        blob: 'someBlob',
      };

      const initialState = { bgLog: pdfObject };
      const tracked = mutationTracker.trackObj(initialState);

      expect(reducer(initialState, {
        type: actionTypes.GENERATE_AGP_IMAGES_FAILURE,
      })).to.deep.equal({});

      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('REMOVE_GENERATED_PDFS', () => {
    it('should reset to the initial state of {}', () => {
      const pdfObject = {
        url: 'someUrl',
        blob: 'someBlob',
      };

      const initialState = { bgLog: pdfObject };
      const tracked = mutationTracker.trackObj(initialState);

      expect(reducer(initialState, {
        type: actionTypes.REMOVE_GENERATED_PDFS,
      })).to.deep.equal({});

      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});

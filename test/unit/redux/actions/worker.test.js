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
  const patientId = 'abc123';

  describe('generatePDFRequest', () => {
    const payload = {
      type: 'combined',
      queries: {},
      opts: {},
      data: {}
    };

    const {
      type,
      queries,
      opts,
      data,
    } = payload;

    const action = worker.generatePDFRequest(type, queries, opts, patientId, data);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to request a PDF generation', () => {
      expect(action).to.deep.equal({
        type: actionTypes.GENERATE_PDF_REQUEST,
        meta: { WebWorker: true, worker: 'pdf', id: patientId },
        payload: {
          type,
          queries,
          opts,
          data,
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

  describe('dataWorkerAddDataRequest', () => {
    const data = [{ foo: 'bar'}];
    const returnData = false;
    const patientId = 'abc123';
    const fetchedUntil = '2019-11-27T00:00:00.000Z';

    const action = worker.dataWorkerAddDataRequest(data, returnData, patientId, fetchedUntil);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to add data to the worker', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_ADD_DATA_REQUEST,
        meta: { WebWorker: true, worker: 'data', id: patientId },
        payload: {
          data: JSON.stringify(data),
          fetchedCount: 1,
          returnData,
          patientId,
          fetchedUntil,
        },
      });
    });
  });

  describe('dataWorkerAddDataSuccess', () => {
    const result = { success: true };

    const action = worker.dataWorkerAddDataSuccess(result);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to handle results of successfully adding data', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_ADD_DATA_SUCCESS,
        payload: {
          result,
        },
      });
    });
  });

  describe('dataWorkerAddDataFailure', () => {
    const error = new Error;

    const action = worker.dataWorkerAddDataFailure(error);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action notify of an adding data failure', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_ADD_DATA_FAILURE,
        error,
      });
    });
  });

  describe('dataWorkerRemoveDataRequest', () => {
    const predicate = { foo: 'bar'};

    const action = worker.dataWorkerRemoveDataRequest(predicate, patientId);
    const actionWithUndefinedPredicate = worker.dataWorkerRemoveDataRequest(undefined, patientId);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
      expect(isTSA(actionWithUndefinedPredicate)).to.be.true;
    });

    it('should create an action to remove data from the worker with a stringified predicate', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_REMOVE_DATA_REQUEST,
        meta: { WebWorker: true, worker: 'data', id: patientId },
        payload: {
          predicate: JSON.stringify(predicate),
        },
      });
    });

    it('should create an action to remove data from the worker with an undefined predicate', () => {
      expect(actionWithUndefinedPredicate).to.deep.equal({
        type: actionTypes.DATA_WORKER_REMOVE_DATA_REQUEST,
        meta: { WebWorker: true, worker: 'data', id: patientId },
        payload: {
          predicate: undefined,
        },
      });
    });
  });

  describe('dataWorkerRemoveDataSuccess', () => {
    const result = { success: true };
    const preserveCache = true;

    const action = worker.dataWorkerRemoveDataSuccess(result, preserveCache);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to handle results of successfully removing data', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS,
        payload: {
          result,
          preserveCache,
        },
      });
    });
  });

  describe('dataWorkerRemoveDataFailure', () => {
    const error = new Error;

    const action = worker.dataWorkerRemoveDataFailure(error);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action notify of an removing data failure', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_REMOVE_DATA_FAILURE,
        error,
      });
    });
  });

  describe('dataWorkerUpdateDatumRequest', () => {
    const datum = { foo: 'bar'};

    const action = worker.dataWorkerUpdateDatumRequest(datum, patientId);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to update a datum in the worker', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_UPDATE_DATUM_REQUEST,
        meta: { WebWorker: true, worker: 'data', id: patientId },
        payload: {
          datum: JSON.stringify(datum),
        },
      });
    });
  });

  describe('dataWorkerUpdateDatumSuccess', () => {
    const result = { success: true };

    const action = worker.dataWorkerUpdateDatumSuccess(result);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to handle results of successfully updating a datum', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_UPDATE_DATUM_SUCCESS,
        payload: {
          result,
        },
      });
    });
  });

  describe('dataWorkerUpdateDatumFailure', () => {
    const error = new Error;

    const action = worker.dataWorkerUpdateDatumFailure(error);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action notify of a datum update failure', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_UPDATE_DATUM_FAILURE,
        error,
      });
    });
  });

  describe('dataWorkerQueryDataRequest', () => {
    const query = { foo: 'bar'};

    const action = worker.dataWorkerQueryDataRequest(query, patientId);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to query data from the worker', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_QUERY_DATA_REQUEST,
        meta: { WebWorker: true, worker: 'data', id: patientId, destination: 'redux' },
        payload: {
          query: JSON.stringify(query),
        },
      });
    });
  });

  describe('dataWorkerQueryDataSuccess', () => {
    const result = { success: true };

    const action = worker.dataWorkerQueryDataSuccess(result);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to handle results of successfully querying data', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
        payload: {
          result,
          destination: 'redux',
        },
      });
    });
  });

  describe('dataWorkerQueryDataFailure', () => {
    const error = new Error;

    const action = worker.dataWorkerQueryDataFailure(error);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action notify of a data query failure', () => {
      expect(action).to.deep.equal({
        type: actionTypes.DATA_WORKER_QUERY_DATA_FAILURE,
        error,
      });
    });
  });
});

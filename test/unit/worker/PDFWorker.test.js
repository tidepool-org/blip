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

/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global afterEach */

import Promise from 'bluebird';

import PDFWorker from '../../../app/worker/PDFWorker';
import * as actions from '../../../app/redux/actions/worker';

describe('PDFWorker', () => {
  let Worker;
  const importer = sinon.stub();
  const renderer = sinon.stub().usingPromise(Promise);

  const queryResults = {
    agpBGM: { data: { current: { data: [] } } },
    agpCGM: { data: { current: { data: ['foo'] } } },
    basics: { data: { current: { aggregationsByDate: {
      basals: {},
      boluses: {},
      fingersticks: {
        calibration: {},
        smbg: {},
      },
      siteChanges: {},
    } } } },
    daily: { data: { current: { data: ['foo'] } } },
    bgLog: { data: { current: { data: [] } } },
    settings: { metaData: { latestPumpUpload: { settings: 'settings data' } } },
  };

  const dataUtil = {
    query: sinon.stub().callsFake(key => queryResults[key]),
  };

  const pdf = {
    url: 'someURL',
    blob: 'someBlob',
  };

  const type = 'combined';

  const queries = {
    agpBGM: 'agpBGM',
    agpCGM: 'agpCGM',
    basics: 'basics',
    daily: 'daily',
    bgLog: 'bgLog',
    settings: 'settings',
  };

  const opts = () => ({
    agpBGM: {},
    agpCGM: {},
    basics: {},
    daily: {},
    bgLog: {},
    settings: {},
    svgDataURLS: 'imageURLs',
    pdfType: 'combined',
  });

  beforeEach(() => {
    Worker = new PDFWorker(dataUtil, importer, renderer);
  });

  afterEach(() => {
    importer.reset();
    renderer.reset();
  });

  it('should instantiate without errors', () => {
    expect(Worker).to.be.an('object');
  });

  it('should have a handleMessage method', () => {
    expect(Worker.handleMessage).to.be.a('function');
  });

  it('should call the pdf rendering method properly upon request', () => {
    renderer.resolves(pdf);

    const postMessage = sinon.stub();

    const action = actions.generatePDFRequest(type, queries, opts());
    Worker.handleMessage({ data: action }, postMessage);

    sinon.assert.calledOnce(renderer);
    sinon.assert.calledWithExactly(renderer, queryResults, {
      ...opts(),
      agpBGM: { disabled: true },
      agpCGM: { disabled: false },
      basics: { disabled: true },
      daily: { disabled: false },
      bgLog: { disabled: true },
      settings: { disabled: false },
    });
  });

  it('should fire a success action upon succesful rendering', done => {
    renderer.resolves(pdf);

    const postMessage = sinon.stub();

    const action = actions.generatePDFRequest(type, queries, opts());
    Worker.handleMessage({ data: action }, postMessage);

    const data = {};

    Worker.renderer(data, opts()).then(result => {
      sinon.assert.calledOnce(postMessage);
      sinon.assert.calledWithExactly(
        postMessage,
        actions.generatePDFSuccess({ [type]: result })
      );
      done()
    });
  });

  it('should fire a failure action upon failed rendering', done => {
    renderer.rejects(new Error());

    const postMessage = sinon.stub();

    const action = actions.generatePDFRequest(type, queries, opts());
    Worker.handleMessage({ data: action }, postMessage);

    const data = {};

    Worker.renderer(data, opts()).then().catch(error => {
      sinon.assert.calledOnce(postMessage);
      sinon.assert.calledWithExactly(
        postMessage,
        actions.generatePDFFailure(error)
      );
      done();
    });
  });

  it('should fire a failure action uplon failed query', () => {
    const postMessage = sinon.stub();
    const error = new Error('query error');
    dataUtil.query.throws(error);

    Worker = new PDFWorker(dataUtil, importer, renderer);

    const action = actions.generatePDFRequest(type, queries, opts());
    Worker.handleMessage({ data: action }, postMessage);

    sinon.assert.calledOnce(postMessage);
    sinon.assert.calledWithExactly(
      postMessage,
      actions.generatePDFFailure(error)
    );
    dataUtil.query = sinon.stub().callsFake(key => queryResults[key]);
  });

  it('should throw an error if it receives an unhandled action type', () => {
    const action = {
      type: 'unknownAction',
    };

    const spy = sinon.spy(Worker, 'handleMessage');

    try {
      spy({ data: action });
    } catch (e) {
      // caught
    }

    expect(spy.threw()).to.be.true;
  });

  it('should request images if agp is requested, and images are not present in opts, instead of generating the PDF', () => {
    const postMessage = sinon.stub();

    let action = actions.generatePDFRequest(
      type,
      { ...queries, agpCGM: 'agpCGM' },
      { ...opts(), svgDataURLS: undefined },
    );

    Worker.handleMessage({ data: action }, postMessage);

    sinon.assert.notCalled(renderer);

    sinon.assert.calledWithExactly(
      postMessage,
      {
        type: 'GENERATE_AGP_IMAGES_REQUEST',
        payload: {
          data: {
            agpBGM: { data: { current: { data: [] } } },
            agpCGM: { data: { current: { data: ['foo'] } } }
          },
          opts: {
            agpBGM: { disabled: true },
            agpCGM: { disabled: false },
            basics: {  },
            bgLog: {  },
            daily: {  },
            settings: {  },
            svgDataURLS: undefined,
            pdfType: 'combined',
          },
          queries: {
            agpBGM: 'agpBGM',
            agpCGM: 'agpCGM',
            basics: 'basics',
            bgLog: 'bgLog',
            daily: 'daily',
            settings: 'settings',
          },
        },
      },
    );
  });
});

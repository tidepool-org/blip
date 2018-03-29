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

  const pdf = {
    url: 'someURL',
    blob: 'someBlob',
  };

  const payload = {
    type: 'daily',
    data: {},
    opts: {},
  };

  const {
    type,
    data,
    opts,
  } = payload;

  beforeEach(() => {
    Worker = new PDFWorker(importer, renderer);
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

  it('should import the required static files upon pdf generation request', () => {
    renderer.resolves(pdf);

    const postMessage = sinon.stub();

    const action = actions.generatePDFRequest(type, data, opts);
    const origin = action.meta.origin;

    Worker.handleMessage({ data: action }, postMessage);

    sinon.assert.calledOnce(importer);
    sinon.assert.calledWithExactly(importer, `${origin}/pdfkit.js`, `${origin}/blob-stream.js`);
  });

  it('should call the pdf rendering method properly upon request', () => {
    renderer.resolves(pdf);

    const postMessage = sinon.stub();

    const action = actions.generatePDFRequest(type, data, opts);
    Worker.handleMessage({ data: action }, postMessage);

    sinon.assert.calledOnce(renderer);
    sinon.assert.calledWithExactly(renderer, data, opts);
  });

  it('should fire a success action upon succesful rendering', () => {
    renderer.resolves(pdf);

    const postMessage = sinon.stub();

    const action = actions.generatePDFRequest(type, data, opts);
    Worker.handleMessage({ data: action }, postMessage);

    return Worker.renderer(data, opts).then(result => {
      sinon.assert.calledOnce(postMessage);
      sinon.assert.calledWithExactly(
        postMessage,
        actions.generatePDFSuccess({ [type]: result })
      );
    });
  });

  it('should fire a failure action upon failed rendering', () => {
    renderer.rejects(new Error());

    const postMessage = sinon.stub();

    const action = actions.generatePDFRequest(type, data, opts);
    Worker.handleMessage({ data: action }, postMessage);

    return Worker.renderer(data, opts).then().catch(error => {
      sinon.assert.calledOnce(postMessage);
      sinon.assert.calledWithExactly(
        postMessage,
        actions.generatePDFFailure(error)
      );
    });
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
});

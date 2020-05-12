/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global afterEach */

import DataWorker from '../../../app/worker/DataWorker';
import * as actions from '../../../app/redux/actions/worker';

describe('DataWorker', () => {
  let Worker;

  class DataUtilStub {
    addData = sinon.stub().returns('added data');
    removeData = sinon.stub();
    updateDatum = sinon.stub().returns('updated datum');
    query = sinon.stub().returns('queried data');
  }

  beforeEach(() => {
    Worker = new DataWorker(DataUtilStub);
  });

  it('should instantiate without errors', () => {
    expect(Worker).to.be.an('object');
  });

  it('should have a handleMessage method', () => {
    expect(Worker.handleMessage).to.be.a('function');
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

  describe('DATA_WORKER_ADD_DATA_REQUEST', () => {
    const data = [];
    const returnData = false;
    const patientId = 'abc123';
    const fetchedUntil = '2019-11-27T00:00:00.000Z';

    let postMessage;
    let action;

    beforeEach(() => {
      postMessage = sinon.stub();
      action = actions.dataWorkerAddDataRequest(data, returnData, patientId, fetchedUntil);
    });

    it('should call the addData method for the dataUtil and post successful result', () => {
      Worker.handleMessage({ data: action }, postMessage);
      sinon.assert.calledWith(Worker.dataUtil.addData, data, patientId, returnData);

      const expectedResult = actions.dataWorkerAddDataSuccess('added data');
      sinon.assert.calledWith(postMessage, expectedResult);
    });

    it('should call the addData method and post error message', () => {
      const error = new Error('error mssg');
      Worker.dataUtil.addData.throws(() => error)
      Worker.handleMessage({ data: action }, postMessage);

      const expectedResult = actions.dataWorkerAddDataFailure(error);
      sinon.assert.calledWith(postMessage, expectedResult);
    });
  });

  describe('DATA_WORKER_REMOVE_DATA_REQUEST', () => {
    const predicate = { foo: 'bar' };

    let postMessage;
    let action;

    beforeEach(() => {
      postMessage = sinon.stub();
      action = actions.dataWorkerRemoveDataRequest(predicate);
    });

    it('should call the removeData method for the dataUtil and post successful result', () => {
      Worker.handleMessage({ data: action }, postMessage);
      sinon.assert.calledWith(Worker.dataUtil.removeData, predicate);

      const expectedResult = actions.dataWorkerRemoveDataSuccess({ success: true });
      sinon.assert.calledWith(postMessage, expectedResult);
    });

    it('should call the removeData method and post error message', () => {
      const error = new Error('error mssg');
      Worker.dataUtil.removeData.throws(() => error)
      Worker.handleMessage({ data: action }, postMessage);

      const expectedResult = actions.dataWorkerRemoveDataFailure(error);
      sinon.assert.calledWith(postMessage, expectedResult);
    });
  });

  describe('DATA_WORKER_UPDATE_DATUM_REQUEST', () => {
    const datum = { foo: 'bar' };

    let postMessage;
    let action;

    beforeEach(() => {
      postMessage = sinon.stub();
      action = actions.dataWorkerUpdateDatumRequest(datum);
    });

    it('should call the updateDatum method for the dataUtil and post successful result', () => {
      Worker.handleMessage({ data: action }, postMessage);
      sinon.assert.calledWith(Worker.dataUtil.updateDatum, datum);

      const expectedResult = actions.dataWorkerUpdateDatumSuccess('updated datum');
      sinon.assert.calledWith(postMessage, expectedResult);
    });

    it('should call the updateDatum method and post error message', () => {
      const error = new Error('error mssg');
      Worker.dataUtil.updateDatum.throws(() => error)
      Worker.handleMessage({ data: action }, postMessage);

      const expectedResult = actions.dataWorkerUpdateDatumFailure(error);
      sinon.assert.calledWith(postMessage, expectedResult);
    });
  });

  describe('DATA_WORKER_QUERY_DATA_REQUEST', () => {
    const query = { foo: 'bar' };
    const patientId = 'abc123';
    const destination = 'foo';

    let postMessage;
    let action;

    beforeEach(() => {
      postMessage = sinon.stub();
      action = actions.dataWorkerQueryDataRequest(query, patientId, destination);
    });

    it('should call the query method for the dataUtil and post successful result', () => {
      Worker.handleMessage({ data: action }, postMessage);
      sinon.assert.calledWith(Worker.dataUtil.query, query);

      const expectedResult = actions.dataWorkerQueryDataSuccess('queried data', destination);
      sinon.assert.calledWith(postMessage, expectedResult);
    });

    it('should call the query method and post error message', () => {
      const error = new Error('error mssg');
      Worker.dataUtil.query.throws(() => error)
      Worker.handleMessage({ data: action }, postMessage);

      const expectedResult = actions.dataWorkerQueryDataFailure(error);
      sinon.assert.calledWith(postMessage, expectedResult);
    });
  });
});

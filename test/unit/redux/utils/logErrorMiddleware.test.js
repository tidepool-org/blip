/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global afterEach */


import logErrorMiddleware from '../../../../app/redux/utils/logErrorMiddleware';

describe.only('logErrorMiddleware', () => {
  let api;
  let middleware;
  let getState;
  let next;
  let action;

  beforeEach(() => {
    api = {
      errors: {
        log: sinon.spy(),
      },
    };
    middleware = logErrorMiddleware(api);
    getState = sinon.spy();
    next = sinon.spy();
    action = {};
  });

  it('should call api.errors.log when action has an error', () => {
    const error = new Error('Test error');
    action = { error };

    middleware({ getState })(next)(action);

    sinon.assert.calledWith(api.errors.log, error, null, {});
    sinon.assert.calledWith(next, action);
  });

  it('should call api.errors.log when action has an error object', () => {
    const error = new Error('Test error');
    action = { error: { apiError: error }};

    middleware({ getState })(next)(action);

    sinon.assert.calledWith(api.errors.log, { apiError: error }, null, {});
    sinon.assert.calledWith(next, action);
  });

  it('should not call api.errors.log when action does not have an error', () => {
    action = {};

    middleware({ getState })(next)(action);

    sinon.assert.notCalled(api.errors.log);
    sinon.assert.calledWith(next, action);
  });

  it('should call api.errors.log when action has meta.apiError', () => {
    const error = new Error('Test error');
    const meta = { apiError: { status: 500 } };
    action = { error, meta };

    middleware({ getState })(next)(action);

    sinon.assert.calledWith(api.errors.log, error, 'API error', meta.apiError);
    sinon.assert.calledWith(next, action);
  });

});

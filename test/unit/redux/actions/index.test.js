/* global chai */
/* global sinon */
/* global describe */
/* global it */

import { isFSA } from 'flux-standard-action';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import actions from '../../../../app/redux/actions/index';

import initialState from '../../../../app/redux/reducers/initialState';

describe('Actions', () => {
  const mockStore = configureStore([thunk]);

  describe('Asyncronous Actions', () => {
    describe('signup', (done) => {
      it('for a successful request, it should trigger SIGNUP_SUCESS and it should call signup and get once', () => {
        let user = { id: 27 };
        let api = {
          user: {
            signup: sinon.stub().callsArgWith(1, null, 'success!'),
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let expectedActions = [
          { type: 'SIGNUP_REQUEST' },
          { type: 'SIGNUP_SUCCESS', payload: { user: { id: 27 } } }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(actions.async.signup(api, {foo: 'bar'}));

        expect(api.user.signup.callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(1);
      });
    });
  });


  describe('Syncronous Actions', () => {

  });
});
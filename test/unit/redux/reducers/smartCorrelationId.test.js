/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { smartCorrelationId as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('smartCorrelationId', () => {
  describe('setSmartCorrelationId', () => {
    it('should set state to correlationId when state is null', () => {
      let initialStateForTest = null;

      let action = actions.sync.setSmartCorrelationId('correlationId123');

      let state = reducer(initialStateForTest, action);

      expect(state).to.equal('correlationId123');
    });

    it('should not change state when state already has a value', () => {
      let initialStateForTest = 'originalCorrelationId';

      let action = actions.sync.setSmartCorrelationId('newCorrelationId');

      let state = reducer(initialStateForTest, action);

      expect(state).to.equal('originalCorrelationId');
    });
  });

  describe('logoutRequest', () => {
    it('should set state to null', () => {
      let initialStateForTest = 'correlationId123';

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });
});

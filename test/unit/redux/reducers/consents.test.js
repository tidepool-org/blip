/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import { consents as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('consents', () => {
  describe('fetchLatestConsentByTypeSuccess', () => {
    it('should set latest consents by type to state', () => {
      let initialStateForTest = {};
      const consentType = 'consentType123';
      let consentDocument = { data: [{ id: 'consentDocument123' }] };
      let action = actions.sync.fetchLatestConsentByTypeSuccess(consentType, consentDocument);
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        consentType123: { id: 'consentDocument123' },
      });
    });
  });

});

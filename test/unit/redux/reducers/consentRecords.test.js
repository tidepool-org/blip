/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import { consentRecords as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('consentRecords', () => {
  describe('fetchUserConsentRecordsSuccess', () => {
    it('should set latest consentRecord by type to state if status is active', () => {
      const initialStateForTest = {};
      const consentType = 'consentType123';
      const records = { data: [{ id: 'record123', status: 'active' }] };
      const action = actions.sync.fetchUserConsentRecordsSuccess(consentType, records);
      const state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        consentType123: { id: 'record123', status: 'active' },
      });
    });

    it('should not set latest consentRecord by type to state if status is revoked', () => {
      const initialStateForTest = {};
      const consentType = 'consentType123';
      const records = { data: [{ id: 'record123', status: 'revoked' }] };
      const action = actions.sync.fetchUserConsentRecordsSuccess(consentType, records);
      const state = reducer(initialStateForTest, action);
      expect(state).to.eql({});
    });
  });

  describe('createUserConsentRecordSuccess', () => {
    it('should set the created record state', () => {
      const initialStateForTest = {};
      const createdRecord = { id: 'record123', type: 'consentType123' };
      const action = actions.sync.createUserConsentRecordSuccess(createdRecord);
      const state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        consentType123: { id: 'record123', type: 'consentType123' },
      });
    });
  });

  describe('updateUserConsentRecordSuccess', () => {
    it('should set the updated record state', () => {
      const initialStateForTest = { consentType123: { id: 'record123', type: 'consentType123' } };
      const updatedRecord = { id: 'record456', type: 'consentType123' };
      const action = actions.sync.updateUserConsentRecordSuccess(updatedRecord);
      const state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        consentType123: { id: 'record456', type: 'consentType123' },
      });
    });
  });

  describe('revokeUserConsentRecordSuccess', () => {
    it('should set the updated record state', () => {
      const initialStateForTest = {
        consentType123: { id: 'record123', type: 'consentType123' },
        consentType456: { id: 'record456', type: 'consentType456' },
     };
      const revokedConsentType = 'consentType123';
      const action = actions.sync.revokeUserConsentRecordSuccess(revokedConsentType);
      const state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        consentType456: { id: 'record456', type: 'consentType456' },
      });
    });
  });
});

/* global chai */
/* global sinon */
/* global describe */
/* global it */

 import { smartOnFhirData as reducer } from '../../../../app/redux/reducers/misc';

 import * as actions from '../../../../app/redux/actions/index';

 const expect = chai.expect;

describe('smartOnFhirData', () => {
  describe('SMART_ON_FHIR_AUTH_SUCCESS', () => {
    it('should set state to the provided Smart on FHIR data', () => {
      const initialStateForTest = null;

      const smartOnFhirData = {
        patients: {
          'correlation-123': {
            mrn: '12345',
          },
        },
      };

      const action = actions.sync.smartOnFhirAuthSuccess(smartOnFhirData);

      const state = reducer(initialStateForTest, action);

      expect(state).to.deep.equal(smartOnFhirData);
    });
  });

  describe('LOGOUT_REQUEST', () => {
    it('should set state to null', () => {
      const initialStateForTest = {
        patients: {
          'correlation-123': {
            mrn: '12345',
          },
        },
      };

      const action = actions.sync.logoutRequest();

      const state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });

  describe('default', () => {
    it('should return the initial state if the action type is not SMART_ON_FHIR_AUTH_SUCCESS or LOGOUT_REQUEST', () => {
      const initialStateForTest = null;

      const action = {
        type: 'UNKNOWN_ACTION',
      };

      const state = reducer(initialStateForTest, action);

      expect(state).to.equal(null);
    });
  });
});

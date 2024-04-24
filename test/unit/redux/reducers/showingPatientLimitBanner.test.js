/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { showingPatientLimitBanner as reducer } from '../../../../app/redux/reducers/misc';
import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('showingPatientLimitBanner', () => {
  describe('showBanner', () => {
    it('should set state to true', () => {
      let initialStateForTest = null;

      let action = actions.sync.showBanner('patientLimit');

      let nextState = reducer(initialStateForTest, action);

      expect(nextState).to.be.true;
    });

    it('should not set state to true if banner was already dismissed', () => {
      let initialStateForTest = false; // signifies dismissal, as opposed to null, which is the default state

      let action = actions.sync.showBanner('patientLimit');

      let nextState = reducer(initialStateForTest, action);

      expect(nextState).to.be.false;
    });
  });

  describe('hideBanner', () => {
    it('should set state to null, but only if type matches', () => {
      let initialStateForTest = true;

      let typeMismatchAction = actions.sync.hideBanner('dexcom');
      let action = actions.sync.hideBanner('patientLimit');

      let intermediate = reducer(initialStateForTest, typeMismatchAction);

      expect(intermediate).to.be.true;

      let nextState = reducer(initialStateForTest, action);

      expect(nextState).to.be.null;
    });
  });

  describe('logoutReqest', () => {
    it('should set state to null', () => {
      let initialStateForTest = true;

      let action = actions.sync.logoutRequest();

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.null;

      let nextState = reducer(null, action);

      expect(nextState).to.be.null;
    });
  });

  describe('dismissBanner', () => {
    it('should set state to false', () => {
      let initialStateForTest = true;

      let action = actions.sync.dismissBanner('patientLimit');

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.false;

      let nextState = reducer(null, action);

      expect(nextState).to.be.false;
    });
  });

  describe('selectClinicSuccess', () => {
    it('should set state to false if user dismissed the banner', () => {
      let initialStateForTest = true;

      const clinicId = 'clinic123';

      let action = actions.sync.selectClinicSuccess(clinicId);

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.null;

      let nextState = reducer(null, action);

      expect(nextState).to.be.null;
    });
  });
});

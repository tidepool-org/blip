/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { prescriptions as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('prescriptions', () => {
  describe('fetchPrescriptionsSuccess', () => {
    it('should set prescriptions to state', () => {
      let initialStateForTest = [];

      let prescriptions = [{ id: 'one' }];

      let action = actions.sync.fetchPrescriptionsSuccess(prescriptions);

      let state = reducer(initialStateForTest, action);

      expect(state[0].id).to.equal('one');
      expect(state.length).to.equal(1);
    });
  });

  describe('createPrescriptionSuccess', () => {
    it('should add prescription to state', () => {
      let initialStateForTest = [];

      let prescription = { id: 'one' };

      let action = actions.sync.createPrescriptionSuccess(prescription);

      let state = reducer(initialStateForTest, action);

      expect(state[0].id).to.equal('one');
      expect(state.length).to.equal(1);
    });
  });

  describe('createPrescriptionRevisionSuccess', () => {
    it('should update a prescription in state by matching `id`', () => {
      let initialStateForTest = [
        { id: 'one', value: 1 },
        { id: 'two', value: 2 },
        { id: 'three', value: 3 },
      ];

      let prescription = { id: 'two', value: 4 };

      let action = actions.sync.createPrescriptionRevisionSuccess(prescription);

      let state = reducer(initialStateForTest, action);

      expect(state[1].id).to.equal('two');
      expect(state[1].value).to.equal(4);
      expect(state.length).to.equal(3);
    });
  });

  describe('deletePrescription', () => {
    it('should delete a prescription in state by matching `id`', () => {
      let initialStateForTest = [
        { id: 'one', value: 1 },
        { id: 'two', value: 2 },
        { id: 'three', value: 3 },
      ];

      let prescriptionId = 'two';

      let action = actions.sync.deletePrescriptionSuccess(prescriptionId);

      let state = reducer(initialStateForTest, action);

      expect(state[1].id).to.equal('three');
      expect(state.length).to.equal(2);
    });
  });

  describe('logoutRequest', () => {
    it('should set state to empty array', () => {
      let initialStateForTest = [{ id: 'one' }];

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state).to.eql([]);
    });
  });
});

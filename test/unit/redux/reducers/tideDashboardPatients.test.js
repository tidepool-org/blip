/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { tideDashboardPatients as reducer } from '../../../../app/redux/reducers/misc';
import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('tideDashboardPatients', () => {
  describe('fetchTideDashboardPatientsSuccess', () => {
    it('should set state to patients', () => {
      let initialStateForTest = null;
      const patients = [{ 'foo': 'bar' }];

      let action = actions.sync.fetchTideDashboardPatientsSuccess(patients);

      let state = reducer(initialStateForTest, action);

      expect(state).to.eql(patients);
    });
  });

  describe('logoutRequest', () => {
    it('should set state to initial empty state', () => {
      const patients = [{ 'foo': 'bar' }];
      let initialStateForTest = patients;

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state).to.eql({});
    });
  });

  describe('clearTideDashboardPatients', () => {
    it('should set state to initial empty state', () => {
      const patients = [{ 'foo': 'bar' }];
      let initialStateForTest = patients;

      let action = actions.sync.clearTideDashboardPatients();

      let state = reducer(initialStateForTest, action);

      expect(state).to.eql({});
    });
  });

  describe('updateClinicPatientSuccess', () => {
    it('should set state to initial empty state', () => {
      const patients = { results: { 'foo': [
        { patient: {id: 'bar' } },
        { patient: { id: 'baz'} }
      ] } };

      const updatedPatient = { id: 'baz', updated: true }
      let initialStateForTest = patients;
      let action = actions.sync.updateClinicPatientSuccess('clinicId123', 'baz', updatedPatient);
      let state = reducer(initialStateForTest, action);

      expect(state).to.eql({ results: { 'foo': [
        { patient: {id: 'bar' } },
        { patient: { id: 'baz', updated: true } }
      ] } });
    });
  });

  describe('fetchPatientFromClinicSuccess', () => {
    it('should set state to initial empty state', () => {
      const patients = { results: { 'foo': [
        { patient: {id: 'bar' } },
        { patient: { id: 'baz'} }
      ] } };

      const updatedPatient = { id: 'baz', updated: true }
      let initialStateForTest = patients;
      let action = actions.sync.fetchPatientFromClinicSuccess('clinicId123', updatedPatient);
      let state = reducer(initialStateForTest, action);

      expect(state).to.eql({ results: { 'foo': [
        { patient: {id: 'bar' } },
        { patient: { id: 'baz', updated: true } }
      ] } });
    });
  });
});

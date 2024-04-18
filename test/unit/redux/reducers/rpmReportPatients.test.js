/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { rpmReportPatients as reducer } from '../../../../app/redux/reducers/misc';
import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('rpmReportPatients', () => {
  describe('fetchRpmReportPatientsSuccess', () => {
    it('should set state to patients', () => {
      let initialStateForTest = null;
      const patients = { 'foo': 'bar' };

      let action = actions.sync.fetchRpmReportPatientsSuccess(patients);

      let state = reducer(initialStateForTest, action);

      expect(state).to.eql(patients);
    });
  });

  describe('logoutRequest', () => {
    it('should set state to initial empty state', () => {
      const patients = { 'foo': 'bar' };
      let initialStateForTest = patients;

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state).to.eql({});
    });
  });

  describe('clearRpmReportPatients', () => {
    it('should set state to initial empty state', () => {
      const patients = { 'foo': 'bar' };
      let initialStateForTest = patients;

      let action = actions.sync.clearRpmReportPatients();

      let state = reducer(initialStateForTest, action);

      expect(state).to.eql({});
    });
  });
});

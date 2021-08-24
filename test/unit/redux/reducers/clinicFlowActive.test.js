/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { clinicFlowActive as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { clinicFlowActive as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('clinicFlowActive', () => {
  describe('fetchClinicianInvitesSuccess', () => {
    it('should set state to true if there are invites', () => {
      let initialStateForTest = false;
      let invites = [
        { key: 'xyz123zyx' },
        { key: 'abc987cba' },
      ];

      let action = actions.sync.fetchClinicianInvitesSuccess(invites);
      let state = reducer(initialStateForTest, action);
      expect(state).to.be.true;
    });

    it('should set state to true if there are no invites and previous state was true', () => {
      let initialStateForTest = true;
      let invites = [];
      let action = actions.sync.fetchClinicianInvitesSuccess(invites);
      let state = reducer(initialStateForTest, action);
      expect(state).to.be.true;
    });

    it('should set state to false if there are no invites and previous state was false', () => {
      let initialStateForTest = false;
      let invites = [];
      let action = actions.sync.fetchClinicianInvitesSuccess(invites);
      let state = reducer(initialStateForTest, action);
      expect(state).to.be.false;
    });
  });

  describe('getClinicsForClinicianSuccess', () => {
    it('should set state to true if there are clinics', () => {
      let initialStateForTest = false;
      const clinics = [{ id: 'clinicId123' }];
      const clinicianId = 'clinicianId123';

      let action = actions.sync.getClinicsForClinicianSuccess(clinics, clinicianId);
      let state = reducer(initialStateForTest, action);
      expect(state).to.be.true;
    });

    it('should set state to true if there are no clinics and previous state was true', () => {
      let initialStateForTest = true;
      let clinics = [];
      const clinicianId = 'clinicianId123';
      let action = actions.sync.getClinicsForClinicianSuccess(clinics, clinicianId);
      let state = reducer(initialStateForTest, action);
      expect(state).to.be.true;
    });

    it('should set state to false if there are no clinics and previous state was false', () => {
      let initialStateForTest = false;
      let clinics = [];
      const clinicianId = 'clinicianId123';
      let action = actions.sync.getClinicsForClinicianSuccess(clinics, clinicianId);
      let state = reducer(initialStateForTest, action);
      expect(state).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to false', () => {
      let initialStateForTest = true;

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.false;
    });
  });
});

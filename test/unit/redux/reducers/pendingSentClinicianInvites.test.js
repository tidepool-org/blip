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

import mutationTracker from 'object-invariant-test-helper';

import { pendingSentClinicianInvites as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { pendingSentClinicianInvites as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('pendingSentClinicianInvites', () => {
  describe('fetchClinicianInviteSuccess', () => {
    it('should add invite to state', () => {
      let initialStateForTest = {};
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let pendingSentClinicianInvite = {
        key: 'inviteKey1'
      };

      let action = actions.sync.fetchClinicianInviteSuccess(pendingSentClinicianInvite);

      let state = reducer(initialStateForTest, action);

      expect(state).to.eql({inviteKey1: pendingSentClinicianInvite});
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
    it('should update an existing invite', () => {
      let initialStateForTest = {
        inviteKey1: {
          created: 'yesterday'
        }
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let pendingSentClinicianInvite = {
        key: 'inviteKey1',
        created: 'today'
      };

      let action = actions.sync.fetchClinicianInviteSuccess(pendingSentClinicianInvite);

      let state = reducer(initialStateForTest, action);

      expect(state.inviteKey1.created).to.equal('today');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
    it('should add new invites', () => {
      let initialStateForTest = {
        inviteKey1: {
          created: 'yesterday'
        }
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let pendingSentClinicianInvite = {
        key: 'inviteKey2',
        created: 'today'
      };

      let action = actions.sync.fetchClinicianInviteSuccess(pendingSentClinicianInvite);

      let state = reducer(initialStateForTest, action);

      expect(state.inviteKey1.created).to.equal('yesterday');
      expect(state.inviteKey2.created).to.equal('today');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('resendClinicianInviteSuccess', () => {
    it('should update an existing invite', () => {
      let initialStateForTest = {
        inviteKey1: {
          created: 'yesterday'
        }
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let pendingSentClinicianInvite = {
        key: 'inviteKey1',
        created: 'today'
      };

      let action = actions.sync.resendClinicianInviteSuccess(pendingSentClinicianInvite);

      let state = reducer(initialStateForTest, action);

      expect(state.inviteKey1.created).to.equal('today');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });


  describe('deleteClinicianInviteSuccess', () => {
    it('should remove deleted invite from state', () => {
      let initialStateForTest = {
        xyz123zyx: { key: 'xyz123zyx', email: 'g@g.com' },
        abc987cba: { key: 'abc987cba', email: 'a@a.com' }
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let inviteId = 'xyz123zyx';

      let action = actions.sync.deleteClinicianInviteSuccess('clinicId',inviteId);

      let state = reducer(initialStateForTest, action);

      expect(_.keys(state).length).to.equal(_.keys(initialStateForTest).length - 1);
      expect(_.find(state, inviteId)).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set to an empty array', () => {
      let initialStateForTest = {
        xyz123zyx: { key: 'xyz123zyx', email: 'g@g.com' },
        abc987cba: { key: 'abc987cba', email: 'a@a.com' }
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state).to.eql({});
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});

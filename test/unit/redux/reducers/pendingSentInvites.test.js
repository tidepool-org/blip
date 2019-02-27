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

import { pendingSentInvites as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { pendingSentInvites as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('pendingSentInvites', () => {
  describe('fetchPendingSentInvitesSuccess', () => {
    it('should set state to an array of pending invites', () => {
      let initialStateForTest = [];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let pendingSentInvites = [
        { inviteid: 'xyz123zyx' },
        { inviteid: 'abc987cba' }
      ];

      let action = actions.sync.fetchPendingSentInvitesSuccess(pendingSentInvites);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(pendingSentInvites.length);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('sendInviteSuccess', () => {
    it('should push new invitation to state', () => {
      let initialStateForTest = [
        { inviteid: 'xyz123zyx' },
        { inviteid: 'abc987cba' }
      ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let invitation = { inviteid: 'def456fed' };

      let action = actions.sync.sendInviteSuccess(invitation);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length + 1);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('cancelSentInviteSuccess', () => {
    it('should remove invitation from state array', () => {
      let initialStateForTest = [
        { inviteid: 'xyz123zyx', email: 'g@g.com' },
        { inviteid: 'abc987cba', email: 'a@a.com' }
      ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let removedEmail = 'g@g.com';

      let action = actions.sync.cancelSentInviteSuccess(removedEmail);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length - 1);
      expect(_.find(state, {email: removedEmail})).to.be.undefined;
      expect(state[0].email).to.equal('a@a.com');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to empty array', () => {
      let initialStateForTest = [
        { inviteid: 'xyz123zyx', email: 'g@g.com' },
        { inviteid: 'abc987cba', email: 'a@a.com' }
      ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(0);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});

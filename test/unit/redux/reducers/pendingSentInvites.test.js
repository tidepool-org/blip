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

import { pendingSentInvites as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { pendingSentInvites as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('pendingSentInvites', () => {
  describe('fetchPendingSentInvitesSuccess', () => {
    it('should set state to an array of pendingSentInvites', () => {
      let initialStateForTest = [];

      let pendingSentInvites = [
        { inviteid: 30 },
        { inviteid: 50 }
      ];

      let action = actions.sync.fetchPendingSentInvitesSuccess(pendingSentInvites)

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(pendingSentInvites.length);
    });
  });

  describe('sendInviteSuccess', () => {
    it('should push new invitation to state', () => {
      let initialStateForTest = [
        { inviteid: 30 },
        { inviteid: 50 }
      ];

      let invitation = { inviteid: 500 };

      let action = actions.sync.sendInviteSuccess(invitation)

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length + 1);
    });
  });

  describe('cancelSentInviteSuccess', () => {
    it('should remove invitation from state array', () => {
      let initialStateForTest = [
        { inviteid: 30, email: 'g@g.com' },
        { inviteid: 50, email: 'a@a.com' }
      ];

      let removedEmail = 'g@g.com';

      let action = actions.sync.cancelSentInviteSuccess(removedEmail)

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length - 1);
      expect(state[0].email).to.equal('a@a.com');
    });
  });

  describe('logoutSuccess', () => {
    it('should remove invitation from state array', () => {
      let initialStateForTest = [
        { inviteid: 30, email: 'g@g.com' },
        { inviteid: 50, email: 'a@a.com' }
      ];

      let action = actions.sync.logoutSuccess()

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(0);
    });
  });
});
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

import { notification as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import * as ActionTypes from '../../../../app/redux/constants/actionTypes';

import { notification as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('notification', () => {
  const ERR = new Error('This is an error :(');

  describe('loginFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.loginFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'loggingIn',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('signupFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.signupFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'signingUp',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('confirmPasswordResetFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.confirmPasswordResetFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'confirmingPasswordReset',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('confirmSignupFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.confirmSignupFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'confirmingSignup',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('resendEmailVerificationFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.resendEmailVerificationFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'resendingEmailVerification',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('acceptTermsFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.acceptTermsFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'acceptingTerms',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('setupDataStorageFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.setupDataStorageFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'settingUpDataStorage',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('fetchServerTimeFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.fetchServerTimeFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'fetchingServerTime',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('removeMembershipInOtherCareTeamFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.removeMembershipInOtherCareTeamFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'removingMembershipInOtherCareTeam',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('requestPasswordResetFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.requestPasswordResetFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'requestingPasswordReset',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('sendInviteFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.sendInviteFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'sendingInvite',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('cancelSentInviteFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.cancelSentInviteFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'cancellingSentInvite',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('acceptReceivedInviteFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.acceptReceivedInviteFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'acceptingReceivedInvite',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('rejectReceivedInviteFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.rejectReceivedInviteFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'rejectingReceivedInvite',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('setMemberPermissionsFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.setMemberPermissionsFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'settingMemberPermissions',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('updatePatientFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.updatePatientFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'updatingPatient',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('updateUserFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.updateUserFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'updatingUser',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('fetchUserFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.fetchUserFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'fetchingUser',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('fetchPendingSentInvitesFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.fetchPendingSentInvitesFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'fetchingPendingSentInvites',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('fetchPendingReceivedInvitesFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.fetchPendingReceivedInvitesFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'fetchingPendingReceivedInvites',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('fetchPatientFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.fetchPatientFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'fetchingPatient',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('fetchPatientsFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.fetchPatientsFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'fetchingPatients',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('fetchPatientDataFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.fetchPatientDataFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'fetchingPatientData',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });

  describe('fetchMessageThreadFailure', () => {
    it('should build a notification', () => {
      let action = actions.sync.fetchMessageThreadFailure(ERR);

      let state = reducer(initialState, action);

      expect(state).to.deep.equal({
        key: 'fetchingMessageThread',
        isDismissible: true,
        link: null,
        status: null
      });
    });
  });
});

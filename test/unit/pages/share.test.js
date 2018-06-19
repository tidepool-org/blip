/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import _ from 'lodash';
var assert = chai.assert;
var expect = chai.expect;

import mutationTracker from 'object-invariant-test-helper';

import { mapStateToProps } from '../../../app/pages/share/share';

describe('PatientCareTeam', () => {
  describe('mapStateToProps', () => {
    const state = {
      allUsersMap: {
        a1b2c3: {userid: 'a1b2c3', profile: {} },
        d4e5f6: {userid: 'd4e5f6', profile: {} },
        foo: {userid: 'foo', profile: {} },
        bar: {userid: 'bar', profile: {} },
        bigdata: {userid: 'bigdata', profile: {} },
      },
      dataDonationAccounts: [
        { userid: 'bigdata'},
      ],
      currentPatientInViewId: 'a1b2c3',
      loggedInUserId: 'a1b2c3',
      membersOfTargetCareTeam: ['foo', 'bar', 'bigdata'],
      pendingSentInvites: [2,4,6,8, 'who do we appreciate'],
      permissionsOfMembersInTargetCareTeam: {
        foo: {view: {}, note: {}},
        bar: {view: {}, note: {}, upload: {}}
      },
      targetUserId: 'a1b2c3',
      working: {
        cancellingSentInvite: {inProgress: true, notification: null},
        fetchingPatient: {inProgress: false, notification: null},
        fetchingUser: {inProgress: false, notification: null},
        removingMemberFromTargetCareTeam: {inProgress: true, notification: null},
        sendingInvite: {inProgress: false, notification: null},
        settingMemberPermissions: {inProgress: false, notification: null}
      }
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({blip: state});

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should map allUsersMap.a1b2c3 to user', () => {
      expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
    });

    it('should map working.fetchingUser.inProgress to fetchingUser', () => {
      expect(result.fetchingUser).to.equal(state.working.fetchingUser.inProgress);
    });

    it('should extract the currentPatientInViewId\'s info from allUsersMap and membersOfTargetCareTeam and permissionsOfMembersInTargetCareTeam', () => {
      // note that bigdata user has been stripped, which is correct
      expect(result.patient).to.deep.equal({
        userid: 'a1b2c3',
        profile: {},
        team: [
          {userid: 'foo', profile: {}, permissions: state.permissionsOfMembersInTargetCareTeam.foo},
          {userid: 'bar', profile: {}, permissions: state.permissionsOfMembersInTargetCareTeam.bar}
        ]
      });
    });

    it('should strip team members without a profile', () => {
      const newState = _.assign({}, state, {
        allUsersMap: {
          foo: {userid: 'foo', profile: {} },
          bar: {userid: 'bar', profile: null },
          baz: {userid: 'baz', profile: false },
          bay: {userid: 'bay' },
          a1b2c3: {userid: 'a1b2c3', profile: {} },
        },
        membersOfTargetCareTeam: ['foo', 'bar', 'baz', 'bay'],
        permissionsOfMembersInTargetCareTeam: {
          foo: {view: {}, note: {}},
          bar: {view: {}, note: {}, upload: {}},
          baz: {view: {}, note: {}, upload: {}},
          bay: {view: {}, note: {}, upload: {}},
        },
      });

      const result = mapStateToProps({ blip: newState });
      expect(result.patient).to.deep.equal({
        userid: 'a1b2c3',
        profile: {},
        team: [
          {userid: 'foo', profile: {}, permissions: state.permissionsOfMembersInTargetCareTeam.foo},
        ]
      });
    });

    it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
      expect(result.fetchingPatient).to.equal(state.working.fetchingPatient.inProgress);
    });

    it('should map pendingSentInvites to pendingSentInvites', () => {
      expect(result.pendingSentInvites).to.deep.equal(state.pendingSentInvites);
    });

    it('should map working.settingMemberPermissions.inProgress to changingMemberPermissions', () => {
      expect(result.changingMemberPermissions).to.equal(state.working.settingMemberPermissions.inProgress);
    });

    it('should map working.removingMemberFromTargetCareTeam.inProgress to removingMember', () => {
      expect(result.removingMember).to.equal(state.working.removingMemberFromTargetCareTeam.inProgress);
    });

    it('should map working.sendingInvite to invitingMemberInfo', () => {
      expect(result.invitingMemberInfo).to.equal(state.working.sendingInvite);
    });

    it('should map working.cancellingSentInvite.inProgress to cancellingInvite', () => {
      expect(result.cancellingInvite).to.equal(state.working.cancellingSentInvite.inProgress);
    });
  });
});

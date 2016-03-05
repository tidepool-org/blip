/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

import React from 'react';
import TestUtils from 'react-addons-test-utils';

var assert = chai.assert;
var expect = chai.expect;

import { Patients } from '../../../app/pages/patients';
import { mapStateToProps } from '../../../app/pages/patients';

describe('Patients', () => {
  it('should be exposed as a module and be of type function', () => {
    expect(Patients).to.be.a('function');
  });

  describe('render', () => {
    it('should console.error when required props are missing', () => {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Patients />);
      expect(console.error.callCount).to.equal(2);
    });

    it('should render without problems when trackMetric is set', () => {
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        clearPatientInView: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('mapStateToProps', () => {
    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });
    describe('loggedInUser has DSA', () => {
      const state = {
        allUsersMap: {
          a1b2c3: {
            userid: 'a1b2c3'
          },
          d4e5f6: {
            userid: 'd4e5f6'
          },
          x1y2z3: {
            userid: 'x1y2z3'
          }
        },
        loggedInUserId: 'a1b2c3',
        memberInOtherCareTeams: ['d4e5f6', 'x1y2z3'],
        pendingReceivedInvites: ['g4h5i6'],
        signupConfirmed: true,
        targetUserId: 'a1b2c3',
        working: {
          fetchingPatients: {inProgress: false},
          fetchingPendingReceivedInvites: {inProgress: false},
          fetchingUser: {inProgress: false}
        }
      };

      const result = mapStateToProps({blip: state});
      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should map working.fetchingUser.inProgress to fetchingUser', () => {
        expect(result.fetchingUser).to.equal(state.working.fetchingUser.inProgress);
      });

      it('should extract the targetUserId and memberInOtherCareTeams as patients', () => {
        expect(result.patients).to.deep.equal([
          state.allUsersMap.a1b2c3,
          state.allUsersMap.d4e5f6,
          state.allUsersMap.x1y2z3
        ]);
      });

      it('should map working.fetchingPatients.inProgress to fetchingPatients', () => {
        expect(result.fetchingPatients).to.equal(state.working.fetchingPatients.inProgress);
      });

      it('should map pendingReceivedInvites to invites', () => {
        expect(result.invites).to.deep.equal(state.pendingReceivedInvites);
      });

      it('should map working.fetchingPendingReceivedInvites.inProgress to fetchingInvites', () => {
        expect(result.fetchingInvites).to.equal(state.working.fetchingPendingReceivedInvites.inProgress);
      });

      it('should map signupConfirmed to showingWelcomeTitle & showingWelcomeSetup', () => {
        expect(result.showingWelcomeTitle).to.equal(state.signupConfirmed);
        expect(result.showingWelcomeSetup).to.equal(state.signupConfirmed);
      });
    });

    describe('loggedInUser does NOT have DSA', () => {
      const state = {
        allUsersMap: {
          a1b2c3: {
            userid: 'a1b2c3'
          },
          d4e5f6: {
            userid: 'd4e5f6'
          },
          x1y2z3: {
            userid: 'x1y2z3'
          }
        },
        loggedInUserId: 'a1b2c3',
        memberInOtherCareTeams: ['d4e5f6', 'x1y2z3'],
        pendingReceivedInvites: ['g4h5i6'],
        signupConfirmed: true,
        targetUserId: null,
        working: {
          fetchingPatients: {inProgress: false},
          fetchingPendingReceivedInvites: {inProgress: false},
          fetchingUser: {inProgress: false}
        }
      };

      const result = mapStateToProps({blip: state});
      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should map working.fetchingUser.inProgress to fetchingUser', () => {
        expect(result.fetchingUser).to.equal(state.working.fetchingUser.inProgress);
      });

      it('should extract the memberInOtherCareTeams as patients', () => {
        expect(result.patients).to.deep.equal([
          state.allUsersMap.d4e5f6,
          state.allUsersMap.x1y2z3
        ]);
      });

      it('should map working.fetchingPatients.inProgress to fetchingPatients', () => {
        expect(result.fetchingPatients).to.equal(state.working.fetchingPatients.inProgress);
      });

      it('should map pendingReceivedInvites to invites', () => {
        expect(result.invites).to.deep.equal(state.pendingReceivedInvites);
      });

      it('should map working.fetchingPendingReceivedInvites.inProgress to fetchingInvites', () => {
        expect(result.fetchingInvites).to.equal(state.working.fetchingPendingReceivedInvites.inProgress);
      });

      it('should map signupConfirmed to showingWelcomeTitle & showingWelcomeSetup', () => {
        expect(result.showingWelcomeTitle).to.equal(state.signupConfirmed);
        expect(result.showingWelcomeSetup).to.equal(state.signupConfirmed);
      });
    });
  });
});
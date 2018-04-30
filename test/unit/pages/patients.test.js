/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import { browserHistory } from 'react-router';
import TestUtils from 'react-addons-test-utils';

import mutationTracker from 'object-invariant-test-helper';

var assert = chai.assert;
var expect = chai.expect;

import { Patients } from '../../../app/pages/patients';
import { mapStateToProps } from '../../../app/pages/patients';

describe('Patients', () => {
  it('should be exposed as a module and be of type function', () => {
    expect(Patients).to.be.a('function');
  });

  describe('componentWillMount', () => {
    it('should clear previously viewed patient data', () => {
      var props = {
        clearPatientData: sinon.stub(),
        currentPatientInViewId: 1234,
      };

      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);

      sinon.assert.calledOnce(props.clearPatientData);
    });

    it('should not clear previously viewed patient data if `currentPatientInViewId` prop not set', () => {
      var props = {
        clearPatientData: sinon.stub(),
      };

      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);

      sinon.assert.notCalled(props.clearPatientData);
    });

    it('should call the `clearPatientInView` prop when provided', () => {
      var props = {
        clearPatientInView: sinon.stub(),
      };

      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);

      sinon.assert.calledOnce(props.clearPatientInView);
    });
  });

  describe('componentWillReceiveProps', () => {
    it('should not redirect to patient data when justLogged query param is set and only one patient if invites present', () => {
      var props = {};
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();

      var nextProps = Object.assign({}, props, {
        invites: [1],
        loading: false,
        location: { query: {
            justLoggedIn: true
          }
        },
        loggedInUserId: 20,
        patients: [ { userid: 1 } ],
        showingWelcomeMessage: null
      });

      render.componentWillReceiveProps(nextProps);
      expect(window.location.pathname).to.not.equal('/patients/1/data');
    });

    it('should not redirect to patient data when justLogged query param is set and more than one patient available', () => {
      var props = {};
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();
      var currentPath = window.location.pathname;
      var nextProps = Object.assign({}, props, {
        loading: false,
        location: { query: {
            justLoggedIn: true
          }
        },
        loggedInUserId: 20,
        patients: [ { userid: 1 }, { userid: 2 } ],
        showingWelcomeMessage: null
      });

      render.componentWillReceiveProps(nextProps);
      expect(window.location.pathname).to.equal(currentPath);
    });

    it('should not redirect to patient data when justLogged query param is set and zero patients available', () => {
      var props = {
        showWelcomeMessage: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();
      var currentPath = window.location.pathname;
      var nextProps = Object.assign({}, props, {
          loading: false,
          location: { query: {
              justLoggedIn: true
            }
          },
          loggedInUserId: 20,
          patients: [],
          invites: [],
          showingWelcomeMessage: null
      });

      render.componentWillReceiveProps(nextProps);
      expect(window.location.pathname).to.equal(currentPath);
    });

    it('should trigger showWelcomeMessage to patient data when justLogged query param is set and zero patients and zero invites available', () => {
      var props = {
        showWelcomeMessage: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();
      var currentPath = window.location.pathname;
      var nextProps = Object.assign({}, props, {
          loading: false,
          location: { query: {
              justLoggedIn: true
            }
          },
          loggedInUserId: 20,
          patients: [],
          invites: [],
          showingWelcomeMessage: null
      });

      render.componentWillReceiveProps(nextProps);
      expect(nextProps.showWelcomeMessage.callCount).to.equal(1);
    });

    it('should not trigger showWelcomeMessage to patient data when justLogged query param is set and one patient and one invite available', () => {
      var props = {
        showWelcomeMessage: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();
      var currentPath = window.location.pathname;
      var nextProps = Object.assign({}, props, {
          loading: false,
          location: { query: {
              justLoggedIn: true
            }
          },
          loggedInUserId: 20,
          patients: [ { userId: 244 } ],
          invites: [ { userId: 222 } ],
          showingWelcomeMessage: null
      });

      render.componentWillReceiveProps(nextProps);
      expect(nextProps.showWelcomeMessage.callCount).to.equal(0);
    });

    it('should not trigger showWelcomeMessage to patient data when justLogged query param is set and zero patients but one invite available', () => {
      var props = {
        showWelcomeMessage: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();
      var currentPath = window.location.pathname;
      var nextProps = Object.assign({}, props, {
          loading: false,
          location: { query: {
              justLoggedIn: true
            }
          },
          loggedInUserId: 20,
          patients: [],
          invites: [ { userId: 222 } ],
          showingWelcomeMessage: null
      });

      render.componentWillReceiveProps(nextProps);
      expect(nextProps.showWelcomeMessage.callCount).to.equal(0);
    });

    it('should not redirect to patient data when justLogged query param is set and only one patient available and no invites, but user is a clinic', () => {
      var props = {};
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();

      var nextProps = Object.assign({}, props, {
        invites: [],
        loading: false,
        location: { query: {
            justLoggedIn: true
          }
        },
        loggedInUserId: 20,
        patients: [ { userid: 1 } ],
        showingWelcomeMessage: null,
        user: {
          roles: ['clinic']
        }
      });

      render.componentWillReceiveProps(nextProps);
      expect(window.location.pathname).to.not.equal('/patients/1/data');
    });

    // NB: this test has to go last since it affects the global window.location.pathname!
    it('should redirect to patient data when justLogged query param is set and only one patient available and no invites', () => {
      var props = {};
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();

      var nextProps = Object.assign({}, props, {
        invites: [],
        loading: false,
        location: { query: {
            justLoggedIn: true
          }
        },
        loggedInUserId: 20,
        patients: [ { userid: 1 } ],
        showingWelcomeMessage: null
      });

      render.componentWillReceiveProps(nextProps);
      expect(window.location.pathname).to.equal('/patients/1/data');
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
        membershipInOtherCareTeams: ['d4e5f6', 'x1y2z3'],
        membershipPermissionsInOtherCareTeams: {
          'd4e5f6': { view: {}},
          'x1y2z3': { view: {}, upload: {} }
        },
        pendingReceivedInvites: ['g4h5i6'],
        permissionsOfMembersInTargetCareTeam: {
          a1b2c3: {root: {}}
        },
        showingWelcomeMessage: true,
        targetUserId: 'a1b2c3',
        working: {
          fetchingPatients: {inProgress: false},
          fetchingPendingReceivedInvites: {inProgress: true},
          fetchingUser: {inProgress: false}
        }
      };

      const tracked = mutationTracker.trackObj(state);
      const result = mapStateToProps({blip: state});

      it('should not mutate the state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map loggedInUserId to loggedInUserId', () => {
        expect(result.loggedInUserId).to.equal(state.loggedInUserId);
      });

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should map working.fetchingUser.inProgress to fetchingUser', () => {
        expect(result.fetchingUser).to.equal(state.working.fetchingUser.inProgress);
      });

      it('should extract the targetUserId and membershipInOtherCareTeams as patients', () => {
        var u1 = Object.assign({},
          state.allUsersMap.d4e5f6,
          { permissions: state.membershipPermissionsInOtherCareTeams.d4e5f6 }
        );

        var u2 = Object.assign({},
          state.allUsersMap.x1y2z3,
          { permissions: state.membershipPermissionsInOtherCareTeams.x1y2z3 }
        );

        expect(result.patients).to.deep.equal([
          Object.assign({}, state.allUsersMap.a1b2c3, { permissions: { root: {} } }),
          u1,
          u2
        ]);
      });

      it('should map pendingReceivedInvites to invites', () => {
        expect(result.pendingReceivedInvites)
      });

      it('should map fetchingPendingReceivedInvites + fetchingUser + fetchingPatients inProgress fields to loading', () => {
        expect(result.loading).to.equal(true);
      });

      it('should map showingWelcomeMessage to showingWelcomeMessage', () => {
        expect(result.showingWelcomeMessage).to.equal(state.showingWelcomeMessage);
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
        membershipInOtherCareTeams: ['d4e5f6', 'x1y2z3'],
        pendingReceivedInvites: ['g4h5i6'],
        showingWelcomeMessage: true,
        targetUserId: null,
        working: {
          fetchingPatients: {inProgress: false},
          fetchingPendingReceivedInvites: {inProgress: false},
          fetchingUser: {inProgress: false}
        }
      };
      const tracked = mutationTracker.trackObj(state);
      const result = mapStateToProps({blip: state});

      it('should not mutate the state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map loggedInUserId to loggedInUserId', () => {
        expect(result.loggedInUserId).to.equal(state.loggedInUserId);
      });

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should map working.fetchingUser.inProgress to fetchingUser', () => {
        expect(result.fetchingUser).to.equal(state.working.fetchingUser.inProgress);
      });

      it('should extract the membershipInOtherCareTeams as patients', () => {
        expect(result.patients).to.deep.equal([
          state.allUsersMap.d4e5f6,
          state.allUsersMap.x1y2z3
        ]);
      });

      it('should map pendingReceivedInvites to invites', () => {
        expect(result.pendingReceivedInvites)
      });

      it('should map fetchingPendingReceivedInvites + fetchingUser + fetchingPatients inProgress fields to loading', () => {
        expect(result.loading).to.equal(false);
      });

      it('should map showingWelcomeMessage to showingWelcomeMessage', () => {
        expect(result.showingWelcomeMessage).to.equal(state.showingWelcomeMessage);
      });
    });
  });
});

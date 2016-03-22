/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

import React from 'react';
import { browserHistory } from 'react-router';
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
      var props = {
        user: {},
        patients: [],
        invites: [],
        loading: false,
        trackMetric: sinon.stub(),
        onAcceptInvitation: sinon.stub(),
        onDismissInvitation: sinon.stub(),
        onRemovePatient: sinon.stub(),
        clearPatientInView: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(<Patients {...props}/>);
      expect(console.error.callCount).to.equal(0);
    });

    it('should console.error when required props are missing', () => {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Patients />);
      expect(console.error.callCount).to.equal(9);
    });
  });

  describe('componentWillReceiveProps', () => {
    it('should redirect to patient data when justLogged query param is set and only one patient available', () => {
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        clearPatientInView: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
      
      var nextProps = Object.assign({}, props, {
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

    it('should not redirect to patient data when justLogged query param is set and more than one patient available', () => {
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        clearPatientInView: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
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
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        clearPatientInView: sinon.stub(),
        showWelcomeMessage: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
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
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        clearPatientInView: sinon.stub(),
        showWelcomeMessage: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
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
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        clearPatientInView: sinon.stub(),
        showWelcomeMessage: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
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
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        clearPatientInView: sinon.stub(),
        showWelcomeMessage: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
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
        membershipPermissionsInOtherCareTeams: {
          'd4e5f6': { view: {}},
          'x1y2z3': { view: {}, upload: {} }
        },
        pendingReceivedInvites: ['g4h5i6'],
        showingWelcomeMessage: true,
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
        var u1 = Object.assign({},
          state.allUsersMap.d4e5f6,
          { permissions: state.membershipPermissionsInOtherCareTeams.d4e5f6 }
        );

        var u2 = Object.assign({},
          state.allUsersMap.x1y2z3,
          { permissions: state.membershipPermissionsInOtherCareTeams.x1y2z3 }
        );

        expect(result.patients).to.deep.equal([
          state.allUsersMap.a1b2c3,
          u1,
          u2
        ]);
      });

      it('should map fetchingPendingReceivedInvites + fetchingUser + fetchingPatients inProgress fields to loading', () => {
        expect(result.loading).to.equal(
          state.working.fetchingPendingReceivedInvites.inProgress ||
          state.working.fetchingPatients.inProgress ||
          state.working.fetchingUser.inProgress
        );
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
        memberInOtherCareTeams: ['d4e5f6', 'x1y2z3'],
        pendingReceivedInvites: ['g4h5i6'],
        showingWelcomeMessage: true,
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

      it('should map fetchingPendingReceivedInvites + fetchingUser + fetchingPatients inProgress fields to loading', () => {
        expect(result.loading).to.equal(
          state.working.fetchingPendingReceivedInvites.inProgress ||
          state.working.fetchingPatients.inProgress ||
          state.working.fetchingUser.inProgress
        );
      });

      it('should map showingWelcomeMessage to showingWelcomeMessage', () => {
        expect(result.showingWelcomeMessage).to.equal(state.showingWelcomeMessage);
      });
    });
  });
});
/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */


import React, { createElement } from 'react';

import mutationTracker from 'object-invariant-test-helper';

var assert = chai.assert;
var expect = chai.expect;

import { Patients } from '../../../app/pages/patients';
import { mapStateToProps, getFetchers } from '../../../app/pages/patients';

const PatientsClass = Patients.WrappedComponent || Patients;

const createPatientsInstance = (overrides = {}) => {
  const props = {
    clearPatientInView: sinon.stub(),
    currentPatientInViewId: null,
    dataWorkerRemoveDataRequest: sinon.stub(),
    fetchers: [],
    fetchingUser: false,
    fetchingPendingReceivedInvites: { inProgress: false, completed: null },
    fetchingAssociatedAccounts: { inProgress: false, completed: null },
    invites: [],
    loading: false,
    location: { query: {} },
    loggedInUserId: '20',
    onAcceptInvitation: sinon.stub(),
    onDismissInvitation: sinon.stub(),
    onHideWelcomeSetup: sinon.stub(),
    onRemovePatient: sinon.stub(),
    patients: [],
    selectedClinicId: null,
    selectClinic: sinon.stub(),
    showWelcomeMessage: sinon.stub(),
    showingWelcomeMessage: null,
    trackMetric: sinon.stub(),
    uploadUrl: '/upload',
    user: { userid: '20' },
    history: { push: sinon.stub() },
    t: str => str,
    ...overrides,
  };

  const instance = new PatientsClass(props);
  instance.props = props;
  instance.setState = (nextState, callback) => {
    const resolved = typeof nextState === 'function'
      ? nextState(instance.state, instance.props)
      : nextState;
    instance.state = { ...instance.state, ...resolved };
    if (typeof callback === 'function') {
      callback.call(instance);
    }
  };

  return { instance, props };
};

describe('Patients', () => {
  it('should be exposed as a module and be of type function', () => {
    expect(Patients).to.be.a('function');
  });

  let props;
  let instance;
  beforeEach(() => {
    ({ instance, props } = createPatientsInstance());
    instance.UNSAFE_componentWillMount();
  });

  afterEach(() => {
    props.dataWorkerRemoveDataRequest.reset();
    props.clearPatientInView.reset();
  });

  describe('componentWillMount', () => {
    it('should clear previously viewed patient data', () => {
      sinon.assert.calledOnce(props.dataWorkerRemoveDataRequest);
    });

    it('should call the `clearPatientInView` prop when provided', () => {
      sinon.assert.calledOnce(props.clearPatientInView);
    });
  });

  describe('componentWillReceiveProps', () => {
    it('should not redirect to patient data when justLogged query param is set and only one patient if invites present', () => {
      const { instance } = createPatientsInstance();

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

      instance.UNSAFE_componentWillReceiveProps(nextProps);
      expect(window.location.pathname).to.not.equal('/patients/1/data');
    });

    it('should not redirect to patient data when justLogged query param is set and more than one patient available', () => {
      const { instance } = createPatientsInstance();
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

      instance.UNSAFE_componentWillReceiveProps(nextProps);
      expect(window.location.pathname).to.equal(currentPath);
    });

    it('should not redirect to patient data when justLogged query param is set and zero patients available', () => {
      const { instance, props } = createPatientsInstance({
        showWelcomeMessage: sinon.stub(),
      });
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

      instance.UNSAFE_componentWillReceiveProps(nextProps);
      expect(window.location.pathname).to.equal(currentPath);
    });

    it('should trigger showWelcomeMessage to patient data when justLogged query param is set and zero patients and zero invites available', () => {
      const { instance, props } = createPatientsInstance({
        showWelcomeMessage: sinon.stub(),
      });
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

      instance.UNSAFE_componentWillReceiveProps(nextProps);
      expect(nextProps.showWelcomeMessage.callCount).to.equal(1);
    });

    it('should not trigger showWelcomeMessage to patient data when justLogged query param is set and one patient and one invite available', () => {
      const { instance, props } = createPatientsInstance({
        showWelcomeMessage: sinon.stub(),
      });
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

      instance.UNSAFE_componentWillReceiveProps(nextProps);
      expect(nextProps.showWelcomeMessage.callCount).to.equal(0);
    });

    it('should not trigger showWelcomeMessage to patient data when justLogged query param is set and zero patients but one invite available', () => {
      const { instance, props } = createPatientsInstance({
        showWelcomeMessage: sinon.stub(),
      });
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

      instance.UNSAFE_componentWillReceiveProps(nextProps);
      expect(nextProps.showWelcomeMessage.callCount).to.equal(0);
    });

    it('should not redirect to patient data when justLogged query param is set and only one patient available and no invites, but user is a clinic', () => {
      const { instance } = createPatientsInstance();

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

      instance.UNSAFE_componentWillReceiveProps(nextProps);
      expect(window.location.pathname).to.not.equal('/patients/1/data');
    });

    it('should redirect to patient data when justLogged query param is set and only one patient available and no invites', () => {
      const { instance, props } = createPatientsInstance({
        history: {
          push: sinon.stub()
        },
      });

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

      instance.UNSAFE_componentWillReceiveProps(nextProps);
      sinon.assert.calledWith(props.history.push, '/patients/1/data');
    });
  });

  describe('getFetchers', () => {
    const stateProps = {
      fetchingPendingReceivedInvites: {
        inProgress: false,
        completed: null,
      },
      fetchingAssociatedAccounts: {
        inProgress: false,
        completed: null,
      },
    };

    const dispatchProps = {
      fetchPendingReceivedInvites: sinon.stub().returns('fetchPendingReceivedInvites'),
      fetchAssociatedAccounts: sinon.stub().returns('fetchAssociatedAccounts'),
    };

    const api = {};

    it('should return an array containing the pending invites and associated accounts fetchers from dispatchProps', () => {
      const result = getFetchers(dispatchProps, stateProps, api);
      expect(result[0]).to.be.a('function');
      expect(result[0]()).to.equal('fetchPendingReceivedInvites');
      expect(result[1]).to.be.a('function');
      expect(result[1]()).to.equal('fetchAssociatedAccounts');
    });

    it('should only add the associated accounts and pending invites fetchers if fetches are not already in progress or completed', () => {
      const standardResult = getFetchers(dispatchProps, stateProps, api);
      expect(standardResult.length).to.equal(2);

      const inProgressResult = getFetchers(dispatchProps, {
        fetchingPendingReceivedInvites: {
          inProgress: true,
          completed: null,
        },
        fetchingAssociatedAccounts: {
          inProgress: true,
          completed: null,
        },
      }, api);

      expect(inProgressResult.length).to.equal(0);

      const completedResult = getFetchers(dispatchProps, {
        user: { userid: '12345' },
        fetchingPendingReceivedInvites: {
          inProgress: false,
          completed: true,
        },
        fetchingAssociatedAccounts: {
          inProgress: false,
          completed: true,
        },
      }, api);
      expect(completedResult.length).to.equal(0);
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
          fetchingAssociatedAccounts: {inProgress: false},
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
        expect(result.invites).to.equal(state.pendingReceivedInvites);
      });

      it('should map fetchingPendingReceivedInvites + fetchingUser + fetchingAssociatedAccounts inProgress fields to loading', () => {
        expect(result.loading).to.equal(true);
      });

      it('should map showingWelcomeMessage to showingWelcomeMessage', () => {
        expect(result.showingWelcomeMessage).to.equal(state.showingWelcomeMessage);
      });

      it('should map working.fetchingPendingReceivedInvites to fetchingPendingReceivedInvites', () => {
        expect(result.fetchingPendingReceivedInvites).to.deep.equal(state.working.fetchingPendingReceivedInvites)
      });

      it('should map working.fetchingAssociatedAccounts to fetchingAssociatedAccounts', () => {
        expect(result.fetchingAssociatedAccounts).to.deep.equal(state.working.fetchingAssociatedAccounts)
      });

      it('should map the membershipInOtherCareTeams to `patients`', () => {
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
          clinics: {
            clinicId123: {
              id: 'clinicId123',
              patients: {
                f4d3s2: {
                  id: 'f4d3s2',
                  email: 'f4d3s2@email.com',
                  fullName: 'Patient One',
                  birthDate: 'today',
                  permissions: { foo: 'bar' },
                },
                j1k2l3: {
                  id: 'j1k2l3',
                  email: 'j1k2l3@email.com',
                  fullName: 'Patient Two',
                  birthDate: 'tomorrow',
                  permissions: { foo: 'baz' },
                },
              },
            },
          },
          loggedInUserId: 'a1b2c3',
          membershipInOtherCareTeams: ['d4e5f6', 'x1y2z3'],
          pendingReceivedInvites: ['g4h5i6'],
          selectedClinicId: null,
          showingWelcomeMessage: true,
          targetUserId: null,
          working: {
            fetchingAssociatedAccounts: {inProgress: false},
            fetchingPendingReceivedInvites: {inProgress: false},
            fetchingUser: {inProgress: false}
          }
        };
        const tracked = mutationTracker.trackObj(state);
        const result = mapStateToProps({blip: state});

        expect(result.patients).to.deep.equal([
          {
            userid: 'd4e5f6',
          },
          {
            userid: 'x1y2z3',
          },
        ]);
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
          fetchingAssociatedAccounts: {inProgress: false},
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
        expect(result.invites).to.equal(state.pendingReceivedInvites);
      });

      it('should map fetchingPendingReceivedInvites + fetchingUser + fetchingAssociatedAccounts inProgress fields to loading', () => {
        expect(result.loading).to.equal(false);
      });

      it('should map showingWelcomeMessage to showingWelcomeMessage', () => {
        expect(result.showingWelcomeMessage).to.equal(state.showingWelcomeMessage);
      });

      it('should map working.fetchingPendingReceivedInvites to fetchingPendingReceivedInvites', () => {
        expect(result.fetchingPendingReceivedInvites).to.deep.equal(state.working.fetchingPendingReceivedInvites)
      });

      it('should map working.fetchingAssociatedAccounts to fetchingAssociatedAccounts', () => {
        expect(result.fetchingAssociatedAccounts).to.deep.equal(state.working.fetchingAssociatedAccounts)
      });
    });
  });
});

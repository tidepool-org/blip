/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global context */
/* global beforeEach */
/* global afterEach */
/* global before */

var React = require('react');
var _ = require('lodash');

import { mount, shallow } from 'enzyme';
import mutationTracker from 'object-invariant-test-helper';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';

import {
  mapStateToProps,
  getFetchers,
} from '../../../app/pages/app/app.js';
import initialState from '../../../app/redux/reducers/initialState';
import LDClientMock from '../../fixtures/LDClientMock';

import * as ErrorMessages from '../../../app/redux/constants/errorMessages';
import { ToastProvider } from '../../../app/providers/ToastProvider.js';
import { AppBannerProvider } from '../../../app/providers/AppBanner/AppBannerProvider.js';

var AppWrapper = require('../../../app/pages/app/app.js');
var App = require('../../../app/pages/app/app.js').AppComponent;
var api = require('../../../app/core/api');
var personUtils = require('../../../app/core/personutils');

var assert = chai.assert;
var expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('App', () => {
  const defaultLDContext = {
    kind: 'multi',
    user: { key: 'anon' },
    clinic: { key: 'none' },
  };

  api.log = sinon.stub();

  var baseProps = {
    context: {
      DEBUG: false,
      api: {},
      config: {},
      log: sinon.stub(),
      personUtils: personUtils,
      trackMetric: sinon.stub(),
    },
    ldClient: new LDClientMock(defaultLDContext),
  };

  const defaultWorkingState = {
    inProgress: false,
    completed: null,
    notification: null,
  };

  const defaultState = {
    blip: {
      authorizedDataSource: null,
      working: {
        fetchingDataSources: defaultWorkingState,
      },
      allUsersMap: {},
      clinics: {},
      loggedInUserId: 'patient123',
      membersOfTargetCareTeam: {},
      pendingSentInvites: {},
      permissionsOfMembersInTargetCareTeam: {},
      consentRecords: {},
      data: {}
    },
  };

  const store = mockStore(defaultState);

  const providerWrapper = store => props => {
    const { children } = props;

    return (
      <Provider store={store}>
        <ToastProvider>
          <BrowserRouter>
            <AppBannerProvider>
              {children}
            </AppBannerProvider>
          </BrowserRouter>
        </ToastProvider>
      </Provider>
    );
  };

  describe('constructor', () => {
    var props = _.assign({}, baseProps, {
      authenticated: false,
      children: (<React.Fragment></React.Fragment>),
      fetchers: [],
      fetchingPatient: false,
      fetchingUser: {
        inProgress: false,
        completed: null,
      },
      fetchingDataSources: {
        inProgress: false,
        completed: null,
      },
      location: '/foo',
      loggingOut: false,
      onAcceptTerms: sinon.stub(),
      onCloseNotification: sinon.stub(),
      onLogout: sinon.stub()
    });

    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<App {...props} />);
    });
  });

  describe('render', () => {
    it('should render without problems or warnings when required props provided', () => {
      var props = _.assign({}, baseProps, {
        authenticated: false,
        children: (<React.Fragment></React.Fragment>),
        fetchers: [],
        fetchingPatient: false,
        fetchingUser: {
          inProgress: false,
          completed: null,
        },
        fetchingDataSources: {
          inProgress: false,
          completed: null,
        },
        location: '/foo',
        loggingOut: false,
        onAcceptTerms: sinon.stub(),
        onCloseNotification: sinon.stub(),
        onLogout: sinon.stub()
      });

      var elem = mount(<App {...props} />, { wrappingComponent: providerWrapper(store) });
      expect(elem).to.be.ok;
      var app = elem.find('.app');
      expect(app).to.be.ok;
    });

    it('should console.error when required props not provided', () => {
      console.error = sinon.stub();

      var elem = mount(<App {...baseProps} />, { wrappingComponent: providerWrapper(store) });
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(11);
      var app = elem.find('.app');
      expect(app).to.be.ok;
    });

    it('should render footer', () => {
      var elem = mount(<App {...baseProps} />, { wrappingComponent: providerWrapper(store) });
      var footer = elem.find('.footer');
      expect(footer).to.be.ok;
    });

    it('should not render a version element when version not set in config', () => {
      var props = _.clone(baseProps);
      props.context.config = { VERSION : null };
      var elem = mount(<App {...props} />, { wrappingComponent: providerWrapper(store) });
      var versionElems = elem.find('.Navbar-version');
      expect(versionElems.length).to.equal(0);
    });

    it('should render version and hostname when version present in config', () => {
      var props = _.clone(baseProps);
      props.context.config = { VERSION : 1.4 };
      var elem = mount(<App {...props} />, { wrappingComponent: providerWrapper(store) });
      var versionElems = elem.find('.Version');
      expect(versionElems.length).to.equal(1);
      expect(versionElems.text()).to.equal('v1.4-localhost');
    });

    it('should include api enviroment in version when available', () => {
      var props = _.clone(baseProps);
      props.context.config = { VERSION : 1.4, API_HOST: 'qa2.development.tidepool.org' };
      var elem = mount(<App {...props} />, { wrappingComponent: providerWrapper(store) });
      var versionElems = elem.find('.Version');
      expect(versionElems.length).to.equal(1);
      expect(versionElems.text()).to.equal('v1.4-localhost-qa2');
    });

    it('should not include the hostname in version if it matches api environment', () => {
      var props = _.clone(baseProps);
      props.context.config = { VERSION : 1.4, API_HOST: 'localhost.tidepool.org' };
      var elem = mount(<App {...props} />, { wrappingComponent: providerWrapper(store) });
      var versionElems = elem.find('.Version');
      expect(versionElems.length).to.equal(1);
      expect(versionElems.text()).to.equal('v1.4-localhost');
    });

    it('should not include hostname or api enviroment in version for production environment', () => {
      var props = _.clone(baseProps);
      props.context.config = { VERSION : 1.4, API_HOST: 'app.tidepool.org' };
      var elem = mount(<App {...props} />, { wrappingComponent: providerWrapper(store) });
      var versionElems = elem.find('.Version');
      expect(versionElems.length).to.equal(1);
      expect(versionElems.text()).to.equal('v1.4');
    });
  });

  describe('componentWillReceiveProps', () => {
    let props = _.assign({}, baseProps, {
      currentPatientInViewId: 'patient123',
      context: {
        log: sinon.stub(),
        trackMetric: sinon.stub(),
        config: { VERSION: 1 },
      },
    });

    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<App {...props} />);
    });

    afterEach(() => {
      props.context.trackMetric.reset();
    });

    context('LaunchDarkly context', () => {
      afterEach(() => {
        AppWrapper.__ResetDependency__('ldContext');
      });

      it('should update the LaunchDarkly client context when the user context changes', () => {
        let updatedLDContext= {
          ...defaultLDContext,
          user: { key: 'patient123' },
        };;

        AppWrapper.__Rewire__('ldContext', updatedLDContext);

        const ldClient = new LDClientMock(defaultLDContext);
        ldClient.identify = sinon.stub();

        wrapper.setProps({
          ldClient,
        });

        sinon.assert.calledWith(ldClient.identify, updatedLDContext);
      });

      it('should update the LaunchDarkly client context when the clinic context changes', () => {
        let updatedLDContext= {
          ...defaultLDContext,
          clinic: { key: 'clinic123' },
        };;

        AppWrapper.__Rewire__('ldContext', updatedLDContext);

        const ldClient = new LDClientMock(defaultLDContext);
        ldClient.identify = sinon.stub();

        wrapper.setProps({
          ldClient,
        });

        sinon.assert.calledWith(ldClient.identify, updatedLDContext);
      });
    });
  });

  describe('showNavPatientHeader', () => {
    it('should return true when page is /patients/a1b2c3/data', () => {
      var props = _.assign({}, baseProps, { location: '/patients/a1b2c3' });
      var elem = mount(<App {...props} />, { wrappingComponent: providerWrapper(store) });
      expect(elem).to.be.ok;
      expect(elem.instance().showNavPatientHeader()).to.be.true;
    });

    it('should return false when page is /patients', () => {
      var elem = mount(<App {...baseProps} />, { wrappingComponent: providerWrapper(store) });
      expect(elem).to.be.ok;

      elem.setState({page: '/patients'});
      expect(elem.instance().showNavPatientHeader()).to.be.false;
    });

    it('should return false when page is /patients/new', () => {
      var elem = mount(<App {...baseProps} />, { wrappingComponent: providerWrapper(store) });
      expect(elem).to.be.ok;

      elem.setState({page: '/patients/new'});
      expect(elem.instance().showNavPatientHeader()).to.be.false;
    });

    it('should return false when page is /patients/new/dataDonation', () => {
      var elem = mount(<App {...baseProps} />, { wrappingComponent: providerWrapper(store) });
      expect(elem).to.be.ok;

      elem.setState({page: '/patients/new/dataDonation'});
      expect(elem.instance().showNavPatientHeader()).to.be.false;
    });

    it('should return false when page is /profile', () => {
      var elem = mount(<App {...baseProps} />, { wrappingComponent: providerWrapper(store) });
      expect(elem).to.be.ok;

      elem.setState({page: '/profile'});
      expect(elem.instance().showNavPatientHeader()).to.be.false;
    });

    it('should return false when page is /foo', () => {
      var elem = mount(<App {...baseProps} />, { wrappingComponent: providerWrapper(store) });
      expect(elem).to.be.ok;

      elem.setState({page: '/foo'});
      expect(elem.instance().showNavPatientHeader()).to.be.false;
    });
  });

  describe('mapStateToProps', () => {
    let tracked;

    beforeEach(() => {
      tracked = mutationTracker.trackObj(initialState);
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    describe('initialState [not logged in]', () => {
      const result = mapStateToProps({blip: initialState});

      it('should not mutate state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map isLoggedIn to authenticated', () => {
        expect(result.authenticated).to.equal(initialState.isLoggedIn);
      });

      it('should map working.fetchingUser to fetchingUser', () => {
        expect(result.fetchingUser).to.eql(initialState.working.fetchingUser);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.equal(initialState.working.fetchingPatient.inProgress);
      });

      it('should map working.loggingOut.inProgress to loggingOut', () => {
        expect(result.loggingOut).to.equal(initialState.working.loggingOut.inProgress);
      });

      it('should return null for termsAccepted', () => {
        expect(result.termsAccepted).to.be.null;
      });

      it('should return null for user', () => {
        expect(result.user).to.be.null;
      });

      it('should return null for patient', () => {
        expect(result.patient).to.be.null;
      });

      it('should return null for permsOfLoggedInUser', () => {
        expect(result.permsOfLoggedInUser).to.be.null;
      });
    });

    describe('logged-in state', () => {
      // this is the absolute minimum state that the mapStateToProps function needs
      const loggedIn = {
        allUsersMap: {
          a1b2c3: {
            termsAccepted: 'today'
          },
          d4e5f6: {}
        },
        currentPatientInViewId: 'd4e5f6',
        loggedIn: true,
        loggedInUserId: 'a1b2c3',
        notification: {
          key: 'fetchingPatient',
          link: {
            to: '/patients/foo',
            text: 'Sorry!'
          },
          status: 405
        },
        permissionsOfMembersInTargetCareTeam: {
          a1b2c3: {
            view: {},
          },
        },
        datasources: [],
        working: {
          fetchingUser: {inProgress: false},
          fetchingPendingSentInvites: {inProgress: false},
          fetchingPatient: {inProgress: false, notification: {type: 'error'}},
          loggingOut: {inProgress: false},
          resendingEmailVerification: {inProgress: false},
          fetchingInfo: {inProgress: false},
        },
        resentEmailVerification: false,
        selectedClinicId: null,
        clinicFlowActive: true,
        clinics: {
          clinic123: {
            id: 'clinic123',
            patients: {
              d4e5f6: {
                permissions: { view: {}, upload: {} },
              },
            },
          },
        },
      };
      const result = mapStateToProps({blip: loggedIn});

      it('should not mutate state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map isLoggedIn to authenticated', () => {
        expect(result.authenticated).to.equal(loggedIn.isLoggedIn);
      });

      it('should map clinicFlowActive to clinicFlowActive', () => {
        expect(result.clinicFlowActive).to.equal(loggedIn.clinicFlowActive);
      });

      it('should map clinics to clinics', () => {
        expect(result.clinics).to.equal(loggedIn.clinics);
      });

      it('should map selectedClinicId to selectedClinicId', () => {
        expect(result.selectedClinicId).to.equal(loggedIn.selectedClinicId);
      });

      it('should map working.fetchingUser to fetchingUser', () => {
        expect(result.fetchingUser).to.eql(loggedIn.working.fetchingUser);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.equal(loggedIn.working.fetchingPatient.inProgress);
      });

      it('should map working.loggingOut.inProgress to loggingOut', () => {
        expect(result.loggingOut).to.equal(loggedIn.working.loggingOut.inProgress);
      });

      it('[with link] should map notification to a notification for display', () => {
        expect(result.notification.body.message).to.equal(ErrorMessages.ERR_GENERIC);
        expect(result.notification.status).to.equal(loggedIn.notification.status);
        expect(result.notification.type).to.equal('error');
        expect(result.notification.link).to.deep.equal(loggedIn.notification.link);
      });

      // TODO: test the various cases in the switch based on status (401, etc.)

      it('should return the logged-in user\'s TOS acceptance as termsAccepted', () => {
        expect(result.termsAccepted).to.equal(loggedIn.allUsersMap.a1b2c3.termsAccepted);
      });

      it('should return the logged-in user as user', () => {
        expect(result.user).to.equal(loggedIn.allUsersMap.a1b2c3);
      });

      it('should return the current patient in view as patient and empty permissions', () => {
        expect(result.patient).to.deep.equal(Object.assign({}, loggedIn.allUsersMap.d4e5f6, { permissions: {} }));
      });

      it('should return empty permsOfLoggedInUser if user does not have authorization', () => {
        expect(result.permsOfLoggedInUser).to.be.empty;
      });

      context('Care team member with upload permissions', () => {
        const careTeamMemberUpload = {
          allUsersMap: {
            a1b2c3: {
              termsAccepted: 'today'
            },
            d4e5f6: {}
          },
          currentPatientInViewId: 'd4e5f6',
          loggedIn: true,
          loggedInUserId: 'a1b2c3',
          notification: {
            key: 'fetchingPatient',
            link: {
              to: '/patients/foo',
              text: 'Sorry!'
            },
            status: 405
          },
          permissionsOfMembersInTargetCareTeam: {},
          membershipPermissionsInOtherCareTeams: {
            d4e5f6: {
              view: {},
              note: {},
              upload: {},
            }
          },
          datasources: [],
          working: {
            fetchingUser: {inProgress: false},
            fetchingPendingSentInvites: {inProgress: false},
            fetchingPatient: {inProgress: false, notification: {type: 'error'}},
            loggingOut: {inProgress: false},
            resendingEmailVerification: {inProgress: false},
          }
        };
        const careTeamMemberUploadResult = mapStateToProps({blip: careTeamMemberUpload});

        it('should return correct permsOfLoggedInUser permissions', () => {
          expect(careTeamMemberUploadResult.permsOfLoggedInUser).to.equal(careTeamMemberUpload.membershipPermissionsInOtherCareTeams.d4e5f6);
        });
      });

      context('Clinic team member with upload permissions', () => {
        const clinicTeamMemberUpload = {
          allUsersMap: {
            a1b2c3: {
              termsAccepted: 'today'
            },
            d4e5f6: {},
          },
          currentPatientInViewId: 'd4e5f6',
          loggedIn: true,
          loggedInUserId: 'a1b2c3',
          notification: {
            key: 'fetchingPatient',
            link: {
              to: '/patients/foo',
              text: 'Sorry!'
            },
            status: 405
          },
          permissionsOfMembersInTargetCareTeam: {},
          membershipPermissionsInOtherCareTeams: {
            d4e5f6: {
              view: {},
            }
          },
          datasources: [],
          working: {
            fetchingUser: {inProgress: false},
            fetchingPendingSentInvites: {inProgress: false},
            fetchingPatient: {inProgress: false, notification: {type: 'error'}},
            loggingOut: {inProgress: false},
            resendingEmailVerification: {inProgress: false},
          },
          selectedClinicId: 'clinic123',
          clinicFlowActive: true,
          clinics: {
            clinic123: {
              id: 'clinic123',
              patients: {
                d4e5f6: {
                  permissions: { view: {}, upload: {} },
                },
              },
            },
          },
        };

        it('should return correct permsOfLoggedInUser permissions when viewing in clinic context', () => {
          const clinicTeamMemberUploadResult = mapStateToProps({blip: clinicTeamMemberUpload});
          expect(clinicTeamMemberUploadResult.permsOfLoggedInUser).to.eql({ view: {}, upload: {} });
        });

        it('should return correct permsOfLoggedInUser permissions when viewing in legacy clinician account context', () => {
          const clinicTeamMemberUploadResult = mapStateToProps({ blip: { ...clinicTeamMemberUpload, selectedClinicId: null } });
          expect(clinicTeamMemberUploadResult.permsOfLoggedInUser).to.eql({ view: {} });
        });
      });

      context('Care team member without upload permissions', () => {
        const careTeamMemberNoUpload = {
          allUsersMap: {
            a1b2c3: {
              termsAccepted: 'today'
            },
            d4e5f6: {}
          },
          currentPatientInViewId: 'd4e5f6',
          loggedIn: true,
          loggedInUserId: 'a1b2c3',
          notification: {
            key: 'fetchingPatient',
            link: {
              to: '/patients/foo',
              text: 'Sorry!'
            },
            status: 405
          },
          permissionsOfMembersInTargetCareTeam: {},
          membershipPermissionsInOtherCareTeams: {
            d4e5f6: {
              view: {},
              note: {},
            }
          },
          datasources: [],
          working: {
            fetchingUser: {inProgress: false},
            fetchingPendingSentInvites: {inProgress: false},
            fetchingPatient: {inProgress: false, notification: {type: 'error'}},
            loggingOut: {inProgress: false},
            resendingEmailVerification: {inProgress: false},
          }
        };
        const careTeamMemberNoUploadResult = mapStateToProps({blip: careTeamMemberNoUpload});

        it('should return correct permsOfLoggedInUser permissions', () => {
          expect(careTeamMemberNoUploadResult.permsOfLoggedInUser).to.equal(careTeamMemberNoUpload.membershipPermissionsInOtherCareTeams.d4e5f6);
        });
      });

      describe('getFetchers', () => {
        const stateProps = {
          authenticated: true,
          fetchingUser: {
            inProgress: false,
            completed: null,
          },
          fetchingDataSources: {
            inProgress: false,
            completed: null,
          },
          fetchingInfo: {
            inProgress: false,
            completed: null,
          },
        };

        const dispatchProps = {
          fetchUser: sinon.stub().returns('fetchUser'),
          fetchDataSources: sinon.stub().returns('fetchDataSources'),
          fetchInfo: sinon.stub().returns('fetchInfo'),
        };

        const api = {};

        it('should return an array containing the user fetcher from dispatchProps', () => {
          const result = getFetchers(stateProps, dispatchProps, api);
          expect(result[0]).to.be.a('function');
          expect(result[0]()).to.equal('fetchUser');
          expect(result[1]).to.be.a('function');
          expect(result[1]()).to.equal('fetchDataSources');
          expect(result[2]).to.be.a('function');
          expect(result[2]()).to.equal('fetchInfo');
        });

        it('should only add the user and data source fetchers if fetches are not already in progress or completed', () => {
          const standardResult = getFetchers(stateProps, dispatchProps, api);
          expect(standardResult.length).to.equal(3);

          const inProgressResult = getFetchers({
            authenticated: true,
            fetchingUser: {
              inProgress: true,
              completed: null,
            },
            fetchingDataSources: {
              inProgress: true,
              completed: null,
            },
            fetchingInfo: {
              inProgress: true,
              completed: null,
            }
          }, dispatchProps, api);

          expect(inProgressResult.length).to.equal(0);

          const completedResult = getFetchers({
            authenticated: true,
            fetchingUser: {
              inProgress: false,
              completed: true,
            },
            fetchingDataSources: {
              inProgress: false,
              completed: true,
            },
            fetchingInfo: {
              inProgress: false,
              completed: true,
            }
          }, dispatchProps, api);
          expect(completedResult.length).to.equal(0);
        });

        it('should return an array containing the data sources fetcher from dispatchProps, but only if authenticated', () => {
          const result = getFetchers(_.assign({}, stateProps, { authenticated: false } ), dispatchProps, api);
          expect(result[2]).to.be.undefined;

          const loggedInResult = getFetchers(_.assign({}, stateProps, { authenticated: true } ), dispatchProps, api);
          expect(loggedInResult[1]).to.be.a('function');
          expect(loggedInResult[1]()).to.equal('fetchDataSources');
        });
      });
    });
  });
});

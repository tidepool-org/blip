import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import NavigationMenu from '../../../../app/components/navbar/NavigationMenu';
import SettingsRounded from '@material-ui/icons/SettingsRounded';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global afterEach */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('NavigationMenu', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        getClinicsForClinician: sinon.stub().callsArgWith(2, null, { clinicsReturn: 'success' }),
        getPatientsForClinic: sinon.stub().callsArgWith(2, null, { patientsReturn: 'success' }),
      },
      user: {
        logout: sinon.stub(),
      },
    },
  };

  before(() => {
    mount = createMount();
  });

  after(() => {
    mount.cleanUp();
  });

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const completedWorkingState = {
    inProgress: false,
    completed: true,
    notification: null,
  };

  const defaultState = {
    blip: {
      working: {
        fetchingClinicsForClinician: defaultWorkingState,
      },
      loggedInUserId: 'clinicianUserId123',
    },
  };

  const fetchedClinicsState = {
    blip: {
      ...defaultState.blip,
      working: {
        fetchingClinicsForClinician: completedWorkingState,
      },
    },
  };

  const defaultUserState = {
    blip: {
      ...defaultState.blip,
      allUsersMap: {
        clinicianUserId123: {
          emails: ['clinic@example.com'],
          roles: ['clinic'],
          userid: 'clinicianUserId123',
          username: 'clinic@example.com',
          profile: {
            fullName: 'Example User',
          },
        },
      },
      clinics: {},
      pendingSentInvites: [],
      selectedClinicId: null,
    },
  };

  const clinicWorkflowState = {
    blip: {
      ...fetchedClinicsState.blip,
      allUsersMap: {
        clinicianUserId123: {
          emails: ['clinic@example.com'],
          roles: ['clinic'],
          userid: 'clinicianUserId123',
          username: 'clinic@example.com',
          profile: {
            fullName: 'Example Clinic',
            clinic: {
              role: 'clinic_manager',
            },
          },
        },
      },
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              id: 'clinicianUserId123',
              roles: ['CLINIC_MEMBER'],
            },
          },
          patients: {},
          id: 'clinicID456',
          address: '1 Address Ln, City Zip',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
          phoneNumbers: [
            {
              number: '(888) 555-5555',
              type: 'Office',
            },
          ],
        },
      },
      pendingSentInvites: [],
      selectedClinicId: 'clinicID456',
    },
  };

  let mountWrapper;
  let store;

  beforeEach(() => {
    mountWrapper = (newStore, props = defaultProps) => {
      store = newStore;

      return mount(
        <Provider store={store}>
          <NavigationMenu {...props} />
        </Provider>
      );
    };
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  context('no clinic workspaces available', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(defaultUserState));
    });

    it('should fetch clinics for clinician user', () => {
      const expectedActions = [
        {
          type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST',
        },
        {
          type: 'GET_CLINICS_FOR_CLINICIAN_SUCCESS',
          payload: {
            clinicianId: 'clinicianUserId123',
            clinics: {
              clinicsReturn: 'success',
            },
          },
        },
      ];

      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should not fetch clinics for non-clinician user', () => {
      wrapper = mountWrapper(mockStore({
        blip: {
          ...defaultUserState.blip,
          allUsersMap: {
            clinicianUserId123: {
              emails: ['user@example.com'],
              roles: [], // Remove 'clinic' role
              userid: 'clinicianUserId123',
              username: 'user@example.com',
              profile: {
                fullName: 'Example User',
              },
            },
          },
        },
      }));

      const expectedActions = [];

      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should render default menu options and dispatch correct actions', () => {
      const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
      expect(menuTrigger).to.have.lengthOf(1);
      expect(menuTrigger.text()).to.equal('Example User');

      const menuOptions = wrapper.find('Button.navigation-menu-option');
      expect(menuOptions).to.have.lengthOf(3);
      expect(menuOptions.at(0).text()).to.equal('Personal Workspace');
      expect(menuOptions.at(1).text()).to.equal('Account Settings');
      expect(menuOptions.at(2).text()).to.equal('Logout');

      // Click personal workspace option
      store.clearActions();
      menuOptions.at(0).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: 'SELECT_CLINIC',
          payload: {
            clinicId: null, // null is appropriate for switch to personal workspace
          },
        },
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/patients'],
            method: 'push',
          },
        },
      ]);

      // Click account settings option
      store.clearActions();
      menuOptions.at(1).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/profile'],
            method: 'push',
          },
        },
      ]);

      // Click logout option
      store.clearActions();
      menuOptions.at(2).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: 'LOGOUT_REQUEST',
        },
        {
          meta: {
            WebWorker: true,
            origin: 'http://localhost:9876',
            patientId: undefined,
            worker: 'data',
          },
          payload: {
            predicate: undefined,
          },
          type: 'DATA_WORKER_REMOVE_DATA_REQUEST',
        },
      ]);
    });
  });

  context('clinic workspaces available', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(clinicWorkflowState));
    });

    it('should fetch clinics if not already fetched', () => {
      wrapper = mountWrapper(mockStore({
        blip: {
          ...clinicWorkflowState.blip,
          working: defaultState.blip.working,
        },
      }));

      const expectedActions = [
        {
          type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST',
        },
        {
          type: 'GET_CLINICS_FOR_CLINICIAN_SUCCESS',
          payload: {
            clinicianId: 'clinicianUserId123',
            clinics: {
              clinicsReturn: 'success',
            },
          },
        },
      ];

      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should not fetch clinics if already fetched', () => {
      expect(store.getActions()).to.eql([]);
    });

    it('should render clinic workspace and default menu options and dispatch correct actions', () => {
      const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
      expect(menuTrigger).to.have.lengthOf(1);
      expect(menuTrigger.text()).to.equal('Example Clinic');

      const menuOptions = wrapper.find('Button.navigation-menu-option');
      expect(menuOptions).to.have.lengthOf(5);
      expect(menuOptions.at(0).text()).to.equal('new_clinic_name Workspace');
      expect(menuOptions.at(1).text()).to.equal('Manage Workspaces');
      expect(menuOptions.at(2).text()).to.equal('Personal Workspace');
      expect(menuOptions.at(3).text()).to.equal('Account Settings');
      expect(menuOptions.at(4).text()).to.equal('Logout');

      // Click clinic workspace option
      store.clearActions();
      menuOptions.at(0).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: 'SELECT_CLINIC',
          payload: {
            clinicId: 'clinicID456',
          },
        },
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/patients'],
            method: 'push',
          },
        },
      ]);

      // Click manage workspaces option
      store.clearActions();
      menuOptions.at(1).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/workspaces'],
            method: 'push',
          },
        },
      ]);

      // Click personal workspace option
      store.clearActions();
      menuOptions.at(2).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: 'SELECT_CLINIC',
          payload: {
            clinicId: null, // null is appropriate for switch to personal workspace
          },
        },
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/patients'],
            method: 'push',
          },
        },
      ]);

      // Click account settings option
      store.clearActions();
      menuOptions.at(3).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/profile'],
            method: 'push',
          },
        },
      ]);

      // Click logout option
      store.clearActions();
      menuOptions.at(4).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: 'LOGOUT_REQUEST',
        },
        {
          meta: {
            WebWorker: true,
            origin: 'http://localhost:9876',
            patientId: undefined,
            worker: 'data',
          },
          payload: {
            predicate: undefined,
          },
          type: 'DATA_WORKER_REMOVE_DATA_REQUEST',
        },
      ]);
    });
  });
});

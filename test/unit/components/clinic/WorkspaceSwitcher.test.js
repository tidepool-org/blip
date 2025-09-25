import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WorkspaceSwitcher from '../../../../app/components/clinic/WorkspaceSwitcher';

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

describe('WorkspaceSwitcher', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        getClinicsForClinician: sinon.stub().callsArgWith(2, null, { clinicsReturn: 'success' }),
        getPatientsForClinic: sinon.stub().callsArgWith(2, null, { patientsReturn: 'success' }),
        getClinicPatientCount: sinon.stub().callsArgWith(1, null, { demo: 1, plan: 3, total: 4 }),
        getClinicPatientCountSettings: sinon.stub().callsArgWith(1, null, 'success'),
      },
    },
  };

  before(() => {
    WorkspaceSwitcher.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/clinic-workspace' }));
    mount = createMount();
  });

  after(() => {
    WorkspaceSwitcher.__ResetDependency__('useLocation');
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
      membershipInOtherCareTeams: [],
    },
  };

  const fetchedDataState = {
    blip: {
      ...defaultState.blip,
      working: {
        fetchingClinicsForClinician: completedWorkingState,
      },
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
            patient: {
              foo: 'bar',
            },
          },
        },
        otherUser123: {
          emails: ['other@example.com'],
          userid: 'otherUser123',
          username: 'other@example.com',
          profile: {
            fullName: 'Other User',
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
        },
      },
      pendingSentInvites: [],
      membershipInOtherCareTeams: ['otherUser123'],
      selectedClinicId: 'clinicID456',
    },
  };

  const multiClinicState = {
    blip: {
      ...fetchedDataState.blip,
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
        },
        clinicID123: {
          id: 'clinicID123',
          name: 'other_clinic_name',
          clinicians: {
            clinicianUserId123: {
              id: 'clinicianUserId123',
              roles: ['CLINIC_MEMBER'],
            },
          },
        }
      },
    },
  };

  let mountWrapper;
  let store;

  beforeEach(() => {
    mountWrapper = (newStore, props = defaultProps) => {
      store = newStore;

      return mount(
        <Provider store={store}>
          <WorkspaceSwitcher {...props} />
        </Provider>
      );
    };
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  context('no clinics fetched', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(defaultState));
    });

    it('should not render anything', () => {
      expect(wrapper.find('#workspace-switcher').hostNodes()).to.have.lengthOf(0);
    });
  });

  context('clinics fetched', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(fetchedDataState));
    });

    it('should render a switcher component with a selected clinic and private workspace options', () => {
      const popupTrigger = wrapper.find('#workspace-switcher-current').hostNodes();
      expect(popupTrigger).to.have.lengthOf(1);
      expect(popupTrigger.text()).to.equal('new_clinic_name Workspace');

      const workspaceButtons = wrapper.find('Button.workspace-option');
      expect(workspaceButtons).to.have.lengthOf(2);
      expect(workspaceButtons.at(0).text()).to.equal('new_clinic_name Workspace');
      expect(workspaceButtons.at(0).find('Icon').props().label).to.equal('Selected');
      expect(workspaceButtons.at(1).text()).to.equal('Private Workspace');
      expect(workspaceButtons.at(1).find('Icon')).to.have.lengthOf(0);
    });

    it('should change to a different workspace and redirect to patients list', () => {
      const popupTrigger = () => wrapper.find('#workspace-switcher-current').hostNodes();
      expect(popupTrigger().text()).to.equal('new_clinic_name Workspace');
      popupTrigger().simulate('click');

      const workspaceButtons = wrapper.find('Button.workspace-option');
      expect(workspaceButtons.at(0).text()).to.equal('new_clinic_name Workspace');
      expect(workspaceButtons.at(1).text()).to.equal('Private Workspace');

      // Click private workspace option
      store.clearActions();
      workspaceButtons.at(1).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: 'SET_PATIENT_LIST_SEARCH_TEXT_INPUT',
          payload: { textInput: '' }
        },
        {
          type: 'SET_IS_PATIENT_LIST_VISIBLE',
          payload: { isVisible: false }
        },
        {
          type: 'SELECT_CLINIC_SUCCESS',
          payload: {
            clinicId: null, // null is appropriate for switch to private workspace
          },
        },
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/patients', { selectedClinicId: null }],
            method: 'push',
          },
        },
      ]);

      // Click clinic workspace option
      store.clearActions();
      workspaceButtons.at(0).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: 'SET_PATIENT_LIST_SEARCH_TEXT_INPUT',
          payload: { textInput: '' }
        },
        {
          type: 'SET_IS_PATIENT_LIST_VISIBLE',
          payload: { isVisible: false }
        },
        {
          type: 'SELECT_CLINIC_SUCCESS',
          payload: {
            clinicId: 'clinicID456',
          },
        },
        {
          type: 'FETCH_CLINIC_PATIENT_COUNT_REQUEST'
        },
        {
          type: 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_REQUEST'
        },
        {
          type: 'FETCH_CLINIC_PATIENT_COUNT_SUCCESS',
          payload: {
            clinicId: 'clinicID456',
            patientCount: { demo: 1, plan: 3, total: 4 },
          }
        },
        {
          type: 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS',
          payload: {
            clinicId: 'clinicID456',
            patientCountSettings: 'success',
          },
        },
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-workspace', { selectedClinicId: 'clinicID456' }],
            method: 'push',
          },
        },
      ]);
    });

    it('should hide the private workspace options under the appropriate conditions', () => {
      wrapper = mountWrapper(mockStore(multiClinicState));

      const workspaceButtons = () => wrapper.find('Button.workspace-option');
      expect(workspaceButtons()).to.have.lengthOf(3);
      expect(workspaceButtons().at(0).text()).to.equal('new_clinic_name Workspace');
      expect(workspaceButtons().at(1).text()).to.equal('other_clinic_name Workspace');
      expect(workspaceButtons().at(2).text()).to.equal('Private Workspace');

      wrapper = mountWrapper(mockStore({
        blip: {
          ...multiClinicState.blip,
          membershipInOtherCareTeams: [], // not a member of another care team
          allUsersMap: {
            ...defaultState.blip.allUsersMap,
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
                patient: undefined // no DSA / patient profile
              },
            },
          },
        },
      }));

      expect(workspaceButtons()).to.have.lengthOf(2);
      expect(workspaceButtons().at(0).text()).to.equal('new_clinic_name Workspace');
      expect(workspaceButtons().at(1).text()).to.equal('other_clinic_name Workspace');
    });
  });
});

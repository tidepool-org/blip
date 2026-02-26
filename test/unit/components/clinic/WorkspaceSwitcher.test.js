import React from 'react';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import WorkspaceSwitcher from '../../../../app/components/clinic/WorkspaceSwitcher';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('WorkspaceSwitcher', () => {
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

  let store;

  const mountWrapper = (state, props = defaultProps) => {
    store = mockStore(state);
    return render(
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <Provider store={store}>
          <WorkspaceSwitcher {...props} />
        </Provider>
      </MemoryRouter>
    );
  };

  afterEach(() => {
    cleanup();
    defaultProps.trackMetric.resetHistory();
  });

  context('no clinics fetched', () => {
    beforeEach(() => {
      wrapper = mountWrapper(defaultState);
    });

    it('should not render anything', () => {
      expect(wrapper.container.querySelector('#workspace-switcher')).to.be.null;
    });
  });

  context('clinics fetched', () => {
    beforeEach(() => {
      cleanup();
      wrapper = mountWrapper(fetchedDataState);
    });

    it('should render a switcher component with a selected clinic and private workspace options', () => {
      const popupTrigger = wrapper.container.querySelector('#workspace-switcher-current');
      expect(popupTrigger).to.not.be.null;
      expect(popupTrigger.textContent).to.include('new_clinic_name');

      // workspace-option buttons render inside a Popover portal in document.body
      const workspaceButtons = document.querySelectorAll('.workspace-option');
      expect(workspaceButtons.length).to.equal(2);
      expect(workspaceButtons[0].textContent).to.include('new_clinic_name');
      expect(workspaceButtons[1].textContent).to.include('Private Workspace');
    });

    it('should change to a different workspace and redirect to patients list', async () => {
      const popupTrigger = wrapper.container.querySelector('#workspace-switcher-current');
      expect(popupTrigger.textContent).to.include('new_clinic_name');

      // workspace-option buttons render inside a Popover portal in document.body
      const workspaceButtons = document.querySelectorAll('.workspace-option');
      expect(workspaceButtons[0].textContent).to.include('new_clinic_name');
      expect(workspaceButtons[1].textContent).to.include('Private Workspace');

      // Click private workspace option
      store.clearActions();
      fireEvent.click(workspaceButtons[1]);

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
            clinicId: null,
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
      fireEvent.click(workspaceButtons[0]);

      await waitFor(() => {
        const actions = store.getActions();
        const hasPush = actions.some(a => a.type === '@@router/CALL_HISTORY_METHOD');
        expect(hasPush).to.be.true;
      }, { timeout: 3000 });

      const actions = store.getActions();
      expect(actions).to.include.deep.members([
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
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-workspace', { selectedClinicId: 'clinicID456' }],
            method: 'push',
          },
        },
      ]);
    });

    it('should hide the private workspace options under the appropriate conditions', () => {
      cleanup();
      wrapper = mountWrapper(multiClinicState);

      const workspaceButtons = () => document.querySelectorAll('.workspace-option');
      expect(workspaceButtons().length).to.equal(3);
      expect(workspaceButtons()[0].textContent).to.include('new_clinic_name');
      expect(workspaceButtons()[1].textContent).to.include('other_clinic_name');
      expect(workspaceButtons()[2].textContent).to.include('Private Workspace');

      cleanup();
      wrapper = mountWrapper({
        blip: {
          ...multiClinicState.blip,
          membershipInOtherCareTeams: [],
          allUsersMap: {
            ...fetchedDataState.blip.allUsersMap,
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
                patient: undefined,
              },
            },
          },
        },
      });

      expect(workspaceButtons().length).to.equal(2);
      expect(workspaceButtons()[0].textContent).to.include('new_clinic_name');
      expect(workspaceButtons()[1].textContent).to.include('other_clinic_name');
    });
  });
});

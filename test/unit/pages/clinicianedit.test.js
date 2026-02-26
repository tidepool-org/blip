import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import _ from 'lodash';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicianEdit from '../../../app/pages/clinicianedit';

const mockUseLocation = jest.fn();
const mockUseFlags = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

jest.mock('launchdarkly-react-client-sdk', () => {
  const actual = jest.requireActual('launchdarkly-react-client-sdk');
  return {
    ...actual,
    useFlags: () => mockUseFlags(),
  };
});

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global context */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicianEdit', () => {
  let defaultProps;
  let store;

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const blipState = {
    blip: {
      working: {
        fetchingClinics: {
          inProgress: false,
          completed: true,
          notification: null,
        },
        fetchingCliniciansFromClinic: {
          inProgress: false,
          completed: true,
          notification: null,
        },
        updatingClinician: defaultWorkingState,
      },
    },
  };

  const fetchedDataState = _.merge({}, blipState, {
    blip: {
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
              name: 'clinician_user_name',
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
      loggedInUserId: 'clinicianUserId123',
      pendingSentInvites: [],
      selectedClinicId: 'clinicID456',
    },
  });

  const fetchedLastAdminState = _.merge({}, fetchedDataState, {
    blip: {
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              roles: ['CLINIC_ADMIN'],
            },
          },
        },
      },
    },
  });

  const fetchedAdminState = _.merge({}, fetchedDataState, {
    blip: {
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              roles: ['CLINIC_ADMIN'],
            },
            clinicianUserId456: {
              roles: ['CLINIC_ADMIN'],
            },
          },
        },
      },
    },
  });

  const fetchedAdminInvitedState = _.merge({}, fetchedAdminState, {
    blip: {
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId456: {
              inviteId: 'some-awesome-inviteId-here',
            },
          },
        },
      },
    },
  });

  const renderPage = (providedStore = store, locationState = {}) => {
    mockUseLocation.mockReturnValue({ state: locationState });

    return render(
      <Provider store={providedStore}>
        <ToastProvider>
          <ClinicianEdit {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    defaultProps = {
      trackMetric: sinon.stub(),
      t: sinon.stub().callsFake((string) => string),
      api: {
        clinics: {
          getCliniciansFromClinic: sinon.stub(),
          updateClinician: sinon.stub().callsArgWith(3, null, {}),
        },
      },
    };

    store = mockStore(blipState);
    mockUseFlags.mockReturnValue({ showPrescriptions: true });
  });

  describe('no clinician selected', () => {
    it('should send user to "clinic-admin" if no clinician is selected', () => {
      renderPage(store, {});

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-admin'],
            method: 'push',
          },
        },
      ]);
    });
  });

  describe('clinician selected', () => {
    const renderSelected = (state = fetchedAdminState) => {
      store = mockStore(state);
      renderPage(store, { clinicId: 'clinicID456', clinicianId: 'clinicianUserId123' });
    };

    it('should render clinician type selection', () => {
      renderSelected();
      expect(document.querySelectorAll('input[type="radio"]').length).to.equal(2);
    });

    it('should change selected type when clicked', () => {
      renderSelected();
      const radios = document.querySelectorAll('input[type="radio"]');
      const adminRadio = radios[0];
      const memberRadio = radios[1];

      expect(adminRadio.checked).to.be.true;
      fireEvent.click(memberRadio);
      expect(memberRadio.checked).to.be.true;
    });

    it('should set prescriber permission when prescriber checkbox clicked', () => {
      renderSelected();
      const prescriberCheckbox = document.querySelector('input[type="checkbox"][name="prescriberPermission"]');

      expect(prescriberCheckbox.checked).to.be.false;
      fireEvent.click(prescriberCheckbox);
      expect(prescriberCheckbox.checked).to.be.true;
    });

    it('should show confirmation dialog when delete clicked', () => {
      renderSelected();
      const deleteDialog = () => document.querySelector('#deleteDialog');
      expect(deleteDialog()).to.exist;

      fireEvent.click(document.querySelector('#remove-team-member'));

      expect(document.body.textContent).to.include('Remove clinician_user_name');
      expect(document.querySelector('#deleteDialogCancel')).to.exist;
      expect(document.querySelector('#deleteDialogRemove')).to.exist;
    });

    context('user is last admin', () => {
      it("should prevent user from removing themselves if they're the last admin", () => {
        renderSelected(fetchedLastAdminState);

        const deleteDialog = () => document.querySelector('#deleteDialog');
        expect(deleteDialog()).to.exist;

        fireEvent.click(document.querySelector('#remove-team-member'));

        expect(document.body.textContent).to.include('Unable to remove yourself');
        expect(document.querySelector('#deleteDialogCancel')).to.exist;
        expect(document.querySelector('#deleteDialogRemove')).to.not.exist;
      });

      it("should prevent user from changing permissions if they're the last admin", () => {
        renderSelected(fetchedLastAdminState);

        expect(document.body.textContent).to.include('You cannot remove your admin permissions if you are the only clinic admin.');
      });
    });

    context('user is last admin with another admin invited', () => {
      it("should prevent user from removing themselves if they're the last admin", () => {
        renderSelected(fetchedAdminInvitedState);

        const deleteDialog = () => document.querySelector('#deleteDialog');
        expect(deleteDialog()).to.exist;

        fireEvent.click(document.querySelector('#remove-team-member'));

        expect(document.body.textContent).to.include('Unable to remove yourself');
        expect(document.querySelector('#deleteDialogCancel')).to.exist;
        expect(document.querySelector('#deleteDialogRemove')).to.not.exist;
      });

      it("should prevent user from changing permissions if they're the last admin", () => {
        renderSelected(fetchedAdminInvitedState);

        expect(document.body.textContent).to.include('You cannot remove your admin permissions if you are the only clinic admin.');
      });
    });

    it('should navigate to "clinic-admin" when back button pushed without edit', () => {
      renderSelected();
      expect(store.getActions()).to.eql([]);
      fireEvent.click(document.querySelector('#cancel'));

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-admin'],
            method: 'push',
          },
        },
      ]);
    });

    it('should show confirm dialog when navigating without saving', () => {
      renderSelected();
      fireEvent.click(document.querySelector('input[type="checkbox"][name="prescriberPermission"]'));

      const confirmDialog = () => document.querySelector('#confirmDialog');
      expect(confirmDialog()).to.exist;

      fireEvent.click(document.querySelector('#cancel'));
      expect(document.body.textContent).to.include('Unsaved changes');
    });

    it('should update clinician and redirect to "clinic-admin" on save', async () => {
      renderSelected();
      expect(store.getActions()).to.eql([]);
      expect(defaultProps.api.clinics.updateClinician.callCount).to.equal(0);

      const radios = document.querySelectorAll('input[type="radio"]');
      fireEvent.click(radios[1]);
      fireEvent.click(document.querySelector('input[type="checkbox"][name="prescriberPermission"]'));

      fireEvent.submit(document.querySelector('#edit-member'));

      await waitFor(() => {
        expect(defaultProps.api.clinics.updateClinician.callCount).to.equal(1);
        sinon.assert.calledWith(
          defaultProps.api.clinics.updateClinician,
          'clinicID456',
          'clinicianUserId123',
          { name: 'clinician_user_name', id: 'clinicianUserId123', roles: ['CLINIC_MEMBER', 'PRESCRIBER'] }
        );

        expect(store.getActions()).to.eql([
          { type: 'UPDATE_CLINICIAN_REQUEST' },
          {
            type: 'UPDATE_CLINICIAN_SUCCESS',
            payload: {
              clinicId: 'clinicID456',
              clinicianId: 'clinicianUserId123',
              clinician: {
                name: 'clinician_user_name',
                id: 'clinicianUserId123',
                roles: ['CLINIC_MEMBER', 'PRESCRIBER'],
              },
            },
          },
        ]);
      });
    });

    it('should render permissions details when trigger text is clicked', () => {
      renderSelected();
      const permissionsDialog = () => document.querySelector('#permissionsDialog');
      expect(permissionsDialog()).to.exist;

      const permissionsTrigger = Array.from(document.querySelectorAll('button')).find((button) =>
        button.textContent.includes('Learn more about clinician roles and permissions')
      );
      fireEvent.click(permissionsTrigger);

      expect(document.body.textContent).to.include('Clinician Roles and Permissions');
    });
  });

  context('clinicians not fetched', () => {
    it('should fetch clinicians for a clinic if not already fetched', () => {
      const initialState = _.cloneDeep(fetchedDataState);
      initialState.blip.working.fetchingCliniciansFromClinic.completed = false;
      store = mockStore(initialState);

      renderPage(store, { clinicId: 'clinicID456', clinicianId: 'clinicianUserIdMissing' });

      sinon.assert.calledWith(defaultProps.api.clinics.getCliniciansFromClinic, 'clinicID456', {
        limit: 1000,
        offset: 0,
      });
    });
  });
});

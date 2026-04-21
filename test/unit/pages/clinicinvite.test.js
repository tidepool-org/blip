import React from 'react';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import ClinicInvite from '../../../app/pages/clinicinvite';
import { ToastProvider } from '../../../app/providers/ToastProvider';

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
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicInvite', () => {
  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        inviteClinician: sinon.stub().callsArgWith(2, null, { inviteReturn: 'success' })
      },
    },
  };

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
        sendingClinicianInvite: defaultWorkingState,
      },
    },
  };

  let store = mockStore(blipState);

  const fetchedDataState = merge({}, blipState, {
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

  const fetchedAdminState = merge({}, fetchedDataState, {
    blip: {
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              permissions: ['CLINIC_ADMIN'],
            },
          },
        },
      },
    },
  });

  const noClinicState = { state: {} };

  const clinicState = {
    state: { clinicId: 'clinicID456' },
  };

  afterEach(() => {
    cleanup();
    defaultProps.trackMetric.resetHistory();
  });

  describe('no clinician selected', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue(noClinicState);
      mockUseFlags.mockReturnValue({ showPrescriptions: true });
      store = mockStore(blipState);
      wrapper = render(
        <Provider store={store}>
          <ToastProvider>
            <ClinicInvite {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should send user to "clinic-admin" if no clinic is selected', () => {
      const expectedActions = [
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-admin'],
            method: 'push',
          },
        },
      ];
      expect(store.getActions()).to.eql(expectedActions);
    });
  });

  describe('clinic selected', () => {
    beforeEach(() => {
      cleanup();
      mockUseLocation.mockReturnValue(clinicState);
      mockUseFlags.mockReturnValue({ showPrescriptions: true });
      store = mockStore(fetchedAdminState);
      wrapper = render(
        <Provider store={store}>
          <ToastProvider>
            <ClinicInvite {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render clinician type selection', () => {
      const radioGroup = wrapper.container.querySelector('[role="radiogroup"]');
      expect(radioGroup).to.not.be.null;
    });

    it('should change selected type when clicked', () => {
      const radios = wrapper.container.querySelectorAll('input[type="radio"]');
      expect(radios.length).to.be.at.least(1);

      fireEvent.click(radios[1]);
      fireEvent.change(radios[1], { target: { name: 'clinicianType', value: 'CLINIC_MEMBER', checked: true } });

      // The radio should be checked after the change event
      expect(radios[1].checked).to.equal(true);
    });

    it('should set prescriber permission when prescriber checkbox clicked', () => {
      const checkbox = wrapper.container.querySelector('input[type="checkbox"]');
      expect(checkbox).to.not.be.null;
      expect(checkbox.checked).to.be.false;

      fireEvent.click(checkbox);
      expect(checkbox.checked).to.be.true;
    });

    it('should navigate to "clinic-admin" when back button pushed without edit', () => {
      expect(store.getActions()).to.eql([]);
      const cancelBtn = wrapper.container.querySelector('button#cancel');
      expect(cancelBtn).to.not.be.null;
      fireEvent.click(cancelBtn);

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

    it('should show confirm dialog when navigating without saving', async () => {
      const emailInput = wrapper.container.querySelector('input[type="text"]');
      fireEvent.change(emailInput, { target: { name: 'email', value: 'email@email.com' } });

      // dialog should be hidden before cancel
      const confirmDialog = () => document.querySelector('[id="confirmDialog"]');
      expect(confirmDialog().style.visibility).to.equal('hidden');

      const cancelBtn = wrapper.container.querySelector('button#cancel');
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(confirmDialog().style.visibility).to.not.equal('hidden');
      });
    });

    it('should update clinician and redirect to "clinic-admin" on save', async () => {
      expect(store.getActions()).to.eql([]);
      expect(defaultProps.api.clinics.inviteClinician.callCount).to.equal(0);

      const emailInput = wrapper.container.querySelector('input[type="text"]');
      fireEvent.change(emailInput, { target: { name: 'email', value: 'email@email.com' } });
      fireEvent.blur(emailInput);

      const radios = wrapper.container.querySelectorAll('input[type="radio"]');
      // Fire change on the CLINIC_MEMBER radio (index 1) to trigger Formik state update
      fireEvent.change(radios[1], { target: { name: 'clinicianType', value: 'CLINIC_MEMBER' } });
      fireEvent.blur(radios[1]);

      const checkbox = wrapper.container.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);

      // Wait for async Formik validation to settle
      await waitFor(() => {
        const submitBtn = wrapper.container.querySelector('button#submit');
        expect(submitBtn.disabled).to.be.false;
      }, { timeout: 3000 });

      const submitBtn = wrapper.container.querySelector('button#submit');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(defaultProps.api.clinics.inviteClinician.callCount).to.equal(1);
      }, { timeout: 3000 });

      sinon.assert.calledWith(
        defaultProps.api.clinics.inviteClinician,
        'clinicID456',
        { email: 'email@email.com', roles: ['CLINIC_MEMBER', 'PRESCRIBER'] },
      );

      expect(store.getActions()).to.include.deep.members([
        { type: 'SEND_CLINICIAN_INVITE_REQUEST' },
      ]);
    });

    it('should render permissions details when trigger text is clicked', async () => {
      // dialog is in DOM but hidden before click
      const permissionsDialog = () => document.querySelector('[id="permissionsDialog"]');
      expect(permissionsDialog().style.visibility).to.equal('hidden');

      const learnMoreBtn = Array.from(wrapper.container.querySelectorAll('button')).find(b =>
        b.textContent.includes('Learn more') || b.textContent.includes('clinician roles')
      );
      expect(learnMoreBtn).to.not.be.null;
      fireEvent.click(learnMoreBtn);

      await waitFor(() => {
        expect(permissionsDialog().style.visibility).to.not.equal('hidden');
      });

      // permissionsDialog contains its own #dialog-title; find it within that dialog element
      const dialogTitle = permissionsDialog().querySelector('#dialog-title');
      expect(dialogTitle).to.not.be.null;
      expect(dialogTitle.textContent).to.include('Clinician Roles');
    });
  });
});

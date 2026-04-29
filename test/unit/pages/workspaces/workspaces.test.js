import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Workspaces from '../../../../app/pages/workspaces';
import { ToastProvider } from '../../../../app/providers/ToastProvider';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('Workspaces', () => {
  let wrapper;
  let store;

  const defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        getClinicsForClinician: sinon.stub().callsArgWith(2, null, { clinicsReturn: 'success' }),
        getClinicianInvites: sinon.stub().callsArgWith(1, null, { invitesReturn: 'success' }),
        deleteClinicianFromClinic: sinon.stub().callsArgWith(2, null, { deleteClinicianReturn: 'success' }),
        acceptClinicianInvite: sinon.stub().callsArgWith(2, null, { acceptInvite: 'success' }),
        dismissClinicianInvite: sinon.stub().callsArgWith(2, null, { dismissInvite: 'success' }),
        getCliniciansFromClinic: sinon.stub().callsArgWith(2, null, { cliniciansReturn: 'success' }),
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
      clinics: {},
      working: {
        fetchingClinicianInvites: defaultWorkingState,
        fetchingClinicsForClinician: defaultWorkingState,
        deletingClinicianFromClinic: defaultWorkingState,
        acceptingClinicianInvite: defaultWorkingState,
        dismissingClinicianInvite: defaultWorkingState,
      },
      loggedInUserId: 'clinicianUserId123',
    },
  };

  const fetchedClinicInvitesState = {
    blip: {
      ...defaultState.blip,
      working: {
        fetchingClinicianInvites: completedWorkingState,
        fetchingClinicsForClinician: defaultWorkingState,
        deletingClinicianFromClinic: defaultWorkingState,
        acceptingClinicianInvite: defaultWorkingState,
        dismissingClinicianInvite: defaultWorkingState,
      },
    },
  };

  const fetchedDataState = {
    blip: {
      ...fetchedClinicInvitesState.blip,
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
            clinicianUserId456: {
              id: 'clinicianUserId456',
              roles: ['CLINIC_ADMIN'],
            },
          },
          patients: {},
          id: 'clinicID456',
          address: '1 Address Ln, City Zip',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
        },
      },
      pendingReceivedClinicianInvites: [
        {
          key: 'i5Ch7l27au7s4f9BHZCdnzA2qlH1qHnK',
          type: 'clinician_invitation',
          email: 'clinic@example.com',
          clinicId: '61003144b78cc595b9560e7d',
          creatorId: 'bf62d3c88b',
          creator: {
            userid: 'bf62d3c88b',
            clinicId: '61003144b78cc595b9560e7d',
            clinicName: 'Example Health',
          },
          context: null,
          created: '2021-07-27T16:16:46.891Z',
          status: 'pending',
          restrictions: {
            canAccept: true,
          },
        },
      ],
    },
  };

  const fetchedDataEmptyState = {
    blip: {
      ...fetchedDataState.blip,
      clinics: {},
      pendingReceivedClinicianInvites: [],
    },
  };

  const fetchedDataLastAdminState = {
    blip: {
      ...fetchedDataState.blip,
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              id: 'clinicianUserId123',
              roles: ['CLINIC_ADMIN'],
            },
          },
          patients: {},
          id: 'clinicID456',
          address: '1 Address Ln, City Zip',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
        },
      },
    },
  };

  const fetchedDataLastAdminInvitedState = {
    blip: {
      ...fetchedDataState.blip,
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              id: 'clinicianUserId123',
              roles: ['CLINIC_ADMIN'],
            },
            clinicianUserId456: {
              id: 'clinicianUserId456',
              roles: ['CLINIC_ADMIN'],
              inviteId: 'invite_id_456',
            },
          },
          patients: {},
          id: 'clinicID456',
          address: '1 Address Ln, City Zip',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
        },
      },
    },
  };

  const fetchedNoIdpEmailMismatchState = {
    blip: {
      ...fetchedDataState.blip,
      pendingReceivedClinicianInvites: [
        {
          key: 'i5Ch7l27au7s4f9BHZCdnzA2qlH1qHnK',
          type: 'clinician_invitation',
          email: 'clinic@example.com',
          clinicId: '61003144b78cc595b9560e7d',
          creatorId: 'bf62d3c88b',
          creator: {
            userid: 'bf62d3c88b',
            clinicId: '61003144b78cc595b9560e7d',
            clinicName: 'Example Health',
          },
          context: null,
          created: '2021-07-27T16:16:46.891Z',
          status: 'pending',
          restrictions: {
            canAccept: false,
          },
        },
      ],
    },
  };

  const fetchedIdpEmailMatchState = {
    blip: {
      ...fetchedDataState.blip,
      pendingReceivedClinicianInvites: [
        {
          key: 'i5Ch7l27au7s4f9BHZCdnzA2qlH1qHnK',
          type: 'clinician_invitation',
          email: 'clinic@example.com',
          clinicId: '61003144b78cc595b9560e7d',
          creatorId: 'bf62d3c88b',
          creator: {
            userid: 'bf62d3c88b',
            clinicId: '61003144b78cc595b9560e7d',
            clinicName: 'Example Health',
          },
          context: null,
          created: '2021-07-27T16:16:46.891Z',
          status: 'pending',
          restrictions: {
            canAccept: false,
            requiredIdp: 'awesome-idp',
          },
        },
      ],
    },
  };

  const mountWrapper = (storeState, props = defaultProps) => {
    store = mockStore(storeState);
    wrapper = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/workspaces']}>
            <Route path='/workspaces' children={() => <Workspaces {...props} />} />
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );
    return wrapper;
  };

  afterEach(() => {
    cleanup();
    defaultProps.trackMetric.resetHistory();
  });

  context('no clinic invites fetched', () => {
    beforeEach(() => {
      mountWrapper(defaultState);
    });

    it('should fetch clinician invites', () => {
      const expectedActions = [
        { type: 'FETCH_CLINICIAN_INVITES_REQUEST' },
        {
          type: 'FETCH_CLINICIAN_INVITES_SUCCESS',
          payload: { invites: { invitesReturn: 'success' } },
        },
      ];
      expect(store.getActions()).to.eql(expectedActions);
    });
  });

  context('clinic and invite data fetched', () => {
    beforeEach(() => {
      mountWrapper(fetchedDataState);
    });

    it('should not fetch clinics', () => {
      cleanup();
      mountWrapper(fetchedClinicInvitesState);
      expect(store.getActions()).to.eql([]);
    });

    it('should render the workspaces title', () => {
      const title = wrapper.container.querySelector('h2');
      expect(title.textContent).to.equal('Welcome To Tidepool');
    });

    it('should render the workspaces section heading', () => {
      const heading = wrapper.container.querySelector('h3');
      expect(heading.textContent).to.equal('Clinic Workspace');
    });

    it('should render a button to add a new clinic', () => {
      const button = wrapper.container.querySelector('button#workspace-create-clinic');
      expect(button).to.exist;
      expect(button.textContent).to.contain('Create a New Clinic');

      store.clearActions();
      fireEvent.click(button);
      expect(store.getActions()).to.eql([
        { type: 'SELECT_CLINIC_SUCCESS', payload: { clinicId: null } },
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-details/new', { selectedClinicId: null, referrer: '/workspaces' }],
            method: 'push',
          },
        },
      ]);
    });

    context('no clinics or invites', () => {
      beforeEach(() => {
        cleanup();
        mountWrapper(fetchedDataEmptyState);
      });

      it('should render new clinic creation info', () => {
        const emptyWorkspaces = wrapper.container.querySelector('#workspaces-empty');
        expect(emptyWorkspaces).to.exist;
        expect(emptyWorkspaces.textContent).to.contain('Start by creating a new clinic.');
      });
    });

    it('should render a list of clinics and pending invites for the clinician', () => {
      const workspaceList = wrapper.container.querySelector('#workspaces-clinics-list');
      expect(workspaceList).to.exist;

      const clinics = workspaceList.querySelectorAll('div.workspace-item-clinic');
      expect(clinics).to.have.lengthOf(1);
      expect(clinics[0].textContent).to.contain('new_clinic_name');
      expect(clinics[0].querySelectorAll('.notification-icon')).to.have.lengthOf(0);

      const invites = workspaceList.querySelectorAll('div.workspace-item-clinician_invitation');
      expect(invites).to.have.lengthOf(1);
      expect(invites[0].textContent).to.contain('Example Health');
      expect(invites[0].querySelectorAll('.notification-icon')).to.have.lengthOf(1);
    });

    it('should allow a clinician to navigate to a clinic workspace', () => {
      const clinic = wrapper.container.querySelector('div.workspace-item-clinic');
      const buttons = clinic.querySelectorAll('button');
      const navigateButton = Array.from(buttons).find(b => b.textContent.trim() === 'Go To Workspace');
      expect(navigateButton).to.exist;

      store.clearActions();
      fireEvent.click(navigateButton);
      expect(store.getActions()).to.eql([
        { type: 'SET_PATIENT_LIST_SEARCH_TEXT_INPUT', payload: { textInput: '' } },
        { type: 'SET_IS_PATIENT_LIST_VISIBLE', payload: { isVisible: false } },
        { type: 'SELECT_CLINIC_SUCCESS', payload: { clinicId: 'clinicID456' } },
        { type: 'FETCH_CLINIC_PATIENT_COUNTS_REQUEST' },
        { type: 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_REQUEST' },
        {
          type: 'FETCH_CLINIC_PATIENT_COUNTS_SUCCESS',
          payload: { clinicId: 'clinicID456', patientCounts: { demo: 1, plan: 3, total: 4 } },
        },
        {
          type: 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS',
          payload: { clinicId: 'clinicID456', patientCountSettings: 'success' },
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

    it('should allow a clinician to leave a clinic', () => {
      const clinic = wrapper.container.querySelector('div.workspace-item-clinic');
      const leaveButton = Array.from(clinic.querySelectorAll('button')).find(
        b => b.textContent.trim() === 'Leave Clinic'
      );
      expect(leaveButton).to.exist;

      // Dialog is in DOM but empty/hidden when closed
      const dialogTitleEl = document.querySelector('#dialog-title');
      expect(dialogTitleEl).to.not.be.null;
      expect(dialogTitleEl.textContent).to.equal('');

      fireEvent.click(leaveButton);

      expect(dialogTitleEl.textContent).to.equal('Leave new_clinic_name');

      const allButtons = document.querySelectorAll('button');
      const confirmLeaveButton = Array.from(allButtons).find(
        b => b.textContent.trim() === 'Leave Clinic' && b !== leaveButton
      );
      expect(confirmLeaveButton).to.exist;

      store.clearActions();
      fireEvent.click(confirmLeaveButton);
      expect(store.getActions()).to.eql([
        { type: 'DELETE_CLINICIAN_FROM_CLINIC_REQUEST' },
        {
          type: 'DELETE_CLINICIAN_FROM_CLINIC_SUCCESS',
          payload: { clinicId: 'clinicID456', clinicianId: 'clinicianUserId123' },
        },
      ]);
    });

    it('should prevent the last admin clinician from leaving a clinic', () => {
      cleanup();
      mountWrapper(fetchedDataLastAdminState);
      const clinic = wrapper.container.querySelector('div.workspace-item-clinic');
      const leaveButton = Array.from(clinic.querySelectorAll('button')).find(
        b => b.textContent.trim() === 'Leave Clinic'
      );
      expect(leaveButton).to.exist;

      fireEvent.click(leaveButton);

      const dialogTitle = document.querySelector('#dialog-title');
      expect(dialogTitle).to.exist;
      expect(dialogTitle.textContent).to.equal('Unable to leave new_clinic_name');

      // No danger/confirm button — only OK
      const allDialogButtons = document.querySelectorAll('button');
      const okButton = Array.from(allDialogButtons).find(b => b.textContent.trim() === 'OK');
      expect(okButton).to.exist;

      // No "Leave Clinic" button inside dialog (danger variant)
      const dangerLeave = Array.from(allDialogButtons).filter(
        b => b.textContent.trim() === 'Leave Clinic' && b !== leaveButton
      );
      expect(dangerLeave).to.have.lengthOf(0);
    });

    it('should prevent the last admin clinician from leaving a clinic with invited clinic admins', () => {
      cleanup();
      mountWrapper(fetchedDataLastAdminInvitedState);
      const clinic = wrapper.container.querySelector('div.workspace-item-clinic');
      const leaveButton = Array.from(clinic.querySelectorAll('button')).find(
        b => b.textContent.trim() === 'Leave Clinic'
      );
      expect(leaveButton).to.exist;

      fireEvent.click(leaveButton);

      const dialogTitle = document.querySelector('#dialog-title');
      expect(dialogTitle).to.exist;
      expect(dialogTitle.textContent).to.equal('Unable to leave new_clinic_name');

      const allDialogButtons = document.querySelectorAll('button');
      const okButton = Array.from(allDialogButtons).find(b => b.textContent.trim() === 'OK');
      expect(okButton).to.exist;

      const dangerLeave = Array.from(allDialogButtons).filter(
        b => b.textContent.trim() === 'Leave Clinic' && b !== leaveButton
      );
      expect(dangerLeave).to.have.lengthOf(0);
    });

    it('should allow a clinician to accept a clinic invite', () => {
      const invite = wrapper.container.querySelector('div.workspace-item-clinician_invitation');
      const acceptButton = Array.from(invite.querySelectorAll('button')).find(
        b => b.textContent.trim() === 'Accept Invite'
      );
      expect(acceptButton).to.exist;

      store.clearActions();
      fireEvent.click(acceptButton);
      expect(store.getActions()).to.eql([
        { type: 'ACCEPT_CLINICIAN_INVITE_REQUEST' },
        {
          type: 'ACCEPT_CLINICIAN_INVITE_SUCCESS',
          payload: { inviteId: 'i5Ch7l27au7s4f9BHZCdnzA2qlH1qHnK' },
        },
      ]);
    });

    it('should allow a clinician to decline a clinic invite', () => {
      const invite = wrapper.container.querySelector('div.workspace-item-clinician_invitation');
      const declineButton = Array.from(invite.querySelectorAll('button')).find(
        b => b.textContent.trim() === 'Decline'
      );
      expect(declineButton).to.exist;

      // Dialog is in DOM but empty/hidden when closed
      const dialogTitleEl = document.querySelector('#dialog-title');
      expect(dialogTitleEl).to.not.be.null;
      expect(dialogTitleEl.textContent).to.equal('');

      fireEvent.click(declineButton);

      expect(dialogTitleEl.textContent).to.equal('Decline Example Health');

      const allButtons = document.querySelectorAll('button');
      const confirmDeclineButton = Array.from(allButtons).find(
        b => b.textContent.trim() === 'Decline Invite'
      );
      expect(confirmDeclineButton).to.exist;

      store.clearActions();
      fireEvent.click(confirmDeclineButton);
      expect(store.getActions()).to.eql([
        { type: 'DISMISS_CLINICIAN_INVITE_REQUEST' },
        {
          type: 'DISMISS_CLINICIAN_INVITE_SUCCESS',
          payload: { inviteId: 'i5Ch7l27au7s4f9BHZCdnzA2qlH1qHnK' },
        },
      ]);
    });

    it('should display an error and SSO link button if an IDP is required', () => {
      cleanup();
      mountWrapper(fetchedIdpEmailMatchState);
      const invite = wrapper.container.querySelector('div.workspace-item-clinician_invitation');
      const linkButton = Array.from(invite.querySelectorAll('button')).find(
        b => b.textContent.trim() === 'Link Account'
      );
      expect(linkButton).to.exist;
      const error = wrapper.container.querySelector('.workspace-error');
      expect(error).to.exist;
      expect(error.textContent).to.equal(
        'Single Sign-On (SSO) is required to join this Clinic. Please link your account to enable SSO.'
      );
    });

    it('should display an error and disabled accept button if email mismatch', () => {
      cleanup();
      mountWrapper(fetchedNoIdpEmailMismatchState);
      const invite = wrapper.container.querySelector('div.workspace-item-clinician_invitation');
      const acceptButton = Array.from(invite.querySelectorAll('button')).find(
        b => b.textContent.trim() === 'Accept Invite'
      );
      expect(acceptButton).to.exist;
      expect(acceptButton.disabled).to.be.true;
      const error = wrapper.container.querySelector('.workspace-error');
      expect(error).to.exist;
      expect(error.textContent).to.equal(
        "Your account doesn't satisfy the security requirements. Please contact this clinic's IT administrator."
      );
    });

    it('should set SSO enabled display state to false if it is true', () => {
      cleanup();
      mountWrapper({ blip: { ...fetchedClinicInvitesState.blip, ssoEnabledDisplay: true } });
      expect(store.getActions()).to.eql([
        { type: 'SET_SSO_ENABLED_DISPLAY', payload: { value: false } },
      ]);
    });
  });
});

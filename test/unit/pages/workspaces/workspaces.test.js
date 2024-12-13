import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
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
/* global before */
/* global afterEach */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('Workspaces', () => {
  let mount;

  let wrapper;
  let defaultProps = {
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
        getClinicPatientCount: sinon.stub().callsArgWith(1, null, { patientCount: 3 }),
        getClinicPatientCountSettings: sinon.stub().callsArgWith(1, null, 'success'),
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
            }
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
            clinicName: 'Example Health'
          },
          context: null,
          created: '2021-07-27T16:16:46.891Z',
          status: 'pending',
          restrictions: {
            canAccept: true,
          }
        }
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
            }
          },
          patients: {},
          id: 'clinicID456',
          address: '1 Address Ln, City Zip',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
        },
      },
    }
  }

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
            }
          },
          patients: {},
          id: 'clinicID456',
          address: '1 Address Ln, City Zip',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
        },
      },
    }
  }

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
            clinicName: 'Example Health'
          },
          context: null,
          created: '2021-07-27T16:16:46.891Z',
          status: 'pending',
          restrictions: {
            canAccept: false,
          }
        }
      ],
    }
  }

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
            clinicName: 'Example Health'
          },
          context: null,
          created: '2021-07-27T16:16:46.891Z',
          status: 'pending',
          restrictions: {
            canAccept: false,
            requiredIdp: 'awesome-idp'
          }
        }
      ],
    }
  }

  let mountWrapper;
  let store;

  beforeEach(() => {
    mountWrapper = (newStore, props = defaultProps) => {
      store = newStore;

      return mount(
        <Provider store={store}>
          <ToastProvider>
            <MemoryRouter initialEntries={['/workspaces']}>
              <Route path='/workspaces' children={() => (<Workspaces {...props} />)} />
            </MemoryRouter>
          </ToastProvider>
        </Provider>
      );
    };
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  context('no clinic invites fetched', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(defaultState));
    });

    it('should fetch clinician invites', () => {
      const expectedActions = [
        {
          type: 'FETCH_CLINICIAN_INVITES_REQUEST',
        },
        {
          type: 'FETCH_CLINICIAN_INVITES_SUCCESS',
          payload: {
            invites: {
              invitesReturn: 'success',
            },
          },
        },
      ];

      expect(store.getActions()).to.eql(expectedActions);
    });
  });

  context('clinic and invite data fetched', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(fetchedDataState));
    });

    it('should not fetch clinics', () => {
      wrapper = mountWrapper(mockStore(fetchedClinicInvitesState));
      expect(store.getActions()).to.eql([]);
    });

    it('should render the workspaces title', () => {
      const title = wrapper.find('h2').at(0);
      expect(title.text()).to.equal('Welcome To Tidepool');
    });

    it('should render the workspaces section heading', () => {
      const heading = wrapper.find('h3').at(0);
      expect(heading.text()).to.equal('Clinic Workspace');
    });

    it('should render a button to add a new clinic', () => {
      const button = wrapper.find('button#workspace-create-clinic');
      expect(button).to.have.lengthOf(1);
      expect(button.text()).contains('Create a New Clinic');

      store.clearActions();
      button.simulate('click');
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
        wrapper = mountWrapper(mockStore(fetchedDataEmptyState));
      });

      it('should render new clinic creation info', () => {
        const emptyWorkspaces = wrapper.find('#workspaces-empty').hostNodes();
        expect(emptyWorkspaces).to.have.lengthOf(1);
        expect(emptyWorkspaces.text()).contains('Start by creating a new clinic.');
      });
    });

    it('should render a list of clinics and pending invites for the clinician', () => {
      const workspaceList = wrapper.find('#workspaces-clinics-list').hostNodes();
      expect(workspaceList).to.have.lengthOf(1);

      const clinics = workspaceList.find('div.workspace-item-clinic');
      expect(clinics).to.have.lengthOf(1);
      expect(clinics.at(0).text()).contains('new_clinic_name');
      expect(clinics.at(0).find('.notification-icon').hostNodes()).to.have.lengthOf(0);

      const invites = workspaceList.find('div.workspace-item-clinician_invitation');
      expect(invites).to.have.lengthOf(1);
      expect(invites.at(0).text()).contains('Example Health');
      expect(invites.at(0).find('.notification-icon').hostNodes()).to.have.lengthOf(1);
    });

    it('should allow a clinician to navigate to a clinic workspace', () => {
      const clinic = wrapper.find('div.workspace-item-clinic').at(0);
      const navigateButton = clinic.find('Button[variant="primary"]');
      expect(navigateButton).to.have.lengthOf(1);
      expect(navigateButton.text()).to.equal('Go To Workspace');

      store.clearActions();
      navigateButton.simulate('click');
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
          type: 'FETCH_CLINIC_PATIENT_COUNT_REQUEST',
        },
        {
          type: 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_REQUEST',
        },
        {
          type: 'FETCH_CLINIC_PATIENT_COUNT_SUCCESS',
          payload: {
            clinicId: 'clinicID456',
            patientCount: 3,
          },
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

    it('should allow a clinician to leave a clinic', () => {
      const clinic = wrapper.find('div.workspace-item-clinic').at(0);

      const deleteDialog = () => wrapper.find('Dialog');
      expect(deleteDialog()).to.have.lengthOf(1);
      expect(deleteDialog().props().open).to.be.false;

      const leaveButton = clinic.find('Button[variant="secondary"]');
      expect(leaveButton).to.have.lengthOf(1);
      expect(leaveButton.text()).to.equal('Leave Clinic');

      leaveButton.simulate('click');
      expect(deleteDialog().props().open).to.be.true;

      const dialogTitle = deleteDialog().find('#dialog-title').hostNodes();
      expect(dialogTitle).to.have.lengthOf(1);
      expect(dialogTitle.text()).to.equal('Leave new_clinic_name');

      const confirmLeaveButton = deleteDialog().find('Button[variant="danger"]');
      expect(confirmLeaveButton).to.have.lengthOf(1);
      expect(confirmLeaveButton.text()).to.equal('Leave Clinic');

      store.clearActions();
      confirmLeaveButton.simulate('click');
      expect(store.getActions()).to.eql([
        {
          type: 'DELETE_CLINICIAN_FROM_CLINIC_REQUEST',
        },
        {
          type: 'DELETE_CLINICIAN_FROM_CLINIC_SUCCESS',
          payload: {
            clinicId: 'clinicID456',
            clinicianId: 'clinicianUserId123',
          },
        },
      ]);
    });

    it('should prevent the last admin clinician from leaving a clinic', () => {
      wrapper = mountWrapper(mockStore(fetchedDataLastAdminState));
      const clinic = wrapper.find('div.workspace-item-clinic').at(0);

      const deleteDialog = () => wrapper.find('Dialog');
      expect(deleteDialog()).to.have.lengthOf(1);
      expect(deleteDialog().props().open).to.be.false;

      const leaveButton = clinic.find('Button[variant="secondary"]');
      expect(leaveButton).to.have.lengthOf(1);
      expect(leaveButton.text()).to.equal('Leave Clinic');

      leaveButton.simulate('click');
      expect(deleteDialog().props().open).to.be.true;

      const dialogTitle = deleteDialog().find('#dialog-title').hostNodes();
      expect(dialogTitle).to.have.lengthOf(1);
      expect(dialogTitle.text()).to.equal('Unable to leave new_clinic_name');

      const confirmLeaveButton = deleteDialog().find('Button[variant="danger"]');
      expect(confirmLeaveButton).to.have.lengthOf(0);

      const cancelLeaveButton = deleteDialog().find('Button[variant="secondary"]');
      expect(cancelLeaveButton).to.have.lengthOf(1);
      expect(cancelLeaveButton.text()).to.equal('OK');
    });

    it('should prevent the last admin clinician from leaving a clinic with invited clinic admins', () => {
      wrapper = mountWrapper(mockStore(fetchedDataLastAdminInvitedState));
      const clinic = wrapper.find('div.workspace-item-clinic').at(0);

      const deleteDialog = () => wrapper.find('Dialog');
      expect(deleteDialog()).to.have.lengthOf(1);
      expect(deleteDialog().props().open).to.be.false;

      const leaveButton = clinic.find('Button[variant="secondary"]');
      expect(leaveButton).to.have.lengthOf(1);
      expect(leaveButton.text()).to.equal('Leave Clinic');

      leaveButton.simulate('click');
      expect(deleteDialog().props().open).to.be.true;

      const dialogTitle = deleteDialog().find('#dialog-title').hostNodes();
      expect(dialogTitle).to.have.lengthOf(1);
      expect(dialogTitle.text()).to.equal('Unable to leave new_clinic_name');

      const confirmLeaveButton = deleteDialog().find('Button[variant="danger"]');
      expect(confirmLeaveButton).to.have.lengthOf(0);

      const cancelLeaveButton = deleteDialog().find('Button[variant="secondary"]');
      expect(cancelLeaveButton).to.have.lengthOf(1);
      expect(cancelLeaveButton.text()).to.equal('OK');
    });

    it('should allow a clinician to accept a clinic invite', () => {
      const invite = wrapper.find('div.workspace-item-clinician_invitation').at(0);
      const acceptButton = invite.find('Button[variant="primary"]');
      expect(acceptButton).to.have.lengthOf(1);
      expect(acceptButton.text()).to.equal('Accept Invite');

      store.clearActions();
      acceptButton.simulate('click');
      expect(store.getActions()).to.eql([
        {
          type: 'ACCEPT_CLINICIAN_INVITE_REQUEST',
        },
        {
          type: 'ACCEPT_CLINICIAN_INVITE_SUCCESS',
          payload: {
            inviteId: 'i5Ch7l27au7s4f9BHZCdnzA2qlH1qHnK',
          },
        },
      ]);
    });

    it('should allow a clinician to decline a clinic invite', () => {
      const invite = wrapper.find('div.workspace-item-clinician_invitation').at(0);

      const deleteDialog = () => wrapper.find('Dialog');
      expect(deleteDialog()).to.have.lengthOf(1);
      expect(deleteDialog().props().open).to.be.false;

      const declineButton = invite.find('Button[variant="secondary"]');
      expect(declineButton).to.have.lengthOf(1);
      expect(declineButton.text()).to.equal('Decline');

      declineButton.simulate('click');
      expect(deleteDialog().props().open).to.be.true;

      const dialogTitle = deleteDialog().find('#dialog-title').hostNodes();
      expect(dialogTitle).to.have.lengthOf(1);
      expect(dialogTitle.text()).to.equal('Decline Example Health');

      const confirmDeclineButton = deleteDialog().find('Button[variant="danger"]');
      expect(confirmDeclineButton).to.have.lengthOf(1);
      expect(confirmDeclineButton.text()).to.equal('Decline Invite');

      store.clearActions();
      confirmDeclineButton.simulate('click');
      expect(store.getActions()).to.eql([
        {
          type: 'DISMISS_CLINICIAN_INVITE_REQUEST',
        },
        {
          type: 'DISMISS_CLINICIAN_INVITE_SUCCESS',
          payload: {
            inviteId: 'i5Ch7l27au7s4f9BHZCdnzA2qlH1qHnK',
          },
        },
      ]);
    });

    it('should display an error and SSO link button if an IDP is required', () => {
      wrapper = mountWrapper(mockStore(fetchedIdpEmailMatchState));
      const invite = wrapper
        .find('div.workspace-item-clinician_invitation')
        .at(0);
      const acceptButton = invite.find('Button[variant="primary"]');
      expect(acceptButton).to.have.lengthOf(1);
      expect(acceptButton.text()).to.equal('Link Account');
      const error = wrapper.find('.workspace-error').hostNodes();
      expect(error.text()).to.equal(
        'Single Sign-On (SSO) is required to join this Clinic. Please link your account to enable SSO.'
      );
    });

    it('should display an error and disabled accept button if email mismatch', () => {
      wrapper = mountWrapper(mockStore(fetchedNoIdpEmailMismatchState));
      const invite = wrapper
        .find('div.workspace-item-clinician_invitation')
        .at(0);
      const acceptButton = invite.find('Button[variant="primary"]');
      expect(acceptButton).to.have.lengthOf(1);
      expect(acceptButton.text()).to.equal('Accept Invite');
      expect(acceptButton.props().disabled).to.be.true;
      const error = wrapper.find('.workspace-error').hostNodes();
      expect(error.text()).to.equal(
        "Your account doesn't satisfy the security requirements. Please contact this clinic's IT administrator."
      );
    });

    it('should set SSO enabled display state to false if it is true', () => {
      wrapper = mountWrapper(
        mockStore({
          blip: { ...fetchedClinicInvitesState.blip, ssoEnabledDisplay: true },
        })
      );

      expect(store.getActions()).to.eql([
        {
          type: 'SET_SSO_ENABLED_DISPLAY',
          payload: {
            value: false,
          },
        },
      ]);
    });
  });
});

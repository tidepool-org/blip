import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import ShareInvite from '../../../../app/pages/share/ShareInvite';
import * as sync from '../../../../app/redux/actions/sync';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ShareInvite', () => {
  describe('member invite', () => {
    let wrapper;
    const defaultProps = {
      trackMetric: sinon.stub(),
      t: sinon.stub().callsFake((string) => string),
      api: {
        clinics: {
          updatePatientPermissions: sinon.stub(),
          deletePatientFromClinic: sinon.stub(),
          deletePatientInvitation: sinon.stub(),
          get: sinon.stub(),
        },
        access: {
          setMemberPermissions: sinon.stub(),
          removeMember: sinon.stub(),
        },
        invitation: {
          cancel: sinon.stub(),
          send: sinon.stub(),
          resend: sinon.stub(),
        }
      },
      api: {
        invitation: {
          send: sinon.stub(),
        },
      },
    };

    const defaultWorkingState = {
      inProgress: false,
      completed: false,
      notification: null,
    };

    const completedState = {
      ...defaultWorkingState,
      completed: true,
    };

    const loggedInUserId = 'patient123';

    const state = {
      blip: {
        loggedInUserId,
        working: {
          sendingInvite: defaultWorkingState,
          fetchingClinic: defaultWorkingState,
          sendingClinicInvite: defaultWorkingState,
          fetchingClinicsByIds: defaultWorkingState,
          fetchingAssociatedAccounts: completedState,
          fetchingClinicsForPatient: completedState,
          fetchingPatient: completedState,
          fetchingPendingSentInvites: completedState,
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
            },
          },
          otherPatient123: {
            emails: ['existingShare@example.com'],
            roles: [],
            userid: 'otherPatient123',
            username: 'existingShare@example.com',
            profile: {
              fullName: 'Fooey McBear',
            },
          },
        },
        clinics: {
          clinicIDNotMember: {
            clinicians:{},
            patients: {},
            id: 'clinicIDNotMember',
            address: '2 Address Ln, City Zip',
            name: 'other_clinic_name',
            email: 'other_clinic_email_address@example.com',
          },
          clinicIDAmMember: {
            clinicians:{},
            patients: {
              [loggedInUserId]: {
                email: 'patient@example.com',
                id: loggedInUserId,
                permissions: { view: {}, upload: {} },
              },
            },
            id: 'clinicIDAmMember',
            address: '1 Address Ln, City Zip',
            name: 'new_clinic_name',
            email: 'new_clinic_email_address@example.com',
          },
        },
        membersOfTargetCareTeam: [
          'otherPatient123',
          'clinicianUserId123',
        ],
        permissionsOfMembersInTargetCareTeam: {
          otherPatient123: { view: {}, upload: {} },
          clinicianUserId123: { view: {}, upload: {} },
        },
        pendingSentInvites: [
          {
            clinicId: 'clinicIDNotMember',
            key: '123',
            context: { view: {} },
            status: 'pending',
            type: 'careteam_invitation',
          },
          {
            email: 'declinedShare@example.com',
            key: '456',
            context: { view: {}, upload: {} },
            status: 'declined',
            type: 'careteam_invitation',
          },
          {
            email: 'pendingShare@example.com',
            key: '789',
            context: { view: {}, upload: {} },
            status: 'pending',
            type: 'careteam_invitation',
          },
        ],
      },
    };

    let store;

    beforeEach(() => {
      store = mockStore(state);
      defaultProps.trackMetric.resetHistory();

      wrapper = render(
        <Provider store={store}>
          <ToastProvider>
            <ShareInvite {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should show an invite form with an email address field and an upload permissions checkbox', () => {
      const form = wrapper.container.querySelector('form#invite');
      expect(form).to.not.be.null;

      const emailField = wrapper.container.querySelector('input#email[type="text"]');
      expect(emailField).to.not.be.null;

      const permissionsCheckbox = wrapper.container.querySelector('input#uploadPermission[type="checkbox"]');
      expect(permissionsCheckbox).to.not.be.null;
    });

    it('should go back to main share page if cancel is clicked', () => {
      const cancelButton = wrapper.container.querySelector('button#cancel');
      expect(cancelButton).to.not.be.null;

      const expectedActions = [
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: [
              '/patients/patient123/share',
            ],
            method: 'push',
          },
        },
      ];

      fireEvent.click(cancelButton);
      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should submit an invitation if submit is clicked', async () => {
      const submitButton = () => wrapper.container.querySelector('button#submit');
      expect(submitButton()).to.not.be.null;
      expect(submitButton().disabled).to.be.true;

      const emailField = wrapper.container.querySelector('input#email[type="text"]');
      expect(emailField).to.not.be.null;

      const memberRadioSelect = wrapper.container.querySelector('input[name="type"][value="member"]');
      expect(memberRadioSelect).to.not.be.null;

      fireEvent.click(memberRadioSelect);

      // input bad email, submit remains disabled
      fireEvent.change(emailField, { target: { value: 'clint@foo'} });
      await waitFor(() => expect(submitButton().disabled).to.be.true);

      // input good email, submit becomes enabled
      fireEvent.change(emailField, { target: { value: 'clint@foo.com'} });
      await waitFor(() => expect(submitButton().disabled).to.be.false);

      // uploadPermission defaults to true, so upload permission is already enabled
      const permissionsCheckbox = wrapper.container.querySelector('input#uploadPermission[type="checkbox"]');
      expect(permissionsCheckbox).to.not.be.null;
      expect(permissionsCheckbox.checked).to.be.true;

      const expectedActions = [
        {
          type: 'SEND_INVITE_REQUEST',
        },
      ];

      fireEvent.submit(submitButton());
      
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        sinon.assert.calledWith(
          defaultProps.api.invitation.send,
          'clint@foo.com',
          { note: {}, upload: {}, view: {} }
        );
      });
    });

    it('should not allow submitting an invitation when existing invite or share exists on the entered email', async () => {
      const submitButton = () => wrapper.container.querySelector('button#submit');
      expect(submitButton()).to.not.be.null;
      expect(submitButton().disabled).to.be.true;

      const emailField = wrapper.container.querySelector('input#email[type="text"]');
      expect(emailField).to.not.be.null;

      const memberRadioSelect = wrapper.container.querySelector('input[name="type"][value="member"]');
      expect(memberRadioSelect).to.not.be.null;

      fireEvent.click(memberRadioSelect);

      // input existing pending share email, submit remains disabled
      fireEvent.change(emailField, { target: { value: 'pendingShare@example.com'} });
      await waitFor(() => expect(submitButton().disabled).to.be.true);

      // input existing care team member email, submit remains disabled
      fireEvent.change(emailField, { target: { value: 'existingShare@example.com'} });
      await waitFor(() => expect(submitButton().disabled).to.be.true);

      // input declined share email, submit should be enabled, to allow re-inviting a declined share
      fireEvent.change(emailField, { target: { value: 'declinedShare@example.com'} });
      await waitFor(() => expect(submitButton().disabled).to.be.false);
    });
  });

  describe('clinic invite', () => {
    const clinic = {
      id: 'clinic123',
      name: 'myClinic',
      shareCode: 'A2B2-C3D4-E5F6',
    };

    let wrapper;
    const defaultProps = {
      trackMetric: sinon.stub(),
      t: sinon.stub().callsFake((string) => string),
      api: {
        clinics: {
          inviteClinic: sinon.stub(),
          get: sinon.stub(),
          getClinicByShareCode: sinon.stub().callsArgWith(1, null, clinic),
        },
      },
    };

    const defaultWorkingState = {
      inProgress: false,
      completed: false,
      notification: null,
    };

    const completedState = {
      inProgress: false,
      completed: true,
      notification: null,
    };

    const loggedInUserId = 'patient123';

    const state = {
      blip: {
        loggedInUserId,
        working: {
          sendingClinicInvite: defaultWorkingState,
          fetchingClinic: defaultWorkingState,
          sendingInvite: defaultWorkingState,
          fetchingClinicsByIds: defaultWorkingState,
          fetchingAssociatedAccounts: completedState,
          fetchingClinicsForPatient: completedState,
          fetchingPatient: completedState,
          fetchingPendingSentInvites: completedState,
        },
        clinics: {
          clinicIDNotMember: {
            clinicians:{},
            patients: {},
            shareCode: '2222-2222-2222',
            id: 'clinicIDNotMember',
            address: '2 Address Ln, City Zip',
            name: 'other_clinic_name',
            email: 'other_clinic_email_address@example.com',
          },
          clinicIDNotMemberButPending: {
            clinicians:{},
            patients: {},
            shareCode: '4444-4444-4444',
            id: 'clinicIDNotMemberButPending',
            address: '2 Address Ln, City Zip',
            name: 'other_clinic_name',
            email: 'other_clinic_email_address@example.com',
          },
          clinicIDAmMember: {
            clinicians:{},
            patients: {
              [loggedInUserId]: {
                email: 'patient@example.com',
                id: loggedInUserId,
                permissions: { view: {}, upload: {} },
              },
            },
            shareCode: '3333-3333-3333',
            id: 'clinicIDAmMember',
            address: '1 Address Ln, City Zip',
            name: 'new_clinic_name',
            email: 'new_clinic_email_address@example.com',
          },
        },
        membersOfTargetCareTeam: [
          'otherPatient123',
          'clinicianUserId123',
        ],
        permissionsOfMembersInTargetCareTeam: {
          otherPatient123: { view: {}, upload: {} },
          clinicianUserId123: { view: {}, upload: {} },
        },
        pendingSentInvites: [
          {
            clinicId: 'clinicIDNotMemberButPending',
            key: '123',
            context: { view: {} },
            status: 'pending',
            type: 'careteam_invitation',
          },
          {
            email: 'declinedShare@example.com',
            key: '456',
            context: { view: {}, upload: {} },
            status: 'declined',
            type: 'careteam_invitation',
          },
          {
            email: 'pendingShare@example.com',
            key: '789',
            context: { view: {}, upload: {} },
            status: 'pending',
            type: 'careteam_invitation',
          },
        ],
      },
    };

    const clinicFetchedState = {
      blip: {
        loggedInUserId: 'patient123',
        working: {
          ...state.blip.working,
          fetchingClinic: completedState,
        },
        clinics: {
          clinic123: clinic,
        }
      },
    };

    let getStore;
    let store;

    beforeEach(() => {
      getStore = state => mockStore(state);
      store = getStore(state);
      defaultProps.trackMetric.resetHistory();

      wrapper = render(
        <Provider store={store}>
          <ToastProvider>
            <ShareInvite {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should show an invite form with a share code field', () => {
      const form = wrapper.container.querySelector('form#invite');
      expect(form).to.not.be.null;

      const shareCodeField = wrapper.container.querySelector('input#shareCode[type="text"]');
      expect(shareCodeField).to.not.be.null;
    });

    it('should go back to main share page if cancel is clicked', () => {
      const cancelButton = wrapper.container.querySelector('button#cancel');
      expect(cancelButton).to.not.be.null;

      const expectedActions = [
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: [
              '/patients/patient123/share',
            ],
            method: 'push',
          },
        },
      ];

      fireEvent.click(cancelButton);
      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should fetch clinic by share code, then submit an invitation', async () => {
      const submitButton = () => wrapper.container.querySelector('button#submit');
      expect(submitButton()).to.not.be.null;
      expect(submitButton().disabled).to.be.true;

      const shareCodeField = wrapper.container.querySelector('input#shareCode[type="text"]');
      expect(shareCodeField).to.not.be.null;

      // Clinic name field should not render until clinic is fetched; base permission checkbox always renders
      const clinicNameField = () => wrapper.container.querySelector('input#clinicName');
      const permissionsCheckbox = () => wrapper.container.querySelectorAll('input#uploadPermission[type="checkbox"]');
      expect(clinicNameField()).to.be.null;
      expect(permissionsCheckbox().length).to.equal(1);

      // input bad shareCode, submit remains disabled
      fireEvent.change(shareCodeField, { target: { value: 'foo' } });
      await waitFor(() => expect(submitButton().disabled).to.be.true);

      // input good shareCode, submit becomes enabled
      fireEvent.change(shareCodeField, { target: { value: clinic.shareCode } });
      await waitFor(() => expect(submitButton().disabled).to.be.false);

      let expectedActions = [
        {
          type: 'FETCH_CLINIC_REQUEST',
        },
        {
          type: 'FETCH_CLINIC_SUCCESS',
          payload: { clinic },
        },
      ];

      fireEvent.submit(submitButton());
      let actions = store.getActions();

      await waitFor(() => {
        expect(actions).to.eql(expectedActions);
        sinon.assert.calledWith(
          defaultProps.api.clinics.getClinicByShareCode,
          clinic.shareCode
        );
      });

      store.dispatch(sync.fetchClinicSuccess(clinic));

      const clinicFetchedStore = mockStore(clinicFetchedState);
      wrapper.rerender(
        <Provider store={clinicFetchedStore}>
          <ToastProvider>
            <ShareInvite {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      // clinic name and permissions fields should now be rendered
      expect(clinicNameField()).to.not.be.null;
      expect(permissionsCheckbox().length).to.equal(2);

      expect(clinicNameField().value).to.equal('myClinic');
      expect(clinicNameField().disabled).to.be.true;

      // uploadPermission defaults to true, it is already enabled
      expect(permissionsCheckbox()[0].checked).to.be.true;

      expectedActions = [
        {
          type: 'SEND_CLINIC_INVITE_REQUEST',
        },
      ];

      // Submit form to finalize invites
      fireEvent.submit(submitButton());
      actions = clinicFetchedStore.getActions();

      await waitFor(() => {
        expect(actions).to.eql(expectedActions);
        sinon.assert.calledWith(
          defaultProps.api.clinics.inviteClinic,
          'A2B2-C3D4-E5F6',
          { note: {}, upload: {}, view: {} },
          'patient123'
        );
      });
    });

    it('should not allow submitting an invitation using the share code of an existing or pending shared clinic', async () => {
      const submitButton = () => wrapper.container.querySelector('button#submit');
      expect(submitButton()).to.not.be.null;
      expect(submitButton().disabled).to.be.true;

      const shareCodeField = wrapper.container.querySelector('input#shareCode[type="text"]');
      expect(shareCodeField).to.not.be.null;

      // input shareCode of clinic which user is already a member of, submit remains disabled
      fireEvent.change(shareCodeField, { target: { value: '3333-3333-3333' } });
      await waitFor(() => expect(submitButton().disabled).to.be.true);

      // input shareCode of clinic to which user has a pending share invite extended, submit remains disabled
      fireEvent.change(shareCodeField, { target: { value: '4444-4444-4444' } });
      await waitFor(() => expect(submitButton().disabled).to.be.true);

      // input shareCode of clinic which user is not a member of, submit is enabled
      fireEvent.change(shareCodeField, { target: { value: '2222-2222-2222' } });
      await waitFor(() => expect(submitButton().disabled).to.be.false);
    });
  });
});


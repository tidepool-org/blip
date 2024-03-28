import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
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
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ShareInvite', () => {
  describe('member invite', () => {
    let mount;

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

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ShareInvite {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should show an invite form with an email address field and an upload permissions checkbox', () => {
      const form = wrapper.find('form#invite');
      expect(form).to.have.length(1);

      const emailField = wrapper.find('input#email[type="text"]');
      expect(emailField).to.have.length(1);

      const permissionsCheckbox = wrapper.find('input#uploadPermission[type="checkbox"]');
      expect(permissionsCheckbox).to.have.length(1);
    });

    it('should go back to main share page if cancel is clicked', () => {
      const cancelButton = wrapper.find('button#cancel');
      expect(cancelButton).to.have.length(1);

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

      cancelButton.props().onClick();
      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should sumbit an invitation if submit is clicked', (done) => {
      const submitButton = () => wrapper.find('button#submit');
      expect(submitButton()).to.have.length(1);
      expect(submitButton().prop('disabled')).to.be.true;

      const emailField = wrapper.find('input#email[type="text"]');
      expect(emailField).to.have.length(1);

      const memberRadioSelect = wrapper.find('input[name="type"][value="member"]');
      expect(memberRadioSelect).to.have.length(1);

      memberRadioSelect.simulate('change', {target: { name: 'type', checked: true, value: 'member'}});

      // input bad email, submit remains disabled
      emailField.simulate('change', { target: { id: 'email', value: 'clint@foo'} })
      expect(submitButton().prop('disabled')).to.be.true;

      // input good email, submit becomes enabled
      emailField.simulate('change', { target: { id: 'email', value: 'clint@foo.com'} });
      expect(submitButton().prop('disabled')).to.be.false;

      // enable upload permission
      const permissionsCheckbox = wrapper.find('input#uploadPermission[type="checkbox"]');
      permissionsCheckbox.simulate('change', {
        target: { id: 'uploadPermission', value: true },
      });

      const expectedActions = [
        {
          type: 'SEND_INVITE_REQUEST',
        },
      ];

      submitButton().simulate('submit');
      const actions = store.getActions();

      // Formik submissions are async, so need to wrap in a timeout and call done()
      window.setTimeout(() => {
        expect(actions).to.eql(expectedActions);
        sinon.assert.calledWith(
          defaultProps.api.invitation.send,
          'clint@foo.com',
          { note: {}, upload: {}, view: {} }
        );
        done();
      }, 0);
    });

    it('should not allow sumbitting an invitation existing invite or share exists on the entered email', () => {
      const submitButton = () => wrapper.find('button#submit');
      expect(submitButton()).to.have.length(1);
      expect(submitButton().prop('disabled')).to.be.true;

      const emailField = wrapper.find('input#email[type="text"]');
      expect(emailField).to.have.length(1);

      const memberRadioSelect = wrapper.find('input[name="type"][value="member"]');
      expect(memberRadioSelect).to.have.length(1);

      memberRadioSelect.simulate('change', {target: { name: 'type', checked: true, value: 'member'}});

      // input existing pending share email, submit remains disabled
      emailField.simulate('change', { target: { id: 'email', value: 'pendingShare@example.com'} });
      expect(submitButton().prop('disabled')).to.be.true;

      // input existing care team member email, submit remains disabled
      emailField.simulate('change', { target: { id: 'email', value: 'existingShare@example.com'} });
      expect(submitButton().prop('disabled')).to.be.true;

      // input declined share email, submit should be enabled, to allow re-inviting a declined share
      emailField.simulate('change', { target: { id: 'email', value: 'declinedShare@example.com'} });
      expect(submitButton().prop('disabled')).to.be.false;
    });
  });

  describe('clinic invite', () => {
    let mount;

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

    beforeEach(() => {
      getStore = state => mockStore(state);
      defaultProps.trackMetric.resetHistory();

      wrapper = mount(
        <Provider store={getStore(state)}>
          <ToastProvider>
            <ShareInvite {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should show an invite form with a share code field', () => {
      const form = wrapper.find('form#invite');
      expect(form).to.have.length(1);

      const shareCodeField = wrapper.find('input#shareCode[type="text"]');
      expect(shareCodeField).to.have.length(1);
    });

    it('should go back to main share page if cancel is clicked', () => {
      const cancelButton = wrapper.find('button#cancel');
      expect(cancelButton).to.have.length(1);

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

      cancelButton.props().onClick();
      const store = wrapper.props().store;
      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should fetch clinic by share code, then submit an invitation', (done) => {
      const submitButton = () => wrapper.find('button#submit');
      expect(submitButton()).to.have.length(1);
      expect(submitButton().prop('disabled')).to.be.true;

      const shareCodeField = wrapper.find('input#shareCode[type="text"]');
      expect(shareCodeField).to.have.length(1);

      // Clinic name field and permission checkbox should not render by default until clinic is fetched
      const clinicNameField = () => wrapper.find('input#clinicName');
      const permissionsCheckbox = () => wrapper.find('input#uploadPermission[type="checkbox"]');
      expect(clinicNameField()).to.have.length(0);
      expect(permissionsCheckbox()).to.have.length(1);

      // input bad shareCode, submit remains disabled
      shareCodeField.simulate('change', { target: { id: 'shareCode', value: 'foo' } });
      expect(submitButton().prop('disabled')).to.be.true;

      // input good shareCode, submit becomes enabled
      shareCodeField.simulate('change', { target: { id: 'shareCode', value: clinic.shareCode } });
      expect(submitButton().prop('disabled')).to.be.false;

      let expectedActions = [
        {
          type: 'FETCH_CLINIC_REQUEST',
        },
        {
          type: 'FETCH_CLINIC_SUCCESS',
          payload: { clinic },
        },
      ];

      submitButton().simulate('submit');
      let store = wrapper.props().store;
      let actions = store.getActions();

      // Formik submissions are async, so need to wrap in a timeout
      window.setTimeout(() => {
        expect(actions).to.eql(expectedActions);
        sinon.assert.calledWith(
          defaultProps.api.clinics.getClinicByShareCode,
          clinic.shareCode
        );

        store.dispatch(sync.fetchClinicSuccess(clinic));

        wrapper.setProps({store: getStore(clinicFetchedState)});
        store = wrapper.props().store;
        wrapper.update();


        // clinic name and permissions fields should now be rendered
        expect(clinicNameField()).to.have.length(1);
        expect(permissionsCheckbox()).to.have.length(2);

        expect(clinicNameField().props().value).to.equal('myClinic');
        expect(clinicNameField().props().disabled).to.be.true;

        // enable upload permission
        permissionsCheckbox().at(0).simulate('change', {
          target: { id: 'uploadPermission', value: true },
        });

        expectedActions = [
          {
            type: 'SEND_CLINIC_INVITE_REQUEST',
          },
        ];

        // Submit form to finalize invites
        submitButton().simulate('submit');
        actions = store.getActions();

        // Formik submissions are async, so need to wrap in a timeout and call done()
        window.setTimeout(() => {
          expect(actions).to.eql(expectedActions);
          sinon.assert.calledWith(
            defaultProps.api.clinics.inviteClinic,
            'A2B2-C3D4-E5F6',
            { note: {}, upload: {}, view: {} },
            'patient123'
          );
          done();
        }, 0);
      }, 0);
    });

    it('should not allow sumbitting an invitation using the share code of an existing or pending shared clinic', () => {
      const submitButton = () => wrapper.find('button#submit');
      expect(submitButton()).to.have.length(1);
      expect(submitButton().prop('disabled')).to.be.true;

      const shareCodeField = wrapper.find('input#shareCode[type="text"]');
      expect(shareCodeField).to.have.length(1);

      // input shareCode of clinic which user is already a member of, submit remains disabled
      shareCodeField.simulate('change', { target: { id: 'shareCode', value: '3333-3333-3333' } });
      expect(submitButton().prop('disabled')).to.be.true;

      // input shareCode of clinic to which user has a pending share invite extended, submit remains disabled
      shareCodeField.simulate('change', { target: { id: 'shareCode', value: '4444-4444-4444' } });
      expect(submitButton().prop('disabled')).to.be.true;

      // input shareCode of clinic which user is not a member of, submit is enabled
      shareCodeField.simulate('change', { target: { id: 'shareCode', value: '2222-2222-2222' } });
      expect(submitButton().prop('disabled')).to.be.false;
    });
  });
});


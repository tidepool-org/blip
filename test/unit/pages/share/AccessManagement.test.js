import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import Table from '../../../../app/components/elements/Table';
import AccessManagement from '../../../../app/pages/share/AccessManagement';
import { Dialog } from '../../../../app/components/elements/Dialog';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('AccessManagement', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        updatePatientPermissions: sinon.stub(),
        deletePatientFromClinic: sinon.stub(),
        deletePatientInvitation: sinon.stub(),
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
  };

  before(() => {
    mount = createMount();
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.access.setMemberPermissions.resetHistory();
    defaultProps.api.access.removeMember.resetHistory();
    defaultProps.api.invitation.cancel.resetHistory();
    defaultProps.api.invitation.resend.resetHistory();
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

  const blipState = {
    blip: {
      loggedInUserId,
      working: {
        fetchingAssociatedAccounts: completedState,
        fetchingClinicsForPatient: completedState,
        fetchingPatient: completedState,
        fetchingPendingSentInvites: completedState,
        cancellingSentInvite: defaultWorkingState,
        deletingPatientInvitation: defaultWorkingState,
        deletingPatientFromClinic: defaultWorkingState,
        fetchingClinicsByIds: defaultWorkingState,
        removingMemberFromTargetCareTeam: defaultWorkingState,
        resendingInvite: defaultWorkingState,
        settingMemberPermissions: defaultWorkingState,
        sendingInvite: defaultWorkingState,
        updatingPatientPermissions: defaultWorkingState,
      },
    },
  };

  let store;

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
        otherPatient123: {
          emails: ['otherpatient@example.com'],
          roles: [],
          userid: 'otherPatient123',
          username: 'otherpatient@example.com',
          profile: {
            fullName: 'Fooey McBear',
          },
        },
      },
      clinics: {
        clinicID123: {
          clinicians:{},
          patients: {},
          id: 'clinicID123',
          address: '2 Address Ln, City Zip',
          name: 'other_clinic_name',
          email: 'other_clinic_email_address@example.com',
          phoneNumbers: [
            {
              number: '(888) 444-4444',
              type: 'Office',
            },
          ],
        },
        clinicID456: {
          clinicians:{},
          patients: {
            [loggedInUserId]: {
              email: 'patient@example.com',
              id: loggedInUserId,
              permissions: { view: {}, upload: {} },
            },
          },
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
      membersOfTargetCareTeam: [
        'otherPatient123',
        'clinicianUserId123'
      ],
      permissionsOfMembersInTargetCareTeam: {
        otherPatient123: { view: {}, upload: {} },
        clinicianUserId123: { view: {}, upload: {} },
      },
      pendingSentInvites: [
        {
          clinicId: 'clinicID123',
          key: '123',
          context: { view: {} },
          status: 'pending',
          type: 'careteam_invitation',
        },
        {
          email: 'yetanotherpatient@example.com',
          key: '456',
          context: { view: {}, upload: {} },
          status: 'declined',
          type: 'careteam_invitation',
        },
        {
          email: 'pendingpatient@example.com',
          key: '789',
          context: { view: {}, upload: {} },
          status: 'pending',
          type: 'careteam_invitation',
        },
      ],
    },
  });

  beforeEach(() => {
    store = mockStore(blipState);
    defaultProps.trackMetric.resetHistory();
    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <AccessManagement {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  it('should render a Share Data button', () => {
    const inviteButton = wrapper.find('button#invite');
    expect(inviteButton).to.have.length(1);
    expect(inviteButton.text()).to.equal('Share Data');
    expect(inviteButton.props().onClick).to.be.a('function');

    const expectedActions = [
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: [
            `/patients/${loggedInUserId}/share/invite`,
          ],
          method: 'push',
        },
      },
    ];

    inviteButton.props().onClick();
    const actions = store.getActions();
    expect(actions).to.eql(expectedActions);
  });

  it('should not render an empty Table with no data', () => {
    const table = wrapper.find(Table);
    expect(table).to.have.length(0);
    expect(wrapper.find('#member-invites-label').hostNodes().text()).to.equal('You have not invited any other members to view your data.');
  });

  context('table has data', () => {
    beforeEach(() => {
      store = mockStore(fetchedDataState);
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <AccessManagement {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    })

    it('should render a Table when data is available', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(7); // data (member, clinician + clinic share, 2 member + clinic invites) + header
      expect(table.find('td')).to.have.length(24);
    });

    it('should render a "More" icon that opens a popover menu', () => {
      const table = () => wrapper.find(Table)

      const accountRow = () => table().find('tr').at(1);

      const popoverMenu = () => accountRow().find('PopoverMenu');
      expect(popoverMenu()).to.have.length(1);

      const popover = () => popoverMenu().find('Popover');
      expect(popover()).to.have.length(1);
      expect(popover().prop('open')).to.be.false;

      popoverMenu().find('button').at(0).simulate('click');
      expect(popover().prop('open')).to.be.true;
    });

    it('should render appropriate popover actions for a classic clinic team member', () => {
      const table = wrapper.find(Table)

      const accountRow = table.find('tr').at(1);
      expect(accountRow.text()).contains('Example Clinic').and.contains('clinician');

      const popoverMenu = accountRow.find('PopoverMenu');
      expect(popoverMenu).to.have.length(1);
      const popoverActionButtons = popoverMenu.find('button.action-list-item');
      expect(popoverActionButtons).to.have.length(2)

      const expectedActions = [
        {
          type: 'SET_MEMBER_PERMISSIONS_REQUEST',
        },
        {
          type: 'REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST',
        },
      ];

      const actions = () => store.getActions();

      // Click upload permissions toggle
      expect(popoverActionButtons.at(0).text()).contains('Remove upload permission');
      popoverActionButtons.at(0).props().onClick();
      expect(actions()[0]).to.eql(expectedActions[0]);

      sinon.assert.calledWith(
        defaultProps.api.access.setMemberPermissions,
        'clinicianUserId123',
        { upload: undefined, view: {} }
      );

      // Click remove account button to open confirmation modal
      expect(popoverActionButtons.at(1).text()).contains('Remove account');
      expect(wrapper.find(Dialog).at(0).props().open).to.be.false;
      popoverActionButtons.at(1).props().onClick();
      wrapper.update();
      expect(wrapper.find(Dialog).at(0).props().open).to.be.true;

      // Confirm delete in modal
      const deleteButton = wrapper.find('button.remove-account-access');
      expect(deleteButton).to.have.length(1);
      deleteButton.props().onClick();
      expect(actions()[1]).to.eql(expectedActions[1]);

      sinon.assert.calledWith(
        defaultProps.api.access.removeMember,
        'clinicianUserId123',
      );
    });

    it('should render appropriate popover actions for a care team member', () => {
      const table = wrapper.find(Table)

      const accountRow = table.find('tr').at(2);
      expect(accountRow.text()).contains('Fooey McBear').and.contains('member').and.contains('sharing');

      const popoverMenu = accountRow.find('PopoverMenu');
      expect(popoverMenu).to.have.length(1);
      const popoverActionButtons = popoverMenu.find('button.action-list-item');
      expect(popoverActionButtons).to.have.length(2)

      const expectedActions = [
        {
          type: 'SET_MEMBER_PERMISSIONS_REQUEST',
        },
        {
          type: 'REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST',
        },
      ];

      const actions = () => store.getActions();

      // Click upload permissions toggle
      expect(popoverActionButtons.at(0).text()).contains('Remove upload permission');
      popoverActionButtons.at(0).props().onClick();
      expect(actions()[0]).to.eql(expectedActions[0]);

      sinon.assert.calledWith(
        defaultProps.api.access.setMemberPermissions,
        'otherPatient123',
        { upload: undefined, view: {} }
      );

      // Click remove account button to open confirmation modal
      expect(popoverActionButtons.at(1).text()).contains('Remove account');
      expect(wrapper.find(Dialog).at(0).props().open).to.be.false;
      popoverActionButtons.at(1).props().onClick();
      wrapper.update();
      expect(wrapper.find(Dialog).at(0).props().open).to.be.true;

      // Confirm delete in modal
      const deleteButton = wrapper.find('button.remove-account-access');
      expect(deleteButton).to.have.length(1);
      deleteButton.props().onClick();
      expect(actions()[1]).to.eql(expectedActions[1]);

      sinon.assert.calledWith(
        defaultProps.api.access.removeMember,
        'otherPatient123',
      );
    });

    it('should render appropriate popover actions for a pending care team invitation', () => {
      const table = wrapper.find(Table)

      const accountRow = table.find('tr').at(5);
      expect(accountRow.text()).contains('pendingpatient@example.com').and.contains('invite sent').and.contains('member');

      const popoverMenu = accountRow.find('PopoverMenu');
      expect(popoverMenu).to.have.length(1);
      const popoverActionButtons = popoverMenu.find('button.action-list-item');
      expect(popoverActionButtons).to.have.length(2)

      const expectedActions = [
        {
          type: 'RESEND_INVITE_REQUEST',
        },
        {
          type: 'CANCEL_SENT_INVITE_REQUEST',
        },
      ];

      const actions = () => store.getActions();

      // Click resent invitation button to open confirmation modal
      expect(popoverActionButtons.at(0).text()).contains('Resend Invite');
      expect(wrapper.find(Dialog).at(1).props().open).to.be.false;
      popoverActionButtons.at(0).props().onClick();
      wrapper.update()
      expect(wrapper.find(Dialog).at(1).props().open).to.be.true;

      // Confirm resend invitation in modal
      const resendButton = wrapper.find('button.resend-invitation');
      expect(resendButton).to.have.length(1);
      resendButton.props().onClick();
      expect(actions()[0]).to.eql(expectedActions[0]);

      sinon.assert.calledWith(
        defaultProps.api.invitation.resend,
        '789'
      );

      // Click Revoke Invite button to open confirmation modal
      expect(popoverActionButtons.at(1).text()).contains('Revoke Invite');
      expect(wrapper.find(Dialog).at(0).props().open).to.be.false;
      popoverActionButtons.at(1).props().onClick();
      wrapper.update();
      expect(wrapper.find(Dialog).at(0).props().open).to.be.true;

      // Confirm delete in modal
      const deleteButton = wrapper.find('button.remove-account-access');
      expect(deleteButton).to.have.length(1);
      deleteButton.props().onClick();
      expect(actions()[1]).to.eql(expectedActions[1]);

      sinon.assert.calledWith(
        defaultProps.api.invitation.cancel,
        'pendingpatient@example.com',
      );
    });

    it('should render appropriate popover actions for a declined care team invitation', () => {
      const table = wrapper.find(Table)

      const accountRow = table.find('tr').at(6);
      expect(accountRow.text()).contains('yetanotherpatient@example.com').and.contains('invite declined').and.contains('member');

      const popoverMenu = accountRow.find('PopoverMenu');
      expect(popoverMenu).to.have.length(1);
      const popoverActionButtons = popoverMenu.find('button.action-list-item');
      expect(popoverActionButtons).to.have.length(1)

      const expectedActions = [
        {
          type: 'CANCEL_SENT_INVITE_REQUEST',
        },
      ];

      const actions = () => store.getActions();

      // Click Revoke Invite button to open confirmation modal
      expect(popoverActionButtons.at(0).text()).contains('Revoke Invite');
      expect(wrapper.find(Dialog).at(0).props().open).to.be.false;
      popoverActionButtons.at(0).props().onClick();
      wrapper.update();
      expect(wrapper.find(Dialog).at(0).props().open).to.be.true;

      // Confirm delete in modal
      const deleteButton = wrapper.find('button.remove-account-access');
      expect(deleteButton).to.have.length(1);
      deleteButton.props().onClick();
      expect(actions()[0]).to.eql(expectedActions[0]);

      sinon.assert.calledWith(
        defaultProps.api.invitation.cancel,
        'yetanotherpatient@example.com',
      );
    });

    it('should render appropriate popover actions for a clinic member', () => {
      const table = wrapper.find(Table)

      const accountRow = table.find('tr').at(3);
      expect(accountRow.text()).contains('new_clinic_name').and.contains('clinic');

      const popoverMenu = accountRow.find('PopoverMenu');
      expect(popoverMenu).to.have.length(1);
      const popoverActionButtons = popoverMenu.find('button.action-list-item');
      expect(popoverActionButtons).to.have.length(2)

      const expectedActions = [
        {
          type: 'UPDATE_PATIENT_PERMISSIONS_REQUEST',
        },
        {
          type: 'DELETE_PATIENT_FROM_CLINIC_REQUEST',
        },
      ];

      const actions = () => store.getActions();

      // Click upload permissions toggle
      expect(popoverActionButtons.at(0).text()).contains('Remove upload permission');
      popoverActionButtons.at(0).props().onClick();
      expect(actions()[0]).to.eql(expectedActions[0]);

      sinon.assert.calledWith(
        defaultProps.api.clinics.updatePatientPermissions,
        'clinicID456',
        'patient123',
        { upload: undefined, view: {} }
      );

      // Click remove account button to open confirmation modal
      expect(popoverActionButtons.at(1).text()).contains('Remove clinic');
      expect(wrapper.find(Dialog).at(0).props().open).to.be.false;
      popoverActionButtons.at(1).props().onClick();
      wrapper.update();
      expect(wrapper.find(Dialog).at(0).props().open).to.be.true;

      // Confirm delete in modal
      const deleteButton = wrapper.find('button.remove-account-access');
      expect(deleteButton).to.have.length(1);
      deleteButton.props().onClick();
      expect(actions()[1]).to.eql(expectedActions[1]);

      sinon.assert.calledWith(
        defaultProps.api.clinics.deletePatientFromClinic,
        'clinicID456',
        'patient123',
      );
    });

    it('should render appropriate popover actions for a clinic invitation', () => {
      const table = wrapper.find(Table)

      const accountRow = table.find('tr').at(4);
      expect(accountRow.text()).contains('other_clinic_name').and.contains('invite sent').and.contains('clinic');

      const popoverMenu = accountRow.find('PopoverMenu');
      expect(popoverMenu).to.have.length(1);
      const popoverActionButtons = popoverMenu.find('button.action-list-item');
      expect(popoverActionButtons).to.have.length(1)

      const expectedActions = [
        {
          type: 'CANCEL_SENT_INVITE_REQUEST',
        },
      ];

      const actions = () => store.getActions();

      // Click Revoke Invite button to open confirmation modal
      expect(popoverActionButtons.at(0).text()).contains('Revoke Invite');
      expect(wrapper.find(Dialog).at(0).props().open).to.be.false;
      popoverActionButtons.at(0).props().onClick();
      wrapper.update();
      expect(wrapper.find(Dialog).at(0).props().open).to.be.true;

      // Confirm delete in modal
      const deleteButton = wrapper.find('button.remove-account-access');
      expect(deleteButton).to.have.length(1);
      deleteButton.props().onClick();
      expect(actions()[1]).to.eql(expectedActions[1]);

      sinon.assert.calledWith(
        defaultProps.api.clinics.deletePatientInvitation,
        'clinicID123',
        '123'
      );
    });
  });
});

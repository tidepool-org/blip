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
      },
      access: {
        setMemberPermissions: sinon.stub(),
        removeMember: sinon.stub(),
      },
      invitation: {
        cancel: sinon.stub(),
        send: sinon.stub(),
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
    defaultProps.api.invitation.send.resetHistory();
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
        fetchingClinicsByIds: defaultWorkingState,
        removingMemberFromTargetCareTeam: defaultWorkingState,
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
        'otherPatient123'
      ],
      permissionsOfMembersInTargetCareTeam: {
        otherPatient123: { view: {}, upload: {} },
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

  it('should render an Invite New Member button', () => {
    const inviteButton = wrapper.find('button#invite-member');
    expect(inviteButton).to.have.length(1);
    expect(inviteButton.text()).to.equal('Invite new member');
    expect(inviteButton.props().onClick).to.be.a('function');

    const expectedActions = [
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: [
            `/patients/${loggedInUserId}/share/member`,
          ],
          method: 'push',
        },
      },
    ];

    inviteButton.props().onClick();
    const actions = store.getActions();
    expect(actions).to.eql(expectedActions);
  });

  it('should render an Invite New Clinic button', () => {
    const inviteButton = wrapper.find('button#invite-clinic');
    expect(inviteButton).to.have.length(1);
    expect(inviteButton.text()).to.equal('Invite new clinic');
    expect(inviteButton.props().onClick).to.be.a('function');

    const expectedActions = [
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: [
            `/patients/${loggedInUserId}/share/clinic`,
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
      expect(table.find('tr')).to.have.length(5); // data (member + clinic share, member + clinic invite) + header
      expect(table.find('td')).to.have.length(16);
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

    it('should render appropriate popover actions for a care team member', () => {
      const table = wrapper.find(Table)

      const accountRow = table.find('tr').at(1);
      expect(accountRow.text()).contains('Fooey McBear').and.contains('member');

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
        { note: {}, upload: undefined, view: {} }
      );

      // Click remove account button to open confirmation modal
      expect(popoverActionButtons.at(1).text()).contains('Remove account');
      expect(wrapper.find(Dialog).props().open).to.be.false;
      popoverActionButtons.at(1).props().onClick();
      wrapper.update();
      expect(wrapper.find(Dialog).props().open).to.be.true;

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

    it('should render appropriate popover actions for a care team invitation', () => {
      const table = wrapper.find(Table)

      const accountRow = table.find('tr').at(4);
      expect(accountRow.text()).contains('yetanotherpatient@example.com').and.contains('member');

      const popoverMenu = accountRow.find('PopoverMenu');
      expect(popoverMenu).to.have.length(1);
      const popoverActionButtons = popoverMenu.find('button.action-list-item');
      expect(popoverActionButtons).to.have.length(2)

      const expectedActions = [
        {
          type: 'SEND_INVITE_REQUEST',
        },
        {
          type: 'CANCEL_SENT_INVITE_REQUEST',
        },
      ];

      const actions = () => store.getActions();

      // Click resent invitation button
      expect(popoverActionButtons.at(0).text()).contains('Resend invitation');
      popoverActionButtons.at(0).props().onClick();
      expect(actions()[0]).to.eql(expectedActions[0]);

      sinon.assert.calledWith(
        defaultProps.api.invitation.send,
        'yetanotherpatient@example.com',
<<<<<<< HEAD
        { upload: {}, view: {} },
=======
        { upload: {  }, view: {  } },
>>>>>>> 90f3bf4130fa893a78c915ffd5e90a4517de0194
        '456'
      );

      // Click delete invitation button to open confirmation modal
      expect(popoverActionButtons.at(1).text()).contains('Revoke invitation');
      expect(wrapper.find(Dialog).props().open).to.be.false;
      popoverActionButtons.at(1).props().onClick();
      wrapper.update();
      expect(wrapper.find(Dialog).props().open).to.be.true;

      // Confirm delete in modal
      const deleteButton = wrapper.find('button.remove-account-access');
      expect(deleteButton).to.have.length(1);
      deleteButton.props().onClick();
      expect(actions()[1]).to.eql(expectedActions[1]);

      sinon.assert.calledWith(
        defaultProps.api.invitation.cancel,
        'yetanotherpatient@example.com',
      );
    });
  });
});

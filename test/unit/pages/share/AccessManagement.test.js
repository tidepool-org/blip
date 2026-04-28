import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import AccessManagement from '../../../../app/pages/share/AccessManagement';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('AccessManagement', () => {
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

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.access.setMemberPermissions.resetHistory();
    defaultProps.api.access.removeMember.resetHistory();
    defaultProps.api.invitation.cancel.resetHistory();
    defaultProps.api.invitation.resend.resetHistory();
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
    wrapper = render(
      <Provider store={store}>
        <ToastProvider>
          <AccessManagement {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  it('should render a Share Data button', () => {
    const inviteButton = wrapper.container.querySelector('button#invite');
    expect(inviteButton).to.not.be.null;
    expect(inviteButton.textContent).to.equal('Share Data');

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

    fireEvent.click(inviteButton);
    const actions = store.getActions();
    expect(actions).to.eql(expectedActions);
  });

  it('should not render an empty Table with no data', () => {
    const table = wrapper.container.querySelector('table');
    expect(table).to.be.null;
    expect(wrapper.container.querySelector('#member-invites-label').textContent).to.equal('You have not invited any other members to view your data.');
  });

  // Helper: click the PopoverMenu trigger icon in a specific row and return visible action button elements
  const openRowMenu = async (row) => {
    // PopoverMenu trigger: Icon with label="Access Management actions" (overrides default label="info")
    // These buttons are inside wrapper.container as part of the table rows
    const allTriggers = Array.from(wrapper.container.querySelectorAll('[aria-label="Access Management actions"]'));
    const rows = Array.from(wrapper.container.querySelectorAll('table tr'));
    const rowIndex = rows.indexOf(row);
    // Data rows start at index 1 (row 0 is header), so trigger index matches rowIndex - 1
    expect(rowIndex, `row not found in table rows (rows.length=${rows.length})`).to.not.equal(-1);
    expect(rowIndex - 1, `rowIndex ${rowIndex} yields a negative trigger index — row must be a data row (index >= 1)`).to.be.at.least(0);
    expect(rowIndex - 1, `rowIndex ${rowIndex} is out of bounds for allTriggers (length=${allTriggers.length})`).to.be.below(allTriggers.length);
    const triggerIcon = allTriggers[rowIndex - 1];
    expect(triggerIcon, `triggerIcon not found at allTriggers[${rowIndex - 1}] (allTriggers.length=${allTriggers.length})`).to.exist;
    fireEvent.click(triggerIcon);
    // Return a function that always re-queries fresh action buttons from the open popover
    // MUI Popover with keepMounted: items are always in DOM, visibility changes on open
    const getActionButtons = () => {
      const allPopovers = Array.from(document.querySelectorAll('[id="access-management-actions"]'));
      const openPopover = allPopovers.find(p => {
        const style = p.getAttribute('style') || '';
        return !style.includes('visibility: hidden') && p.getAttribute('aria-hidden') !== 'true';
      });
      return openPopover ? Array.from(openPopover.querySelectorAll('.action-list-item')) : [];
    };
    await waitFor(() => {
      expect(getActionButtons().length).to.be.at.least(1);
    });
    return getActionButtons;
  };

  context('table has data', () => {
    afterEach(() => {
      cleanup();
    });

    beforeEach(() => {
      cleanup(); // clean up outer beforeEach render before rendering with data
      store = mockStore(fetchedDataState);
      defaultProps.api.access.setMemberPermissions.resetHistory();
      defaultProps.api.access.removeMember.resetHistory();
      defaultProps.api.clinics.updatePatientPermissions.resetHistory();
      defaultProps.api.clinics.deletePatientFromClinic.resetHistory();
      defaultProps.api.clinics.deletePatientInvitation.resetHistory();
      defaultProps.api.invitation.cancel.resetHistory();
      defaultProps.api.invitation.resend.resetHistory();
      wrapper = render(
        <Provider store={store}>
          <ToastProvider>
            <AccessManagement {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render a Table when data is available', () => {
      const table = wrapper.container.querySelector('table');
      expect(table).to.not.be.null;
      const rows = wrapper.container.querySelectorAll('table tr');
      expect(rows.length).to.equal(7);
      const cells = wrapper.container.querySelectorAll('table td');
      expect(cells.length).to.equal(24);
      const triggers = wrapper.container.querySelectorAll('[aria-label="Access Management actions"]');
      expect(triggers.length).to.equal(6); // one per data row
    });

    it('should render a "More" icon that opens a popover menu', async () => {
      // Trigger buttons are inside wrapper.container with aria-label="Access Management actions"
      const allTriggers = wrapper.container.querySelectorAll('[aria-label="Access Management actions"]');
      const triggerIcon = allTriggers[0]; // first data row trigger
      expect(triggerIcon).to.not.be.null;

      fireEvent.click(triggerIcon);

      await waitFor(() => {
        const popovers = Array.from(document.querySelectorAll('[id="access-management-actions"]'));
        const open = popovers.find(p => p.getAttribute('aria-hidden') !== 'true');
        expect(open).to.not.be.undefined;
        const items = open.querySelectorAll('.action-list-item');
        expect(items.length).to.be.at.least(1);
      });
    });

    it('should render appropriate popover actions for a classic clinic team member', async () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      const accountRow = rows[1];
      expect(accountRow.textContent).to.include('Example Clinic');
      expect(accountRow.textContent).to.include('clinician');

      const actions = () => store.getActions();

      const getActionButtons = await openRowMenu(accountRow);
      expect(getActionButtons().length).to.equal(2);

      expect(getActionButtons()[0].textContent).to.include('Remove upload permission');
      fireEvent.click(getActionButtons()[0]);
      expect(actions()[0].type).to.equal('SET_MEMBER_PERMISSIONS_REQUEST');

      sinon.assert.calledWith(
        defaultProps.api.access.setMemberPermissions,
        'clinicianUserId123',
        { upload: undefined, view: {} }
      );

      // Click Remove Care Team Member button to open confirmation modal
      expect(getActionButtons()[1].textContent).to.include('Remove Care Team Member');
      fireEvent.click(getActionButtons()[1]);

      await waitFor(() => {
        expect(document.body.querySelector('button.remove-account-access')).to.not.be.null;
      });

      const confirmBtn = document.body.querySelector('button.remove-account-access');
      fireEvent.click(confirmBtn);
      expect(actions()[1].type).to.equal('REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST');

      sinon.assert.calledWith(
        defaultProps.api.access.removeMember,
        'clinicianUserId123',
      );
    });

    it('should render appropriate popover actions for a care team member', async () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      const accountRow = rows[2];
      expect(accountRow.textContent).to.include('Fooey McBear');
      expect(accountRow.textContent).to.include('member');

      const actions = () => store.getActions();

      const getActionButtons = await openRowMenu(accountRow);
      expect(getActionButtons().length).to.equal(2);

      expect(getActionButtons()[0].textContent).to.include('Remove upload permission');
      fireEvent.click(getActionButtons()[0]);
      expect(actions()[0].type).to.equal('SET_MEMBER_PERMISSIONS_REQUEST');

      sinon.assert.calledWith(
        defaultProps.api.access.setMemberPermissions,
        'otherPatient123',
        { upload: undefined, view: {} }
      );

      expect(getActionButtons()[1].textContent).to.include('Remove Care Team Member');
      fireEvent.click(getActionButtons()[1]);

      await waitFor(() => {
        expect(document.body.querySelector('button.remove-account-access')).to.not.be.null;
      });

      const confirmBtn = document.body.querySelector('button.remove-account-access');
      fireEvent.click(confirmBtn);
      expect(actions()[1].type).to.equal('REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST');

      sinon.assert.calledWith(
        defaultProps.api.access.removeMember,
        'otherPatient123',
      );
    });

    it('should render appropriate popover actions for a pending care team invitation', async () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      const accountRow = rows[5];
      expect(accountRow.textContent).to.include('pendingpatient@example.com');
      expect(accountRow.textContent).to.include('Invite sent');

      const actions = () => store.getActions();

      const getActionButtons = await openRowMenu(accountRow);
      expect(getActionButtons().length).to.equal(2);

      expect(getActionButtons()[0].textContent).to.include('Resend Invite');
      fireEvent.click(getActionButtons()[0]);

      await waitFor(() => {
        expect(document.body.querySelector('button.resend-invitation')).to.not.be.null;
      });

      const resendConfirmBtn = document.body.querySelector('button.resend-invitation');
      fireEvent.click(resendConfirmBtn);
      expect(actions()[0].type).to.equal('RESEND_INVITE_REQUEST');

      sinon.assert.calledWith(defaultProps.api.invitation.resend, '789');

      // Re-open the row menu since the popover closed after first action
      const getActionButtons2 = await openRowMenu(wrapper.container.querySelectorAll('table tr')[5]);
      expect(getActionButtons2()[1].textContent).to.include('Revoke Invite');
      fireEvent.click(getActionButtons2()[1]);

      await waitFor(() => {
        expect(document.body.querySelector('button.remove-account-access')).to.not.be.null;
      });

      const confirmBtn = document.body.querySelector('button.remove-account-access');
      fireEvent.click(confirmBtn);
      expect(actions()[1].type).to.equal('CANCEL_SENT_INVITE_REQUEST');

      sinon.assert.calledWith(defaultProps.api.invitation.cancel, 'pendingpatient@example.com');
    });

    it('should render appropriate popover actions for a declined care team invitation', async () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      const accountRow = rows[6];
      expect(accountRow.textContent).to.include('yetanotherpatient@example.com');
      expect(accountRow.textContent).to.include('Invite declined');

      const actions = () => store.getActions();

      const getActionButtons = await openRowMenu(accountRow);
      expect(getActionButtons().length).to.equal(1);

      expect(getActionButtons()[0].textContent).to.include('Revoke Invite');
      fireEvent.click(getActionButtons()[0]);

      await waitFor(() => {
        expect(document.body.querySelector('button.remove-account-access')).to.not.be.null;
      });

      const confirmBtn = document.body.querySelector('button.remove-account-access');
      fireEvent.click(confirmBtn);
      expect(actions()[0].type).to.equal('CANCEL_SENT_INVITE_REQUEST');

      sinon.assert.calledWith(defaultProps.api.invitation.cancel, 'yetanotherpatient@example.com');
    });

    it('should render appropriate popover actions for a clinic member', async () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      const accountRow = rows[3];
      expect(accountRow.textContent).to.include('new_clinic_name');
      expect(accountRow.textContent).to.include('clinic');

      const actions = () => store.getActions();

      const getActionButtons = await openRowMenu(accountRow);
      expect(getActionButtons().length).to.equal(2);

      expect(getActionButtons()[0].textContent).to.include('Remove upload permission');
      fireEvent.click(getActionButtons()[0]);
      expect(actions()[0].type).to.equal('UPDATE_PATIENT_PERMISSIONS_REQUEST');

      sinon.assert.calledWith(
        defaultProps.api.clinics.updatePatientPermissions,
        'clinicID456',
        'patient123',
        { upload: undefined, view: {} }
      );

      expect(getActionButtons()[1].textContent).to.include('Remove Clinic');
      fireEvent.click(getActionButtons()[1]);

      await waitFor(() => {
        expect(document.body.querySelector('button.remove-account-access')).to.not.be.null;
      });

      const confirmBtn = document.body.querySelector('button.remove-account-access');
      fireEvent.click(confirmBtn);
      expect(actions()[1].type).to.equal('DELETE_PATIENT_FROM_CLINIC_REQUEST');

      sinon.assert.calledWith(
        defaultProps.api.clinics.deletePatientFromClinic,
        'clinicID456',
        'patient123',
      );
    });

    it('should render appropriate popover actions for a clinic invitation', async () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      const accountRow = rows[4];
      expect(accountRow.textContent).to.include('other_clinic_name');
      expect(accountRow.textContent).to.include('Invite sent');
      expect(accountRow.textContent).to.include('clinic');

      const actions = () => store.getActions();

      const getActionButtons = await openRowMenu(accountRow);
      expect(getActionButtons().length).to.equal(1);

      expect(getActionButtons()[0].textContent).to.include('Revoke Invite');
      fireEvent.click(getActionButtons()[0]);

      await waitFor(() => {
        expect(document.body.querySelector('button.remove-account-access')).to.not.be.null;
      });

      const confirmBtn = document.body.querySelector('button.remove-account-access');
      fireEvent.click(confirmBtn);
      expect(actions()[0].type).to.equal('DELETE_PATIENT_INVITATION_REQUEST');

      sinon.assert.calledWith(
        defaultProps.api.clinics.deletePatientInvitation,
        'clinicID123',
        '123'
      );
    });
  });
});

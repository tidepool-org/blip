import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../../../../../app/core/navutils';
import NavigationMenu from '../../../../../app/components/navbar/DesktopNavbar/NavigationMenu';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: jest.fn(),
  };
});

jest.mock('../../../../../app/core/navutils', () => {
  const actual = jest.requireActual('../../../../../app/core/navutils');
  return {
    ...actual,
    useNavigation: jest.fn(),
  };
});

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

describe('NavigationMenu', () => {
  let defaultProps;

  const handleSelectWorkspace = sinon.stub();
  const handleViewManageWorkspaces = sinon.stub();
  const handleViewAccountSettings = sinon.stub();
  const handleLogout = sinon.stub();

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
      membershipInOtherCareTeams: [],
      pendingReceivedClinicianInvites: [],
      loggedInUserId: 'clinicianUserId123',
    },
  };

  const fetchedClinicsState = {
    blip: {
      ...defaultState.blip,
      working: {
        fetchingClinicsForClinician: completedWorkingState,
      },
    },
  };

  const defaultUserState = {
    blip: {
      ...defaultState.blip,
      allUsersMap: {
        clinicianUserId123: {
          emails: ['clinic@example.com'],
          roles: ['clinic'],
          userid: 'clinicianUserId123',
          username: 'clinic@example.com',
          profile: {
            fullName: 'Example User',
          },
        },
      },
      clinics: {},
      pendingSentInvites: [],
      selectedClinicId: null,
    },
  };

  const clinicWorkflowState = {
    blip: {
      ...fetchedClinicsState.blip,
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
      clinicFlowActive: true,
      pendingSentInvites: [],
      selectedClinicId: 'clinicID456',
    },
  };

  const renderMenu = (state, path = '/clinic-workspace', props = defaultProps) => {
    useLocation.mockReturnValue({ pathname: path });
    const store = mockStore(state);

    render(
      <Provider store={store}>
        <NavigationMenu {...props} />
      </Provider>
    );

    fireEvent.click(document.querySelector('#navigation-menu-trigger'));
  };

  const getMenuOptions = () => Array.from(document.querySelectorAll('button.navigation-menu-option'));

  beforeEach(() => {
    defaultProps = {
      trackMetric: sinon.stub(),
      t: sinon.stub().callsFake((string) => string),
      api: {
        clinics: {
          getClinicsForClinician: sinon.stub().callsArgWith(2, null, { clinicsReturn: 'success' }),
          getPatientsForClinic: sinon.stub().callsArgWith(2, null, { patientsReturn: 'success' }),
          getClinicPatientCount: sinon.stub(),
          getClinicPatientCountSettings: sinon.stub(),
        },
        user: {
          logout: sinon.stub(),
        },
      },
    };

    handleSelectWorkspace.resetHistory();
    handleViewManageWorkspaces.resetHistory();
    handleViewAccountSettings.resetHistory();
    handleLogout.resetHistory();

    useNavigation.mockReturnValue({
      handleSelectWorkspace,
      handleViewManageWorkspaces,
      handleViewAccountSettings,
      handleLogout,
    });
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  context('no clinic workspaces available', () => {
    it('should render default menu options and dispatch correct actions when no clinic workspaces are available', () => {
      renderMenu(defaultUserState);

      const menuTrigger = document.querySelector('#navigation-menu-trigger');
      expect(menuTrigger.textContent).to.contain('Example User');

      const menuOptions = getMenuOptions();
      expect(menuOptions).to.have.lengthOf(3);
      expect(menuOptions[0].textContent).to.equal('Private Workspace');
      expect(menuOptions[1].textContent).to.equal('Account Settings');
      expect(menuOptions[2].textContent).to.equal('Logout');

      fireEvent.click(getMenuOptions()[0]);
      expect(handleSelectWorkspace.calledOnce).to.be.true;

      fireEvent.click(getMenuOptions()[1]);
      expect(handleViewAccountSettings.calledOnce).to.be.true;

      fireEvent.click(getMenuOptions()[2]);
      expect(handleLogout.calledOnce).to.be.true;
    });
  });

  context('clinic workspaces available', () => {
    it('should render clinic workspace options and dispatch correct actions when clinic workspaces are available', () => {
      renderMenu(clinicWorkflowState);

      const menuTrigger = document.querySelector('#navigation-menu-trigger');
      expect(menuTrigger.textContent).to.contain('Example Clinic');

      const menuOptions = getMenuOptions();
      expect(menuOptions).to.have.lengthOf(5);
      expect(menuOptions[0].textContent).to.equal('new_clinic_name Workspace');
      expect(menuOptions[1].textContent).to.equal('Manage Workspaces');
      expect(menuOptions[2].textContent).to.equal('Private Workspace');
      expect(menuOptions[3].textContent).to.equal('Account Settings');
      expect(menuOptions[4].textContent).to.equal('Logout');

      fireEvent.click(menuOptions[0]);
      expect(handleSelectWorkspace.getCall(0).args).to.eql(['clinicID456']);

      fireEvent.click(menuOptions[1]);
      expect(handleViewManageWorkspaces.calledOnce).to.be.true;

      fireEvent.click(menuOptions[2]);
      expect(handleSelectWorkspace.getCall(1).args).to.eql([null]);

      fireEvent.click(menuOptions[3]);
      expect(handleViewAccountSettings.calledOnce).to.be.true;

      fireEvent.click(menuOptions[4]);
      expect(handleLogout.calledOnce).to.be.true;
    });
  });

  context('clinician has a data storage account for private data', () => {
    it('should render a `Private Workspace` option in a addition to the standard options', () => {
      renderMenu({
        blip: {
          ...clinicWorkflowState.blip,
          allUsersMap: {
            clinicianUserId123: {
              emails: ['clinic@example.com'],
              roles: ['clinic'],
              userid: 'clinicianUserId123',
              username: 'clinic@example.com',
              profile: {
                fullName: 'Example Clinic',
                clinic: { role: 'clinic_manager' },
                patient: { foo: 'bar' }, // patient profile indicates a DSA has been set up
              },
            },
          },
        },
      });

      const menuTrigger = document.querySelector('#navigation-menu-trigger');
      expect(menuTrigger.textContent).to.contain('Example Clinic');

      const menuOptions = getMenuOptions();
      expect(menuOptions).to.have.lengthOf(5);
      expect(menuOptions[0].textContent).to.equal('new_clinic_name Workspace');
      expect(menuOptions[1].textContent).to.equal('Manage Workspaces');
      expect(menuOptions[2].textContent).to.equal('Private Workspace');
      expect(menuOptions[3].textContent).to.equal('Account Settings');
      expect(menuOptions[4].textContent).to.equal('Logout');

      fireEvent.click(menuOptions[2]);
      expect(handleSelectWorkspace.calledOnceWithExactly(null)).to.be.true;
    });
  });

  context('clinician has other accounts data shared with theirs', () => {
    it('should render a `Private Workspace` option in a addition to the standard options', () => {
      renderMenu({
        blip: {
          ...clinicWorkflowState.blip,
          membershipInOtherCareTeams: ['otherUser123'],
        },
      });

      const menuTrigger = document.querySelector('#navigation-menu-trigger');
      expect(menuTrigger.textContent).to.contain('Example Clinic');

      const menuOptions = getMenuOptions();
      expect(menuOptions).to.have.lengthOf(5);
      expect(menuOptions[0].textContent).to.equal('new_clinic_name Workspace');
      expect(menuOptions[1].textContent).to.equal('Manage Workspaces');
      expect(menuOptions[2].textContent).to.equal('Private Workspace');
      expect(menuOptions[3].textContent).to.equal('Account Settings');
      expect(menuOptions[4].textContent).to.equal('Logout');

      fireEvent.click(menuOptions[2]);
      expect(handleSelectWorkspace.calledOnceWithExactly(null)).to.be.true;
    });
  });

  context('clinic team member has pending clinic invites', () => {
    it('should render notification icon next to trigger and Manage Workspaces option for pending clinic invites', () => {
      renderMenu({
        blip: {
          ...clinicWorkflowState.blip,
          pendingReceivedClinicianInvites: ['clinicInvite123'],
        },
      });

      const menuTrigger = document.querySelector('#navigation-menu-trigger');
      expect(menuTrigger.querySelector('.notification-icon')).to.not.equal(null);

      const menuOptions = getMenuOptions();
      expect(menuOptions[1].textContent).to.contain('Manage Workspaces');
      expect(menuOptions[1].querySelector('.notification-icon')).to.not.equal(null);
    });
  });

  context('non clinic team member has pending clinic invites', () => {
    it('should render a notification icon next to the navigation menu trigger and the `Manage Workspaces` option', () => {
      renderMenu({
        blip: {
          ...defaultUserState.blip,
          pendingReceivedClinicianInvites: ['clinicInvite123'],
          clinicFlowActive: true,
        },
      });

      const menuTrigger = document.querySelector('#navigation-menu-trigger');
      expect(menuTrigger.textContent).to.contain('Example User');
      expect(menuTrigger.querySelector('.notification-icon')).to.not.equal(null);

      const menuOptions = getMenuOptions();
      expect(menuOptions[0].textContent).to.equal('Manage Workspaces');
      expect(menuOptions[0].querySelector('.notification-icon')).to.not.equal(null);
    });
  });

  context('clinician profile form page', () => {
    it('should only show logout action on clinician profile page', () => {
      renderMenu(defaultUserState, '/clinic-details/profile');
      const menuOptions = getMenuOptions();
      expect(menuOptions).to.have.lengthOf(1);
      expect(menuOptions[0].textContent).to.equal('Logout');
    });
  });

  context('clinic migration form page', () => {
    it('should only show logout action on clinic migration page', () => {
      renderMenu(clinicWorkflowState, '/clinic-details/migrate');
      const menuOptions = getMenuOptions();
      expect(menuOptions).to.have.lengthOf(1);
      expect(menuOptions[0].textContent).to.equal('Logout');
    });
  });
});

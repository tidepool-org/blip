import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import NavigationMenu from '../../../../../app/components/navbar/DesktopNavbar/NavigationMenu';

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
  let mount;

  let wrapper;
  let defaultProps = {
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

  const handleSelectWorkspace = sinon.stub();
  const handleViewManageWorkspaces = sinon.stub();
  const handleViewAccountSettings = sinon.stub();
  const handleLogout = sinon.stub();

  before(() => {
    mount = createMount();
    NavigationMenu.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/clinic-workspace' }));
    NavigationMenu.__Rewire__('useNavigation', sinon.stub().returns({
      handleSelectWorkspace,
      handleViewManageWorkspaces,
      handleViewAccountSettings,
      handleLogout,
    }));
  });

  beforeEach(() => {
    handleSelectWorkspace.resetHistory();
    handleViewManageWorkspaces.resetHistory();
    handleViewAccountSettings.resetHistory();
    handleLogout.resetHistory();
  });

  after(() => {
    NavigationMenu.__ResetDependency__('useNavigation');
    NavigationMenu.__ResetDependency__('useLocation');
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

  let mountWrapper;
  let store;

  beforeEach(() => {
    mountWrapper = (newStore, props = defaultProps) => {
      store = newStore;

      return mount(
        <Provider store={store}>
          <NavigationMenu {...props} />
        </Provider>
      );
    };
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  context('no clinic workspaces available', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(defaultUserState));
    });

    it('should render default menu options and dispatch correct actions', () => {
      const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
      expect(menuTrigger).to.have.lengthOf(1);
      expect(menuTrigger.text()).to.equal('Example User');

      const menuOptions = wrapper.find('Button.navigation-menu-option');
      expect(menuOptions).to.have.lengthOf(3);
      expect(menuOptions.at(0).text()).to.equal('Private Workspace');
      expect(menuOptions.at(1).text()).to.equal('Account Settings');
      expect(menuOptions.at(2).text()).to.equal('Logout');

      // Click private workspace option
      menuOptions.at(0).simulate('click');
      expect(handleSelectWorkspace.calledOnce).to.be.true;

      // Click account settings option
      menuOptions.at(1).simulate('click');
      expect(handleViewAccountSettings.calledOnce).to.be.true;

      // Click logout option
      menuOptions.at(2).simulate('click');
      expect(handleLogout.calledOnce).to.be.true;
    });
  });

  context('clinic workspaces available', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(clinicWorkflowState));
    });

    it('should render clinic workspace and default menu options and dispatch correct actions', () => {
      const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
      expect(menuTrigger).to.have.lengthOf(1);
      expect(menuTrigger.text()).to.equal('Example Clinic');

      const menuOptions = wrapper.find('Button.navigation-menu-option');
      expect(menuOptions).to.have.lengthOf(5);
      expect(menuOptions.at(0).text()).to.equal('new_clinic_name Workspace');
      expect(menuOptions.at(1).text()).to.equal('Manage Workspaces');
      expect(menuOptions.at(2).text()).to.equal('Private Workspace');
      expect(menuOptions.at(3).text()).to.equal('Account Settings');
      expect(menuOptions.at(4).text()).to.equal('Logout');

      // Click clinic workspace option
      menuOptions.at(0).simulate('click');
      expect(handleSelectWorkspace.getCall(0).args).to.eql(['clinicID456']);

      // Click manage workspaces option
      menuOptions.at(1).simulate('click');
      expect(handleViewManageWorkspaces.calledOnce).to.be.true;

      // Click private workspace option
      menuOptions.at(2).simulate('click');
      expect(handleSelectWorkspace.getCall(1).args).to.eql([null]);

      // Click account settings option
      menuOptions.at(3).simulate('click');
      expect(handleViewAccountSettings.calledOnce).to.be.true;

      // Click logout option
      menuOptions.at(4).simulate('click');
      expect(handleLogout.calledOnce).to.be.true;
    });


    context('clinician has a data storage account for private data', () => {
      beforeEach(() => {
        wrapper = mountWrapper(mockStore({
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
                  clinic: {
                    role: 'clinic_manager',
                  },
                  patient: { // patient profile indicates that a DSA has been set up
                    foo: 'bar',
                  },
                },
              },
            },
          },
        }));
      });

      it('should render a `Private Workspace` option in a addition to the standard options', () => {
        const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
        expect(menuTrigger).to.have.lengthOf(1);
        expect(menuTrigger.text()).to.equal('Example Clinic');

        const menuOptions = wrapper.find('Button.navigation-menu-option');
        expect(menuOptions).to.have.lengthOf(5);
        expect(menuOptions.at(0).text()).to.equal('new_clinic_name Workspace');
        expect(menuOptions.at(1).text()).to.equal('Manage Workspaces');
        expect(menuOptions.at(2).text()).to.equal('Private Workspace');
        expect(menuOptions.at(3).text()).to.equal('Account Settings');
        expect(menuOptions.at(4).text()).to.equal('Logout');

        // Click private workspace option
        menuOptions.at(2).simulate('click');


        expect(handleSelectWorkspace.calledOnceWithExactly(null)).to.be.true;
      });
    });

    context('clinician has other accounts data shared with theirs', () => {
      beforeEach(() => {
        wrapper = mountWrapper(mockStore({
          blip: {
            ...clinicWorkflowState.blip,
            membershipInOtherCareTeams: [
              'otherUser123',
            ],
          },
        }));
      });

      it('should render a `Private Workspace` option in a addition to the standard options', () => {
        const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
        expect(menuTrigger).to.have.lengthOf(1);
        expect(menuTrigger.text()).to.equal('Example Clinic');

        const menuOptions = wrapper.find('Button.navigation-menu-option');
        expect(menuOptions).to.have.lengthOf(5);
        expect(menuOptions.at(0).text()).to.equal('new_clinic_name Workspace');
        expect(menuOptions.at(1).text()).to.equal('Manage Workspaces');
        expect(menuOptions.at(2).text()).to.equal('Private Workspace');
        expect(menuOptions.at(3).text()).to.equal('Account Settings');
        expect(menuOptions.at(4).text()).to.equal('Logout');

        // Click private workspace option
        menuOptions.at(2).simulate('click');


        expect(handleSelectWorkspace.calledOnceWithExactly(null)).to.be.true;
      });
    });
  });

  context('clinic team member has pending clinic invites', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore({
        blip: {
          ...clinicWorkflowState.blip,
          pendingReceivedClinicianInvites: [
            'clinicInvite123',
          ],
        },
      }));
    });

    it('should render a notification icon next to the navigation menu trigger and the `Manage Workspaces` option', () => {
      const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
      expect(menuTrigger).to.have.lengthOf(1);
      expect(menuTrigger.text()).to.equal('Example Clinic');
      expect(menuTrigger.find('.notification-icon').hostNodes()).to.have.lengthOf(1);

      const menuOptions = wrapper.find('Button.navigation-menu-option');
      expect(menuOptions.at(1).text()).to.equal('Manage Workspaces');
      expect(menuOptions.at(1).find('.notification-icon').hostNodes()).to.have.lengthOf(1);
    });
  });

  context('non clinic team member has pending clinic invites', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore({
        blip: {
          ...defaultUserState.blip,
          pendingReceivedClinicianInvites: [
            'clinicInvite123',
          ],
          clinicFlowActive: true,
        },
      }));
    });

    it('should render a notification icon next to the navigation menu trigger and the `Manage Workspaces` option', () => {
      const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
      expect(menuTrigger).to.have.lengthOf(1);
      expect(menuTrigger.text()).to.equal('Example User');
      expect(menuTrigger.find('.notification-icon').hostNodes()).to.have.lengthOf(1);

      const menuOptions = wrapper.find('Button.navigation-menu-option');
      expect(menuOptions.at(0).text()).to.equal('Manage Workspaces');
      expect(menuOptions.at(0).find('.notification-icon').hostNodes()).to.have.lengthOf(1);
    });
  });

  context('clinician profile form page', () => {
  before(() => {
      NavigationMenu.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/clinic-details/profile' }));
      mount = createMount();
    });

    beforeEach(() => {
      wrapper = mountWrapper(mockStore(defaultUserState));
    });

    it('should only show the logout action', () => {
      const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
      expect(menuTrigger).to.have.lengthOf(1);
      expect(menuTrigger.text()).to.equal('Example User');

      const menuOptions = wrapper.find('Button.navigation-menu-option');
      expect(menuOptions).to.have.lengthOf(1);
      expect(menuOptions.at(0).text()).to.equal('Logout');
    });
  });

  context('clinic migration form page', () => {
    before(() => {
      NavigationMenu.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/clinic-details/migrate' }));
      mount = createMount();
    });

    beforeEach(() => {
      wrapper = mountWrapper(mockStore(clinicWorkflowState));
    });

    it('should only show the logout action', () => {
      const menuTrigger = wrapper.find('#navigation-menu-trigger').hostNodes();
      expect(menuTrigger).to.have.lengthOf(1);
      expect(menuTrigger.text()).to.equal('Example Clinic');

      const menuOptions = wrapper.find('Button.navigation-menu-option');
      expect(menuOptions).to.have.lengthOf(1);
      expect(menuOptions.at(0).text()).to.equal('Logout');
    });
  });
});

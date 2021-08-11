import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WorkspaceSwitcher from '../../../../app/components/clinic/WorkspaceSwitcher';

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

describe('WorkspaceSwitcher', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        getClinicsForClinician: sinon.stub().callsArgWith(2, null, { clinicsReturn: 'success' }),
        getPatientsForClinic: sinon.stub().callsArgWith(2, null, { patientsReturn: 'success' }),
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
      working: {
        fetchingClinicsForClinician: defaultWorkingState,
      },
      loggedInUserId: 'clinicianUserId123',
      membershipInOtherCareTeams: [],
    },
  };

  const fetchedDataState = {
    blip: {
      ...defaultState.blip,
      working: {
        fetchingClinicsForClinician: completedWorkingState,
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
        otherUser123: {
          emails: ['other@example.com'],
          userid: 'otherUser123',
          username: 'other@example.com',
          profile: {
            fullName: 'Other User',
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
          phoneNumbers: [
            {
              number: '(888) 555-5555',
              type: 'Office',
            },
          ],
        },
      },
      pendingSentInvites: [],
      membershipInOtherCareTeams: ['otherUser123'],
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
          <WorkspaceSwitcher {...props} />
        </Provider>
      );
    };
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  context('no clinics fetched', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(defaultState));
    });

    it('should not render anything', () => {
      expect(wrapper.find('#workspace-switcher').hostNodes()).to.have.lengthOf(0);
    });
  });

  context('clinics fetched', () => {
    beforeEach(() => {
      wrapper = mountWrapper(mockStore(fetchedDataState));
    });

    it('should render a switcher component with a selected clinic and personal workspace options', () => {
      const popupTrigger = wrapper.find('#workspace-switcher-current').hostNodes();
      expect(popupTrigger).to.have.lengthOf(1);
      expect(popupTrigger.text()).to.equal('new_clinic_name Workspace');

      const workspaceButtons = wrapper.find('Button.workspace-option');
      expect(workspaceButtons).to.have.lengthOf(2);
      expect(workspaceButtons.at(0).text()).to.equal('new_clinic_name Workspace');
      expect(workspaceButtons.at(0).find('Icon').props().label).to.equal('Selected');
      expect(workspaceButtons.at(1).text()).to.equal('Personal Workspace');
      expect(workspaceButtons.at(1).find('Icon')).to.have.lengthOf(0);
    });

    it('should change to a different workspace and redirect to patients list', () => {
      const popupTrigger = () => wrapper.find('#workspace-switcher-current').hostNodes();
      expect(popupTrigger().text()).to.equal('new_clinic_name Workspace');
      popupTrigger().simulate('click');

      const workspaceButtons = wrapper.find('Button.workspace-option');
      expect(workspaceButtons.at(0).text()).to.equal('new_clinic_name Workspace');
      expect(workspaceButtons.at(1).text()).to.equal('Personal Workspace');

      // Click personal workspace option
      store.clearActions();
      workspaceButtons.at(1).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: 'SELECT_CLINIC',
          payload: {
            clinicId: null, // null is appropriate for switch to personal workspace
          },
        },
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/patients'],
            method: 'push',
          },
        },
      ]);

      // Click clinic workspace option
      store.clearActions();
      workspaceButtons.at(0).simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: 'SELECT_CLINIC',
          payload: {
            clinicId: 'clinicID456',
          },
        },
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-workspace'],
            method: 'push',
          },
        },
      ]);
    });
  });
});

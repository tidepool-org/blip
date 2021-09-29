import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import Button from '../../../app/components/elements/Button';
import Table from '../../../app/components/elements/Table';
import Popover from '../../../app/components/elements/Popover';
import ClinicAdmin from '../../../app/pages/clinicadmin';
import { Dialog } from '../../../app/components/elements/Dialog';

/* global chai */
/* global sinon */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicAdmin', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
      },
    },
  };

  before(() => {
    mount = createMount();
    ClinicAdmin.__Rewire__('ClinicProfile', sinon.stub().returns('stubbed clinic profile'));
    ClinicAdmin.__Rewire__('config', { RX_ENABLED: true });
  });

  after(() => {
    mount.cleanUp();
    ClinicAdmin.__ResetDependency__('ClinicProfile');
    ClinicAdmin.__ResetDependency__('config');
  });

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const workingState = {
    blip: {
      working: {
        fetchingClinicsForClinician: {
          inProgress: false,
          completed: true,
          notification: null,
        },
        fetchingCliniciansFromClinic: {
          inProgress: false,
          completed: true,
          notification: null,
        },
        updatingClinician: defaultWorkingState,
        sendingClinicianInvite: defaultWorkingState,
        resendingClinicianInvite: defaultWorkingState,
        deletingClinicianInvite: defaultWorkingState,
        deletingClinicianFromClinic: defaultWorkingState,
      },
    },
  };

  let store = mockStore(workingState);

  const fetchedDataState = {
    blip: merge({}, workingState.blip, {
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
              email: 'clinic@example.com',
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
      loggedInUserId: 'clinicianUserId123',
      selectedClinicId: 'clinicID456',
      pendingSentInvites: [],
    }),
  };

  const fetchedMultipleAdminState = {
    blip: merge({}, fetchedDataState.blip, {
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              roles: ['CLINIC_ADMIN', 'PRESCRIBER'],
            },
            clinicianUserId456: {
              roles: ['CLINIC_ADMIN', 'PRESCRIBER'],
            },
          },
        },
      },
    }),
  };

  const fetchedSingleAdminState = {
    blip: merge({}, fetchedDataState.blip, {
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              roles: ['CLINIC_ADMIN', 'PRESCRIBER'],
            },
          },
        },
      },
    }),
  };

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <ClinicAdmin {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  it('should render a clinic profile', () => {
    expect(wrapper.text()).to.include('stubbed clinic profile');
  });

  it('should not render an Invite button for a clinic member', () => {
    const inviteButton = wrapper.find(Button).filter({ variant: 'primary' });
    expect(inviteButton).to.have.length(0);
  });

  it('should render a search bar', () => {
    const searchInput = wrapper.find('TextInput#search-members');
    expect(searchInput).to.have.lengthOf(1);
    expect(searchInput.props().onChange).to.be.a('function');
    searchInput
      .find('input')
      .simulate('change', { target: { value: 'new search text' } });
    const table = wrapper.find(Table);
    expect(table.props().searchText).to.equal('new search text');
  });

  it('should render an empty Table with no data', () => {
    const table = wrapper.find(Table);
    expect(table).to.have.length(1);
    expect(table.props().data).to.eql([]);
    expect(table.find('tr')).to.have.length(1); // header
  });

  it('should render a Table when data is available', () => {
    wrapper = mount(
      <Provider store={mockStore(fetchedDataState)}>
        <ToastProvider>
          <ClinicAdmin {...defaultProps} />
        </ToastProvider>
      </Provider>
    );

    const table = wrapper.find(Table);
    expect(table).to.have.length(1);
    expect(table.find('tr')).to.have.length(2); // data + header
    expect(table.find('td')).to.have.length(3);
  });

  context('logged in as a clinic admin', () => {
    beforeEach(() => {
      store = mockStore(fetchedMultipleAdminState);
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicAdmin {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render an Invite button', () => {
      const inviteButton = wrapper.find(Button).filter({ variant: 'primary' });
      expect(inviteButton).to.have.length(1);
      expect(inviteButton.text()).to.equal('Invite New Clinic Team Member');
      expect(inviteButton.props().onClick).to.be.a('function');

      const expectedActions = [
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: [
              '/clinic-invite',
              {
                clinicId: 'clinicID456',
              },
            ],
            method: 'push',
          },
        },
      ];

      inviteButton.props().onClick();
      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should render Edit and "More" icon', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header + 2 clinicians
      expect(table.find('td')).to.have.length(10); // 5 per clinician
      const editButton = table.find(Button).at(0);
      expect(editButton.text()).to.equal('Edit');
      expect(table.find('PopoverMenu')).to.have.length(1);
    });

    context('logged in as the only clinic admin', () => {
      beforeEach(() => {
        store = mockStore(fetchedSingleAdminState);
        wrapper = mount(
          <Provider store={store}>
            <ToastProvider>
              <ClinicAdmin {...defaultProps} />
            </ToastProvider>
          </Provider>
        );
      });

      it('should not render the "More" popover menu', () => {
        const table = wrapper.find(Table);
        expect(table.find('PopoverMenu')).to.have.length(0);
      });
    });

    it('should navigate to "/clinician-edit" when "Edit" button clicked', () => {
      const editButton = wrapper.find(Table).find(Button).at(0);
      store.clearActions();
      editButton.simulate('click');
      expect(store.getActions()).to.eql([
        {
          payload: {
            args: [
              '/clinician-edit',
              {
                clinicId: 'clinicID456',
                clinicianId: 'clinicianUserId123',
              },
            ],
            method: 'push',
          },
          type: '@@router/CALL_HISTORY_METHOD',
        },
      ]);
    });

    it('should display menu when "More" icon is clicked', () => {
      const moreMenuIcon = wrapper.find('PopoverMenu').find('Icon').at(0);
      expect(wrapper.find(Popover).props().open).to.be.false;
      moreMenuIcon.simulate('click');
      expect(wrapper.find(Popover).props().open).to.be.true;
    });

    it('should display dialog when "Remove User" is clicked', () => {
      const flex = wrapper.find('Button[iconLabel="Remove User"]');
      expect(wrapper.find(Dialog).props().open).to.be.false;
      flex.simulate('click');
      expect(wrapper.find(Dialog).props().open).to.be.true;
    });
  });
});

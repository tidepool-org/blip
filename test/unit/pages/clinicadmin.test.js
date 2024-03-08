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
        getCliniciansFromClinic: sinon.stub(),
        deleteClinicianFromClinic: sinon.stub(),
        resendClinicianInvite: sinon.stub(),
        deleteClinicianInvite: sinon.stub(),
      },
    },
  };

  before(() => {
    mount = createMount();
    ClinicAdmin.__Rewire__('ClinicWorkspaceHeader', sinon.stub().returns('stubbed clinic workspace header'));
    ClinicAdmin.__Rewire__('config', { RX_ENABLED: true });
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.deleteClinicianFromClinic.resetHistory();
    defaultProps.api.clinics.getCliniciansFromClinic.resetHistory();
    defaultProps.api.clinics.deleteClinicianInvite.resetHistory();
    defaultProps.api.clinics.resendClinicianInvite.resetHistory();
  });

  after(() => {
    mount.cleanUp();
    ClinicAdmin.__ResetDependency__('ClinicWorkspaceHeader');
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
        fetchingClinicianInvite: defaultWorkingState,
        updatingClinician: defaultWorkingState,
        updatingClinic: defaultWorkingState,
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
              name: 'John Doe',
              email: 'clinic@example.com',
              id: 'clinicianUserId123',
              roles: ['CLINIC_MEMBER'],
              createdTime: '2021-10-05T18:00:00Z',
              updatedTime: '2021-10-05T18:00:00Z',
            },
          },
          patients: {},
          id: 'clinicID456',
          address: '1 Address Ln, City Zip',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
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
              name: 'Jane Smith',
              email: 'clinicianUserId456@example.com',
              id: 'clinicianUserId456',
              createdTime: '2021-10-06T18:00:00Z',
              updatedTime: '2021-10-06T18:00:00Z',
            },
            clinicianUserId789InviteId: {
              roles: ['CLINIC_MEMBER'],
              email: 'clinicianUserId789@example.com',
              inviteId: 'clinicianUserId789InviteId',
              createdTime: '2021-10-07T18:00:00Z',
              updatedTime: '2021-10-07T18:00:00Z',
            }
          },
        },
      },
      pendingSentClinicianInvites: {
        'clinicianUserId789InviteId': {
          inviteId: 'clinicianUserId789InviteId',
          created: '2021-9-19T16:27:59.504Z',
          modified: '2021-10-19T16:27:59.504Z',
          email: 'clinicianUserId789@example.com',
        }
      },
      timePrefs: {
        timezoneName: 'UTC'
      }
    })
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
    expect(wrapper.text()).to.include('stubbed clinic workspace header');
  });

  it('should not render an Invite button for a clinic member', () => {
    const inviteButton = wrapper.find(Table).find(Button).filter({ variant: 'primary' });
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
      store.clearActions();
    });

    it('should render an Invite button', () => {
      const inviteButton = wrapper.find(Button).filter({ variant: 'primary' }).at(0);
      expect(inviteButton).to.have.length(1);
      expect(inviteButton.text()).to.equal('Invite New Clinic Team Member');
      expect(inviteButton.props().onClick).to.be.a('function');

      const expectedActions = [
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: [
              '/clinic-invite',
            ],
            method: 'push',
          },
        },
      ];

      inviteButton.props().onClick();
      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should render an Export List button', () => {
      const clock = sinon.useFakeTimers({
        now: new Date('2021-10-05 18:00:00').getTime()
      });

      const exportButton = wrapper.find('#export-clinic-team-list').hostNodes();
      expect(exportButton).to.have.length(1);
      expect(exportButton.text()).to.equal('Export List');
      expect(exportButton.props().onClick).to.be.a('function');

      const expectedCsvRows = [
        [
          'Name',
          'Email',
          'Admin?',
          'Pending?',
          'Created',
          'Updated',
        ],
        [
          '"John Doe"',
          '"clinic@example.com"',
          'True',
          'False',
          '2021-10-05 18:00:00 UTC',
          '2021-10-05 18:00:00 UTC',
        ],
        [
          '"Jane Smith"',
          '"clinicianUserId456@example.com"',
          'True',
          'False',
          '2021-10-06 18:00:00 UTC',
          '2021-10-06 18:00:00 UTC',
        ],
        [
          '""',
          '"clinicianUserId789@example.com"',
          'False',
          'True',
          '2021-10-07 18:00:00 UTC',
          '2021-10-07 18:00:00 UTC',
        ],
      ];

      const expectedCsv = expectedCsvRows.map((row) => row.join(',')).join('\n');
      const expectedBlob = new Blob([expectedCsv], { type: 'text/csv;charset=utf-8;' });
      const expectedUrl = 'mock-url';
      const expectedDownloadFileName = 'new_clinic_name-2021-10-05 18:00:00 UTC.csv';

      const createBlobSpy = sinon.spy(window, 'Blob');

      const createElementStub = sinon.stub(document, 'createElement').returns({
        href: '',
        download: '',
        click: sinon.stub(),
      });
      const createObjectURLStub = sinon.stub(URL, 'createObjectURL').returns(expectedUrl);

      exportButton.props().onClick();

      expect(defaultProps.trackMetric.calledOnceWithExactly('Clinic - clicked export clinic member list', {
        clinicId: 'clinicID456',
      })).to.be.true;

      expect(createBlobSpy.calledOnceWithExactly([expectedCsv], { type: 'text/csv;charset=utf-8;' })).to.be.true;
      expect(createElementStub.calledOnceWithExactly('a')).to.be.true;
      expect(createObjectURLStub.calledOnceWithExactly(expectedBlob)).to.be.true;
      expect(createElementStub.returnValues[0].href).to.equal(expectedUrl);
      expect(createElementStub.returnValues[0].download).to.equal(expectedDownloadFileName);
      expect(createElementStub.returnValues[0].click.calledOnce).to.be.true;

      createElementStub.restore();
      createObjectURLStub.restore();
      clock.restore();
    });

    it('should render a "More" icon per row', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(4); // header + 2 clinicians + 1 invite
      expect(table.find('td')).to.have.length(12); // 4 per clinician/invite
      expect(table.find('PopoverMenu')).to.have.length(3);
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

      it('should only allow editing clinician info within the "More" popover menu', () => {
        const table = wrapper.find(Table);
        expect(table.find('PopoverMenu')).to.have.length(1);
        expect(table.find('PopoverMenu').find('Button')).to.have.length(1);
        expect(table.find('PopoverMenu').find('Button').text()).to.equal('Edit Clinician Information');
      });
    });

    it('should display menu when "More" icon is clicked', () => {
      const moreMenuIcon = wrapper.find('PopoverMenu').find('Icon').at(0);
      expect(wrapper.find(Popover).at(0).props().open).to.be.false;
      moreMenuIcon.simulate('click');
      expect(wrapper.find(Popover).at(0).props().open).to.be.true;
    });

    it('should navigate to "/clinician-edit" when "Edit" menu action is clicked', () => {
      const editButton = wrapper.find('Button[iconLabel="Edit Clinician Information"]').at(0);
      store.clearActions();
      editButton.simulate('click');
      expect(store.getActions()).to.eql([
        {
          payload: {
            args: [
              '/clinician-edit',
              {
                clinicId: 'clinicID456',
                clinicianId: 'clinicianUserId456',
              },
            ],
            method: 'push',
          },
          type: '@@router/CALL_HISTORY_METHOD',
        },
      ]);
    });

    it('should display dialog when "Remove User" is clicked', () => {
      const expectedActions = [
        {
          type: 'DELETE_CLINICIAN_FROM_CLINIC_REQUEST'
        }
      ];
      const removeButton = wrapper.find('Button[iconLabel="Remove User"]').at(0);
      const deleteDialog = () => wrapper.find(Dialog).at(0);
      expect(deleteDialog().props().open).to.be.false;
      removeButton.simulate('click');
      expect(deleteDialog().props().open).to.be.true;

      const removeUser = deleteDialog().find(Button).filter({variant:'danger'});
      expect(removeUser).to.have.length(1);
      removeUser.props().onClick();
      expect(store.getActions()).to.eql(expectedActions);
      sinon.assert.calledWith(
        defaultProps.api.clinics.deleteClinicianFromClinic,
        'clinicID456',
        'clinicianUserId456'
      );
    });

    it('should display dialog when "Resend Invite" is clicked', () => {
      const expectedActions = [
        {
          type: 'RESEND_CLINICIAN_INVITE_REQUEST'
        }
      ];
      const resendButton = wrapper.find('Button[iconLabel="Resend Invite"]');
      const resendDialog = () => wrapper.find(Dialog).at(1);
      expect(resendDialog().props().open).to.be.false;
      resendButton.simulate('click');
      expect(resendDialog().props().open).to.be.true;

      expect(resendDialog().text()).to.have.string('10/19/2021 at 4:27 pm');

      const resendInvite = resendDialog().find(Button).filter({variant: 'primary'});
      expect(resendInvite).to.have.length(1);
      resendInvite.props().onClick();
      expect(store.getActions()).to.eql(expectedActions);
      sinon.assert.calledWith(
        defaultProps.api.clinics.resendClinicianInvite,
        'clinicID456',
        'clinicianUserId789InviteId'
      );
    });

    it('should display dialog when "Revoke Invite" is clicked', () => {
      const expectedActions = [
        {
          type: 'DELETE_CLINICIAN_INVITE_REQUEST'
        }
      ];
      const revokeButton = wrapper.find('Button[iconLabel="Revoke Invite"]');
      const revokeDialog = () => wrapper.find(Dialog).at(2);
      expect(revokeDialog().props().open).to.be.false;
      revokeButton.simulate('click');
      expect(revokeDialog().props().open).to.be.true;

      const revokeInvite = revokeDialog().find(Button).filter({variant: 'danger'});
      expect(revokeInvite).to.have.length(1);
      revokeInvite.props().onClick();
      expect(store.getActions()).to.eql(expectedActions);
      sinon.assert.calledWith(
        defaultProps.api.clinics.deleteClinicianInvite,
        'clinicID456',
        'clinicianUserId789InviteId'
      );
    });
  });

  context('clinicians not fetched', () => {
    it('should fetch clinicians for a clinic if not already fetched', () => {
      const initialState = { ...fetchedDataState };
      initialState.blip.working.fetchingCliniciansFromClinic.completed = false;
      store = mockStore(initialState);

      defaultProps.trackMetric.resetHistory();
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicAdmin {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      sinon.assert.calledWith(defaultProps.api.clinics.getCliniciansFromClinic, 'clinicID456', { limit: 1000, offset: 0 });
    });
  });

  context('on mount', () => {
    it('should not fetch clinicians if fetch is already in progress', () => {
      const noFetchState = merge({}, fetchedMultipleAdminState, {
        blip: {
          working: {
            fetchingCliniciansFromClinic: {
              inProgress: true,
            },
          },
        },
      });
      const noFetchStore = mockStore(noFetchState);
      defaultProps.api.clinics.getCliniciansFromClinic.resetHistory();
      mount(
        <Provider store={noFetchStore}>
          <ToastProvider>
            <ClinicAdmin {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      expect(noFetchStore.getActions()).to.eql([]);
      sinon.assert.notCalled(defaultProps.api.clinics.getCliniciansFromClinic);
    });

    it('should fetch clinicians if not already in progress', () => {
      const fetchStore = mockStore(fetchedMultipleAdminState);
      mount(
        <Provider store={fetchStore}>
          <ToastProvider>
            <ClinicAdmin {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
      const expectedActions = [
        {
          type: 'FETCH_CLINICIANS_FROM_CLINIC_REQUEST',
        },
      ];
      expect(fetchStore.getActions()).to.eql(expectedActions);
      sinon.assert.calledWith(defaultProps.api.clinics.getCliniciansFromClinic, 'clinicID456', { limit: 1000, offset: 0 });
    });

    it('should fetch clinicians even if previously errored', () => {
      const erroredState = merge({}, fetchedMultipleAdminState, {
        blip: {
          working: {
            fetchingCliniciansFromClinic: {
              notification: {
                message: 'Errored',
              },
            },
          },
        },
      });
      const errorStore = mockStore(erroredState);
      mount(
        <Provider store={errorStore}>
          <ToastProvider>
            <ClinicAdmin {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
      const expectedActions = [
        {
          type: 'FETCH_CLINICIANS_FROM_CLINIC_REQUEST',
        },
      ];
      expect(errorStore.getActions()).to.eql(expectedActions);
      sinon.assert.calledWith(defaultProps.api.clinics.getCliniciansFromClinic, 'clinicID456', { limit: 1000, offset: 0 });
    });
  });
});

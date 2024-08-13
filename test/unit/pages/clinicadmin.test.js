import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import Button from '../../../app/components/elements/Button';
import Table from '../../../app/components/elements/Table';
import Popover from '../../../app/components/elements/Popover';
import ClinicAdmin from '../../../app/pages/clinicadmin';
import { Dialog } from '../../../app/components/elements/Dialog';
import moment from 'moment';

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
        update: sinon.stub().callsArgWith(2, null, { updateReturn: 'success' }),
      },
    },
  };

  before(() => {
    mount = createMount();
    ClinicAdmin.__Rewire__('ClinicWorkspaceHeader', sinon.stub().returns('stubbed clinic workspace header'));

    ClinicAdmin.__Rewire__('useFlags', sinon.stub().returns({
      showPrescriptions: true,
    }));
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.deleteClinicianFromClinic.resetHistory();
    defaultProps.api.clinics.getCliniciansFromClinic.resetHistory();
    defaultProps.api.clinics.deleteClinicianInvite.resetHistory();
    defaultProps.api.clinics.resendClinicianInvite.resetHistory();
    defaultProps.api.clinics.update.resetHistory();
  });

  after(() => {
    mount.cleanUp();
    ClinicAdmin.__ResetDependency__('ClinicWorkspaceHeader');
    ClinicAdmin.__ResetDependency__('useFlags');
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
          address: '1 Test Ln',
          name: 'Test Clinic',
          email: 'test.clinic@example.com',
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

  const clinicMemberState = {
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
          address: '1 Test Ln',
          postalCode: '12345',
          city: 'Gotham',
          state: 'NJ',
          country: 'US',
          name: 'Test Clinic',
          email: 'test.clinic@example.com',
          shareCode: 'ABCD-ABCD-ABCD',
          website: 'http://clinic.com',
          clinicType: 'provider_practice',
          preferredBgUnits: 'mmol/L',
          ui: {
            display: {
              workspacePlan: true,
              workspaceLimitDescription: true,
              workspaceLimitFeedback: true,
              workspaceLimitResolutionLink: true,
            },
            text: {
              planDisplayName: 'Basey Base',
              limitDescription: 'Basey Base is an OK-is plan, but you can do better',
              limitFeedback: {
                text: 'Uh-oh.  Not looking good here',
                status: 'warning',
              },
              limitResolutionLink: {
                text: 'Click this link',
                url: 'https://resolutions.com',
              },
            }
          },
        },
      },
      loggedInUserId: 'clinicianUserId123',
      selectedClinicId: 'clinicID456',
      pendingSentInvites: [],
    }),
  };

  const clinicAdminState = {
    blip: {
      ...clinicMemberState.blip,
      clinics: {
        clinicID456: {
          ...clinicMemberState.blip.clinics.clinicID456,
          clinicians: {
            clinicianUserId123: {
              email: 'clinic@example.com',
              id: 'clinicianUserId123',
              roles: ['CLINIC_ADMIN'],
            },
          },
        },
      },
    },
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
      const expectedDownloadFileName = 'Test Clinic-2021-10-05 18:00:00 UTC.csv';

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
      createBlobSpy.restore();
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

  describe('clinic workspace details', () => {
    let store;

    beforeEach(() => {
      store = mockStore(clinicAdminState);
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicAdmin {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
      store.clearActions();
    });

    it('should render the main clinic workspace details', () => {
      const workSpaceDetails = wrapper.find('#clinicWorkspaceDetails').hostNodes()
      expect(workSpaceDetails).to.have.lengthOf(1);

      expect(workSpaceDetails.find('#clinicName').hostNodes().text()).to.equal('Test Clinic');
      expect(workSpaceDetails.find('#clinicType').hostNodes().text()).to.equal('Type : Provider Practice');
      expect(workSpaceDetails.find('#clinicAddress').hostNodes().text()).to.equal('Address : 1 Test Ln, Gotham NJ, 12345, US');
      expect(workSpaceDetails.find('#clinicWebsite').hostNodes().text()).to.equal('Website : http://clinic.com');
      expect(workSpaceDetails.find('#clinicPreferredBloodGlucoseUnits').hostNodes().text()).to.equal('Preferred blood glucose units : mmol/L');
    });

    it('should render the workspace plan, description, feedback, and resolution link', () => {
      const workSpacePlan = wrapper.find('#clinicWorkspacePlan').hostNodes()
      expect(workSpacePlan).to.have.lengthOf(1);

      expect(workSpacePlan.find('#clinicPlanName').hostNodes().text()).to.equal('Basey Base');
      expect(workSpacePlan.find('#clinicPatientLimitDescription').hostNodes().text()).to.equal('Basey Base is an OK-is plan, but you can do better');
      expect(workSpacePlan.find('#clinicPatientLimitFeedback').hostNodes().text()).to.equal('Uh-oh.  Not looking good here');
      expect(workSpacePlan.find('Pill#clinicPatientLimitFeedback').props().colorPalette).to.equal('warning');
      expect(workSpacePlan.find('#clinicPatientLimitResolutionLink').hostNodes().text()).to.equal('Click this link');
      expect(workSpacePlan.find('#clinicPatientLimitResolutionLink').hostNodes().props().href).to.equal('https://resolutions.com');
    });
  });

  describe('clinic profile updating', () => {
    let store;
    let profileForm;

    context('clinic non-admin team member', () => {
      beforeEach(() => {
        store = mockStore(clinicMemberState);

        wrapper = mount(
          <Provider store={store}>
            <ToastProvider>
              <ClinicAdmin {...defaultProps} />
            </ToastProvider>
          </Provider>
        );
      });

      it('should not show a clinic profile edit button', () => {
        const profileEditButton = wrapper.find('#clinic-profile-edit-trigger');
        expect(profileEditButton).to.have.lengthOf(0);
      });
    });

    context('clinic admin team member', () => {
      beforeEach(() => {
        store = mockStore(clinicAdminState);

        wrapper = mount(
          <Provider store={store}>
            <ToastProvider>
              <ClinicAdmin {...defaultProps} />
            </ToastProvider>
          </Provider>
        );

        profileForm = () => wrapper.find('Dialog#editClinicProfile');
        expect(profileForm().props().open).to.be.false;

        const profileEditButton = wrapper.find('#clinic-profile-edit-trigger').hostNodes();
        profileEditButton.simulate('click');

        expect(profileForm().props().open).to.be.true;
      });

      it('should populate the profile edit form with clinic values', () => {
        expect(profileForm().find('input[name="name"]').prop('value')).to.equal('Test Clinic');
        expect(profileForm().find('select[name="country"]').prop('value')).to.equal('US');
        expect(profileForm().find('select[name="state"]').prop('value')).to.equal('NJ');
        expect(profileForm().find('input[name="city"]').prop('value')).to.equal('Gotham');
        expect(profileForm().find('input[name="address"]').prop('value')).to.equal('1 Test Ln');
        expect(profileForm().find('input[name="postalCode"]').prop('value')).to.equal('12345');
        expect(profileForm().find('input[name="website"]').prop('value')).to.equal('http://clinic.com');
        expect(profileForm().find('select[name="clinicType"]').prop('value')).to.equal('provider_practice');
        expect(profileForm().find('input[name="preferredBgUnits"][checked=true]').prop('value')).to.equal('mmol/L');
      });

      it('should submit updated clinic profile values', done => {
        wrapper.find('input[name="name"]').simulate('change', { persist: noop, target: { name: 'name', value: 'name_updated' } });
        expect(wrapper.find('input[name="name"]').prop('value')).to.equal('name_updated');

        wrapper.find('select[name="country"]').simulate('change', { persist: noop, target: { name: 'country', value: 'CA' } });
        expect(wrapper.find('select[name="country"]').prop('value')).to.equal('CA');

        wrapper.find('select[name="state"]').simulate('change', { persist: noop, target: { name: 'state', value: 'ON' } });
        expect(wrapper.find('select[name="state"]').prop('value')).to.equal('ON');

        wrapper.find('input[name="city"]').simulate('change', { persist: noop, target: { name: 'city', value: 'city_updated' } });
        expect(wrapper.find('input[name="city"]').prop('value')).to.equal('city_updated');

        wrapper.find('input[name="address"]').simulate('change', { persist: noop, target: { name: 'address', value: 'address_updated' } });
        expect(wrapper.find('input[name="address"]').prop('value')).to.equal('address_updated');

        wrapper.find('input[name="postalCode"]').simulate('change', { persist: noop, target: { name: 'postalCode', value: 'L3X 9G2' } });
        expect(wrapper.find('input[name="postalCode"]').prop('value')).to.equal('L3X 9G2');

        wrapper.find('input[name="website"]').simulate('change', { persist: noop, target: { name: 'website', value: 'http://clinic_updated.com' } });
        expect(wrapper.find('input[name="website"]').prop('value')).to.equal('http://clinic_updated.com');

        wrapper.find('select[name="clinicType"]').simulate('change', { persist: noop, target: { name: 'clinicType', value: 'healthcare_system' } });
        expect(wrapper.find('select[name="clinicType"]').prop('value')).to.equal('healthcare_system');

        wrapper.find('input[name="preferredBgUnits"]').at(1).simulate('change', { persist: noop, target: { name: 'preferredBgUnits', value: 'mg/dL' } });
        expect(wrapper.find('input[name="preferredBgUnits"][checked=true]').prop('value')).to.equal('mg/dL');

        store.clearActions();
        wrapper.find('#editClinicProfileSubmit').hostNodes().simulate('click');

        setTimeout(() => {
          expect(defaultProps.api.clinics.update.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.update,
            'clinicID456',
            {
              address: 'address_updated',
              city: 'city_updated',
              clinicType: 'healthcare_system',
              country: 'CA',
              name: 'name_updated',
              postalCode: 'L3X 9G2',
              state: 'ON',
              website: 'http://clinic_updated.com',
              preferredBgUnits: 'mg/dL',
            }
          );

          expect(store.getActions()).to.eql([
            { type: 'UPDATE_CLINIC_REQUEST' },
            {
              type: 'UPDATE_CLINIC_SUCCESS',
              payload: {
                clinicId: 'clinicID456',
                clinic: { updateReturn: 'success' },
              },
            },
          ]);

          done();
        }, 0);
      });

      it('should populate updated clinic profile values when re-opening form after edit', done => {
        expect(profileForm().find('input[name="name"]').prop('value')).to.equal('Test Clinic');

        wrapper.find('input[name="name"]').simulate('change', { persist: noop, target: { name: 'name', value: 'name_updated' } });
        expect(wrapper.find('input[name="name"]').prop('value')).to.equal('name_updated');

        wrapper.find('#editClinicProfileSubmit').hostNodes().simulate('click');

        setTimeout(() => {
          expect(defaultProps.api.clinics.update.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.update,
            'clinicID456',
            sinon.match({
              name: 'name_updated',
            })
          );

          expect(wrapper.find('input[name="name"]').prop('value')).to.equal('name_updated');
          done();
        }, 0);
      });
    });

    context('clinic admin team member with clinic timezone', () => {
      beforeEach(() => {
        store = mockStore(merge({}, clinicAdminState, {
          blip: {
            clinics: {
              clinicID456: {
                timezone: 'America/Toronto',
              },
            },
          },
        }));

        wrapper = mount(
          <Provider store={store}>
            <ToastProvider>
              <ClinicAdmin {...defaultProps} />
            </ToastProvider>
          </Provider>
        );

        profileForm = () => wrapper.find('Dialog#editClinicProfile');
        expect(profileForm().props().open).to.be.false;

        const profileEditButton = wrapper.find('#clinic-profile-edit-trigger').hostNodes();
        profileEditButton.simulate('click');

        expect(profileForm().props().open).to.be.true;
      });

      it('should populate the profile edit form with clinic values', () => {
        expect(profileForm().find('input[name="name"]').prop('value')).to.equal('Test Clinic');
        expect(profileForm().find('select[name="country"]').prop('value')).to.equal('US');
        expect(profileForm().find('select[name="state"]').prop('value')).to.equal('NJ');
        expect(profileForm().find('input[name="city"]').prop('value')).to.equal('Gotham');
        expect(profileForm().find('input[name="address"]').prop('value')).to.equal('1 Test Ln');
        expect(profileForm().find('input[name="postalCode"]').prop('value')).to.equal('12345');
        expect(profileForm().find('input[name="website"]').prop('value')).to.equal('http://clinic.com');
        expect(profileForm().find('select[name="clinicType"]').prop('value')).to.equal('provider_practice');
        expect(profileForm().find('input[name="preferredBgUnits"][checked=true]').prop('value')).to.equal('mmol/L');
      });

      it('should submit updated clinic profile values maintaining timezone', done => {
        wrapper.find('input[name="name"]').simulate('change', { persist: noop, target: { name: 'name', value: 'name_updated' } });
        expect(wrapper.find('input[name="name"]').prop('value')).to.equal('name_updated');

        wrapper.find('select[name="country"]').simulate('change', { persist: noop, target: { name: 'country', value: 'CA' } });
        expect(wrapper.find('select[name="country"]').prop('value')).to.equal('CA');

        wrapper.find('select[name="state"]').simulate('change', { persist: noop, target: { name: 'state', value: 'ON' } });
        expect(wrapper.find('select[name="state"]').prop('value')).to.equal('ON');

        wrapper.find('input[name="city"]').simulate('change', { persist: noop, target: { name: 'city', value: 'city_updated' } });
        expect(wrapper.find('input[name="city"]').prop('value')).to.equal('city_updated');

        wrapper.find('input[name="address"]').simulate('change', { persist: noop, target: { name: 'address', value: 'address_updated' } });
        expect(wrapper.find('input[name="address"]').prop('value')).to.equal('address_updated');

        wrapper.find('input[name="postalCode"]').simulate('change', { persist: noop, target: { name: 'postalCode', value: 'L3X 9G2' } });
        expect(wrapper.find('input[name="postalCode"]').prop('value')).to.equal('L3X 9G2');

        wrapper.find('input[name="website"]').simulate('change', { persist: noop, target: { name: 'website', value: 'http://clinic_updated.com' } });
        expect(wrapper.find('input[name="website"]').prop('value')).to.equal('http://clinic_updated.com');

        wrapper.find('select[name="clinicType"]').simulate('change', { persist: noop, target: { name: 'clinicType', value: 'healthcare_system' } });
        expect(wrapper.find('select[name="clinicType"]').prop('value')).to.equal('healthcare_system');

        wrapper.find('input[name="preferredBgUnits"]').at(1).simulate('change', { persist: noop, target: { name: 'preferredBgUnits', value: 'mg/dL' } });
        expect(wrapper.find('input[name="preferredBgUnits"][checked=true]').prop('value')).to.equal('mg/dL');

        store.clearActions();
        wrapper.find('#editClinicProfileSubmit').hostNodes().simulate('click');

        setTimeout(() => {
          expect(store.getActions()).to.eql([
            { type: 'UPDATE_CLINIC_REQUEST' },
            {
              type: 'UPDATE_CLINIC_SUCCESS',
              payload: {
                clinicId: 'clinicID456',
                clinic: { updateReturn: 'success' },
              },
            },
          ]);
          expect(defaultProps.api.clinics.update.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.update,
            'clinicID456',
            {
              address: 'address_updated',
              city: 'city_updated',
              clinicType: 'healthcare_system',
              country: 'CA',
              name: 'name_updated',
              postalCode: 'L3X 9G2',
              state: 'ON',
              website: 'http://clinic_updated.com',
              preferredBgUnits: 'mg/dL',
              timezone: 'America/Toronto',
            }
          );

          expect(store.getActions()).to.eql([
            { type: 'UPDATE_CLINIC_REQUEST' },
            {
              type: 'UPDATE_CLINIC_SUCCESS',
              payload: {
                clinicId: 'clinicID456',
                clinic: { updateReturn: 'success' },
              },
            },
          ]);

          done();
        }, 0);
      });
    });
  });
});

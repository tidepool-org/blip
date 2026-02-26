import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicAdmin from '../../../app/pages/clinicadmin';
import { FETCH_CLINICIANS_FROM_CLINIC_FAILURE } from '../../../app/redux/constants/actionTypes';

const mockUseLocation = jest.fn();

jest.mock('../../../app/core/validation/postalCodes', () => ({}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

jest.mock('launchdarkly-react-client-sdk', () => {
  const actual = jest.requireActual('launchdarkly-react-client-sdk');
  return {
    ...actual,
    useFlags: () => ({
      showPrescriptions: true,
    }),
  };
});

jest.mock('../../../app/components/clinic/ClinicWorkspaceHeader', () => {
  const React = require('react');
  return function MockClinicWorkspaceHeader() {
    return React.createElement('div', null, 'stubbed clinic workspace header');
  };
});

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
  let view;
  let store;
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

  const renderClinicAdmin = (state = store) => {
    cleanup();
    return render(
      <Provider store={state}>
        <ToastProvider>
          <ClinicAdmin {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  };

  const getVisibleDialogById = (dialogId) => {
    const roots = Array.from(document.querySelectorAll(`#${dialogId}`));
    const visibleRoot = roots.find((root) => root.getAttribute('aria-hidden') !== 'true');
    return visibleRoot ? visibleRoot.querySelector('[role="dialog"]') : null;
  };

  const getRows = (container) => container.querySelectorAll('#clinicianTable tbody tr');
  const getCells = (container) => container.querySelectorAll('#clinicianTable tbody td');

  const clickActionMenuItemById = (itemId) => {
    const menuIcons = Array.from(document.querySelectorAll('[aria-label="info"]'));

    for (const icon of menuIcons) {
      fireEvent.click(icon);
      const menuItem = document.getElementById(itemId);
      if (menuItem) {
        fireEvent.click(menuItem);
        return true;
      }
    }

    return false;
  };

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
          created: '2021-09-19T16:27:59.504Z',
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
    defaultProps.api.clinics.deleteClinicianFromClinic.resetHistory();
    defaultProps.api.clinics.getCliniciansFromClinic.resetHistory();
    defaultProps.api.clinics.deleteClinicianInvite.resetHistory();
    defaultProps.api.clinics.resendClinicianInvite.resetHistory();
    defaultProps.api.clinics.update.resetHistory();
    store = mockStore(workingState);
    cleanup();
  });

  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: '/clinic-admin' });
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    view = renderClinicAdmin(store);
  });

  it('should render a clinic profile', () => {
    expect(screen.getByText('stubbed clinic workspace header')).to.exist;
  });

  it('should not render an Invite button for a clinic member', () => {
    expect(screen.queryByRole('button', { name: 'Invite New Clinic Team Member' })).to.not.exist;
  });

  it('should render a search bar', () => {
    const searchInput = view.container.querySelector('input[name="search-members"]');
    expect(searchInput).to.exist;
    fireEvent.change(searchInput, { target: { value: 'new search text' } });
    expect(searchInput.value).to.equal('new search text');
  });

  it('should render an empty Table with no data', () => {
    const table = view.container.querySelector('#clinicianTable');
    expect(table).to.exist;
    expect(getRows(view.container)).to.have.length(0);
  });

  it('should render a Table when data is available', () => {
    view.rerender(
      <Provider store={mockStore(fetchedDataState)}>
        <ToastProvider>
          <ClinicAdmin {...defaultProps} />
        </ToastProvider>
      </Provider>
    );

    expect(view.container.querySelector('#clinicianTable')).to.exist;
    expect(getRows(view.container)).to.have.length(1);
    expect(getCells(view.container).length).to.be.greaterThan(0);
  });

  context('logged in as a clinic admin', () => {
    beforeEach(() => {
      store = mockStore(fetchedMultipleAdminState);
      view = renderClinicAdmin(store);
      store.clearActions();
    });

    it('should render an Invite button', () => {
      const inviteButton = screen.getByRole('button', { name: 'Invite New Clinic Team Member' });
      expect(inviteButton).to.exist;

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

      fireEvent.click(inviteButton);
      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should render an Export List button', () => {
      const clock = sinon.useFakeTimers({
        now: new Date('2021-10-05T18:00:00.000Z').getTime()
      });

      const exportButton = screen.getByRole('button', { name: 'Export List' });
      expect(exportButton).to.exist;

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

      try {
        fireEvent.click(exportButton);

        expect(defaultProps.trackMetric.calledOnceWithExactly('Clinic - clicked export clinic member list', {
          clinicId: 'clinicID456',
        })).to.be.true;

        expect(createBlobSpy.calledOnceWithExactly([expectedCsv], { type: 'text/csv;charset=utf-8;' })).to.be.true;
        expect(createElementStub.calledOnceWithExactly('a')).to.be.true;
        expect(createObjectURLStub.calledOnceWithExactly(expectedBlob)).to.be.true;
        expect(createElementStub.returnValues[0].href).to.equal(expectedUrl);
        expect(createElementStub.returnValues[0].download).to.equal(expectedDownloadFileName);
        expect(createElementStub.returnValues[0].click.calledOnce).to.be.true;
      } finally {
        createElementStub.restore();
        createObjectURLStub.restore();
        createBlobSpy.restore();
        clock.restore();
      }
    });

    it('should render a "More" icon per row', () => {
      expect(view.container.querySelector('#clinicianTable')).to.exist;
      expect(getRows(view.container)).to.have.length(3);
      expect(getCells(view.container)).to.have.length(12);
      expect(document.querySelectorAll('[aria-label="info"]')).to.have.length(3);
    });

    context('logged in as the only clinic admin', () => {
      beforeEach(() => {
        store = mockStore(fetchedSingleAdminState);
        view = renderClinicAdmin(store);
      });

      it('should only allow editing clinician info within the "More" popover menu', () => {
        const icon = document.querySelector('[aria-label="info"]');
        expect(icon).to.exist;
        fireEvent.click(icon);

        expect(screen.getByRole('button', { name: /Edit Clinician Information/i })).to.exist;
        expect(screen.queryByRole('button', { name: /Remove User/i })).to.not.exist;
      });
    });

    it('should display menu when "More" icon is clicked', () => {
      const firstMenuIcon = document.querySelector('[aria-label="info"]');
      expect(firstMenuIcon).to.exist;
      fireEvent.click(firstMenuIcon);

      const hasAction =
        screen.queryByRole('button', { name: /Edit Clinician Information/i }) ||
        screen.queryByRole('button', { name: /Resend Invite/i }) ||
        screen.queryByRole('button', { name: /Revoke Invite/i });
      expect(hasAction).to.exist;
    });

    it('should navigate to "/clinician-edit" when "Edit" menu action is clicked', () => {
      store.clearActions();
      const clicked = clickActionMenuItemById('edit-clinicianUserId456');
      expect(clicked).to.be.true;
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
      const clicked = clickActionMenuItemById('delete-clinicianUserId456');
      expect(clicked).to.be.true;
      expect(screen.getAllByText(/will lose all access to this clinic workspace and patient list/i).length).to.be.greaterThan(0);

      const dialog = screen.getByRole('dialog');
      fireEvent.click(within(dialog).getByRole('button', { name: /Remove User/i }));
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
      const clicked = clickActionMenuItemById('resendInvite-clinicianUserId789InviteId');
      expect(clicked).to.be.true;

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Confirm Resending Invite')).to.exist;
      expect(within(dialog).getByText(/10\/19\/2021 at 4:27 pm/i)).to.exist;

      fireEvent.click(within(dialog).getByRole('button', { name: /Resend Invite/i }));
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
      const clicked = clickActionMenuItemById('deleteInvite-clinicianUserId789InviteId');
      expect(clicked).to.be.true;

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Confirm Revoking Invite')).to.exist;
      fireEvent.click(within(dialog).getByRole('button', { name: /Revoke Invite/i }));
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
      const initialState = merge({}, fetchedDataState);
      initialState.blip.working.fetchingCliniciansFromClinic.completed = false;
      store = mockStore(initialState);

      defaultProps.trackMetric.resetHistory();
      view = renderClinicAdmin(store);

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
      renderClinicAdmin(noFetchStore);

      expect(noFetchStore.getActions()).to.eql([]);
      sinon.assert.notCalled(defaultProps.api.clinics.getCliniciansFromClinic);
    });

    it('should fetch clinicians if not already in progress', () => {
      const fetchStore = mockStore(fetchedMultipleAdminState);
      renderClinicAdmin(fetchStore);
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
      renderClinicAdmin(errorStore);
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
      view = renderClinicAdmin(store);
      store.clearActions();
    });

    it('should render the main clinic workspace details', () => {
      const workspaceDetails = view.container.querySelector('#clinicWorkspaceDetails');
      expect(workspaceDetails).to.exist;
      expect(view.container.querySelector('#clinicName').textContent).to.equal('Test Clinic');
      expect(view.container.querySelector('#clinicType').textContent).to.equal('Type : Provider Practice');
      expect(view.container.querySelector('#clinicAddress').textContent).to.equal('Address : 1 Test Ln, Gotham NJ, 12345, US');
      expect(view.container.querySelector('#clinicWebsite').textContent).to.equal('Website : http://clinic.com');
      expect(view.container.querySelector('#clinicPreferredBloodGlucoseUnits').textContent).to.equal('Preferred blood glucose units : mmol/L');
    });

    it('should render the workspace plan, description, feedback, and resolution link', () => {
      const workspacePlan = view.container.querySelector('#clinicWorkspacePlan');
      expect(workspacePlan).to.exist;

      expect(view.container.querySelector('#clinicPlanName').textContent).to.equal('Basey Base');
      expect(view.container.querySelector('#clinicPatientLimitDescription').textContent).to.equal('Basey Base is an OK-is plan, but you can do better');
      expect(view.container.querySelector('#clinicPatientLimitFeedback').textContent).to.equal('Uh-oh.  Not looking good here');
      expect(view.container.querySelector('#clinicPatientLimitResolutionLink').textContent).to.equal('Click this link');
      expect(view.container.querySelector('#clinicPatientLimitResolutionLink').getAttribute('href')).to.equal('https://resolutions.com');
    });
  });

  describe('clinic profile updating', () => {
    let store;
    let profileForm;

    context('clinic non-admin team member', () => {
      beforeEach(() => {
        store = mockStore(clinicMemberState);

        view = renderClinicAdmin(store);
      });

      it('should not show a clinic profile edit button', () => {
        expect(view.container.querySelector('#clinic-profile-edit-trigger')).to.not.exist;
      });
    });

    context('clinic admin team member', () => {
      beforeEach(() => {
        store = mockStore(clinicAdminState);

        view = renderClinicAdmin(store);

        profileForm = () => getVisibleDialogById('editClinicProfile');
        expect(profileForm()).to.not.exist;

        fireEvent.click(view.container.querySelector('#clinic-profile-edit-trigger'));

        expect(profileForm()).to.exist;
      });

      it('should populate the profile edit form with clinic values', () => {
        const form = profileForm();
        expect(form.querySelector('input[name="name"]').value).to.equal('Test Clinic');
        expect(form.querySelector('select[name="country"]').value).to.equal('US');
        expect(form.querySelector('select[name="state"]').value).to.equal('NJ');
        expect(form.querySelector('input[name="city"]').value).to.equal('Gotham');
        expect(form.querySelector('input[name="address"]').value).to.equal('1 Test Ln');
        expect(form.querySelector('input[name="postalCode"]').value).to.equal('12345');
        expect(form.querySelector('input[name="website"]').value).to.equal('http://clinic.com');
        expect(form.querySelector('select[name="clinicType"]').value).to.equal('provider_practice');
        expect(form.querySelector('input[name="preferredBgUnits"]:checked').value).to.equal('mmol/L');
      });

      it('should submit updated clinic profile values', async () => {
        fireEvent.change(profileForm().querySelector('input[name="name"]'), { persist: noop, target: { name: 'name', value: 'name_updated' } });
        expect(profileForm().querySelector('input[name="name"]').value).to.equal('name_updated');

        fireEvent.change(profileForm().querySelector('select[name="country"]'), { persist: noop, target: { name: 'country', value: 'CA' } });
        expect(profileForm().querySelector('select[name="country"]').value).to.equal('CA');

        fireEvent.change(profileForm().querySelector('select[name="state"]'), { persist: noop, target: { name: 'state', value: 'ON' } });
        expect(profileForm().querySelector('select[name="state"]').value).to.equal('ON');

        fireEvent.change(profileForm().querySelector('input[name="city"]'), { persist: noop, target: { name: 'city', value: 'city_updated' } });
        expect(profileForm().querySelector('input[name="city"]').value).to.equal('city_updated');

        fireEvent.change(profileForm().querySelector('input[name="address"]'), { persist: noop, target: { name: 'address', value: 'address_updated' } });
        expect(profileForm().querySelector('input[name="address"]').value).to.equal('address_updated');

        fireEvent.change(profileForm().querySelector('input[name="postalCode"]'), { persist: noop, target: { name: 'postalCode', value: 'L3X 9G2' } });
        expect(profileForm().querySelector('input[name="postalCode"]').value).to.equal('L3X 9G2');

        fireEvent.change(profileForm().querySelector('input[name="website"]'), { persist: noop, target: { name: 'website', value: 'http://clinic_updated.com' } });
        expect(profileForm().querySelector('input[name="website"]').value).to.equal('http://clinic_updated.com');

        fireEvent.change(profileForm().querySelector('select[name="clinicType"]'), { persist: noop, target: { name: 'clinicType', value: 'healthcare_system' } });
        expect(profileForm().querySelector('select[name="clinicType"]').value).to.equal('healthcare_system');

        fireEvent.click(profileForm().querySelector('input[name="preferredBgUnits"][value="mg/dL"]'));
        expect(profileForm().querySelector('input[name="preferredBgUnits"]:checked').value).to.equal('mg/dL');

        store.clearActions();
        const submitButton = profileForm().querySelector('#editClinicProfileSubmit');
        const formElement = submitButton?.closest('form');
        if (formElement) {
          fireEvent.submit(formElement);
        } else {
          fireEvent.click(submitButton);
        }

        await waitFor(() => {
          expect(defaultProps.api.clinics.update.callCount).to.equal(1);
        });

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
      });

      it('should populate updated clinic profile values when re-opening form after edit', async () => {
        const form = profileForm();
        expect(form.querySelector('input[name="name"]').value).to.equal('Test Clinic');

        fireEvent.change(form.querySelector('input[name="name"]'), { persist: noop, target: { name: 'name', value: 'name_updated' } });
        expect(form.querySelector('input[name="name"]').value).to.equal('name_updated');

        fireEvent.click(form.querySelector('#editClinicProfileSubmit'));

        await waitFor(() => {
          expect(defaultProps.api.clinics.update.callCount).to.equal(1);
        });

        sinon.assert.calledWith(
          defaultProps.api.clinics.update,
          'clinicID456',
          sinon.match({
            name: 'name_updated',
          })
        );

        expect(profileForm().querySelector('input[name="name"]').value).to.equal('name_updated');
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

        view = renderClinicAdmin(store);

        profileForm = () => getVisibleDialogById('editClinicProfile');
        expect(profileForm()).to.not.exist;

        fireEvent.click(view.container.querySelector('#clinic-profile-edit-trigger'));

        expect(profileForm()).to.exist;
      });

      it('should populate the profile edit form with clinic values', () => {
        const form = profileForm();
        expect(form.querySelector('input[name="name"]').value).to.equal('Test Clinic');
        expect(form.querySelector('select[name="country"]').value).to.equal('US');
        expect(form.querySelector('select[name="state"]').value).to.equal('NJ');
        expect(form.querySelector('input[name="city"]').value).to.equal('Gotham');
        expect(form.querySelector('input[name="address"]').value).to.equal('1 Test Ln');
        expect(form.querySelector('input[name="postalCode"]').value).to.equal('12345');
        expect(form.querySelector('input[name="website"]').value).to.equal('http://clinic.com');
        expect(form.querySelector('select[name="clinicType"]').value).to.equal('provider_practice');
        expect(form.querySelector('input[name="preferredBgUnits"]:checked').value).to.equal('mmol/L');
      });

      it('should submit updated clinic profile values maintaining timezone', async () => {
        fireEvent.change(profileForm().querySelector('input[name="name"]'), { persist: noop, target: { name: 'name', value: 'name_updated' } });
        expect(profileForm().querySelector('input[name="name"]').value).to.equal('name_updated');

        fireEvent.change(profileForm().querySelector('select[name="country"]'), { persist: noop, target: { name: 'country', value: 'CA' } });
        expect(profileForm().querySelector('select[name="country"]').value).to.equal('CA');

        fireEvent.change(profileForm().querySelector('select[name="state"]'), { persist: noop, target: { name: 'state', value: 'ON' } });
        expect(profileForm().querySelector('select[name="state"]').value).to.equal('ON');

        fireEvent.change(profileForm().querySelector('input[name="city"]'), { persist: noop, target: { name: 'city', value: 'city_updated' } });
        expect(profileForm().querySelector('input[name="city"]').value).to.equal('city_updated');

        fireEvent.change(profileForm().querySelector('input[name="address"]'), { persist: noop, target: { name: 'address', value: 'address_updated' } });
        expect(profileForm().querySelector('input[name="address"]').value).to.equal('address_updated');

        fireEvent.change(profileForm().querySelector('input[name="postalCode"]'), { persist: noop, target: { name: 'postalCode', value: 'L3X 9G2' } });
        expect(profileForm().querySelector('input[name="postalCode"]').value).to.equal('L3X 9G2');

        fireEvent.change(profileForm().querySelector('input[name="website"]'), { persist: noop, target: { name: 'website', value: 'http://clinic_updated.com' } });
        expect(profileForm().querySelector('input[name="website"]').value).to.equal('http://clinic_updated.com');

        fireEvent.change(profileForm().querySelector('select[name="clinicType"]'), { persist: noop, target: { name: 'clinicType', value: 'healthcare_system' } });
        expect(profileForm().querySelector('select[name="clinicType"]').value).to.equal('healthcare_system');

        fireEvent.click(profileForm().querySelector('input[name="preferredBgUnits"][value="mg/dL"]'));
        expect(profileForm().querySelector('input[name="preferredBgUnits"]:checked').value).to.equal('mg/dL');

        store.clearActions();
        const submitButton = profileForm().querySelector('#editClinicProfileSubmit');
        const formElement = submitButton?.closest('form');
        if (formElement) {
          fireEvent.submit(formElement);
        } else {
          fireEvent.click(submitButton);
        }

        await waitFor(() => {
          expect(defaultProps.api.clinics.update.callCount).to.equal(1);
        });

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
      });
    });
  });
});

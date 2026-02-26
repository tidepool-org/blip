import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import moment from 'moment';
import ClinicWorkspaceHeader from '../../../app/components/clinic/ClinicWorkspaceHeader';

const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicWorkspaceHeader', () => {
  let defaultProps;
  let store;

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const workingState = {
    blip: {
      working: {
        updatingClinic: defaultWorkingState,
      },
    },
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
          address: '1 Address Ln, City Zip',
          country: 'US',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
          shareCode: 'ABCD-ABCD-ABCD',
          preferredBgUnits: 'mmol/L',
          tier: 'tier0100',
          patientCounts: { demo: 1, plan: 251, total: 252 },
          fetchedPatientTotalCount: 251,
          patientCountSettings: {
            hardLimit: {
              plan: 250,
              startDate: moment().subtract(1, 'day').toISOString(),
            },
          },
          ui: {
            text: {
              planDisplayName: 'Base',
            },
            display: {
              patientLimit: true,
              planName: true,
              patientCount: true,
            },
            warnings: {
              limitReached: true,
              limitApproaching: true,
            },
          },
        },
      },
      loggedInUserId: 'clinicianUserId123',
      selectedClinicId: 'clinicID456',
      pendingSentInvites: [],
    }),
  };

  const renderHeader = (providedStore = store) => render(
    <Provider store={providedStore}>
      <ToastProvider>
        <ClinicWorkspaceHeader {...defaultProps} />
      </ToastProvider>
    </Provider>
  );

  beforeEach(() => {
    defaultProps = {
      trackMetric: sinon.stub(),
      t: sinon.stub().callsFake((string) => string),
      api: {},
    };

    store = mockStore(clinicMemberState);
    mockUseLocation.mockReturnValue({ pathname: '/clinic-workspace' });
  });

  it('should render a link to the clinic workspace page if currently on clinic admin', () => {
    mockUseLocation.mockReturnValue({ pathname: '/clinic-admin' });

    renderHeader();

    const link = document.querySelector('#profileNavigationButton');
    expect(link).to.exist;
    expect(link.textContent).to.equal('View Patient List');

    store.clearActions();
    fireEvent.click(link);

    expect(store.getActions()).to.eql([
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: ['/clinic-workspace'],
          method: 'push',
        },
      },
    ]);
  });

  it('should render a link to the clinic workspace page if currently on clinic profile editing', () => {
    mockUseLocation.mockReturnValue({ pathname: '/clinic-profile' });

    renderHeader();

    const link = document.querySelector('#profileNavigationButton');
    expect(link).to.exist;
    expect(link.textContent).to.equal('View Patient List');

    store.clearActions();
    fireEvent.click(link);

    expect(store.getActions()).to.eql([
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: ['/clinic-workspace'],
          method: 'push',
        },
      },
    ]);
  });

  describe('profile details', () => {
    it('should render the clinic name', () => {
      renderHeader();
      expect(document.querySelector('#clinicProfileDetails').textContent).to.include('new_clinic_name');
    });

    it('should render the clinic share code', () => {
      renderHeader();
      expect(document.querySelector('#clinicProfileDetails').textContent).to.include('ABCD-ABCD-ABCD');
    });

    it('should render the clinic plan name', () => {
      renderHeader();
      expect(document.querySelector('#clinicProfilePlan').textContent).to.equal('Base');
    });

    it('should render the patient count and limit', () => {
      renderHeader();
      expect(document.querySelector('#clinicPatientCount').textContent.replace(/\s+/g, '')).to.equal('PatientAccounts:251');
      // hardLimit.plan=250 minus patientCounts.plan=251 = -1 raw remaining;
      // ClinicWorkspaceHeader uses Math.max([...remaining, 0]) so negative values floor to 0.
      expect(document.querySelector('#clinicPatientLimits').textContent).to.equal('0 remaining');
    });

    it('should render the unlock plans link for clinics with limit warnings', () => {
      renderHeader();
      const plansLink = document.querySelector('#clinicProfileUnlockPlansLink');
      expect(plansLink).to.exist;
      expect(plansLink.textContent).to.equal('Unlock Plans');
    });
  });
});

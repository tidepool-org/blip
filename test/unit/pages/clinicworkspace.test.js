import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { render } from '@testing-library/react';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicWorkspace from '../../../app/pages/clinicworkspace';

let mockUseFlags = () => ({ showPrescriptions: true });

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: (...args) => mockUseFlags(...args),
}));

jest.mock('../../../app/components/clinic/ClinicWorkspaceHeader', () => () => <div>stubbed clinic profile</div>);
jest.mock('../../../app/pages/share', () => ({
  PatientInvites: () => <div>stubbed patient invites</div>,
}));
jest.mock('../../../app/pages/clinicworkspace/ClinicPatients', () => () => <div>stubbed clinic patients</div>);
jest.mock('../../../app/pages/prescription/Prescriptions', () => () => <div>stubbed patient prescriptions</div>);

/* global chai */
/* global sinon */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicWorkspace', () => {
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
        fetchingPatientInvites: defaultWorkingState,
      },
    },
  };

  const fetchedWorkingState = {
    blip: {
      working: {
        fetchingPatientInvites: {
          inProgress: false,
          completed: true,
          notification: null,
        },
      },
    },
  };

  const fetchedDataState = {
    blip: merge({}, fetchedWorkingState.blip, {
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
        },
      },
      loggedInUserId: 'clinicianUserId123',
      selectedClinicId: 'clinicID456',
      pendingSentInvites: [],
    }),
  };

  const renderPage = (route = '', providedStore = store) => {
    return render(
      <Provider store={providedStore}>
        <ToastProvider>
          <MemoryRouter initialEntries={[`/clinic-workspace/${route}`]}>
            <Route path='/clinic-workspace/:tab?' children={() => (<ClinicWorkspace {...defaultProps} />)} />
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    defaultProps = {
      trackMetric: sinon.stub(),
      t: sinon.stub().callsFake((string) => string),
      api: {
        clinics: {
          getPatientInvites: sinon.stub().callsArgWith(1, null, { invitesReturn: 'success' }),
        },
      },
    };

    store = mockStore(fetchedDataState);
    mockUseFlags = () => ({ showPrescriptions: true });
  });

  context('initial fetching', () => {
    beforeEach(() => {
      renderPage('', mockStore({
        blip: {
          ...fetchedDataState.blip,
          working: workingState.blip.working,
        },
      }));
    });

    it('should fetch patient invites', () => {
      sinon.assert.callCount(defaultProps.api.clinics.getPatientInvites, 1);
      sinon.assert.calledWith(defaultProps.api.clinics.getPatientInvites, 'clinicID456');
    });
  });

  it('should render a clinic profile', () => {
    const { container } = renderPage();
    expect(container.textContent).to.include('stubbed clinic profile');
  });

  it('should render the patients tab by default when no tab route param provided', () => {
    const { container } = renderPage();
    expect(container.querySelector('button[aria-selected="true"]')?.textContent).to.equal('Patient List');
    expect(container.textContent).to.include('stubbed clinic patients');
  });

  it('should render the patients tab by default when an unmatched route param provided', () => {
    const { container } = renderPage('foo');
    expect(container.querySelector('button[aria-selected="true"]')?.textContent).to.equal('Patient List');
    expect(container.textContent).to.include('stubbed clinic patients');
  });

  it('should render the patients tab by default when `patients` route param provided', () => {
    const { container } = renderPage('patients');
    expect(container.querySelector('button[aria-selected="true"]')?.textContent).to.equal('Patient List');
    expect(container.textContent).to.include('stubbed clinic patients');
  });

  it('should render the invites tab by default when `invites` route param provided', () => {
    const { container } = renderPage('invites');
    expect(container.querySelector('button[aria-selected="true"]')?.textContent).to.equal('Invites (0)');
    expect(container.textContent).to.include('stubbed patient invites');
  });

  it('should render the prescriptions tab by default when `prescriptions` route param provided', () => {
    const { container } = renderPage('prescriptions');
    expect(container.querySelector('button[aria-selected="true"]')?.textContent).to.equal('Tidepool Loop Start Orders');
    expect(container.textContent).to.include('stubbed patient prescriptions');
  });
});

import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicWorkspace from '../../../app/pages/clinicworkspace';

/* global chai */
/* global sinon */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicWorkspace', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        getPatientInvites: sinon.stub().callsArgWith(1, null, { invitesReturn: 'success' }),
      },
    },
  };

  before(() => {
    mount = createMount();
    ClinicWorkspace.__Rewire__('ClinicWorkspaceHeader', sinon.stub().returns('stubbed clinic profile'));
    ClinicWorkspace.__Rewire__('PatientInvites', () => (<div>stubbed patient invites</div>));
    ClinicWorkspace.__Rewire__('ClinicPatients', () => (<div>stubbed clinic patients</div>));
    ClinicWorkspace.__Rewire__('Prescriptions', sinon.stub().returns('stubbed patient prescriptions'));

    ClinicWorkspace.__Rewire__('useFlags', sinon.stub().returns({
      showPrescriptions: true,
    }));
  });

  after(() => {
    mount.cleanUp();
    ClinicWorkspace.__ResetDependency__('ClinicWorkspaceHeader');
    ClinicWorkspace.__ResetDependency__('PatientInvites');
    ClinicWorkspace.__ResetDependency__('ClinicPatients');
    ClinicWorkspace.__ResetDependency__('Prescriptions');
    ClinicWorkspace.__ResetDependency__('useFlags');
  });

  afterEach(() => {
    defaultProps.api.clinics.getPatientInvites.resetHistory();
  });

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

  let store = mockStore(fetchedDataState);

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();

    wrapper = (route = '', providedStore = store) => {
      store = providedStore;

      return mount(
        <Provider store={store}>
          <ToastProvider>
            <MemoryRouter initialEntries={[`/clinic-workspace/${route}`]}>
              <Route path='/clinic-workspace/:tab?' children={() => (<ClinicWorkspace {...defaultProps} />)} />
            </MemoryRouter>
          </ToastProvider>
        </Provider>
      );
    }
  });

  context('initial fetching', () => {
    let initialWrapper;

    beforeEach(() => {
      initialWrapper = wrapper('', mockStore({
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
    expect(wrapper().text()).to.include('stubbed clinic profile');
  });

  it('should render the patients tab by default when no tab route param provided', () => {
    expect(wrapper().find('button[aria-selected=true]').hostNodes().text()).to.equal('Patient List');
    expect(wrapper().find('div[role="tabpanel"][hidden=false]').parent('#patientsTab')).to.have.lengthOf(1);
  });

  it('should render the patients tab by default when an unmatched route param provided', () => {
    expect(wrapper('foo').find('button[aria-selected=true]').hostNodes().text()).to.equal('Patient List');
    expect(wrapper().find('div[role="tabpanel"][hidden=false]').parent('#patientsTab')).to.have.lengthOf(1);
  });

  it('should render the patients tab by default when `patients` route param provided', () => {
    expect(wrapper('patients').find('button[aria-selected=true]').hostNodes().text()).to.equal('Patient List');
    expect(wrapper().find('div[role="tabpanel"][hidden=false]').parent('#patientsTab')).to.have.lengthOf(1);
  });

  it('should render the invites tab by default when `invites` route param provided', () => {
    expect(wrapper('invites').find('button[aria-selected=true]').hostNodes().text()).to.equal('Invites (0)');
    expect(wrapper().find('div[role="tabpanel"][hidden=false]').parent('#invitesTab')).to.have.lengthOf(1);
  });

  it('should render the prescriptions tab by default when `prescriptions` route param provided', () => {
    expect(wrapper('prescriptions').find('button[aria-selected=true]').hostNodes().text()).to.equal('Tidepool Loop Start Orders');
    expect(wrapper().find('div[role="tabpanel"][hidden=false]').parent('#prescriptionsTab')).to.have.lengthOf(1);
  });
});

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
      },
    },
  };

  before(() => {
    mount = createMount();
    ClinicWorkspace.__Rewire__('ClinicProfile', sinon.stub().returns('stubbed clinic profile'));
    ClinicWorkspace.__Rewire__('PatientInvites', () => (<div>stubbed patient invites</div>));
    ClinicWorkspace.__Rewire__('PeopleTable', sinon.stub().returns('stubbed patient invites'));
    ClinicWorkspace.__Rewire__('Prescriptions', sinon.stub().returns('stubbed patient invites'));
    ClinicWorkspace.__Rewire__('config', { RX_ENABLED: true });
  });

  after(() => {
    mount.cleanUp();
    ClinicWorkspace.__ResetDependency__('ClinicProfile');
    ClinicWorkspace.__ResetDependency__('PatientInvites');
    ClinicWorkspace.__ResetDependency__('PeopleTable');
    ClinicWorkspace.__ResetDependency__('Prescriptions');
    ClinicWorkspace.__ResetDependency__('config');
  });

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const workingState = {
    blip: {
      working: {
        fetchingPatientInvites: {
          inProgress: false,
          completed: true,
          notification: null,
        },
        fetchingPatientsForClinic: {
          inProgress: false,
          completed: true,
          notification: null,
        },
        deletingPatientFromClinic: defaultWorkingState,
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

  let store = mockStore(fetchedDataState);

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();

    wrapper = route => mount(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={[`/clinic-workspace/${route}`]}>
            <Route path='/clinic-workspace/:tab?' children={() => (<ClinicWorkspace {...defaultProps} />)} />
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );
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

  it('should render the patients tab by default when `patient` route param provided', () => {
    expect(wrapper('patients').find('button[aria-selected=true]').hostNodes().text()).to.equal('Patient List');
    expect(wrapper().find('div[role="tabpanel"][hidden=false]').parent('#patientsTab')).to.have.lengthOf(1);
  });

  it('should render the invites tab by default when `invites` route param provided', () => {
    expect(wrapper('invites').find('button[aria-selected=true]').hostNodes().text()).to.equal('Invites (0)');
    expect(wrapper().find('div[role="tabpanel"][hidden=false]').parent('#invitesTab')).to.have.lengthOf(1);
  });

  it('should render the prescriptions tab by default when `prescriptions` route param provided', () => {
    expect(wrapper('prescriptions').find('button[aria-selected=true]').hostNodes().text()).to.equal('Prescriptions');
    expect(wrapper().find('div[role="tabpanel"][hidden=false]').parent('#prescriptionsTab')).to.have.lengthOf(1);
  });
});

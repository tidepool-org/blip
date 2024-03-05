import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicWorkspaceHeader from '../../../app/components/clinic/ClinicWorkspaceHeader';
import Button from '../../../app/components/elements/Button';

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

describe('ClinicWorkspaceHeader', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
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
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
          shareCode: 'ABCD-ABCD-ABCD',
          preferredBgUnits: 'mmol/L',
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
          clinicians: {
            clinicianUserId123: {
              email: 'clinic@example.com',
              id: 'clinicianUserId123',
              roles: ['CLINIC_ADMIN'],
            },
          },
          patients: {},
          id: 'clinicID456',
          address: '1 Address Ln, City Zip',
          postalCode: '12345',
          city: 'Gotham',
          state: 'New Jersey',
          country: 'US',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
          shareCode: 'ABCD-ABCD-ABCD',
          website: 'http://clinic.com',
          clinicType: 'provider_practice',
          preferredBgUnits: 'mmol/L',
        },
      },
    },
  };

  let store = mockStore(clinicMemberState);

  before(() => {
    ClinicWorkspaceHeader.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/clinic-workspace' }));
    ClinicWorkspaceHeader.__Rewire__('countries', {
      getNames: sinon.stub().returns({
        US: 'United States',
        CA: 'Canada',
      }),
      registerLocale: sinon.stub(),
      getAlpha2Codes: sinon.stub().returns({
        US: 'US',
        CA: 'CA',
      }),
    });
  });

  after(() => {
    ClinicWorkspaceHeader.__ResetDependency__('useLocation');
    ClinicWorkspaceHeader.__ResetDependency__('countries');
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();

    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <ClinicWorkspaceHeader {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  it('should render a link to the clinic workspace page if currently on clinic admin', () => {
    ClinicWorkspaceHeader.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/clinic-admin'}));

    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <ClinicWorkspaceHeader {...defaultProps} />
        </ToastProvider>
      </Provider>
    );

    const link = wrapper.find(Button).filter({ variant: 'textSecondary' });
    expect(link).to.have.length(1);
    expect(link.text()).to.equal('View Patient List');
    expect(link.props().onClick).to.be.a('function');
    store.clearActions();

    const expectedActions = [
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: [
            '/clinic-workspace',
          ],
          method: 'push',
        },
      },
    ];

    link.props().onClick();
    const actions = store.getActions();
    expect(actions).to.eql(expectedActions);
  });

  it('should render a link to the clinic workspace page if currently on clinic profile editing', () => {
    ClinicWorkspaceHeader.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/clinic-profile'}));

    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <ClinicWorkspaceHeader {...defaultProps} />
        </ToastProvider>
      </Provider>
    );

    const link = wrapper.find(Button).filter({ variant: 'textSecondary' });
    expect(link).to.have.length(1);
    expect(link.text()).to.equal('View Patient List');
    expect(link.props().onClick).to.be.a('function');
    store.clearActions();

    const expectedActions = [
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: [
            '/clinic-workspace',
          ],
          method: 'push',
        },
      },
    ];

    link.props().onClick();
    const actions = store.getActions();
    expect(actions).to.eql(expectedActions);
  });

  describe('profile details', () => {
    it('should render the clinic name', () => {
      const details = wrapper.find('#clinicProfileDetails').hostNodes();
      expect(details.find('span').at(0).text()).to.equal('new_clinic_name');
    });

    it('should render the clinic share code', () => {
      const details = wrapper.find('#clinicProfileDetails').hostNodes();
      expect(details.find('span').at(1).text()).to.equal('ABCD-ABCD-ABCD');
    });
  });
});

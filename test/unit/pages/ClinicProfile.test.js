import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicProfile from '../../../app/components/clinic/ClinicProfile';
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

describe('ClinicProfile', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        update: sinon.stub().callsArgWith(2, null, { updateReturn: 'success' }),
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
          clinicSize: '0-249',
          phoneNumbers: [
            {
              number: '(888) 555-5555',
              type: 'Office',
            },
          ],
        },
      },
    },
  };

  let store = mockStore(clinicMemberState);

  before(() => {
    ClinicProfile.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/clinic-workspace' }));
    ClinicProfile.__Rewire__('countries', {
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
    ClinicProfile.__ResetDependency__('useLocation');
    ClinicProfile.__ResetDependency__('countries');
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();

    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <ClinicProfile {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  it('should render the header', () => {
    const header = wrapper.find('#clinic-profile-header').hostNodes();
    expect(header).to.have.lengthOf(1);
    expect(header.find('h3').text()).to.equal('Clinic Profile');
  });

  it('should render a link to the clinic admin page if currently on clinic workspace', () => {
    const link = wrapper.find(Button).filter({ variant: 'textPrimary' });
    expect(link).to.have.length(1);
    expect(link.text()).to.equal('View Clinic Members');
    expect(link.props().onClick).to.be.a('function');
    store.clearActions();

    const expectedActions = [
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: [
            '/clinic-admin',
          ],
          method: 'push',
        },
      },
    ];

    link.props().onClick();
    const actions = store.getActions();
    expect(actions).to.eql(expectedActions);
  });

  it('should render a link to the clinic workspace page if currently on clinic admin', () => {
    ClinicProfile.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/clinic-admin'}));

    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <ClinicProfile {...defaultProps} />
        </ToastProvider>
      </Provider>
    );

    const link = wrapper.find(Button).filter({ variant: 'textPrimary' });
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
      expect(details.find('h3').at(0).text()).to.equal('new_clinic_name');
    });

    it('should render the clinic share code', () => {
      const details = wrapper.find('#clinicProfileDetails').hostNodes();
      expect(details.find('h3').at(1).text()).to.equal('ABCD-ABCD-ABCD');
    });
  });

  describe('profile editing', () => {
    context('non-admin clinic team member', () => {
      it('should not show a profile edit button', () => {
        const profileButton = wrapper.find('button#profileEditButton');
        expect(profileButton).to.have.lengthOf(0);
      });
    });

    context('clinic admin team member', () => {
      beforeEach(() => {
        store = mockStore(clinicAdminState);

        wrapper = mount(
          <Provider store={store}>
            <ToastProvider>
              <ClinicProfile {...defaultProps} />
            </ToastProvider>
          </Provider>
        );
      });

      it('should show a profile edit button that opens up a clinic edit form', () => {
        const profileButton = wrapper.find('button#profileEditButton');
        expect(profileButton).to.have.lengthOf(1);
        expect(profileButton.text()).to.equal('Edit Clinic Profile');

        const profileForm = () => wrapper.find('form#clinic-profile-update');
        expect(profileForm()).to.have.lengthOf(0);
        profileButton.simulate('click');
        expect(profileForm()).to.have.lengthOf(1);
      });

      it('should populate the profile edit form with clinic values', () => {
        const profileButton = wrapper.find('button#profileEditButton');
        profileButton.simulate('click');

        const profileForm = wrapper.find('form#clinic-profile-update');
        expect(profileForm).to.have.lengthOf(1);

        expect(profileForm.find('input[name="name"]').prop('value')).to.equal('new_clinic_name');
        expect(profileForm.find('input[name="phoneNumbers.0.number"]').prop('defaultValue')).to.equal('(888) 555-5555');
        expect(profileForm.find('select[name="country"]').prop('value')).to.equal('US');
        expect(profileForm.find('input[name="address"]').prop('value')).to.equal('1 Address Ln, City Zip');
        expect(profileForm.find('input[name="city"]').prop('value')).to.equal('Gotham');
        expect(profileForm.find('input[name="state"]').prop('value')).to.equal('New Jersey');
        expect(profileForm.find('input[name="postalCode"]').prop('value')).to.equal('12345');
        expect(profileForm.find('input[name="website"]').prop('value')).to.equal('http://clinic.com');
        expect(profileForm.find('input[name="clinicType"][checked=true]').prop('value')).to.equal('provider_practice');
        expect(profileForm.find('input[name="clinicSize"][checked=true]').prop('value')).to.equal('0-249');
      });

      it('should submit updated clinic profile values', done => {
        const profileButton = wrapper.find('button#profileEditButton');
        profileButton.simulate('click');

        const profileForm = wrapper.find('form#clinic-profile-update');
        expect(profileForm).to.have.lengthOf(1);

        wrapper.find('input[name="name"]').simulate('change', { persist: noop, target: { name: 'name', value: 'name_updated' } });
        expect(wrapper.find('input[name="name"]').prop('value')).to.equal('name_updated');

        wrapper.find('input[name="phoneNumbers.0.number"]').simulate('change', { persist: noop, target: { name: 'phoneNumbers.0.number', value: '(888) 555-6666' } });
        expect(wrapper.find('input[name="phoneNumbers.0.number"]').prop('defaultValue')).to.equal('(888) 555-6666');

        wrapper.find('select[name="country"]').simulate('change', { persist: noop, target: { name: 'country', value: 'CA' } });
        expect(wrapper.find('select[name="country"]').prop('value')).to.equal('CA');

        wrapper.find('input[name="address"]').simulate('change', { persist: noop, target: { name: 'address', value: 'address_updated' } });
        expect(wrapper.find('input[name="address"]').prop('value')).to.equal('address_updated');

        wrapper.find('input[name="city"]').simulate('change', { persist: noop, target: { name: 'city', value: 'city_updated' } });
        expect(wrapper.find('input[name="city"]').prop('value')).to.equal('city_updated');

        wrapper.find('input[name="state"]').simulate('change', { persist: noop, target: { name: 'state', value: 'state_updated' } });
        expect(wrapper.find('input[name="state"]').prop('value')).to.equal('state_updated');

        wrapper.find('input[name="postalCode"]').simulate('change', { persist: noop, target: { name: 'postalCode', value: '65432' } });
        expect(wrapper.find('input[name="postalCode"]').prop('value')).to.equal('65432');

        wrapper.find('input[name="website"]').simulate('change', { persist: noop, target: { name: 'website', value: 'http://clinic_updated.com' } });
        expect(wrapper.find('input[name="website"]').prop('value')).to.equal('http://clinic_updated.com');

        wrapper.find('input[name="clinicType"]').at(1).simulate('change', { persist: noop, target: { name: 'clinicType', value: 'healthcare_system' } });
        expect(wrapper.find('input[name="clinicType"][checked=true]').prop('value')).to.equal('healthcare_system');

        wrapper.find('input[name="clinicSize"]').at(1).simulate('change', { persist: noop, target: { name: 'clinicSize', value: '250-499' } });
        expect(wrapper.find('input[name="clinicSize"][checked=true]').prop('value')).to.equal('250-499');

        store.clearActions();
        wrapper.find('Button#submit').simulate('submit');

        setTimeout(() => {
          expect(defaultProps.api.clinics.update.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.update,
            'clinicID456',
            {
              address: 'address_updated',
              city: 'city_updated',
              clinicSize: '250-499',
              clinicType: 'healthcare_system',
              country: 'CA',
              name: 'name_updated',
              phoneNumbers: [{ number: '(888) 555-6666', type: 'Office' }],
              postalCode: '65432',
              state: 'state_updated',
              website: 'http://clinic_updated.com',
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

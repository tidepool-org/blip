import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicProfile from '../../../app/pages/clinicprofile';

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
    ClinicProfile.__Rewire__('ClinicWorkspaceHeader', sinon.stub().returns('stubbed clinic workspace header'));
    ClinicProfile.__Rewire__('config', { RX_ENABLED: true });
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.update.resetHistory();
  });

  after(() => {
    mount.cleanUp();
    ClinicProfile.__ResetDependency__('ClinicWorkspaceHeader');
    ClinicProfile.__ResetDependency__('config');
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
          preferredBgUnits: 'mmol/L',
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

  it('should render a clinic profile header', () => {
    expect(wrapper.text()).to.include('stubbed clinic workspace header');
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

    it('should populate the profile edit form with clinic values', () => {
      const profileForm = wrapper.find('form#clinic-profile-update');
      expect(profileForm).to.have.lengthOf(1);

      expect(profileForm.find('input[name="name"]').prop('value')).to.equal('new_clinic_name');
      expect(profileForm.find('input[name="phoneNumbers.0.number"]').prop('defaultValue')).to.equal('(888) 555-5555');
      expect(profileForm.find('select[name="country"]').prop('value')).to.equal('US');
      expect(profileForm.find('select[name="state"]').prop('value')).to.equal('New Jersey');
      expect(profileForm.find('input[name="city"]').prop('value')).to.equal('Gotham');
      expect(profileForm.find('input[name="address"]').prop('value')).to.equal('1 Address Ln, City Zip');
      expect(profileForm.find('input[name="postalCode"]').prop('value')).to.equal('12345');
      expect(profileForm.find('input[name="website"]').prop('value')).to.equal('http://clinic.com');
      expect(profileForm.find('input[name="clinicType"][checked=true]').prop('value')).to.equal('provider_practice');
      expect(profileForm.find('input[name="clinicSize"][checked=true]').prop('value')).to.equal('0-249');
      expect(profileForm.find('input[name="preferredBgUnits"][checked=true]').prop('value')).to.equal('mmol/L');
    });

    it('should submit updated clinic profile values', done => {
      const profileForm = wrapper.find('form#clinic-profile-update');
      expect(profileForm).to.have.lengthOf(1);

      wrapper.find('input[name="name"]').simulate('change', { persist: noop, target: { name: 'name', value: 'name_updated' } });
      expect(wrapper.find('input[name="name"]').prop('value')).to.equal('name_updated');

      wrapper.find('input[name="phoneNumbers.0.number"]').simulate('change', { persist: noop, target: { name: 'phoneNumbers.0.number', value: '(888) 555-6666' } });
      expect(wrapper.find('input[name="phoneNumbers.0.number"]').prop('defaultValue')).to.equal('(888) 555-6666');

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

      wrapper.find('input[name="clinicType"]').at(1).simulate('change', { persist: noop, target: { name: 'clinicType', value: 'healthcare_system' } });
      expect(wrapper.find('input[name="clinicType"][checked=true]').prop('value')).to.equal('healthcare_system');

      wrapper.find('input[name="clinicSize"]').at(1).simulate('change', { persist: noop, target: { name: 'clinicSize', value: '250-499' } });
      expect(wrapper.find('input[name="clinicSize"][checked=true]').prop('value')).to.equal('250-499');

      wrapper.find('input[name="preferredBgUnits"]').at(1).simulate('change', { persist: noop, target: { name: 'preferredBgUnits', value: 'mg/dL' } });
      expect(wrapper.find('input[name="preferredBgUnits"][checked=true]').prop('value')).to.equal('mg/dL');

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
  });
});

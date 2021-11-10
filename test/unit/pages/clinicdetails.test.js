import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicDetails from '../../../app/pages/clinicdetails';

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

describe('ClinicDetails', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        getClinicianInvites: sinon.stub().callsArgWith(1, null, { invitesReturn: 'success' }),
        update: sinon.stub().callsArgWith(2, null, { canMigrate: true }),
        triggerInitialClinicMigration: sinon.stub().callsArgWith(1, null, { triggerMigrationReturn: 'success' }),
      },
      user: {
        put: sinon.stub().callsArgWith(1, null, { updateUserReturn: 'success' }),
      }
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
        fetchingClinicianInvites: defaultWorkingState,
        updatingClinic: defaultWorkingState,
        updatingUser: defaultWorkingState,
        triggeringInitialClinicMigration: defaultWorkingState,
      },
    },
  };

  const fetchedWorkingState = {
    blip: {
      working: {
        ...workingState.blip.working,
        fetchingClinicianInvites: {
          ...defaultWorkingState,
          completed: true,
        },
      },
    },
  };

  const defaultState = {
    blip: merge({}, fetchedWorkingState.blip, {
      allUsersMap: {
        clinicianUserId123: {
          emails: ['clinic@example.com'],
          roles: ['clinic'],
          userid: 'clinicianUserId123',
          username: 'clinic@example.com',
        },
      },
      clinics: {
        clinicID456: {
          name: 'Clinic 1',
          canMigrate: false,
          clinicians: {
            clinicianUserId123: {
              email: 'clinic@example.com',
              id: 'clinicianUserId123',
              roles: ['CLINIC_ADMIN'],
            },
          },
        },
      },
      loggedInUserId: 'clinicianUserId123',
      pendingReceivedClinicianInvites: [],
    }),
  };

  const newClinicianUserInviteState = {
    blip: {
      ...defaultState.blip,
      pendingReceivedClinicianInvites: [ { key: 'invite123' } ],
    },
  };

  const initialEmptyClinicState = {
    blip: {
      ...defaultState.blip,
      clinics: {
        clinicID456: {
          id: 'clinicID456',
          name: '',
          canMigrate: false,
          clinicians: {
            clinicianUserId123: {
              email: 'clinic@example.com',
              id: 'clinicianUserId123',
              roles: ['CLINIC_ADMIN'],
            },
          },
        },
      },
      selectedClinicId: 'clinicID456',
    },
  };

  let store = mockStore(defaultState);

  before(() => {
    ClinicDetails.__Rewire__('config', {
      CLINICS_ENABLED: true,
    });

    ClinicDetails.__Rewire__('countries', {
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
    ClinicDetails.__ResetDependency__('countries');
    ClinicDetails.__ResetDependency__('config');
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();

    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <ClinicDetails {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  afterEach(() => {
    defaultProps.api.clinics.triggerInitialClinicMigration.resetHistory();
    defaultProps.api.clinics.getClinicianInvites.resetHistory();
    defaultProps.api.clinics.update.resetHistory();
    defaultProps.api.user.put.resetHistory();
  });

  context('initial fetching', () => {
    beforeEach(() => {
      store = mockStore({
        blip: {
          ...defaultState.blip,
          ...workingState.blip,
        },
      });

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicDetails {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should fetch clinician invites', () => {
      sinon.assert.callCount(defaultProps.api.clinics.getClinicianInvites, 1);
      sinon.assert.calledWith(defaultProps.api.clinics.getClinicianInvites, 'clinicianUserId123');
    });
  });

  describe('profile editing', () => {
    context('partial form submission', () => {
      beforeEach(() => {
        store = mockStore(newClinicianUserInviteState);

        wrapper = mount(
          <Provider store={store}>
            <ToastProvider>
              <ClinicDetails {...defaultProps} />
            </ToastProvider>
          </Provider>
        );
      });

      it('should present a simplified form for updating profile information', done => {
        const profileForm = wrapper.find('form#clinic-profile');
        expect(profileForm).to.have.lengthOf(1);

        wrapper.find('input[name="firstName"]').simulate('change', { persist: noop, target: { name: 'firstName', value: 'Bill' } });
        expect(wrapper.find('input[name="firstName"]').prop('value')).to.equal('Bill');

        wrapper.find('input[name="lastName"]').simulate('change', { persist: noop, target: { name: 'lastName', value: 'Bryerson' } });
        expect(wrapper.find('input[name="lastName"]').prop('value')).to.equal('Bryerson');

        wrapper.find('select[name="role"]').simulate('change', { persist: noop, target: { name: 'role', value: 'endocrinologist' } });
        expect(wrapper.find('select[name="role"]').prop('value')).to.equal('endocrinologist');

        wrapper.find('input[name="npi"]').simulate('change', { persist: noop, target: { name: 'npi', value: '1234567890' } });
        expect(wrapper.find('input[name="npi"]').prop('value')).to.equal('1234567890');

        store.clearActions();
        wrapper.find('Button#submit').simulate('submit');

        setTimeout(() => {
          expect(defaultProps.api.user.put.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.user.put,
            {
              preferences: {  },
              profile: {
                clinic: { npi: '1234567890', role: 'endocrinologist' },
                fullName: 'Bill Bryerson'
              },
              roles: ['clinic'],
              userid: 'clinicianUserId123'
            }
          );

          expect(store.getActions()).to.eql([
            {
              type: 'UPDATE_USER_REQUEST',
              payload: {
                userId: 'clinicianUserId123',
                updatingUser: {
                  emails: ['clinic@example.com'],
                  roles: ['clinic'],
                  userid: 'clinicianUserId123',
                  username: 'clinic@example.com',
                  profile: {
                    fullName: 'Bill Bryerson',
                    clinic: {
                      role: 'endocrinologist',
                      npi: '1234567890',
                    },
                  },
                  preferences: {},
                },
              },
            },
            {
              type: 'UPDATE_USER_SUCCESS',
              payload: {
                userId: 'clinicianUserId123',
                updatedUser: { updateUserReturn: 'success' },
              },
            },
          ]);

          done();
        }, 0);
      });
    });

    context('full form submission', () => {
      beforeEach(() => {
        store = mockStore(initialEmptyClinicState);
        wrapper = mount(
          <Provider store={store}>
            <ToastProvider>
              <ClinicDetails {...defaultProps} />
            </ToastProvider>
          </Provider>
        );
      });

      it('should present an expanded form for updating clinician and clinic profile information, and redirect to clinic admin page', done => {
        const profileForm = wrapper.find('form#clinic-profile');
        expect(profileForm).to.have.lengthOf(1);

        wrapper.find('input[name="firstName"]').simulate('change', { persist: noop, target: { name: 'firstName', value: 'Bill' } });
        expect(wrapper.find('input[name="firstName"]').prop('value')).to.equal('Bill');

        wrapper.find('input[name="lastName"]').simulate('change', { persist: noop, target: { name: 'lastName', value: 'Bryerson' } });
        expect(wrapper.find('input[name="lastName"]').prop('value')).to.equal('Bryerson');

        wrapper.find('select[name="role"]').simulate('change', { persist: noop, target: { name: 'role', value: 'endocrinologist' } });
        expect(wrapper.find('select[name="role"]').prop('value')).to.equal('endocrinologist');

        wrapper.find('input[name="npi"]').simulate('change', { persist: noop, target: { name: 'npi', value: '1234567890' } });
        expect(wrapper.find('input[name="npi"]').prop('value')).to.equal('1234567890');

        wrapper.find('input[name="name"]').simulate('change', { persist: noop, target: { name: 'name', value: 'My Clinic' } });
        expect(wrapper.find('input[name="name"]').prop('value')).to.equal('My Clinic');

        wrapper.find('input[name="phoneNumbers.0.number"]').simulate('change', { persist: noop, target: { name: 'phoneNumbers.0.number', value: '(888) 555-6666' } });
        expect(wrapper.find('input[name="phoneNumbers.0.number"]').prop('defaultValue')).to.equal('(888) 555-6666');

        wrapper.find('select[name="country"]').simulate('change', { persist: noop, target: { name: 'country', value: 'US' } });
        expect(wrapper.find('select[name="country"]').prop('value')).to.equal('US');

        wrapper.find('input[name="address"]').simulate('change', { persist: noop, target: { name: 'address', value: '253 Mystreet Ave Apt. 34' } });
        expect(wrapper.find('input[name="address"]').prop('value')).to.equal('253 Mystreet Ave Apt. 34');

        wrapper.find('input[name="city"]').simulate('change', { persist: noop, target: { name: 'city', value: 'Gotham' } });
        expect(wrapper.find('input[name="city"]').prop('value')).to.equal('Gotham');

        wrapper.find('select[name="state"]').simulate('change', { persist: noop, target: { name: 'state', value: 'NJ' } });
        expect(wrapper.find('select[name="state"]').prop('value')).to.equal('NJ');

        wrapper.find('input[name="postalCode"]').simulate('change', { persist: noop, target: { name: 'postalCode', value: '90210' } });
        expect(wrapper.find('input[name="postalCode"]').prop('value')).to.equal('90210');

        wrapper.find('input[name="website"]').simulate('change', { persist: noop, target: { name: 'website', value: 'http://clinic.com' } });
        expect(wrapper.find('input[name="website"]').prop('value')).to.equal('http://clinic.com');

        wrapper.find('input[name="clinicType"]').at(1).simulate('change', { persist: noop, target: { name: 'clinicType', value: 'healthcare_system' } });
        expect(wrapper.find('input[name="clinicType"][checked=true]').prop('value')).to.equal('healthcare_system');

        wrapper.find('input[name="clinicSize"]').at(1).simulate('change', { persist: noop, target: { name: 'clinicSize', value: '250-499' } });
        expect(wrapper.find('input[name="clinicSize"][checked=true]').prop('value')).to.equal('250-499');

        wrapper.find('input[name="adminAcknowledge"]').simulate('change', { persist: noop, target: { name: 'adminAcknowledge', value: true } });
        expect(wrapper.find('input[name="adminAcknowledge"]').prop('value')).to.be.true;

        store.clearActions();
        wrapper.find('Button#submit').simulate('submit');

        setTimeout(() => {
          expect(defaultProps.api.user.put.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.user.put,
            {
              preferences: {  },
              profile: {
                clinic: { npi: '1234567890', role: 'endocrinologist' },
                fullName: 'Bill Bryerson'
              },
              roles: ['clinic'],
              userid: 'clinicianUserId123'
            }
          );

          expect(defaultProps.api.clinics.update.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.update,
            'clinicID456',
            {
              address: '253 Mystreet Ave Apt. 34',
              city: 'Gotham',
              clinicSize: '250-499',
              clinicType: 'healthcare_system',
              country: 'US',
              name: 'My Clinic',
              phoneNumbers: [{ number: '(888) 555-6666', type: 'Office' }],
              postalCode: '90210',
              state: 'NJ',
              website: 'http://clinic.com',
            }
          );

          expect(store.getActions()).to.eql([
            {
              type: 'UPDATE_USER_REQUEST',
              payload: {
                userId: 'clinicianUserId123',
                updatingUser: {
                  emails: ['clinic@example.com'],
                  roles: ['clinic'],
                  userid: 'clinicianUserId123',
                  username: 'clinic@example.com',
                  profile: {
                    fullName: 'Bill Bryerson',
                    clinic: {
                      role: 'endocrinologist',
                      npi: '1234567890',
                    },
                  },
                  preferences: {},
                },
              },
            },
            {
              type: 'UPDATE_USER_SUCCESS',
              payload: {
                userId: 'clinicianUserId123',
                updatedUser: { updateUserReturn: 'success' },
              },
            },
            { type: 'UPDATE_CLINIC_REQUEST' },
            {
              type: 'UPDATE_CLINIC_SUCCESS',
              payload: {
                clinicId: 'clinicID456',
                clinic: { canMigrate: true },
              },
            },
          ]);

          done();
        }, 0);
      });
    });
  });
});

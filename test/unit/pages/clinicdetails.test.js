import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicDetails from '../../../app/pages/clinicdetails';
import Button from '../../../app/components/elements/Button';

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
        create: sinon.stub().callsArgWith(1, null, { createReturn: 'success' }),
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

  const clinicMemberNoInvitesState = {
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
              roles: ['CLINIC_ADMIN'],
            },
          },
        },
      },
      loggedInUserId: 'clinicianUserId123',
      pendingReceivedClinicianInvites: [],
    }),
  };

  const clinicMemberHasInvitesState = {
    blip: {
      ...clinicMemberNoInvitesState.blip,
      pendingReceivedClinicianInvites: [ { key: 'invite123' } ],
    },
  };

  let store = mockStore(clinicMemberNoInvitesState);

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
    defaultProps.api.clinics.getClinicianInvites.resetHistory();
    defaultProps.api.clinics.create.resetHistory();
    defaultProps.api.user.put.resetHistory();
  });

  context('initial fetching', () => {
    beforeEach(() => {
      store = mockStore({
        blip: {
          ...clinicMemberNoInvitesState.blip,
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
    context('clinic team member has pending invites', () => {
      beforeEach(() => {
        store = mockStore(clinicMemberHasInvitesState);

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

    context('clinic team member has no pending invites', () => {
      beforeEach(() => {
        store = mockStore(clinicMemberNoInvitesState);

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

        wrapper.find('input[name="orgName"]').simulate('change', { persist: noop, target: { name: 'orgName', value: 'My Clinic' } });
        expect(wrapper.find('input[name="orgName"]').prop('value')).to.equal('My Clinic');

        wrapper.find('input[name="phoneNumber"]').simulate('blur', { persist: noop, target: { name: 'phoneNumber', value: '(888) 555-6666' } });
        expect(wrapper.find('input[name="phoneNumber"]').prop('defaultValue')).to.equal('(888) 555-6666');

        wrapper.find('select[name="country"]').simulate('change', { persist: noop, target: { name: 'country', value: 'US' } });
        expect(wrapper.find('select[name="country"]').prop('value')).to.equal('US');

        wrapper.find('input[name="address1"]').simulate('change', { persist: noop, target: { name: 'address1', value: '253 Mystreet Ave' } });
        expect(wrapper.find('input[name="address1"]').prop('value')).to.equal('253 Mystreet Ave');

        wrapper.find('input[name="address2"]').simulate('change', { persist: noop, target: { name: 'address2', value: 'Apt. 34' } });
        expect(wrapper.find('input[name="address2"]').prop('value')).to.equal('Apt. 34');

        wrapper.find('input[name="city"]').simulate('change', { persist: noop, target: { name: 'city', value: 'Gotham' } });
        expect(wrapper.find('input[name="city"]').prop('value')).to.equal('Gotham');

        wrapper.find('input[name="state"]').simulate('change', { persist: noop, target: { name: 'state', value: 'New Jersey' } });
        expect(wrapper.find('input[name="state"]').prop('value')).to.equal('New Jersey');

        wrapper.find('input[name="zip"]').simulate('change', { persist: noop, target: { name: 'zip', value: '65432' } });
        expect(wrapper.find('input[name="zip"]').prop('value')).to.equal('65432');

        wrapper.find('input[name="website"]').simulate('change', { persist: noop, target: { name: 'website', value: 'http://clinic_updated.com' } });
        expect(wrapper.find('input[name="website"]').prop('value')).to.equal('http://clinic_updated.com');

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

          expect(defaultProps.api.clinics.create.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.create,
            {
              address: '253 Mystreet Ave Apt. 34',
              city: 'Gotham',
              clinicSize: '250-499',
              clinicType: 'healthcare_system',
              country: 'US',
              name: 'My Clinic',
              phoneNumbers: [{ number: '(888) 555-6666', type: 'Office' }],
              postalCode: '65432',
              state: 'New Jersey',
              website: 'http://clinic_updated.com',
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
            { type: 'CREATE_CLINIC_REQUEST' },
            {
              type: 'CREATE_CLINIC_SUCCESS',
              payload: {
                clinic: { createReturn: 'success' },
              },
            },
            {
              type: '@@router/CALL_HISTORY_METHOD',
              payload: {
                args: [
                  '/clinic-admin',
                ],
                method: 'push',
              },
            },
          ]);

          done();
        }, 0);
      });
    });
  });
});

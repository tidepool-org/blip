import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicDetails from '../../../app/pages/clinicdetails';

jest.mock('../../../app/core/validation/postalCodes', () => ({}));

jest.mock('i18n-iso-countries', () => ({
  getNames: () => ({
    US: 'United States',
    CA: 'Canada',
  }),
  registerLocale: jest.fn(),
  getAlpha2Codes: () => ({
    US: 'US',
    CA: 'CA',
  }),
}));

/* global chai */
/* global sinon */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicDetails', () => {
  let wrapper;
  let store;

  const defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        getClinicianInvites: sinon.stub().callsArgWith(1, null, { invitesReturn: 'success' }),
        getClinicsForClinician: sinon.stub().callsArgWith(2, null, [{ clinic: { id: 'newClinic123' } }]),
        dismissClinicianInvite: sinon.stub().callsArgWith(2, null, { dismissInvite: 'success' }),
        update: sinon.stub().callsArgWith(2, null, { canMigrate: true }),
        create: sinon.stub().callsArgWith(1, null, { id: 'newClinic123' }),
        triggerInitialClinicMigration: sinon.stub().callsArgWith(1, null, { triggerMigrationReturn: 'success' }),
        getEHRSettings: sinon.stub().callsArgWith(1, null, { enabled: true }),
        getMRNSettings: sinon.stub().callsArgWith(1, null, { required: true }),
      },
      user: {
        put: sinon.stub().callsArgWith(1, null, { updateUserReturn: 'success' }),
      },
    },
  };

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const workingState = {
    blip: {
      working: {
        fetchingClinicianInvites: defaultWorkingState,
        fetchingClinicsForClinician: defaultWorkingState,
        updatingClinic: defaultWorkingState,
        creatingClinic: defaultWorkingState,
        updatingUser: defaultWorkingState,
        triggeringInitialClinicMigration: defaultWorkingState,
        dismissingClinicianInvite: defaultWorkingState,
      },
    },
  };

  const fetchedWorkingState = {
    blip: {
      working: {
        ...workingState.blip.working,
        fetchingClinicianInvites: { ...defaultWorkingState, completed: true },
        fetchingClinicsForClinician: { ...defaultWorkingState, completed: true },
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
          id: 'clinicID456',
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
      pendingReceivedClinicianInvites: [
        {
          key: 'invite123',
          creator: { clinicName: 'Example Health' },
        },
      ],
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

  const clinicCanMigrateState = {
    blip: {
      ...defaultState.blip,
      allUsersMap: {
        clinicianUserId123: {
          emails: ['clinic@example.com'],
          roles: ['clinic'],
          userid: 'clinicianUserId123',
          username: 'clinic@example.com',
          profile: { fullName: 'Clinician One', clinic: { role: 'front_desk' } },
        },
      },
      clinics: {
        clinicID456: {
          id: 'clinicID456',
          name: 'My Clinic',
          canMigrate: true,
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

  const createWrapper = (route = '', storeState = defaultState) => {
    store = mockStore(storeState);
    wrapper = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={[`/clinic-details/${route}`]}>
            <Route path='/clinic-details/:action' children={() => <ClinicDetails {...defaultProps} />} />
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );
    return wrapper;
  };

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  afterEach(() => {
    cleanup();
    defaultProps.api.clinics.getClinicianInvites.resetHistory();
    defaultProps.api.clinics.getClinicsForClinician.resetHistory();
    defaultProps.api.clinics.dismissClinicianInvite.resetHistory();
    defaultProps.api.clinics.update.resetHistory();
    defaultProps.api.clinics.create.resetHistory();
    defaultProps.api.clinics.triggerInitialClinicMigration.resetHistory();
    defaultProps.api.clinics.getEHRSettings.resetHistory();
    defaultProps.api.clinics.getMRNSettings.resetHistory();
    defaultProps.api.user.put.resetHistory();
  });

  context('initial fetching', () => {
    beforeEach(() => {
      createWrapper('migrate', { blip: { ...defaultState.blip, ...workingState.blip } });
    });

    it('should fetch clinician invites and clinics', () => {
      sinon.assert.callCount(defaultProps.api.clinics.getClinicianInvites, 1);
      sinon.assert.calledWith(defaultProps.api.clinics.getClinicianInvites, 'clinicianUserId123');

      sinon.assert.callCount(defaultProps.api.clinics.getClinicsForClinician, 1);
      sinon.assert.calledWith(defaultProps.api.clinics.getClinicsForClinician, 'clinicianUserId123');
    });
  });

  context('content visibility based on route action param', () => {
    it('should render the appropriate form sections for the "/migrate" route', () => {
      createWrapper('migrate', defaultState);
      const { container } = wrapper;
      expect(container.querySelector('.container-title')).to.exist;
      expect(container.querySelector('.container-subtitle')).to.exist;
      expect(container.querySelector('#clinic-invite-details')).to.be.null;
      expect(container.querySelector('#clinician-profile-form')).to.exist;
      expect(container.querySelector('#clinic-profile-form')).to.exist;
    });

    it('should render the appropriate form sections for the "/profile" route', () => {
      createWrapper('profile', defaultState);
      const { container } = wrapper;
      expect(container.querySelector('.container-title')).to.exist;
      expect(container.querySelector('.container-subtitle')).to.exist;
      expect(container.querySelector('#clinic-invite-details')).to.be.null;
      expect(container.querySelector('#clinician-profile-form')).to.exist;
      expect(container.querySelector('#clinic-profile-form')).to.be.null;
    });

    it('should render the appropriate form sections for the "/profile" route with clinic invite present', () => {
      createWrapper('profile', newClinicianUserInviteState);
      const { container } = wrapper;
      expect(container.querySelector('.container-title')).to.exist;
      expect(container.querySelector('.container-subtitle')).to.exist;
      expect(container.querySelector('#clinic-invite-details')).to.exist;
      expect(container.querySelector('#clinician-profile-form')).to.exist;
      expect(container.querySelector('#clinic-profile-form')).to.be.null;
    });

    it('should render the appropriate form sections for the "/new" route', () => {
      createWrapper('new', defaultState);
      const { container } = wrapper;
      expect(container.querySelector('.container-title')).to.exist;
      expect(container.querySelector('.container-subtitle')).to.be.null;
      expect(container.querySelector('#clinic-invite-details')).to.be.null;
      expect(container.querySelector('#clinician-profile-form')).to.be.null;
      expect(container.querySelector('#clinic-profile-form')).to.exist;
    });
  });

  describe('form submission', () => {
    context('profile form', () => {
      beforeEach(() => {
        createWrapper('profile', newClinicianUserInviteState);
      });

      it('should present a simplified form for updating profile information', async () => {
        const { container } = wrapper;
        expect(container.querySelector('div#clinic-profile')).to.exist;

        const firstName = container.querySelector('input[name="firstName"]');
        fireEvent.change(firstName, { target: { name: 'firstName', value: 'Bill' } });
        expect(container.querySelector('input[name="firstName"]').value).to.equal('Bill');

        const lastName = container.querySelector('input[name="lastName"]');
        fireEvent.change(lastName, { target: { name: 'lastName', value: 'Bryerson' } });
        expect(container.querySelector('input[name="lastName"]').value).to.equal('Bryerson');

        const role = container.querySelector('select[name="role"]');
        fireEvent.change(role, { target: { name: 'role', value: 'endocrinologist' } });
        expect(container.querySelector('select[name="role"]').value).to.equal('endocrinologist');

        store.clearActions();
        fireEvent.click(container.querySelector('button#submit'));

        await waitFor(() => {
          expect(defaultProps.api.user.put.callCount).to.equal(1);
        });

        sinon.assert.calledWith(
          defaultProps.api.user.put,
          {
            preferences: {},
            profile: {
              clinic: { role: 'endocrinologist' },
              fullName: 'Bill Bryerson',
            },
            roles: ['clinician'],
            userid: 'clinicianUserId123',
          }
        );

        expect(store.getActions()).to.eql([
          {
            type: 'UPDATE_USER_REQUEST',
            payload: {
              userId: 'clinicianUserId123',
              updatingUser: {
                emails: ['clinic@example.com'],
                roles: ['clinician'],
                userid: 'clinicianUserId123',
                username: 'clinic@example.com',
                profile: {
                  fullName: 'Bill Bryerson',
                  clinic: { role: 'endocrinologist' },
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
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/workspaces', { selectedClinicId: null }] },
          },
        ]);
      });
    });

    context('clinic migration', () => {
      beforeEach(() => {
        createWrapper('migrate', initialEmptyClinicState);
      });

      it('should present an expanded form for updating clinician and clinic profile information', async () => {
        const { container } = wrapper;
        expect(container.querySelector('div#clinic-profile')).to.exist;

        fireEvent.change(container.querySelector('input[name="firstName"]'), { target: { name: 'firstName', value: 'Bill' } });
        expect(container.querySelector('input[name="firstName"]').value).to.equal('Bill');

        fireEvent.change(container.querySelector('input[name="lastName"]'), { target: { name: 'lastName', value: 'Bryerson' } });
        expect(container.querySelector('input[name="lastName"]').value).to.equal('Bryerson');

        fireEvent.change(container.querySelector('select[name="role"]'), { target: { name: 'role', value: 'endocrinologist' } });
        expect(container.querySelector('select[name="role"]').value).to.equal('endocrinologist');

        fireEvent.change(container.querySelector('input[name="name"]'), { target: { name: 'name', value: 'My Clinic' } });
        expect(container.querySelector('input[name="name"]').value).to.equal('My Clinic');

        fireEvent.change(container.querySelector('select[name="country"]'), { target: { name: 'country', value: 'US' } });
        expect(container.querySelector('select[name="country"]').value).to.equal('US');

        fireEvent.change(container.querySelector('input[name="address"]'), { target: { name: 'address', value: '253 Mystreet Ave Apt. 34' } });
        expect(container.querySelector('input[name="address"]').value).to.equal('253 Mystreet Ave Apt. 34');

        fireEvent.change(container.querySelector('input[name="city"]'), { target: { name: 'city', value: 'Gotham' } });
        expect(container.querySelector('input[name="city"]').value).to.equal('Gotham');

        fireEvent.change(container.querySelector('select[name="state"]'), { target: { name: 'state', value: 'NJ' } });
        expect(container.querySelector('select[name="state"]').value).to.equal('NJ');

        fireEvent.change(container.querySelector('input[name="postalCode"]'), { target: { name: 'postalCode', value: '90210' } });
        expect(container.querySelector('input[name="postalCode"]').value).to.equal('90210');

        fireEvent.change(container.querySelector('input[name="website"]'), { target: { name: 'website', value: 'http://clinic.com' } });
        expect(container.querySelector('input[name="website"]').value).to.equal('http://clinic.com');

        fireEvent.change(container.querySelector('select[name="clinicType"]'), { target: { name: 'clinicType', value: 'healthcare_system' } });
        expect(container.querySelector('select[name="clinicType"]').value).to.equal('healthcare_system');

        const bgUnits = container.querySelectorAll('input[name="preferredBgUnits"]');
        fireEvent.click(bgUnits[1]);
        expect(bgUnits[1].checked).to.be.true;

        const adminAck = container.querySelector('input[name="adminAcknowledge"]');
        fireEvent.click(adminAck);
        expect(adminAck.checked).to.be.true;

        store.clearActions();
        await waitFor(() => {
          expect(container.querySelector('button#submit').disabled).to.be.false;
        });
        fireEvent.click(container.querySelector('button#submit'));

        await waitFor(() => {
          expect(defaultProps.api.user.put.callCount).to.equal(1);
        });

        sinon.assert.calledWith(
          defaultProps.api.user.put,
          {
            preferences: {},
            profile: {
              clinic: { role: 'endocrinologist' },
              fullName: 'Bill Bryerson',
            },
            roles: ['clinician'],
            userid: 'clinicianUserId123',
          }
        );

        expect(defaultProps.api.clinics.update.callCount).to.equal(1);

        sinon.assert.calledWith(
          defaultProps.api.clinics.update,
          'clinicID456',
          {
            address: '253 Mystreet Ave Apt. 34',
            city: 'Gotham',
            clinicType: 'healthcare_system',
            country: 'US',
            name: 'My Clinic',
            postalCode: '90210',
            state: 'NJ',
            website: 'http://clinic.com',
            preferredBgUnits: 'mmol/L',
          }
        );

        expect(store.getActions()).to.eql([
          {
            type: 'UPDATE_USER_REQUEST',
            payload: {
              userId: 'clinicianUserId123',
              updatingUser: {
                emails: ['clinic@example.com'],
                roles: ['clinician'],
                userid: 'clinicianUserId123',
                username: 'clinic@example.com',
                profile: {
                  fullName: 'Bill Bryerson',
                  clinic: { role: 'endocrinologist' },
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
            payload: { clinicId: 'clinicID456', clinic: { canMigrate: true } },
          },
        ]);
      }, 15000);
    });

    context('clinic creation', () => {
      beforeEach(() => {
        createWrapper('new', defaultState);
      });

      it('should present an expanded form for adding new clinic profile information', async () => {
        const { container } = wrapper;
        expect(container.querySelector('div#clinic-profile')).to.exist;

        fireEvent.change(container.querySelector('input[name="name"]'), { target: { name: 'name', value: 'My Clinic' } });
        expect(container.querySelector('input[name="name"]').value).to.equal('My Clinic');

        fireEvent.change(container.querySelector('select[name="country"]'), { target: { name: 'country', value: 'US' } });
        expect(container.querySelector('select[name="country"]').value).to.equal('US');

        fireEvent.change(container.querySelector('input[name="address"]'), { target: { name: 'address', value: '253 Mystreet Ave Apt. 34' } });
        expect(container.querySelector('input[name="address"]').value).to.equal('253 Mystreet Ave Apt. 34');

        fireEvent.change(container.querySelector('input[name="city"]'), { target: { name: 'city', value: 'Gotham' } });
        expect(container.querySelector('input[name="city"]').value).to.equal('Gotham');

        fireEvent.change(container.querySelector('select[name="state"]'), { target: { name: 'state', value: 'NJ' } });
        expect(container.querySelector('select[name="state"]').value).to.equal('NJ');

        fireEvent.change(container.querySelector('input[name="postalCode"]'), { target: { name: 'postalCode', value: '90210' } });
        expect(container.querySelector('input[name="postalCode"]').value).to.equal('90210');

        fireEvent.change(container.querySelector('input[name="website"]'), { target: { name: 'website', value: 'http://clinic.com' } });
        expect(container.querySelector('input[name="website"]').value).to.equal('http://clinic.com');

        fireEvent.change(container.querySelector('select[name="clinicType"]'), { target: { name: 'clinicType', value: 'healthcare_system' } });
        expect(container.querySelector('select[name="clinicType"]').value).to.equal('healthcare_system');

        const bgUnits = container.querySelectorAll('input[name="preferredBgUnits"]');
        fireEvent.click(bgUnits[1]);
        expect(bgUnits[1].checked).to.be.true;

        const adminAck = container.querySelector('input[name="adminAcknowledge"]');
        fireEvent.click(adminAck);
        expect(adminAck.checked).to.be.true;

        store.clearActions();
        await waitFor(() => {
          expect(container.querySelector('button#submit').disabled).to.be.false;
        });
        fireEvent.click(container.querySelector('button#submit'));

        await waitFor(() => {
          expect(defaultProps.api.clinics.create.callCount).to.equal(1);
        });

        sinon.assert.notCalled(defaultProps.api.user.put);

        sinon.assert.calledWith(
          defaultProps.api.clinics.create,
          {
            address: '253 Mystreet Ave Apt. 34',
            city: 'Gotham',
            clinicType: 'healthcare_system',
            country: 'US',
            name: 'My Clinic',
            postalCode: '90210',
            state: 'NJ',
            website: 'http://clinic.com',
            preferredBgUnits: 'mmol/L',
          }
        );

        const expectedActions = [
          { type: 'CREATE_CLINIC_REQUEST' },
          { type: 'CREATE_CLINIC_SUCCESS', payload: { clinic: { id: 'newClinic123' } } },
          { type: 'SELECT_CLINIC_SUCCESS', payload: { clinicId: 'newClinic123' } },
          { type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST' },
          { type: 'GET_CLINICS_FOR_CLINICIAN_SUCCESS', payload: { clinics: [{ clinic: { id: 'newClinic123' } }], clinicianId: 'clinicianUserId123' } },
          { type: 'FETCH_CLINIC_EHR_SETTINGS_REQUEST' },
          { type: 'FETCH_CLINIC_EHR_SETTINGS_SUCCESS', payload: { clinicId: 'newClinic123', settings: { enabled: true } } },
          { type: 'FETCH_CLINIC_MRN_SETTINGS_REQUEST' },
          { type: 'FETCH_CLINIC_MRN_SETTINGS_SUCCESS', payload: { clinicId: 'newClinic123', settings: { required: true } } },
        ];

        expect(store.getActions()).to.eql(expectedActions);
      });
    });

    context('pre-populate clinic team member profile fields', () => {
      it('should not populate the team member profile fields if the clinic details have not been filled out', () => {
        createWrapper('profile', initialEmptyClinicState);
        const { container } = wrapper;
        expect(container.querySelector('input[name="firstName"]').value).to.equal('');
        expect(container.querySelector('input[name="lastName"]').value).to.equal('');
        expect(container.querySelector('select[name="role"]').value).to.equal('');
      });

      it('should populate the team member profile fields if the clinic details have been filled out', () => {
        createWrapper('migrate', clinicCanMigrateState);
        const { container } = wrapper;
        expect(container.querySelector('input[name="firstName"]').value).to.equal('Clinician');
        expect(container.querySelector('input[name="lastName"]').value).to.equal('One');
        expect(container.querySelector('select[name="role"]').value).to.equal('front_desk');
      });
    });

    context('clinic is ready to migrate on load', () => {
      beforeEach(() => {
        createWrapper('migrate', clinicCanMigrateState);
      });

      it('should open the migration confirmation modal', () => {
        const migrateDialog = document.querySelector('#migrateClinic');
        expect(migrateDialog).to.exist;
        const dialogTitle = migrateDialog.querySelector('#dialog-title');
        expect(dialogTitle).to.not.be.null;
        expect(dialogTitle.textContent).to.not.equal('');
      });
    });
  });
});

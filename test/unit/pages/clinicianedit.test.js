import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import _ from 'lodash';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import RadioGroup from '../../../app/components/elements/RadioGroup';
import ClinicianEdit from '../../../app/pages/clinicianedit';
import Checkbox from '../../../app/components/elements/Checkbox';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe.only('ClinicianEdit', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        updateClinician: sinon.stub().callsArgWith(3, null, {}),
      },
    },
  };

  before(() => {
    mount = createMount();
    ClinicianEdit.__Rewire__(
      'useLocation',
      sinon.stub().returns({ state: {} })
    );
    ClinicianEdit.__Rewire__('config', { RX_ENABLED: true });
  });

  after(() => {
    mount.cleanUp();
    ClinicianEdit.__ResetDependency__('config');
  });

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const blipState = {
    blip: {
      working: {
        fetchingClinics: {
          inProgress: false,
          completed: true,
          notification: null,
        },
        fetchingCliniciansFromClinic: {
          inProgress: false,
          completed: true,
          notification: null,
        },
        updatingClinician: defaultWorkingState,
      },
    },
  };

  let store = mockStore(blipState);

  const fetchedDataState = _.merge({}, blipState, {
    blip: {
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
              id:'clinicianUserId123',
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
      pendingSentInvites: [],
      selectedClinicId: 'clinicID456',
    },
  });

  const fetchedAdminState = _.merge({}, fetchedDataState, {
    blip: {
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              roles: ['CLINIC_ADMIN'],
            },
          },
        },
      },
    },
  });

  const noClinicianState = { state: {} };

  const clinicianState = {
    state: { clinicId: 'clinicID456', clinicianId: 'clinicianUserId123' },
  };

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  describe('no clinician selected', () => {
    before(() => {
      ClinicianEdit.__Rewire__(
        'useLocation',
        sinon.stub().returns(noClinicianState)
      );
    });

    after(() => {
      ClinicianEdit.__ResetDependency__('useLocation');
    });

    beforeEach(() => {
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicianEdit {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should send user to "clinic-admin" if no clinician is selected', () => {
      const expectedActions = [
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-admin'],
            method: 'push',
          },
        },
      ];
      expect(store.getActions()).to.eql(expectedActions);
    });
  });

  describe('clinician selected', () => {
    before(() => {
      ClinicianEdit.__Rewire__(
        'useLocation',
        sinon.stub().returns(clinicianState)
      );
    });

    after(() => {
      ClinicianEdit.__ResetDependency__('useLocation');
    });

    beforeEach(() => {
      store = mockStore(fetchedAdminState);
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicianEdit {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render clinician type selection', () => {
      expect(wrapper.find(RadioGroup)).to.have.length(1);
    });

    it('should change selected type when clicked', () => {
      expect(wrapper.find(RadioGroup).props().value).to.equal('CLINIC_ADMIN');
      wrapper
        .find('input[type="radio"]')
        .at(1)
        .simulate('change', { persist: _.noop, target: { name: 'clinicianType', value: 'CLINIC_MEMBER' } });
      expect(wrapper.find(RadioGroup).props().value).to.equal('CLINIC_MEMBER');
    });

    it('should set prescriber permission when prescriber checkbox clicked', () => {
      expect(wrapper.find(Checkbox).props().checked).to.be.false;
      wrapper
        .find('input[type="checkbox"]').at(0)
        .simulate('change', { persist: _.noop, target: { name: 'prescriberPermission', value: true } });
      expect(wrapper.find(Checkbox).props().checked).to.be.true;
    });

    it('should show confirmation dialog when delete clicked', () => {
      expect(wrapper.find('Dialog#deleteDialog').props().open).to.be.false;
      wrapper.find('div[color="feedback.danger"]').at(0).simulate('click');
      expect(wrapper.find('Dialog#deleteDialog').props().open).to.be.true;
    });

    it('should navigate to "clinic-admin" when back button pushed without edit', () => {
      expect(store.getActions()).to.eql([]);
      wrapper.find('Button#cancel').simulate('click');
      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-admin'],
            method: 'push',
          },
        },
      ]);
    });

    it('should show confirm dialog when navigating without saving', () => {
      wrapper
        .find('input[type="checkbox"]')
        .simulate('change', { persist: _.noop, target: { name: 'prescriberPermission', checked: true } });
      expect(wrapper.find('Dialog#confirmDialog').props().open).to.be.false;
      wrapper.find('Button#cancel').simulate('click');
      expect(wrapper.find('Dialog#confirmDialog').props().open).to.be.true;
    });

    it('should update clinician and redirect to "clinic-admin" on save', (done) => {
      expect(store.getActions()).to.eql([]);
      expect(defaultProps.api.clinics.updateClinician.callCount).to.equal(0);

      wrapper
        .find('input[type="radio"]')
        .at(1)
        .simulate('change', { persist: _.noop, target: { name: 'clinicianType', value: 'CLINIC_MEMBER' } });

      wrapper
        .find('input[type="checkbox"]').at(0)
        .simulate('change', { persist: _.noop, target: { name: 'prescriberPermission', value: true } });

      wrapper.find('Button#submit').simulate('submit');
      setTimeout(() => {
        expect(defaultProps.api.clinics.updateClinician.callCount).to.equal(1);
        sinon.assert.calledWith(
          defaultProps.api.clinics.updateClinician,
          'clinicID456',
          'clinicianUserId123',
          { id: 'clinicianUserId123', roles: ['CLINIC_MEMBER', 'PRESCRIBER'] },
        );

        expect(store.getActions()).to.eql([
          { type: 'UPDATE_CLINICIAN_REQUEST' },
          {
            type: 'UPDATE_CLINICIAN_SUCCESS',
            payload: {
              'clinicId': 'clinicID456',
              'clinicianId': 'clinicianUserId123',
              'clinician': {
                'id': 'clinicianUserId123',
                'roles': ['CLINIC_MEMBER', 'PRESCRIBER'],
              },
            },
          },
        ]);

        done();
      });
    });

    it('should render permissions details when trigger text is clicked', () => {
      const permissionsDialog = () => wrapper.find('Dialog#permissionsDialog');
      expect(permissionsDialog().props().open).to.be.false;

      wrapper.find('Button[variant="textPrimary"]').simulate('click');
      expect(permissionsDialog().props().open).to.be.true;

      expect(permissionsDialog().find('#dialog-title').hostNodes().text()).to.equal('Clinician Roles and Permissions');
    });
  });
});

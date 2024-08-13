import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import RadioGroup from '../../../app/components/elements/RadioGroup';
import ClinicInvite from '../../../app/pages/clinicinvite';
import Checkbox from '../../../app/components/elements/Checkbox';
import { ToastProvider } from '../../../app/providers/ToastProvider';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicInvite', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        inviteClinician: sinon.stub().callsArgWith(2, null, { inviteReturn: 'success' })
      },
    },
  };

  before(() => {
    mount = createMount();
    ClinicInvite.__Rewire__('useLocation', sinon.stub().returns({ state: {} }));

    ClinicInvite.__Rewire__('useFlags', sinon.stub().returns({
      showPrescriptions: true,
    }));
  });

  after(() => {
    mount.cleanUp();
    ClinicInvite.__ResetDependency__('useLocation');
    ClinicInvite.__ResetDependency__('useFlags');
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
        sendingClinicianInvite: defaultWorkingState,
      },
    },
  };

  let store = mockStore(blipState);

  const fetchedDataState = merge({}, blipState, {
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
      pendingSentInvites: [],
      selectedClinicId: 'clinicID456',
    },
  });

  const fetchedAdminState = merge({}, fetchedDataState, {
    blip: {
      clinics: {
        clinicID456: {
          clinicians: {
            clinicianUserId123: {
              permissions: ['CLINIC_ADMIN'],
            },
          },
        },
      },
    },
  });

  const noClinicState = { state: {} };

  const clinicState = {
    state: { clinicId: 'clinicID456' },
  };

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  describe('no clinician selected', () => {
    before(() => {
      ClinicInvite.__Rewire__(
        'useLocation',
        sinon.stub().returns(noClinicState)
      );
    });

    after(() => {
      ClinicInvite.__ResetDependency__('useLocation');
    });

    beforeEach(() => {
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicInvite {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should send user to "clinic-admin" if no clinic is selected', () => {
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

  describe('clinic selected', () => {
    before(() => {
      ClinicInvite.__Rewire__('useLocation', sinon.stub().returns(clinicState));
    });

    after(() => {
      ClinicInvite.__ResetDependency__('useLocation');
    });

    beforeEach(() => {
      store = mockStore(fetchedAdminState);
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicInvite {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render clinician type selection', () => {
      expect(wrapper.find(RadioGroup)).to.have.length(1);
    });

    it('should change selected type when clicked', () => {
      expect(wrapper.find(RadioGroup).props().value).to.equal(null);
      wrapper
        .find('input[type="radio"]')
        .at(1)
        .simulate('change', {
          persist: noop,
          target: { name: 'clinicianType', value: 'CLINIC_MEMBER' },
        });
      expect(wrapper.find(RadioGroup).props().value).to.equal('CLINIC_MEMBER');
    });

    it('should set prescriber permission when prescriber checkbox clicked', () => {
      expect(wrapper.find(Checkbox).at(0).props().checked).to.be.false;
      wrapper
        .find('input[type="checkbox"]')
        .simulate('change', { persist: noop, target: { name: 'prescriberPermission', checked: true, value: true } });

      expect(wrapper.find(Checkbox).at(0).props().checked).to.be.true;
    });

    it('should navigate to "clinic-admin" when back button pushed without edit', () => {
      expect(store.getActions()).to.eql([]);
      wrapper.find('Button#cancel').simulate('click');

      wrapper.update();
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
        .find('input[type="text"]')
        .simulate('change', { persist: noop, target: { name: 'email', value: 'email@email.com' } });
      expect(wrapper.find('Dialog#confirmDialog').props().open).to.be.false;
      wrapper.find('Button#cancel').simulate('click');
      expect(wrapper.find('Dialog#confirmDialog').props().open).to.be.true;
    });

    it('should update clinician and redirect to "clinic-admin" on save', (done) => {
      expect(store.getActions()).to.eql([]);
      expect(defaultProps.api.clinics.inviteClinician.callCount).to.equal(0);
      wrapper
        .find('input[type="radio"]')
        .at(1)
        .simulate('change', { persist: noop, target: { name: 'clinicianType', value: 'CLINIC_MEMBER' } });

      wrapper
        .find('input[type="text"]')
        .simulate('change', { persist: noop, target: { name: 'email', value: 'email@email.com' } });

      wrapper
        .find('input[type="checkbox"]')
        .simulate('change', { persist: noop, target: { name: 'prescriberPermission', checked: true, value: true } });

      wrapper.find('Button#submit').simulate('submit');
      setTimeout(() => {
        expect(defaultProps.api.clinics.inviteClinician.callCount).to.equal(1);
        sinon.assert.calledWith(
          defaultProps.api.clinics.inviteClinician,
          'clinicID456',
          { email: 'email@email.com', roles: ['CLINIC_MEMBER', 'PRESCRIBER'] },
        );

        expect(store.getActions()).to.eql([
          { type: 'SEND_CLINICIAN_INVITE_REQUEST' },
          {
            type: 'SEND_CLINICIAN_INVITE_SUCCESS',
            payload: {
              'clinicId': 'clinicID456',
              'clinician': { inviteReturn: 'success' },
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

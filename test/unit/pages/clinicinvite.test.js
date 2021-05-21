import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import _ from 'lodash';
import RadioGroup from '../../../app/components/elements/RadioGroup';
import ClinicInvite from '../../../app/pages/clinicinvite';
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

describe('ClinicInvite', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        inviteClinician: sinon.stub().callsArgWith(2, null, {inviteReturn:'success'})
      },
    },
  };

  before(() => {
    mount = createMount();
    ClinicInvite.__Rewire__('useLocation', sinon.stub().returns({ state: {} }));
  });

  after(() => {
    mount.cleanUp();
  });

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
      pendingSentInvites: [],
    },
  });

  const fetchedAdminState = _.merge({}, fetchedDataState, {
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
          <ClinicInvite {...defaultProps} />
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

  describe('clinician selected', () => {
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
          <ClinicInvite {...defaultProps} />
        </Provider>
      );
    });

    it('should render clinician type selection', () => {
      expect(wrapper.find(RadioGroup)).to.have.length(1);
    });

    it('should change selected type when clicked', () => {
      expect(wrapper.find(RadioGroup).props().value).to.equal('');
      wrapper
        .find('input[type="radio"]')
        .at(1)
        .simulate('change', {
          target: { name: 'clinician-type', value: 'CLINIC_MEMBER' },
        });
      expect(wrapper.find(RadioGroup).props().value).to.equal('CLINIC_MEMBER');
    });

    it('should set prescriber permission when prescriber checkbox clicked', () => {
      expect(wrapper.find(Checkbox).props().checked).to.be.false;
      wrapper
        .find('input[type="checkbox"]')
        .simulate('change', { target: { checked: true } });
      expect(wrapper.find(Checkbox).props().checked).to.be.true;
    });

    it('should navigate to "clinic-admin" when back button pushed without edit', () => {
      expect(store.getActions()).to.eql([]);
      wrapper.find('Button#back').simulate('click');
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
        .simulate('change', { target: { checked: true } });
      expect(wrapper.find('Dialog#confirmDialog').props().open).to.be.false;
      wrapper.find('Button#back').simulate('click');
      expect(wrapper.find('Dialog#confirmDialog').props().open).to.be.true;
    });

    it('should update clinician and redirect to "clinic-admin" on save', () => {
      expect(store.getActions()).to.eql([]);
      expect(defaultProps.api.clinics.inviteClinician.callCount).to.equal(0);
      wrapper.find('Button#next').simulate('click');
      expect(defaultProps.api.clinics.inviteClinician.callCount).to.equal(1);
      expect(store.getActions()).to.eql([
        { type: 'SEND_CLINICIAN_INVITE_REQUEST' },
        {
          type: 'SEND_CLINICIAN_INVITE_SUCCESS',
          payload: {
            'clinicId': 'clinicID456',
            'clinician': { inviteReturn: 'success' },
          },
        },
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: {
            args: ['/clinic-admin'],
            method: 'push',
          },
        },
      ]);
    });
  });
});

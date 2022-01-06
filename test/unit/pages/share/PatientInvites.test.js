import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import Table from '../../../../app/components/elements/Table';
import PatientInvites from '../../../../app/pages/share/PatientInvites';
import { Dialog } from '../../../../app/components/elements/Dialog';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('PatientInvites', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        acceptPatientInvitation: sinon.stub(),
        deletePatientInvitation: sinon.stub(),
        getPatientInvites: sinon.stub(),
      },
    },
  };

  before(() => {
    mount = createMount();
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.acceptPatientInvitation.resetHistory();
    defaultProps.api.clinics.deletePatientInvitation.resetHistory();
    defaultProps.api.clinics.getPatientInvites.resetHistory();
  });

  after(() => {
    mount.cleanUp();
  });

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const completedState = {
    ...defaultWorkingState,
    completed: true,
  };

  const loggedInUserId = 'clinicianUserId123';

  const clinicianUserId123 = {
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
  };

  const noInvitesState = {
    blip: {
      loggedInUserId,
      clinics: {
        clinicID123: {
          clinicians:{
            clinicianUserId123,
          },
          patients: {},
          id: 'clinicID123',
          address: '2 Address Ln, City Zip',
          name: 'other_clinic_name',
          email: 'other_clinic_email_address@example.com',
          phoneNumbers: [
            {
              number: '(888) 444-4444',
              type: 'Office',
            },
          ],
        },
      },
      selectedClinicId: 'clinicID123',
      working: {
        fetchingPatientInvites: completedState,
        acceptingPatientInvitation: defaultWorkingState,
        deletingPatientInvitation: defaultWorkingState,
      },
    },
  };

  let store;

  const hasInvitesState = merge({}, noInvitesState, {
    blip: {
      allUsersMap: {
        clinicianUserId123,
      },
      clinics: {
        clinicID123: {
          clinicians:{
            clinicianUserId123,
          },
          patientInvites: {
            invite1: {
              key: 'invite1',
              status: 'pending',
              creator: { profile: {
                fullName: 'Patient One',
                patient: { birthday: '1999-01-01' }
              } },
            },
            invite2: {
              key: 'invite2',
              status: 'pending',
              creator: { profile: {
                fullName: 'Patient Two',
                patient: { birthday: '1999-02-02' }
              } },
            },
          },
          id: 'clinicID123',
          address: '2 Address Ln, City Zip',
          name: 'other_clinic_name',
          email: 'other_clinic_email_address@example.com',
          phoneNumbers: [
            {
              number: '(888) 444-4444',
              type: 'Office',
            },
          ],
        },
      },
    },
  });

  context('no pending invites', () => {
    beforeEach(() => {
      store = mockStore(noInvitesState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <PatientInvites {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render an empty table', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(1); // header row only
      expect(wrapper.find('#no-invites').hostNodes().text()).includes('There are no invites. Refresh to check for pending invites');
    });

    it('should render a button that refreshes invites', () => {
      const refreshButton = wrapper.find('Button#refresh-invites');
      expect(refreshButton).to.have.lengthOf(1);
      expect(refreshButton.text()).to.equal('Refresh');

      store.clearActions();
      defaultProps.api.clinics.getPatientInvites.resetHistory();

      refreshButton.simulate('click');

      expect(store.getActions()).to.eql([
        { type: 'FETCH_PATIENT_INVITES_REQUEST' }
      ]);

      sinon.assert.calledWith(defaultProps.api.clinics.getPatientInvites, 'clinicID123')
    });
  });

  context('has pending invites', () => {
    beforeEach(() => {
      store = mockStore(hasInvitesState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <PatientInvites {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render a list of invites', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header row + 2 invites
      expect(table.find('tr').at(1).text()).contains('Patient One')
      expect(table.find('tr').at(1).text()).contains('1999-01-01')
      expect(table.find('tr').at(2).text()).contains('Patient Two')
      expect(table.find('tr').at(2).text()).contains('1999-02-02')
    });

    it('should allow searching invites', () => {
      const table = () => wrapper.find(Table);
      expect(table()).to.have.length(1);
      expect(table().find('tr')).to.have.length(3); // header row + 2 invites
      expect(table().find('tr').at(1).text()).contains('Patient One')
      expect(table().find('tr').at(2).text()).contains('Patient Two')

      const searchInput = wrapper.find('input[name="search-invites"]');
      expect(searchInput).to.have.lengthOf(1);

      // Input partial match on name for patient two
      searchInput.simulate('change', { target: { name: 'search-invites', value: 'Two' } });

      expect(table().find('tr')).to.have.length(2); // header row + 1 invite
      expect(table().find('tr').at(1).text()).contains('Patient Two')
    });

    it('should allow accepting a patient invite', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header row + 2 invites
      const acceptButton = table.find('tr').at(1).find('Button.accept-invite');
      expect(acceptButton.text()).to.equal('Accept');

      acceptButton.simulate('click');

      expect(store.getActions()).to.eql([
        { type: 'ACCEPT_PATIENT_INVITATION_REQUEST' },
      ]);

      sinon.assert.calledWith(defaultProps.api.clinics.acceptPatientInvitation, 'clinicID123', 'invite1');
    });

    it('should allow declining a patient invite', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header row + 2 invites
      const declineButton = table.find('tr').at(1).find('Button.decline-invite');
      expect(declineButton.text()).to.equal('Decline');

      expect(wrapper.find(Dialog).props().open).to.be.false;
      declineButton.simulate('click');
      wrapper.update();
      expect(wrapper.find(Dialog).props().open).to.be.true;

      const confirmDeclineButton = wrapper.find(Dialog).find('Button.decline-invite');
      expect(confirmDeclineButton.text()).to.equal('Decline Invite');

      confirmDeclineButton.simulate('click');

      expect(store.getActions()).to.eql([
        { type: 'DELETE_PATIENT_INVITATION_REQUEST' },
      ]);

      sinon.assert.calledWith(defaultProps.api.clinics.deletePatientInvitation, 'clinicID123', 'invite1');
    });
  });
});

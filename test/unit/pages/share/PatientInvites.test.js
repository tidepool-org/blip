import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import Table from '../../../../app/components/elements/Table';
import PatientInvites from '../../../../app/pages/share/PatientInvites';
import { Dialog } from '../../../../app/components/elements/Dialog';
import { clinicUIDetails } from '../../../../app/core/clinicUtils';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('PatientInvites', () => {
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

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.acceptPatientInvitation.resetHistory();
    defaultProps.api.clinics.deletePatientInvitation.resetHistory();
    defaultProps.api.clinics.getPatientInvites.resetHistory();
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
        },
      },
      selectedClinicId: 'clinicID123',
      working: {
        fetchingPatientInvites: completedState,
        acceptingPatientInvitation: defaultWorkingState,
        deletingPatientInvitation: defaultWorkingState,
        deletingPatientInvitation: defaultWorkingState,
        sendingPatientDataProviderConnectRequest: defaultWorkingState,
        fetchingPatientsForClinic: defaultWorkingState,
        fetchingClinicMRNsForPatientFormValidation: defaultWorkingState,
      },
    },
  };

  let store;

  const hasInvitesState = (clinicOverrides = { tier: 'tier0100' }) => {
    const clinic = {
      clinicians:{
        clinicianUserId123,
      },
      patientInvites: {
        invite1: {
          key: 'invite1',
          status: 'pending',
          creatorId: 'patient1',
          creator: { profile: {
            fullName: 'Patient One',
            patient: { birthday: '1999-01-01' }
          } },
        },
        invite2: {
          key: 'invite2',
          status: 'pending',
          creatorId: 'patient2',
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
      ...clinicOverrides,
    };

    return merge({}, noInvitesState, {
      blip: {
        allUsersMap: {
          clinicianUserId123,
        },
        clinics: {
          clinicID123: {
            ...clinic,
            ...clinicUIDetails({...clinic}),
          },
        },
      },
    });
  };

  context('no pending invites', () => {
    beforeEach(() => {
      store = mockStore(noInvitesState);
      defaultProps.trackMetric.resetHistory();
      wrapper = render(
        <Provider store={store}>
          <ToastProvider>
            <PatientInvites {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render an empty table', () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      expect(rows.length).to.equal(1); // header row only
      expect(wrapper.container.querySelector('#no-invites').textContent).to.include('There are no invites. Refresh to check for pending invites');
    });

    it('should render a button that refreshes invites', () => {
      const refreshButton = wrapper.container.querySelector('button#refresh-invites');
      expect(refreshButton).to.not.be.null;
      expect(refreshButton.textContent).to.equal('Refresh');

      store.clearActions();
      defaultProps.api.clinics.getPatientInvites.resetHistory();

      fireEvent.click(refreshButton);

      expect(store.getActions()).to.eql([
        { type: 'FETCH_PATIENT_INVITES_REQUEST' }
      ]);

      sinon.assert.calledWith(defaultProps.api.clinics.getPatientInvites, 'clinicID123')
    });
  });

  context('has pending invites', () => {
    beforeEach(() => {
      store = mockStore(hasInvitesState());
      defaultProps.trackMetric.resetHistory();
      wrapper = render(
        <Provider store={store}>
          <ToastProvider>
            <PatientInvites {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render a list of invites', () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      expect(rows.length).to.equal(3); // header row + 2 invites
      expect(rows[1].textContent).to.include('Patient One');
      expect(rows[1].textContent).to.include('1999-01-01');
      expect(rows[2].textContent).to.include('Patient Two');
      expect(rows[2].textContent).to.include('1999-02-02');
    });

    it('should allow searching invites', async () => {
      const rows = () => wrapper.container.querySelectorAll('table tr');
      expect(rows().length).to.equal(3); // header row + 2 invites
      expect(rows()[1].textContent).to.include('Patient One');
      expect(rows()[2].textContent).to.include('Patient Two');

      const searchInput = wrapper.container.querySelector('input[name="search-invites"]');
      expect(searchInput).to.not.be.null;

      // Input partial match on name for patient two
      fireEvent.change(searchInput, { target: { name: 'search-invites', value: 'Two' } });

      await waitFor(() => {
        const updatedRows = wrapper.container.querySelectorAll('table tr');
        expect(updatedRows.length).to.equal(2); // header row + 1 invite
        expect(updatedRows[1].textContent).to.include('Patient Two');
      });
    });

    it('should allow accepting a patient invite directly for tier0100 clinics', () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      expect(rows.length).to.equal(3); // header row + 2 invites
      const acceptButton = rows[1].querySelector('button.accept-invite');
      expect(acceptButton.textContent).to.equal('Accept');

      fireEvent.click(acceptButton);

      expect(store.getActions()).to.eql([
        { type: 'ACCEPT_PATIENT_INVITATION_REQUEST' },
      ]);

      sinon.assert.calledWith(defaultProps.api.clinics.acceptPatientInvitation, 'clinicID123', 'invite1');
    });

    it('should open a modal to set patient details prior to accepting a patient invite for tier0300 clinics', async () => {
      const { unmount } = wrapper;
      store = mockStore(hasInvitesState({ tier: 'tier0300' }));
      defaultProps.trackMetric.resetHistory();
      wrapper = render(
        <Provider store={store}>
          <ToastProvider>
            <PatientInvites {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      const rows = wrapper.container.querySelectorAll('table tr');
      expect(rows.length).to.equal(3); // header row + 2 invites
      const acceptButton = rows[2].querySelector('button.accept-invite');
      expect(acceptButton.textContent).to.equal('Accept');

      expect(document.body.querySelector('[id="editInvitedPatient"]')).to.be.null;
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(document.body.querySelector('[id="editInvitedPatient"]')).to.not.be.null;
      });

      expect(defaultProps.trackMetric.calledWith('Clinic - Edit invited patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      const patientForm = document.body.querySelector('form#clinic-patient-form');
      expect(patientForm).to.not.be.null;

      const fullNameInput = patientForm.querySelector('input[name="fullName"]');
      expect(fullNameInput.value).to.equal('Patient Two');
      fireEvent.change(fullNameInput, { target: { name: 'fullName', value: 'Patient 2' } });
      expect(fullNameInput.value).to.equal('Patient 2');

      const birthDateInput = patientForm.querySelector('input[name="birthDate"]');
      expect(birthDateInput.value).to.equal('02/02/1999');
      fireEvent.change(birthDateInput, { target: { name: 'birthDate', value: '01/01/1999' } });
      expect(birthDateInput.value).to.equal('01/01/1999');

      const mrnInput = patientForm.querySelector('input[name="mrn"]');
      expect(mrnInput.value).to.equal('');
      fireEvent.change(mrnInput, { target: { name: 'mrn', value: 'mrn456' } });
      await waitFor(() => expect(mrnInput.value).to.equal('MRN456'));

      // should not show the email field
      expect(patientForm.querySelector('input[name="email"]')).to.be.null;

      // should not show the dexcom connection section
      expect(document.body.querySelector('#connectDexcomWrapper')).to.be.null;

      store.clearActions();
      const confirmButton = document.body.querySelector('button#editInvitedPatientConfirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(defaultProps.api.clinics.acceptPatientInvitation.callCount).to.equal(1);
        sinon.assert.calledWith(
          defaultProps.api.clinics.acceptPatientInvitation,
          'clinicID123',
          'invite2',
          {
            birthDate: '1999-01-01',
            fullName: 'Patient 2',
            mrn: 'MRN456',
            tags: [],
            sites: [],
            diagnosisType: '',
            glycemicRanges: { type: 'preset', preset: 'adaStandard' },
          }
        );
        expect(store.getActions()).to.eql([
          { type: 'ACCEPT_PATIENT_INVITATION_REQUEST' },
        ]);
      });
    });

    it('should open a modal to set patient details prior to accepting a patient invite for mrnSettings.required clinics', async () => {
      store = mockStore(hasInvitesState({ mrnSettings: { required: true } }));
      defaultProps.trackMetric.resetHistory();
      wrapper = render(
        <Provider store={store}>
          <ToastProvider>
            <PatientInvites {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      const rows = wrapper.container.querySelectorAll('table tr');
      expect(rows.length).to.equal(3); // header row + 2 invites
      const acceptButton = rows[2].querySelector('button.accept-invite');
      expect(acceptButton.textContent).to.equal('Accept');

      expect(document.body.querySelector('[id="editInvitedPatient"]')).to.be.null;
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(document.body.querySelector('[id="editInvitedPatient"]')).to.not.be.null;
      });

      expect(defaultProps.trackMetric.calledWith('Clinic - Edit invited patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      const patientForm = document.body.querySelector('form#clinic-patient-form');
      expect(patientForm).to.not.be.null;

      const fullNameInput = patientForm.querySelector('input[name="fullName"]');
      expect(fullNameInput.value).to.equal('Patient Two');
      fireEvent.change(fullNameInput, { target: { name: 'fullName', value: 'Patient 2' } });
      expect(fullNameInput.value).to.equal('Patient 2');

      const birthDateInput = patientForm.querySelector('input[name="birthDate"]');
      expect(birthDateInput.value).to.equal('02/02/1999');
      fireEvent.change(birthDateInput, { target: { name: 'birthDate', value: '01/01/1999' } });
      expect(birthDateInput.value).to.equal('01/01/1999');

      // Since MRN is required, submit button should be disabled until filled
      const mrnInput = patientForm.querySelector('input[name="mrn"]');
      expect(mrnInput.value).to.equal('');

      const confirmButton = document.body.querySelector('button#editInvitedPatientConfirm');
      expect(confirmButton.disabled).to.be.true;

      fireEvent.change(mrnInput, { target: { name: 'mrn', value: 'mrn456' } });
      await waitFor(() => expect(mrnInput.value).to.equal('MRN456'));
      await waitFor(() => expect(confirmButton.disabled).to.be.false);

      // should not show the email field
      expect(patientForm.querySelector('input[name="email"]')).to.be.null;

      // should not show the dexcom connection section
      expect(document.body.querySelector('#connectDexcomWrapper')).to.be.null;

      store.clearActions();
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(defaultProps.api.clinics.acceptPatientInvitation.callCount).to.equal(1);
        sinon.assert.calledWith(
          defaultProps.api.clinics.acceptPatientInvitation,
          'clinicID123',
          'invite2',
          {
            birthDate: '1999-01-01',
            fullName: 'Patient 2',
            mrn: 'MRN456',
            tags: [],
            sites: [],
            diagnosisType: '',
            glycemicRanges: { type: 'preset', preset: 'adaStandard' },
          }
        );
        expect(store.getActions()).to.eql([
          { type: 'ACCEPT_PATIENT_INVITATION_REQUEST' },
        ]);
      });
    });

    it('should allow declining a patient invite', async () => {
      const rows = wrapper.container.querySelectorAll('table tr');
      expect(rows.length).to.equal(3); // header row + 2 invites
      const declineButton = rows[1].querySelector('button.decline-invite');
      expect(declineButton.textContent).to.equal('Decline');

      // Before click, the confirm decline button should not be visible
      // confirmDeclineButton text should not be 'Decline Invite' yet (dialog closed)

      fireEvent.click(declineButton);

      await waitFor(() => {
        const openDialog = document.body.querySelector('[role="dialog"]');
        const confirmDeclineButton = openDialog && openDialog.querySelector('button.decline-invite');
        // After click, the 'Decline Invite' button text should be populated (dialog open)
        expect(confirmDeclineButton && confirmDeclineButton.textContent).to.equal('Decline Invite');
      });

      const openDialog = document.body.querySelector('[role="dialog"]');
      const confirmDeclineButton = openDialog.querySelector('button.decline-invite');
      expect(confirmDeclineButton.textContent).to.equal('Decline Invite');

      fireEvent.click(confirmDeclineButton);

      expect(store.getActions()).to.eql([
        { type: 'DELETE_PATIENT_INVITATION_REQUEST' },
      ]);

      sinon.assert.calledWith(defaultProps.api.clinics.deletePatientInvitation, 'clinicID123', 'invite1');
    });
  });
});

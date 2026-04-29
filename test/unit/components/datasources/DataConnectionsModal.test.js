import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import DataConnectionsModal from '../../../../app/components/datasources/DataConnectionsModal';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import coreApi from '../../../../app/core/api';

const mockUseHistory = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useHistory: () => mockUseHistory(),
  };
});

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('DataConnectionsModal', () => {
  const originalCoreApiMethods = {
    clinics: {
      getPatientFromClinic: coreApi.clinics.getPatientFromClinic,
      updateClinicPatient: coreApi.clinics.updateClinicPatient,
    },
  };

  const api = {
    clinics: {
      getPatientFromClinic: sinon.stub(),
      updateClinicPatient: sinon.stub(),
    },
  };

  let wrapper;

  const patientWithEmail = {
    id: 'patient123',
    fullName: 'Patient 123',
    birthDate: '2004-02-03',
    mrn: '12345',
    email: 'patient@test.ca',
    tags: ['tag1', 'tag2'],
    permissions: { custodian: {} },
  };

  const patientWithoutEmail = {
    id: 'patient123',
    fullName: 'Patient 123',
    birthDate: '2004-02-03',
    mrn: '12345',
    tags: ['tag1', 'tag2'],
    permissions: { custodian: {} },
  };

  const patientWithoutCustodialPermission = {
    id: 'patient123',
    fullName: 'Patient 123',
    birthDate: '2004-02-03',
    mrn: '12345',
    tags: ['tag1', 'tag2'],
    permissions: {},
  };

  let defaultProps = {
    open: true,
    onClose: sinon.stub(),
    onBack: sinon.stub(),
    patient: patientWithEmail,
    trackMetric: sinon.stub(),
  };

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const fetchedDataState = {
    blip: {
      working: {
        sendingPatientDataProviderConnectRequest: defaultWorkingState,
        updatingClinicPatient: defaultWorkingState,
      },
      clinics: {
        clinicID123: {
          mrnSettings: {
            required: true,
          },
          patientTags: [
            { id: 'tag1' },
            { id: 'tag2' },
          ],
        },
      },
      selectedClinicId: 'clinicID123',
    },
  };

  let store = mockStore(fetchedDataState);

  beforeEach(() => {
    coreApi.clinics.getPatientFromClinic = api.clinics.getPatientFromClinic;
    coreApi.clinics.updateClinicPatient = api.clinics.updateClinicPatient;

    mockUseHistory.mockReturnValue({
      location: { query: {}, pathname: '/settings' },
      replace: sinon.stub(),
    });

    wrapper = render(
      <Provider store={store}>
        <ToastProvider>
          <DataConnectionsModal {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  afterEach(() => {
    cleanup();
    store.clearActions();
    defaultProps.trackMetric.resetHistory();
    defaultProps.onClose.resetHistory();
    defaultProps.onBack.resetHistory();
    coreApi.clinics.getPatientFromClinic = originalCoreApiMethods.clinics.getPatientFromClinic;
    coreApi.clinics.updateClinicPatient = originalCoreApiMethods.clinics.updateClinicPatient;
  });

  it('should render the modal title', () => {
    // Dialog portals into document.body
    const title = document.getElementById('data-connections-title');
    expect(title).to.not.be.null;
    expect(title.textContent).to.equal('Bring Data into Tidepool');
  });

  it('should render patient details', () => {
    const details = document.getElementById('data-connections-patient-details');
    expect(details).to.not.be.null;
  });

  it('should render a patients data connection statuses', () => {
    const connections = document.querySelectorAll('.data-connection');
    expect(connections.length).to.equal(3);

    expect(connections[0].id).to.equal('data-connection-dexcom');
    expect(connections[1].id).to.equal('data-connection-twiist');
    expect(connections[2].id).to.equal('data-connection-abbott');
  });

  it('should allow opening a dialog for updating an existing email address for a custodial patient', async () => {
    // patient-email-modal should not be open initially
    expect(document.getElementById('patient-email-modal')).to.be.null;

    const dialogButton = document.getElementById('data-connections-open-email-modal');
    expect(dialogButton).to.not.be.null;
    expect(dialogButton.textContent).to.equal(patientWithEmail.email);

    fireEvent.click(dialogButton);

    await waitFor(() => {
      expect(document.getElementById('patient-email-modal')).to.not.be.null;
    });
  });

  it('should not allow opening a dialog for updating an email address for a custodial patient without an existing email address', () => {
    cleanup();
    wrapper = render(
      <Provider store={store}>
        <ToastProvider>
          <DataConnectionsModal {...{ ...defaultProps, patient: patientWithoutEmail }} />
        </ToastProvider>
      </Provider>
    );

    expect(document.getElementById('patient-email-modal')).to.be.null;
    expect(document.getElementById('data-connections-open-email-modal')).to.be.null;
  });

  it('should not allow opening a dialog for updating an existing email address for a patient without custodial access', () => {
    cleanup();
    wrapper = render(
      <Provider store={store}>
        <ToastProvider>
          <DataConnectionsModal {...{ ...defaultProps, patient: patientWithoutCustodialPermission }} />
        </ToastProvider>
      </Provider>
    );

    expect(document.getElementById('patient-email-modal')).to.be.null;
    expect(document.getElementById('data-connections-open-email-modal')).to.be.null;
  });
});

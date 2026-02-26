import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import PatientEmailModal from '../../../../app/components/datasources/PatientEmailModal';
import noop from 'lodash/noop';

jest.mock('../../../../app/core/api', () => ({
  __esModule: true,
  default: { clinics: { updateClinicPatient: jest.fn() } },
}));

const mockApi = jest.requireMock('../../../../app/core/api').default;

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('PatientEmailModal', () => {
  let wrapper;
  const patientWithEmail = {
    id: 'patient123',
    fullName: 'Patient 123',
    birthDate: '2004-02-03',
    mrn: '12345',
    email: 'patient@test.ca',
    tags: ['tag1', 'tag2']
  };

  let defaultProps = {
    open: true,
    onClose: sinon.stub(),
    onFormChange: sinon.stub(),
    onSubmit: sinon.stub(),
    processing: false,
    patient: patientWithEmail,
    trackMetric: sinon.stub(),
  };

  const fetchedDataState = {
    blip: {
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
    mockApi.clinics.updateClinicPatient.mockReset();
    wrapper = render(
      <Provider store={store}>
        <PatientEmailModal {...defaultProps} />
      </Provider>
    );
  });

  afterEach(() => {
    cleanup();
    defaultProps.trackMetric.resetHistory();
    defaultProps.onFormChange.resetHistory();
    defaultProps.onSubmit.resetHistory();
  });

  it('should render a dialog for updating an existing patient email address', done => {
    // Dialog portal renders into document.body
    const dialog = document.getElementById('patient-email-modal');
    expect(dialog).to.not.be.null;

    const title = document.getElementById('patient-email-modal-title');
    expect(title.textContent).to.equal('Edit Patient Email');

    const submitButton = document.getElementById('patient-email-modal-submit');
    expect(submitButton.textContent).to.equal('Save');

    const bannerTitle = document.querySelector('.title');
    expect(bannerTitle.textContent).to.equal('Changing this email will update the email associated with the account.');

    const emailInput = document.querySelector('input[name="email"]');
    expect(emailInput.value).to.equal('patient@test.ca');

    fireEvent.change(emailInput, { target: { name: 'email', value: 'patient-updated@test.ca' } });
    expect(emailInput.value).to.equal('patient-updated@test.ca');

    sinon.assert.calledWith(defaultProps.onFormChange, sinon.match({ values: {
      birthDate: '2004-02-03',
      email: 'patient-updated@test.ca',
      fullName: 'Patient 123',
      mrn: '12345',
      tags: ['tag1', 'tag2'],
      dataSources: [],
    } }));

    store.clearActions();
    fireEvent.click(submitButton);

    setTimeout(() => {
      sinon.assert.calledOnce(defaultProps.onSubmit);
      done();
    });
  });

  it('should render a dialog for adding an email and sending an invite for a patient without an email address', done => {
    cleanup();
    wrapper = render(
      <Provider store={store}>
        <PatientEmailModal {...defaultProps} patient={{ ...defaultProps.patient, email: undefined }} />
      </Provider>
    );

    const dialog = document.getElementById('patient-email-modal');
    expect(dialog).to.not.be.null;

    const title = document.getElementById('patient-email-modal-title');
    expect(title.textContent).to.equal('Add a Patient Email');

    const submitButton = document.getElementById('patient-email-modal-submit');
    expect(submitButton.textContent).to.equal('Send Invite');

    const bannerTitle = document.querySelector('.title');
    expect(bannerTitle.textContent).to.equal('Please set the email address for this patient account.');

    const emailInput = document.querySelector('input[name="email"]');
    expect(emailInput.value).to.equal('');

    fireEvent.change(emailInput, { target: { name: 'email', value: 'patient@test.ca' } });
    expect(emailInput.value).to.equal('patient@test.ca');

    sinon.assert.calledWith(defaultProps.onFormChange, sinon.match({ values: {
      birthDate: '2004-02-03',
      email: 'patient@test.ca',
      fullName: 'Patient 123',
      mrn: '12345',
      tags: ['tag1', 'tag2'],
      dataSources: [],
    } }));

    store.clearActions();
    fireEvent.click(submitButton);

    setTimeout(() => {
      sinon.assert.calledOnce(defaultProps.onSubmit);
      done();
    });
  });
});

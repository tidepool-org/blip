import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import PatientEmailModal from '../../../../app/components/datasources/PatientEmailModal';
import Banner from '../../../../app/components/elements/Banner';
import { Dialog } from '../../../../app/components/elements/Dialog';
import noop from 'lodash/noop';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global afterEach */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('PatientEmailModal', () => {
  let mount;

  const api = {
    clinics: {
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

  before(() => {
    mount = createMount();
  });

  after(() => {
    mount.cleanUp();
  });

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
    PatientEmailModal.__Rewire__('api', api);
    wrapper = mount(
      <Provider store={store}>
        <PatientEmailModal {...defaultProps} />
      </Provider>
    );
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.onFormChange.resetHistory();
    defaultProps.onSubmit.resetHistory();
    PatientEmailModal.__ResetDependency__('api');
  });

  it('should render a dialog for updating an existing patient email address', done => {
    const dialog = () => wrapper.find(Dialog).at(0);
    expect(dialog()).to.have.lengthOf(1);
    expect(dialog().props().open).to.be.true;

    const title = dialog().find('#data-connections-title').hostNodes();
    expect(title.text()).to.equal('Edit Patient Email');

    const submitButton = dialog().find('Button#patient-email-modal-submit');
    expect(submitButton.text()).to.equal('Save');

    const banner = dialog().find(Banner);
    expect(banner.find('.title').hostNodes().text()).to.equal('Changing this email will update the email associated with the account.')

    expect(dialog().find('input[name="email"]').prop('value')).to.equal('patient@test.ca');
    dialog().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: 'patient-updated@test.ca' } });
    expect(dialog().find('input[name="email"]').prop('value')).to.equal('patient-updated@test.ca');

    sinon.assert.calledWith(defaultProps.onFormChange, sinon.match({ values: {
      birthDate: '2004-02-03',
      email: 'patient-updated@test.ca',
      fullName: 'Patient 123',
      mrn: '12345',
      tags: ['tag1', 'tag2'],
      dataSources: [] ,
    } }));

    store.clearActions();
    submitButton.simulate('click');

    setTimeout(() => {
      sinon.assert.calledOnce(defaultProps.onSubmit);
      done();
    });
  });

  it('should render a dialog for adding an email and sending an invite for a patient without an email address', done => {
    wrapper = mount(
      <Provider store={store}>
        <PatientEmailModal {...defaultProps} patient={{ ...defaultProps.patient, email: undefined }} />
      </Provider>
    );

    const dialog = () => wrapper.find(Dialog).at(0);
    expect(dialog()).to.have.lengthOf(1);
    expect(dialog().props().open).to.be.true;

    const title = dialog().find('#data-connections-title').hostNodes();
    expect(title.text()).to.equal('Add a Patient Email');

    const submitButton = dialog().find('Button#patient-email-modal-submit');
    expect(submitButton.text()).to.equal('Send Invite');

    const banner = dialog().find(Banner);
    expect(banner.find('.title').hostNodes().text()).to.equal('Please set the email address for this patient account.')

    expect(dialog().find('input[name="email"]').prop('value')).to.equal('');
    dialog().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: 'patient@test.ca' } });
    expect(dialog().find('input[name="email"]').prop('value')).to.equal('patient@test.ca');

    sinon.assert.calledWith(defaultProps.onFormChange, sinon.match({ values: {
      birthDate: '2004-02-03',
      email: 'patient@test.ca',
      fullName: 'Patient 123',
      mrn: '12345',
      tags: ['tag1', 'tag2'],
      dataSources: [] ,
    } }));

    store.clearActions();
    submitButton.simulate('click');

    setTimeout(() => {
      sinon.assert.calledOnce(defaultProps.onSubmit);
      done();
    });
  });
});

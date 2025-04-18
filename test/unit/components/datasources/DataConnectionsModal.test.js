import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import DataConnectionsModal from '../../../../app/components/datasources/DataConnectionsModal';
import DataConnections from '../../../../app/components/datasources/DataConnections';
import { Dialog } from '../../../../app/components/elements/Dialog';
import { ToastProvider } from '../../../../app/providers/ToastProvider';

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

describe('DataConnectionsModal', () => {
  let mount;

  const api = {
    clinics: {
      getPatientFromClinic: sinon.stub(),
      updateClinicPatient: sinon.stub(),
    },
  };

  let wrapper;
  let formikContext;

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
    DataConnectionsModal.__Rewire__('api', api);
    DataConnections.__Rewire__('api', api);

    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <DataConnectionsModal {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.onClose.resetHistory();
    defaultProps.onBack.resetHistory();
    DataConnections.__ResetDependency__('api');
    DataConnectionsModal.__ResetDependency__('api');
  });

  it('should render the modal title', () => {
    const dialog = () => wrapper.find(Dialog).at(0);
    expect(dialog()).to.have.lengthOf(1);
    expect(dialog().props().open).to.be.true;

    const title = dialog().find('#data-connections-title').hostNodes();
    expect(title).to.have.lengthOf(1);
    expect(title.text()).to.equal('Bring Data into Tidepool');
  });

  it('should render patient details', () => {
    const dialog = () => wrapper.find(Dialog).at(0);
    expect(dialog()).to.have.lengthOf(1);
    expect(dialog().props().open).to.be.true;

    const details = dialog().find('#data-connections-patient-details').hostNodes();
    expect(details).to.have.lengthOf(1);
  });

  it('should render a patients data connection statuses', () => {
    const dialog = () => wrapper.find(Dialog).at(0);
    expect(dialog()).to.have.lengthOf(1);
    expect(dialog().props().open).to.be.true;

    const connections = dialog().find('.data-connection').hostNodes();
    expect(connections).to.have.lengthOf(2);

    expect(connections.at(0).is('#data-connection-dexcom')).to.be.true;
    expect(connections.at(1).is('#data-connection-twiist')).to.be.true;
  });

  it('should allow opening a dialog for updating an existing email address for a custodial patient', () => {
    const dialog = () => wrapper.find('Dialog#patient-email-modal');
    expect(dialog()).to.have.lengthOf(0);

    const dialogButton = wrapper.find('#data-connections-open-email-modal').hostNodes();
    expect(dialogButton).to.have.lengthOf(1);
    expect(dialogButton.text()).to.equal(patientWithEmail.email);

    dialogButton.simulate('click');
    expect(dialog()).to.have.lengthOf(1);
    expect(dialog().props().open).to.be.true;
  });

  it('should not allow opening a dialog for updating an email address for a custodial patient without an existing email address', () => {
    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <DataConnectionsModal {...{ ...defaultProps, patient: patientWithoutEmail }} />
        </ToastProvider>
      </Provider>
    );

    const dialog = () => wrapper.find('Dialog#patient-email-modal');
    expect(dialog()).to.have.lengthOf(0);

    const dialogButton = wrapper.find('#data-connections-open-email-modal').hostNodes();
    expect(dialogButton).to.have.lengthOf(0);
  });

  it('should not allow opening a dialog for updating an existing email address for a patient without custodial access', () => {
    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <DataConnectionsModal {...{ ...defaultProps, patient: patientWithoutCustodialPermission }} />
        </ToastProvider>
      </Provider>
    );

    const dialog = () => wrapper.find('Dialog#patient-email-modal');
    expect(dialog()).to.have.lengthOf(0);

    const dialogButton = wrapper.find('#data-connections-open-email-modal').hostNodes();
    expect(dialogButton).to.have.lengthOf(0);
  });
});

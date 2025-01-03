import React from 'react';
import moment from 'moment';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Button } from '../../../../app/components/elements/Button';
import { Dialog } from '../../../../app/components/elements/Dialog';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import map from 'lodash/map';
import noop from 'lodash/noop';
import reduce from 'lodash/reduce';

import PatientEmailModal from '../../../../app/components/datasources/PatientEmailModal';

import DataConnections, {
  activeProviders,
  providers,
  getProviderHandlers,
  getConnectStateUI,
  getDataConnectionProps
} from '../../../../app/components/datasources/DataConnections';
import { timePrefs } from '../../../../app/redux/reducers/misc';

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

describe('DataConnections', () => {
  let mount;

  const api = {
    clinics: {
      getPatientFromClinic: sinon.stub(),
      sendPatientDataProviderConnectRequest: sinon.stub(),
      updateClinicPatient: sinon.stub(),
    },
    user: {
      createRestrictedToken: sinon.stub().callsArgWith(1, null, { id: 'restrictedTokenID' }),
      createOAuthProviderAuthorization: sinon.stub(),
    },
  };

  const getDateInPast = (amount, unit) => moment.utc().subtract(amount, unit).toISOString();

  const patientWithState = (isClinicContext, state, opts = {}) => ({
    id: 'patient123',
    dataSources: state ? map(activeProviders, providerName => ({
      providerName,
      state,
      createdTime: opts.createdTime,
      modifiedTime: opts.modifiedTime,
      expirationTime: opts.expirationTime,
      lastImportTime: opts.lastImportTime,
      latestDataTime: opts.latestDataTime,
    })) : undefined,
    connectionRequests: isClinicContext && opts.createdTime ? reduce(activeProviders, (res, providerName) => {
      res[providerName] = [{ providerName, createdTime: opts.createdTime }];
      return res;
    }, {}) : undefined,
  });

  const clinicPatients = {
    dataConnectionUnset: patientWithState(true),
    dataConnectionInviteJustSent: patientWithState(true, 'pending', { createdTime: getDateInPast(5, 'seconds') }),
    dataConnectionPending: patientWithState(true, 'pending', { createdTime: getDateInPast(5, 'days') }),
    dataConnectionPendingReconnect: patientWithState(true, 'pendingReconnect', { createdTime: getDateInPast(10, 'days') }),
    dataConnectionPendingExpired: patientWithState(true, 'pending', { createdTime: getDateInPast(31, 'days'), expirationTime: getDateInPast(1, 'days') }),
    dataConnectionConnected: patientWithState(true, 'connected'),
    dataConnectionDisconnected: patientWithState(true, 'disconnected', { modifiedTime: getDateInPast(7, 'hours') }),
    dataConnectionError: patientWithState(true, 'error', { modifiedTime: getDateInPast(20, 'minutes') }),
    dataConnectionUnknown: patientWithState(true, 'foo'),
  }

  const userPatients = {
    dataConnectionUnset: patientWithState(false),
    dataConnectionConnected: patientWithState(false, 'connected', { createdTime: getDateInPast(1, 'minutes') }),
    dataConnectionConnectedWithNoData: patientWithState(false, 'connected', { lastImportTime: getDateInPast(5, 'minutes') }),
    dataConnectionConnectedWithData: patientWithState(false, 'connected', { lastImportTime: getDateInPast(1, 'minutes'), latestDataTime: getDateInPast(35, 'minutes') }),
    dataConnectionDisconnected: patientWithState(false, 'disconnected', { modifiedTime: getDateInPast(1, 'hour') }),
    dataConnectionError: patientWithState(false, 'error', { modifiedTime: getDateInPast(6, 'days') }),
    dataConnectionUnknown: patientWithState(false, 'foo'),
  }

  let defaultProps = {
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

  const clinicianUserLoggedInState = {
    blip: {
      timePrefs: { timezoneName: 'US/Eastern' },
      working: {
        sendingPatientDataProviderConnectRequest: defaultWorkingState,
        updatingClinicPatient: defaultWorkingState,
      },
      selectedClinicId: 'clinicID123',
      loggedInUserId: 'clinician123',
    },
  };

  const patientUserLoggedInState = {
    blip: {
      working: {
        sendingPatientDataProviderConnectRequest: defaultWorkingState,
        updatingClinicPatient: defaultWorkingState,
      },
      selectedClinicId: 'clinicID123',
      loggedInUserId: 'patient123',
    },
  };

  let wrapper;
  const mountWrapper = (store, patient) => {
    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <DataConnections {...defaultProps} patient={patient} />
        </ToastProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    DataConnections.__Rewire__('api', api);
    PatientEmailModal.__Rewire__('api', api);
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
    api.clinics.getPatientFromClinic.resetHistory();
    api.clinics.sendPatientDataProviderConnectRequest.resetHistory();
    api.clinics.updateClinicPatient.resetHistory();
    DataConnections.__ResetDependency__('api');
    PatientEmailModal.__ResetDependency__('api');
  });

  context('clinic patients', () => {
    describe('data connection unset', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionUnset);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('No Pending Connections');
        expect(dexcomConnection.find('.state-message')).to.have.lengthOf(0);

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('No Pending Connections');
        expect(abbottConnection.find('.state-message')).to.have.lengthOf(0);
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', done => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionUnset);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Email Invite');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Email Invite');

        store.clearActions();
        dexcomActionButton.simulate('click');
        abbottActionButton.simulate('click');

        setTimeout(() => {
          sinon.assert.calledWith(api.clinics.updateClinicPatient, 'clinicID123', 'patient123', sinon.match({ dataSources: [ { providerName: 'dexcom', state: 'pending' } ] }));
          sinon.assert.calledWith(api.clinics.updateClinicPatient, 'clinicID123', 'patient123', sinon.match({ dataSources: [ { providerName: 'abbott', state: 'pending' } ] }));
          done();
        })
      });
    });

    describe('data connection invite just sent', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionInviteJustSent);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Connection Pending');
        expect(dexcomConnection.find('.state-message')).to.have.lengthOf(0);

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Connection Pending');
        expect(abbottConnection.find('.state-message')).to.have.lengthOf(0);
      });

      it('should render a disabled action buttons with appropriate text', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionInviteJustSent);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.props().disabled).to.be.true;
        expect(dexcomActionButton.text()).to.equal('Invite Sent');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.props().disabled).to.be.true;
        expect(abbottActionButton.text()).to.equal('Invite Sent');
      });
    });

    describe('data connection pending', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPending);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Connection Pending');
        expect(dexcomConnection.find('.state-message').hostNodes().text()).to.equal(' - Invite sent 5 days ago');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Connection Pending');
        expect(abbottConnection.find('.state-message').hostNodes().text()).to.equal(' - Invite sent 5 days ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPending);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Resend Invite');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        const resendDialog = () => wrapper.find('#resendDataSourceConnectRequest').at(1);
        expect(resendDialog().props().open).to.be.false;
        dexcomActionButton.simulate('click');
        expect(resendDialog().props().open).to.be.true;

        const resendInvite = resendDialog().find(Button).filter({variant: 'primary'});
        expect(resendInvite).to.have.length(1);

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        resendInvite.props().onClick();
        expect(store.getActions()).to.eql(expectedActions);
        sinon.assert.calledWith(
          api.clinics.sendPatientDataProviderConnectRequest,
          'clinicID123',
          'patient123',
          'dexcom',
        );
      });
    });

    describe('data reconnection pending', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPendingReconnect);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Invite Sent');
        expect(dexcomConnection.find('.state-message').hostNodes().text()).to.equal(' - Invite sent 10 days ago');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Invite Sent');
        expect(abbottConnection.find('.state-message').hostNodes().text()).to.equal(' - Invite sent 10 days ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPendingReconnect);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Resend Invite');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        const resendDialog = () => wrapper.find('#resendDataSourceConnectRequest').at(1);
        expect(resendDialog().props().open).to.be.false;
        dexcomActionButton.simulate('click');
        expect(resendDialog().props().open).to.be.true;

        const resendInvite = resendDialog().find(Button).filter({variant: 'primary'});
        expect(resendInvite).to.have.length(1);

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        resendInvite.props().onClick();
        expect(store.getActions()).to.eql(expectedActions);
        sinon.assert.calledWith(
          api.clinics.sendPatientDataProviderConnectRequest,
          'clinicID123',
          'patient123',
          'dexcom',
        );
      });
    });

    describe('data connection pending expired', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPendingExpired);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Invite Expired');
        expect(dexcomConnection.find('.state-message').hostNodes().text()).to.equal(' - Sent over one month ago');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Invite Expired');
        expect(abbottConnection.find('.state-message').hostNodes().text()).to.equal(' - Sent over one month ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPendingExpired);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Resend Invite');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        const resendDialog = () => wrapper.find('#resendDataSourceConnectRequest').at(1);
        expect(resendDialog().props().open).to.be.false;
        dexcomActionButton.simulate('click');
        expect(resendDialog().props().open).to.be.true;

        const resendInvite = resendDialog().find(Button).filter({variant: 'primary'});
        expect(resendInvite).to.have.length(1);

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        resendInvite.props().onClick();
        expect(store.getActions()).to.eql(expectedActions);
        sinon.assert.calledWith(
          api.clinics.sendPatientDataProviderConnectRequest,
          'clinicID123',
          'patient123',
          'dexcom',
        );
      });
    });

    describe('data connected', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionConnected);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Connected');
        expect(dexcomConnection.find('.state-message')).to.have.lengthOf(0);

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Connected');
        expect(abbottConnection.find('.state-message')).to.have.lengthOf(0);
      });

      it('should not render an action button', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionConnected);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(0);

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(0);
      });
    });

    describe('data connection disconnected', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionDisconnected);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Patient Disconnected');
        expect(dexcomConnection.find('.state-message').hostNodes().text()).to.equal(' - Last update 7 hours ago');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Patient Disconnected');
        expect(abbottConnection.find('.state-message').hostNodes().text()).to.equal(' - Last update 7 hours ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionDisconnected);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Resend Invite');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        const resendDialog = () => wrapper.find('#resendDataSourceConnectRequest').at(1);
        expect(resendDialog().props().open).to.be.false;
        dexcomActionButton.simulate('click');
        expect(resendDialog().props().open).to.be.true;

        const resendInvite = resendDialog().find(Button).filter({variant: 'primary'});
        expect(resendInvite).to.have.length(1);

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        resendInvite.props().onClick();
        expect(store.getActions()).to.eql(expectedActions);
        sinon.assert.calledWith(
          api.clinics.sendPatientDataProviderConnectRequest,
          'clinicID123',
          'patient123',
          'dexcom',
        );
      });
    });

    describe('data connection error', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionError);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Error Connecting');
        expect(dexcomConnection.find('.state-message').hostNodes().text()).to.equal(' - Last update 20 minutes ago');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Error Connecting');
        expect(abbottConnection.find('.state-message').hostNodes().text()).to.equal(' - Last update 20 minutes ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionError);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Resend Invite');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        const resendDialog = () => wrapper.find('#resendDataSourceConnectRequest').at(1);
        expect(resendDialog().props().open).to.be.false;
        dexcomActionButton.simulate('click');
        expect(resendDialog().props().open).to.be.true;

        const resendInvite = resendDialog().find(Button).filter({variant: 'primary'});
        expect(resendInvite).to.have.length(1);

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        resendInvite.props().onClick();
        expect(store.getActions()).to.eql(expectedActions);
        sinon.assert.calledWith(
          api.clinics.sendPatientDataProviderConnectRequest,
          'clinicID123',
          'patient123',
          'dexcom',
        );
      });
    });
  });

  context('logged-in user patients', () => {
    describe('data connection unset', () => {
      it('should not render data connection status or message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionUnset);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text')).to.have.lengthOf(0);
        expect(dexcomConnection.find('.state-message')).to.have.lengthOf(0);

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text')).to.have.lengthOf(0);
        expect(abbottConnection.find('.state-message')).to.have.lengthOf(0);
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', done => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionUnset);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Connect');

        const abbottConnection = wrapper.find('#data-connection-abbott').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Connect');

        store.clearActions();
        dexcomActionButton.simulate('click');
        abbottActionButton.simulate('click');

        setTimeout(() => {
          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/dexcom' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'dexcom', 'restrictedTokenID');

          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/abbott' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'abbott', 'restrictedTokenID');
          done();
        });
      });
    });
  });
});

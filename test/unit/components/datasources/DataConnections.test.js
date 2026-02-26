import React from 'react';
import moment from 'moment';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import coreApi from '../../../../app/core/api';
import * as appActions from '../../../../app/redux/actions';

import PatientEmailModal from '../../../../app/components/datasources/PatientEmailModal';
import * as PatientEmailModalModule from '../../../../app/components/datasources/PatientEmailModal';
import * as DataConnectionsModule from '../../../../app/components/datasources/DataConnections';

import DataConnections, {
  availableProviders,
  getActiveProviders,
  providers,
  getProviderHandlers,
  getCurrentDataSourceForProvider,
  getConnectStateUI,
  getDataConnectionProps
} from '../../../../app/components/datasources/DataConnections';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global afterEach */

jest.mock('../../../../app/components/clinic/ResendDataSourceConnectRequestDialog', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ open, onClose, onConfirm }) =>
      open
        ? React.createElement('div', null,
            React.createElement('button', { className: 'resend-data-source-connect-request', onClick: onConfirm }, 'Resend Request')
          )
        : null,
  };
});

jest.mock('../../../../app/components/datasources/DataConnections', () => {
  const actual = jest.requireActual('../../../../app/components/datasources/DataConnections');
  return { __esModule: true, ...actual, getActiveProviders: jest.fn(actual.getActiveProviders) };
});

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('providers', () => {
  it('should define the provider details', () => {
    const { dexcom, abbott, twiist } = providers;

    expect(dexcom.id).to.equal('oauth/dexcom');
    expect(dexcom.displayName).to.equal('Dexcom');
    expect(dexcom.restrictedTokenCreate).to.eql({ paths: ['/v1/oauth/dexcom'] });
    expect(dexcom.dataSourceFilter).to.eql({ providerType: 'oauth', providerName: 'dexcom' });
    expect(dexcom.logoImage).to.be.a('string');
    expect(dexcom.disconnectInstructions).to.be.undefined;
    expect(dexcom.indeterminateDataImportTime).to.be.undefined;

    expect(abbott.id).to.equal('oauth/abbott');
    expect(abbott.displayName).to.equal('FreeStyle Libre');
    expect(abbott.restrictedTokenCreate).to.eql({ paths: ['/v1/oauth/abbott'] });
    expect(abbott.dataSourceFilter).to.eql({ providerType: 'oauth', providerName: 'abbott' });
    expect(abbott.logoImage).to.be.a('string');
    expect(abbott.disconnectInstructions).to.be.an('object');
    expect(abbott.disconnectInstructions.title).to.be.a('string');
    expect(abbott.disconnectInstructions.message).to.be.a('string');
    expect(abbott.indeterminateDataImportTime).to.be.undefined;

    expect(twiist.id).to.equal('oauth/twiist');
    expect(twiist.displayName).to.equal('twiist');
    expect(twiist.restrictedTokenCreate).to.eql({ paths: ['/v1/oauth/twiist'] });
    expect(twiist.dataSourceFilter).to.eql({ providerType: 'oauth', providerName: 'twiist' });
    expect(twiist.logoImage).to.be.a('string');
    expect(twiist.disconnectInstructions).to.be.undefined;
    expect(twiist.indeterminateDataImportTime).to.be.true;
  });
});

describe('availableProviders', () => {
  it('should define a list of all available providers', () => {
    expect(availableProviders).to.eql(['dexcom', 'twiist', 'abbott']);
  });
});

describe('getActiveProviders', () => {
  it('should define a default list of all available providers when called without overrides', () => {
    expect(getActiveProviders()).to.eql(['dexcom', 'twiist', 'abbott']);
  });

  it('should define an overridden list of all available providers when called with overrides', () => {
    expect(getActiveProviders({ dexcom: false, abbott: true })).to.eql(['twiist', 'abbott']);
  });
});

describe('getProviderHandlers', () => {
  it('should define the default action handlers for a given provider and patient', () => {
    const patient = { id: 'patient123', email: 'patient@123.com', dataSources: [ { providerName: 'provider123' }] };
    const selectedClinicId = 'clinic123';
    const provider = { id: 'oauth/provider123', dataSourceFilter: { providerName: 'provider123' }, restrictedTokenCreate: { paths: ['/v1/oauth/provider123'] }};

    expect(getProviderHandlers(patient, selectedClinicId, provider)).to.eql({
      connect: {
        buttonText: 'Connect',
        buttonStyle: 'solid',
        action: appActions.async.connectDataSource,
        args: [coreApi, 'oauth/provider123', provider.restrictedTokenCreate, provider.dataSourceFilter],
      },
      disconnect: {
        buttonText: 'Disconnect',
        buttonStyle: 'text',
        action: appActions.async.disconnectDataSource,
        args: [coreApi, provider.dataSourceFilter],
      },
      inviteSent: {
        buttonDisabled: true,
        buttonIcon: CheckRoundedIcon,
        buttonText: 'Invite Sent',
        buttonStyle: 'staticText',
        action: appActions.async.connectDataSource,
        args: [coreApi, 'oauth/provider123', provider.restrictedTokenCreate, provider.dataSourceFilter],
      },
      reconnect: {
        buttonText: 'Reconnect',
        buttonStyle: 'solid',
        action: appActions.async.connectDataSource,
        args: [coreApi, 'oauth/provider123', provider.restrictedTokenCreate, provider.dataSourceFilter],
      },
      sendInvite: {
        buttonText: 'Email Invite',
        buttonStyle: 'solid',
        action: appActions.async.sendPatientDataProviderConnectRequest,
        args: [coreApi, 'clinic123', 'patient123', 'provider123'],
        emailRequired: false,
        patientUpdates: undefined,
      },
      resendInvite: {
        buttonText: 'Resend Invite',
        buttonStyle: 'solid',
        action: appActions.async.sendPatientDataProviderConnectRequest,
        args: [coreApi, 'clinic123', 'patient123', 'provider123'],
        emailRequired: false,
        patientUpdates: undefined,
      },
    });
  });

  it('should set emailRequired to true for send and resend invite actions if email is missing on a clinic custodial patient', () => {
    const patient = { id: 'patient123', email: null, permissions: { custodian: {} }, dataSources: [ { providerName: 'provider123' }] };
    const selectedClinicId = 'clinic123';
    const provider = { id: 'oauth/provider123', dataSourceFilter: { providerName: 'provider123' }, restrictedTokenCreate: { paths: ['/v1/oauth/provider123'] }};

    const handlers = getProviderHandlers(patient, selectedClinicId, provider);
    expect(handlers.sendInvite.emailRequired).to.be.true;
    expect(handlers.resendInvite.emailRequired).to.be.true;
  });

  it('should set patientUpdates to include pending data source for send and resend invite actions if patient does not have a data source for the provider', () => {
    const patient = { id: 'patient123', email: 'patient@123.com', permissions: { custodian: {} }, dataSources: [ { providerName: 'otherProvider' }] };
    const selectedClinicId = 'clinic123';
    const provider = { id: 'oauth/provider123', dataSourceFilter: { providerName: 'provider123' }, restrictedTokenCreate: { paths: ['/v1/oauth/provider123'] }};

    const handlers = getProviderHandlers(patient, selectedClinicId, provider);
    expect(handlers.sendInvite.patientUpdates).to.eql({ dataSources: [ { providerName: 'otherProvider' }, { providerName: 'provider123', state: 'pending' } ]});
    expect(handlers.resendInvite.patientUpdates).to.eql({ dataSources: [ { providerName: 'otherProvider' }, { providerName: 'provider123', state: 'pending' } ]});
  });
});

describe('getCurrentDataSourceForProvider', () => {
  it('should return undefined if no matching data sources', () => {
    const patient = {
      dataSources: [
        { providerName: 'abbott', state: 'connected' },
      ],
    };
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result).to.be.undefined;
  });

  it('should return undefined if patient has no dataSources', () => {
    const patient = {};
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result).to.be.undefined;
  });

  it('should return pending data source as highest priority', () => {
    const patient = {
      dataSources: [
        { providerName: 'dexcom', state: 'disconnected', lastImportTime: '2024-02-01T00:00:00Z' },
        { providerName: 'dexcom', state: 'pendingReconnect' },
        { providerName: 'dexcom', state: 'error' },
        { providerName: 'dexcom', state: 'connected' },
        { providerName: 'dexcom', state: 'pending' },
      ],
    };
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result.state).to.equal('pending');
  });

  it('should return connected data source when no pending exists', () => {
    const patient = {
      dataSources: [
        { providerName: 'dexcom', state: 'disconnected', lastImportTime: '2024-02-01T00:00:00Z' },
        { providerName: 'dexcom', state: 'pendingReconnect' },
        { providerName: 'dexcom', state: 'error' },
        { providerName: 'dexcom', state: 'connected' },
      ],
    };
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result.state).to.equal('connected');
  });

  it('should return error data source when no pending or connected exists', () => {
    const patient = {
      dataSources: [
        { providerName: 'dexcom', state: 'disconnected', lastImportTime: '2024-02-01T00:00:00Z' },
        { providerName: 'dexcom', state: 'pendingReconnect' },
        { providerName: 'dexcom', state: 'error' },
      ],
    };
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result.state).to.equal('error');
  });

  it('should return pendingReconnect data source when no pending, connected, or error exists', () => {
    const patient = {
      dataSources: [
        { providerName: 'dexcom', state: 'disconnected', lastImportTime: '2024-02-01T00:00:00Z' },
        { providerName: 'dexcom', state: 'pendingReconnect' },
      ],
    };
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result.state).to.equal('pendingReconnect');
  });

  it('should return the disconnected data source with the most recent lastImportTime when only disconnected states exist', () => {
    const patient = {
      dataSources: [
        { providerName: 'dexcom', state: 'disconnected', lastImportTime: '2024-01-01T00:00:00Z' },
        { providerName: 'dexcom', state: 'disconnected', lastImportTime: '2024-02-01T00:00:00Z' },
        { providerName: 'dexcom', state: 'disconnected', lastImportTime: '2024-01-15T00:00:00Z' },
      ],
    };
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result.lastImportTime).to.equal('2024-02-01T00:00:00Z');
  });

  it('should return disconnected data source with lastImportTime over one without lastImportTime', () => {
    const patient = {
      dataSources: [
        { providerName: 'dexcom', state: 'disconnected' }, // No lastImportTime
        { providerName: 'dexcom', state: 'disconnected', lastImportTime: '2024-01-01T00:00:00Z' },
      ],
    };
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result.lastImportTime).to.equal('2024-01-01T00:00:00Z');
  });

  it('should handle unknown states by placing them at the end of priority', () => {
    const patient = {
      dataSources: [
        { providerName: 'dexcom', state: 'unknownState' },
        { providerName: 'dexcom', state: 'disconnected', lastImportTime: '2024-02-01T00:00:00Z' },
      ],
    };
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result.state).to.equal('disconnected');
  });

  it('should return the first unknown state if only unknown states exist', () => {
    const patient = {
      dataSources: [
        { providerName: 'dexcom', state: 'unknownState1' },
        { providerName: 'dexcom', state: 'unknownState2' },
      ],
    };
    const result = getCurrentDataSourceForProvider(patient, 'dexcom');
    expect(result.state).to.equal('unknownState1');
  });
});

describe('getConnectStateUI', () => {
  const clinicPatient = {
    id: 'patient123',
    dataSources: [ { providerName: 'provider123', state: 'pending' }],
    connectionRequests: { provider123: [{ createdTime: moment.utc().subtract(20, 'days') }] },
  };

  const clinicPatientJustSent = {
    ...clinicPatient,
    connectionRequests: { provider123: [{ createdTime: moment.utc().subtract(30, 'seconds') }] },
  }

  const userPatient = {
    id: 'patient123',
    dataSources: [ {
      providerName: 'provider123',
      state: 'pending',
      createdTime: moment.utc().subtract(20, 'days'),
    }],
  }

  const userPatientNoDataFound = {
    id: 'patient123',
    dataSources: [ {
      providerName: 'provider123',
      state: 'pending',
      createdTime: moment.utc().subtract(20, 'days'),
      lastImportTime: moment.utc().subtract(10, 'days'),
    }],
  }

  const userPatientDataFound = {
    id: 'patient123',
    dataSources: [ {
      providerName: 'provider123',
      state: 'pending',
      createdTime: moment.utc().subtract(20, 'days'),
      modifiedTime: moment.utc().subtract(5, 'days'),
      lastImportTime: moment.utc().subtract(10, 'days'),
      latestDataTime: moment.utc().subtract(15, 'days'),
    }],
  }

  context('clinician user', () => {
    it('should define the UI props for the various connection states', () => {
      const UI = getConnectStateUI(clinicPatient, false, 'provider123');
      const UIJustSent = getConnectStateUI(clinicPatientJustSent, false, 'provider123');

      expect(UI.noPendingConnections.message).to.equal(null);
      expect(UI.noPendingConnections.text).to.equal(null);
      expect(UI.noPendingConnections.handler).to.equal('sendInvite');

      expect(UI.inviteJustSent.message).to.equal(null);
      expect(UI.inviteJustSent.text).to.equal('Connection Pending');
      expect(UI.inviteJustSent.handler).to.equal('inviteSent');

      expect(UI.pending.message).to.equal('Invite sent 20 days ago');
      expect(UIJustSent.pending.message).to.equal('Invite sent a few seconds ago');
      expect(UI.pending.text).to.equal('Connection Pending');
      expect(UI.pending.handler).to.equal('resendInvite');
      expect(UI.pending.inviteJustSent).to.be.undefined;
      expect(UIJustSent.pending.inviteJustSent).to.be.true;

      expect(UI.pendingReconnect.message).to.equal('Invite sent 20 days ago');
      expect(UIJustSent.pendingReconnect.message).to.equal('Invite sent a few seconds ago');
      expect(UI.pendingReconnect.text).to.equal('Invite Sent');
      expect(UI.pendingReconnect.handler).to.equal('resendInvite');
      expect(UI.pendingReconnect.inviteJustSent).to.be.undefined;
      expect(UIJustSent.pendingReconnect.inviteJustSent).to.be.true;

      expect(UI.pendingExpired.message).to.equal('Sent over one month ago');
      expect(UI.pendingExpired.text).to.equal('Invite Expired');
      expect(UI.pendingExpired.handler).to.equal('resendInvite');

      expect(UI.connected.message).to.equal(null);
      expect(UI.connected.text).to.equal('Connected');
      expect(UI.connected.handler).to.equal(null);

      expect(UI.disconnected.message).to.equal('Last update 20 days ago');
      expect(UI.disconnected.text).to.equal('Patient Disconnected');
      expect(UI.disconnected.handler).to.equal('resendInvite');

      expect(UI.error.message).to.equal('Last update 20 days ago');
      expect(UI.error.text).to.equal('Error Connecting');
      expect(UI.error.handler).to.equal('resendInvite');
    });
  });

  context('patient user', () =>  {
    it('should define the UI props for the various connection states', () => {
      const UI = getConnectStateUI(userPatient, true, 'provider123');
      const UINoDataFound = getConnectStateUI(userPatientNoDataFound, true, 'provider123');
      const UIDataFound = getConnectStateUI(userPatientDataFound, true, 'provider123');

      expect(UI.noPendingConnections.message).to.equal(null);
      expect(UI.noPendingConnections.text).to.equal(null);
      expect(UI.noPendingConnections.handler).to.equal('connect');

      expect(UI.inviteJustSent.message).to.equal(null);
      expect(UI.inviteJustSent.text).to.equal('Connection Pending');
      expect(UI.inviteJustSent.handler).to.equal('inviteSent');

      expect(UI.pending.message).to.equal('Invite sent 20 days ago');
      expect(UI.pending.text).to.equal('Connection Pending');
      expect(UI.pending.handler).to.equal('connect');
      expect(UI.pending.inviteJustSent).to.be.undefined;

      expect(UI.pendingReconnect.message).to.equal('Invite sent 20 days ago');
      expect(UI.pendingReconnect.text).to.equal('Invite Sent');
      expect(UI.pendingReconnect.handler).to.equal('connect');
      expect(UI.pendingReconnect.inviteJustSent).to.be.undefined;

      expect(UI.pendingExpired.message).to.equal('Sent over one month ago');
      expect(UI.pendingExpired.text).to.equal('Invite Expired');
      expect(UI.pendingExpired.handler).to.equal('connect');

      expect(UI.connected.message).to.equal('This can take a few minutes');
      expect(UI.connected.text).to.equal('Connecting');
      expect(UI.connected.handler).to.equal('disconnect');
      expect(UINoDataFound.connected.message).to.equal('No data found as of 10 days ago');
      expect(UINoDataFound.connected.text).to.equal('Connected');
      expect(UINoDataFound.connected.handler).to.equal('disconnect');
      expect(UIDataFound.connected.text).to.equal('Connected');
      expect(UIDataFound.connected.message).to.equal('Last data 15 days ago');
      expect(UIDataFound.connected.handler).to.equal('disconnect');

      expect(UI.disconnected.message).to.equal(null);
      expect(UI.disconnected.text).to.equal(null);
      expect(UI.disconnected.handler).to.equal('connect');

      expect(UI.error.message).to.equal('Last update 20 days ago. Please reconnect your account to keep syncing data.');
      expect(UI.error.text).to.equal('Error Connecting');
      expect(UI.error.handler).to.equal('reconnect');
    });
  });
});

describe('getDataConnectionProps', () => {
  const setActiveHandlerStub = sinon.stub();

  const createPatientWithPendingDexcomConnection = () => ({
    id: 'patient123',
    dataSources: [
      {
        providerName: 'dexcom',
        state: 'pending',
        modifiedTime: moment.utc().subtract(2, 'days').toISOString(),
        expirationTime: moment.utc().add(5, 'days').toISOString(),
      },
    ],
    connectionRequests: { dexcom: [{ createdTime: moment.utc().subtract(2, 'days').toISOString() }] },
  });

  afterEach(() => {
    setActiveHandlerStub.resetHistory();
  });

  it('should merge real connect state UI and handler props based on provider connection state for a patient', () => {
    const dataConnectionProps = getDataConnectionProps(createPatientWithPendingDexcomConnection(), false, 'clinic125', setActiveHandlerStub);

    expect(dataConnectionProps).to.have.all.keys(availableProviders);

    const dexcomConnection = dataConnectionProps.dexcom;
    expect(dexcomConnection.buttonHandler).to.be.a('function');
    expect(dexcomConnection.buttonText).to.equal('Resend Invite');
    expect(dexcomConnection.iconLabel).to.equal('connection status: pending');
    expect(dexcomConnection.label).to.equal('dexcom data connection state');
    expect(dexcomConnection.logoImage).to.be.a('string');
    expect(dexcomConnection.logoImageLabel).to.equal('dexcom logo');
    expect(dexcomConnection.messageColor).to.equal('#6D6D6D');
    expect(dexcomConnection.messageText).to.contain('Invite sent');
    expect(dexcomConnection.providerName).to.equal('dexcom');
    expect(dexcomConnection.stateText).to.equal('Connection Pending');
  });

  it('should merge the appropriate connect state UI and handler props based on the current provider connection state for a patient', () => {
    const dataConnectionProps = getDataConnectionProps(createPatientWithPendingDexcomConnection(), false, 'clinic125', setActiveHandlerStub);

    expect(dataConnectionProps).to.have.all.keys(availableProviders);

    const dexcomConnection = dataConnectionProps.dexcom;
    expect(dexcomConnection.buttonHandler).to.be.a('function');
    expect(dexcomConnection.buttonText).to.equal('Resend Invite');
    expect(dexcomConnection.iconLabel).to.equal('connection status: pending');
    expect(dexcomConnection.label).to.equal('dexcom data connection state');
    expect(dexcomConnection.logoImage).to.be.a('string');
    expect(dexcomConnection.logoImageLabel).to.equal('dexcom logo');
    expect(dexcomConnection.messageColor).to.equal('#6D6D6D');
    expect(dexcomConnection.messageText).to.contain('Invite sent');
    expect(dexcomConnection.providerName).to.equal('dexcom');
    expect(dexcomConnection.stateText).to.equal('Connection Pending');
  });

  it('should set the button handler to call the provided active handler setter with the appropriate args', () => {
    const dexcomConnection = getDataConnectionProps(createPatientWithPendingDexcomConnection(), false, 'clinic125', setActiveHandlerStub).dexcom;

    expect(dexcomConnection.buttonHandler).to.be.a('function');
    sinon.assert.notCalled(setActiveHandlerStub);

    dexcomConnection.buttonHandler();
    sinon.assert.calledWith(setActiveHandlerStub, {
      action: appActions.async.sendPatientDataProviderConnectRequest,
      args: [coreApi, 'clinic125', 'patient123', 'dexcom'],
      emailRequired: false,
      patientUpdates: undefined,
      providerName: 'dexcom',
      connectState: 'pending',
      handler: 'resendInvite',
    });
  });
});

describe('DataConnections', () => {
  const originalCoreApiMethods = {
    clinics: {
      getPatientFromClinic: coreApi?.clinics?.getPatientFromClinic,
      sendPatientDataProviderConnectRequest: coreApi?.clinics?.sendPatientDataProviderConnectRequest,
      updateClinicPatient: coreApi?.clinics?.updateClinicPatient,
    },
    user: {
      createRestrictedToken: coreApi?.user?.createRestrictedToken,
      createOAuthProviderAuthorization: coreApi?.user?.createOAuthProviderAuthorization,
      deleteOAuthProviderAuthorization: coreApi?.user?.deleteOAuthProviderAuthorization,
    },
  };

  const api = {
    clinics: {
      getPatientFromClinic: sinon.stub(),
      sendPatientDataProviderConnectRequest: sinon.stub(),
      updateClinicPatient: sinon.stub(),
    },
    user: {
      createRestrictedToken: sinon.stub().callsArgWith(1, null, { id: 'restrictedTokenID' }),
      createOAuthProviderAuthorization: sinon.stub(),
      deleteOAuthProviderAuthorization: sinon.stub(),
    },
  };

  const getDateInPast = (amount, unit) => moment.utc().subtract(amount, unit).toISOString();

  const patientWithState = (isClinicContext, state, opts = {}) => ({
    id: 'patient123',
    dataSources: state ? map(availableProviders, providerName => ({
      providerName,
      state,
      createdTime: opts.createdTime,
      modifiedTime: opts.modifiedTime,
      expirationTime: opts.expirationTime,
      lastImportTime: opts.lastImportTime,
      latestDataTime: opts.latestDataTime,
    })) : undefined,
    connectionRequests: isClinicContext && opts.createdTime ? reduce(availableProviders, (res, providerName) => {
      res[providerName] = [{ providerName, createdTime: opts.createdTime }];
      return res;
    }, {}) : undefined,
  });

  let clinicPatients;
  let userPatients;

  const buildPatients = () => {
    clinicPatients = {
      dataConnectionUnset: patientWithState(true),
      dataConnectionInviteJustSent: patientWithState(true, 'pending', { createdTime: getDateInPast(5, 'seconds') }),
      dataConnectionPending: patientWithState(true, 'pending', { createdTime: getDateInPast(5, 'days') }),
      dataConnectionPendingReconnect: patientWithState(true, 'pendingReconnect', { createdTime: getDateInPast(10, 'days') }),
      dataConnectionPendingExpired: patientWithState(true, 'pending', { createdTime: getDateInPast(31, 'days'), expirationTime: getDateInPast(1, 'days') }),
      dataConnectionConnected: patientWithState(true, 'connected'),
      dataConnectionDisconnected: patientWithState(true, 'disconnected', { modifiedTime: getDateInPast(7, 'hours') }),
      dataConnectionError: patientWithState(true, 'error', { modifiedTime: getDateInPast(20, 'minutes') }),
      dataConnectionUnknown: patientWithState(true, 'foo'),
    };

    userPatients = {
      dataConnectionUnset: patientWithState(false),
      dataConnectionJustConnected: patientWithState(false, 'connected', { createdTime: getDateInPast(1, 'minutes') }),
      dataConnectionConnectedWithNoData: patientWithState(false, 'connected', { lastImportTime: getDateInPast(5, 'minutes') }),
      dataConnectionConnectedWithData: patientWithState(false, 'connected', { lastImportTime: getDateInPast(1, 'minutes'), latestDataTime: getDateInPast(35, 'minutes') }),
      dataConnectionDisconnected: patientWithState(false, 'disconnected', { modifiedTime: getDateInPast(1, 'hour') }),
      dataConnectionError: patientWithState(false, 'error', { modifiedTime: getDateInPast(6, 'days') }),
      dataConnectionUnknown: patientWithState(false, 'foo'),
    };
  };

  let defaultProps = {
    trackMetric: sinon.stub(),
    shownProviders: availableProviders,
  };

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
        disconnectingDataSource: defaultWorkingState,
      },
      selectedClinicId: 'clinicID123',
      loggedInUserId: 'patient123',
    },
  };

  let container;
  const mountWrapper = (store, patient) => {
    const result = render(
      <Provider store={store}>
        <ToastProvider>
          <DataConnections {...defaultProps} patient={patient} />
        </ToastProvider>
      </Provider>
    );
    container = result.container;
  };

  beforeEach(() => {
    buildPatients();
    DataConnectionsModule.getActiveProviders.mockReturnValue(availableProviders);
    coreApi.clinics.getPatientFromClinic = api.clinics.getPatientFromClinic;
    coreApi.clinics.sendPatientDataProviderConnectRequest = api.clinics.sendPatientDataProviderConnectRequest;
    coreApi.clinics.updateClinicPatient = api.clinics.updateClinicPatient;
    coreApi.user.createRestrictedToken = api.user.createRestrictedToken;
    coreApi.user.createOAuthProviderAuthorization = api.user.createOAuthProviderAuthorization;
    coreApi.user.deleteOAuthProviderAuthorization = api.user.deleteOAuthProviderAuthorization;
  });

  afterEach(() => {
    cleanup();
    defaultProps.trackMetric.resetHistory();
    api.clinics.getPatientFromClinic.resetHistory();
    api.clinics.sendPatientDataProviderConnectRequest.resetHistory();
    api.clinics.updateClinicPatient.resetHistory();
    api.user.createRestrictedToken.resetHistory();
    api.user.createOAuthProviderAuthorization.resetHistory();
    api.user.deleteOAuthProviderAuthorization.resetHistory();
    DataConnectionsModule.getActiveProviders.mockReset();
    coreApi.clinics.getPatientFromClinic = originalCoreApiMethods.clinics.getPatientFromClinic;
    coreApi.clinics.sendPatientDataProviderConnectRequest = originalCoreApiMethods.clinics.sendPatientDataProviderConnectRequest;
    coreApi.clinics.updateClinicPatient = originalCoreApiMethods.clinics.updateClinicPatient;
    coreApi.user.createRestrictedToken = originalCoreApiMethods.user.createRestrictedToken;
    coreApi.user.createOAuthProviderAuthorization = originalCoreApiMethods.user.createOAuthProviderAuthorization;
    coreApi.user.deleteOAuthProviderAuthorization = originalCoreApiMethods.user.deleteOAuthProviderAuthorization;
  });

  context('clinic patients', () => {
    describe('data connection unset', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionUnset);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text')).to.be.null;
        expect(dexcomConnection.querySelector('.state-message')).to.be.null;

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text')).to.be.null;
        expect(twiistConnection.querySelector('.state-message')).to.be.null;
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', async () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionUnset);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Email Invite');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Email Invite');

        store.clearActions();
        fireEvent.click(dexcomActionButton);
        fireEvent.click(twiistActionButton);

        await waitFor(() => {
          sinon.assert.calledWith(api.clinics.updateClinicPatient, 'clinicID123', 'patient123', sinon.match({ dataSources: [ { providerName: 'dexcom', state: 'pending' } ] }));
          sinon.assert.calledWith(api.clinics.updateClinicPatient, 'clinicID123', 'patient123', sinon.match({ dataSources: [ { providerName: 'twiist', state: 'pending' } ] }));
        });
      });
    });

    describe('data connection invite just sent', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionInviteJustSent);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Connection Pending');
        expect(dexcomConnection.querySelector('.state-message')).to.be.null;

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Connection Pending');
        expect(twiistConnection.querySelector('.state-message')).to.be.null;
      });

      it('should render a disabled action buttons with appropriate text', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionInviteJustSent);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.disabled).to.be.true;
        expect(dexcomActionButton.textContent).to.equal('Invite Sent');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.disabled).to.be.true;
        expect(twiistActionButton.textContent).to.equal('Invite Sent');
      });
    });

    describe('data connection pending', () => {
      it('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPending);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Connection Pending');
        expect(dexcomConnection.querySelector('.state-message').textContent).to.equal(' - Invite sent 5 days ago');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Connection Pending');
        expect(twiistConnection.querySelector('.state-message').textContent).to.equal(' - Invite sent 5 days ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPending);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Resend Invite');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        fireEvent.click(dexcomActionButton);

        const resendInviteBtn = document.querySelector('.resend-data-source-connect-request');
        expect(resendInviteBtn).to.exist;

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        fireEvent.click(resendInviteBtn);
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

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Invite Sent');
        expect(dexcomConnection.querySelector('.state-message').textContent).to.equal(' - Invite sent 10 days ago');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Invite Sent');
        expect(twiistConnection.querySelector('.state-message').textContent).to.equal(' - Invite sent 10 days ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPendingReconnect);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Resend Invite');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        fireEvent.click(dexcomActionButton);

        const resendInviteBtn = document.querySelector('.resend-data-source-connect-request');
        expect(resendInviteBtn).to.exist;

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        fireEvent.click(resendInviteBtn);
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

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Invite Expired');
        expect(dexcomConnection.querySelector('.state-message').textContent).to.equal(' - Sent over one month ago');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Invite Expired');
        expect(twiistConnection.querySelector('.state-message').textContent).to.equal(' - Sent over one month ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionPendingExpired);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Resend Invite');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        fireEvent.click(dexcomActionButton);

        const resendInviteBtn = document.querySelector('.resend-data-source-connect-request');
        expect(resendInviteBtn).to.exist;

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        fireEvent.click(resendInviteBtn);
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

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Connected');
        expect(dexcomConnection.querySelector('.state-message')).to.be.null;

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Connected');
        expect(twiistConnection.querySelector('.state-message')).to.be.null;
      });

      it('should not render an action button', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionConnected);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.action')).to.be.null;

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.action')).to.be.null;
      });
    });

    describe('data connection disconnected', () => {
      it.skip('should render all appropriate data connection statuses and messages', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionDisconnected);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Patient Disconnected');
        expect(dexcomConnection.querySelector('.state-message').textContent).to.equal(' - Last update 7 hours ago');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Patient Disconnected');
        expect(twiistConnection.querySelector('.state-message').textContent).to.equal(' - Last update 7 hours ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionDisconnected);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Resend Invite');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        fireEvent.click(dexcomActionButton);

        const resendInviteBtn = document.querySelector('.resend-data-source-connect-request');
        expect(resendInviteBtn).to.exist;

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        fireEvent.click(resendInviteBtn);
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

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Error Connecting');
        expect(dexcomConnection.querySelector('.state-message').textContent).to.include(' - Last update ');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Error Connecting');
        expect(twiistConnection.querySelector('.state-message').textContent).to.include(' - Last update ');
      });

      it('should render appropriate buttons and dispatch appropriate actions when confirmed in dialog', () => {
        const store = mockStore(clinicianUserLoggedInState);
        mountWrapper(store, clinicPatients.dataConnectionError);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Resend Invite');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Resend Invite');

        // Open and submit the dexcom resend invite confirmation modal
        fireEvent.click(dexcomActionButton);

        const resendInviteBtn = document.querySelector('.resend-data-source-connect-request');
        expect(resendInviteBtn).to.exist;

        const expectedActions = [
          {
            type: 'SEND_PATIENT_DATA_PROVIDER_CONNECT_REQUEST_REQUEST',
          },
        ];

        store.clearActions();
        fireEvent.click(resendInviteBtn);
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

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text')).to.be.null;
        expect(dexcomConnection.querySelector('.state-message')).to.be.null;

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text')).to.be.null;
        expect(twiistConnection.querySelector('.state-message')).to.be.null;
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', async () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionUnset);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Connect');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Connect');

        store.clearActions();
        fireEvent.click(dexcomActionButton);
        fireEvent.click(twiistActionButton);

        await waitFor(() => {
          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/dexcom' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'dexcom', 'restrictedTokenID');

          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/twiist' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'twiist', 'restrictedTokenID');
        });
      });
    });

    describe('data connection just connected', () => {
      it('should render data connection status and message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionJustConnected);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Connecting');
        expect(dexcomConnection.querySelector('.state-message').textContent).to.equal(' - This can take a few minutes');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Connected');
        // expect(twiistConnection.querySelector('.state-message').textContent).to.equal(' - No data found as of 1 minute ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', async () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionJustConnected);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Disconnect');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Disconnect');

        store.clearActions();
        fireEvent.click(dexcomActionButton);
        fireEvent.click(twiistActionButton);

        await waitFor(() => {
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'dexcom');
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'twiist');
        });
      });
    });

    describe('data connection connected with no data', () => {
      it('should render data connection status and message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionConnectedWithNoData);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Connected');
        expect(dexcomConnection.querySelector('.state-message').textContent).to.include(' - No data found as of ');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Connected');
        // expect(twiistConnection.querySelector('.state-message').textContent).to.equal(' - No data found as of 5 minutes ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', async () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionConnectedWithNoData);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Disconnect');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Disconnect');

        store.clearActions();
        fireEvent.click(dexcomActionButton);
        fireEvent.click(twiistActionButton);

        await waitFor(() => {
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'dexcom');
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'twiist');
        });
      });
    });

    describe('data connection connected with data', () => {
      it.skip('should render data connection status and message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionConnectedWithData);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Connected');
        expect(dexcomConnection.querySelector('.state-message').textContent).to.equal(' - Last data 35 minutes ago');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Connected');
        // expect(twiistConnection.querySelector('.state-message').textContent).to.equal(' - Last data 35 minutes ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', async () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionConnectedWithData);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Disconnect');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Disconnect');

        store.clearActions();
        fireEvent.click(dexcomActionButton);
        fireEvent.click(twiistActionButton);

        await waitFor(() => {
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'dexcom');
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'twiist');
        });
      });
    });

    describe('data connection disconnected', () => {
      it('should not render data connection status or message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionDisconnected);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text')).to.be.null;
        expect(dexcomConnection.querySelector('.state-message')).to.be.null;

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text')).to.be.null;
        expect(twiistConnection.querySelector('.state-message')).to.be.null;
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', async () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionDisconnected);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Connect');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Connect');

        store.clearActions();
        fireEvent.click(dexcomActionButton);
        fireEvent.click(twiistActionButton);

        await waitFor(() => {
          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/dexcom' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'dexcom', 'restrictedTokenID');

          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/twiist' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'twiist', 'restrictedTokenID');
        });
      });
    });

    describe('data connection error', () => {
      it('should render data connection status and message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionError);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        expect(dexcomConnection.querySelector('.state-text').textContent).to.equal('Error Connecting');
        expect(dexcomConnection.querySelector('.state-message').textContent).to.equal(' - Last update 6 days ago. Please reconnect your account to keep syncing data.');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        expect(twiistConnection.querySelector('.state-text').textContent).to.equal('Error Connecting');
        expect(twiistConnection.querySelector('.state-message').textContent).to.equal(' - Last update 6 days ago. Please reconnect your account to keep syncing data.');
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', async () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionError);

        const connections = container.querySelectorAll('.data-connection');
        expect(connections.length).to.equal(3);

        const dexcomConnection = container.querySelector('#data-connection-dexcom');
        expect(dexcomConnection).to.exist;
        const dexcomActionButton = dexcomConnection.querySelector('.action');
        expect(dexcomActionButton).to.exist;
        expect(dexcomActionButton.textContent).to.equal('Reconnect');

        const twiistConnection = container.querySelector('#data-connection-twiist');
        expect(twiistConnection).to.exist;
        const twiistActionButton = twiistConnection.querySelector('.action');
        expect(twiistActionButton).to.exist;
        expect(twiistActionButton.textContent).to.equal('Reconnect');

        store.clearActions();
        fireEvent.click(dexcomActionButton);
        fireEvent.click(twiistActionButton);

        await waitFor(() => {
          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/dexcom' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'dexcom', 'restrictedTokenID');

          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/twiist' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'twiist', 'restrictedTokenID');
        });
      });
    });
  });
});


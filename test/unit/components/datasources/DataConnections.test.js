import React from 'react';
import moment from 'moment';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Button } from '../../../../app/components/elements/Button';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import map from 'lodash/map';
import reduce from 'lodash/reduce';

import PatientEmailModal from '../../../../app/components/datasources/PatientEmailModal';

import DataConnections, {
  activeProviders,
  providers,
  getProviderHandlers,
  getConnectStateUI,
  getDataConnectionProps
} from '../../../../app/components/datasources/DataConnections';

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

describe('activeProviders', () => {
  it('should define a list of active providers', () => {
    expect(activeProviders).to.eql(['dexcom', 'twiist']);
  });
});

describe('providers', () => {
  it('should define the provider details', () => {
    const { dexcom, abbott, twiist } = providers;

    expect(dexcom.id).to.equal('oauth/dexcom');
    expect(dexcom.displayName).to.equal('Dexcom');
    expect(dexcom.restrictedTokenCreate).to.eql({ paths: ['/v1/oauth/dexcom'] });
    expect(dexcom.dataSourceFilter).to.eql({ providerType: 'oauth', providerName: 'dexcom' });
    expect(dexcom.logoImage).to.be.a('string');

    expect(abbott.id).to.equal('oauth/abbott');
    expect(abbott.displayName).to.equal('FreeStyle Libre');
    expect(abbott.restrictedTokenCreate).to.eql({ paths: ['/v1/oauth/abbott'] });
    expect(abbott.dataSourceFilter).to.eql({ providerType: 'oauth', providerName: 'abbott' });
    expect(abbott.logoImage).to.be.a('string');

    expect(twiist.id).to.equal('oauth/twiist');
    expect(twiist.displayName).to.equal('Twiist');
    expect(twiist.restrictedTokenCreate).to.eql({ paths: ['/v1/oauth/twiist'] });
    expect(twiist.dataSourceFilter).to.eql({ providerType: 'oauth', providerName: 'twiist' });
    expect(twiist.logoImage).to.be.a('string');
  });
});

describe('getProviderHandlers', () => {
  const actions = {
    async: {
      connectDataSource: 'connectDataSourceStub',
      disconnectDataSource: 'disconnectDataSourceStub',
      sendPatientDataProviderConnectRequest: 'sendPatientDataProviderConnectRequestStub',
    }
  };

  const api = 'api123';

  beforeEach(() => {
    DataConnections.__Rewire__('actions', actions);
    DataConnections.__Rewire__('api', api);
  });

  afterEach(() => {
    DataConnections.__ResetDependency__('actions');
    DataConnections.__ResetDependency__('api');
  });

  it('should define the default action handlers for a given provider and patient', () => {
    const patient = { id: 'patient123', email: 'patient@123.com', dataSources: [ { providerName: 'provider123' }] };
    const selectedClinicId = 'clinic123';
    const provider = { id: 'oauth/provider123', dataSourceFilter: { providerName: 'provider123' }, restrictedTokenCreate: { paths: ['/v1/oauth/provider123'] }};

    expect(getProviderHandlers(patient, selectedClinicId, provider)).to.eql({
      connect: {
        buttonText: 'Connect',
        buttonStyle: 'solid',
        action: 'connectDataSourceStub',
        args: ['api123', 'oauth/provider123', provider.restrictedTokenCreate, provider.dataSourceFilter],
      },
      disconnect: {
        buttonText: 'Disconnect',
        buttonStyle: 'text',
        action: 'disconnectDataSourceStub',
        args: ['api123', provider.dataSourceFilter],
      },
      inviteSent: {
        buttonDisabled: true,
        buttonIcon: CheckRoundedIcon,
        buttonText: 'Invite Sent',
        buttonStyle: 'staticText',
        action: 'connectDataSourceStub',
        args: ['api123', 'oauth/provider123', provider.restrictedTokenCreate, provider.dataSourceFilter],
      },
      reconnect: {
        buttonText: 'Reconnect',
        buttonStyle: 'solid',
        action: 'connectDataSourceStub',
        args: ['api123', 'oauth/provider123', provider.restrictedTokenCreate, provider.dataSourceFilter],
      },
      sendInvite: {
        buttonText: 'Email Invite',
        buttonStyle: 'solid',
        action: 'sendPatientDataProviderConnectRequestStub',
        args: ['api123', 'clinic123', 'patient123', 'provider123'],
        emailRequired: false,
        patientUpdates: undefined,
      },
      resendInvite: {
        buttonText: 'Resend Invite',
        buttonStyle: 'solid',
        action: 'sendPatientDataProviderConnectRequestStub',
        args: ['api123', 'clinic123', 'patient123', 'provider123'],
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
      lastImportTime: moment.utc().subtract(10, 'days'),
      latestDataTime: moment.utc().subtract(5, 'days'),
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
      expect(UIDataFound.connected.message).to.equal('Last data 5 days ago');
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

  const connectStates = [
    'connectState1',
    'connectState2',
  ];

  const createPatientWithConnectionState = state => ({
    id: 'patient123',
    dataSources: [ { providerName: 'provider123', state }],
    connectionRequests: { provider123: [{ createdTime: moment.utc().subtract(20, 'days') }] },
  });

  beforeEach(() => {
    DataConnections.__Rewire__('getConnectStateUI', () => reduce(connectStates, (res, state) => {
      return {
        ...res,
        [state]: {
          color: `${state} color stub`,
          icon: `${state} icon stub`,
          message: `${state} message stub`,
          text: `${state} text stub`,
          handler: `${state} handler stub`,
        },
      };
    }, {}));

    DataConnections.__Rewire__('getProviderHandlers', () => reduce(connectStates, (res, state) => {
      return {
        ...res,
        [`${state} handler stub`]: {
          action: `${state} handler action stub`,
          args: `${state} handler args stub`,
          buttonDisabled: `${state} handler buttonDisabled stub`,
          buttonIcon: `${state} handler buttonIcon stub`,
          buttonText: `${state} handler buttonText stub`,
          buttonStyle: `${state} handler buttonStyle stub`,
          emailRequired: `${state} handler emailRequired stub`,
          patientUpdates: `${state} handler patientUpdates stub`,
        },
      };
    }, {}));

    DataConnections.__Rewire__('activeProviders', ['provider123']);

    DataConnections.__Rewire__('providers', {
      provider123: {
        logoImage: 'provider123 logo image stub',
      }
    });
  });

  afterEach(() => {
    setActiveHandlerStub.resetHistory();
    DataConnections.__ResetDependency__('getConnectStateUI');
    DataConnections.__ResetDependency__('getProviderHandlers');
    DataConnections.__ResetDependency__('activeProviders');
    DataConnections.__ResetDependency__('providers');
  });

  it('should merge the the appropriate connect state UI and handler props based on the current provider connection state for a patient', () => {
    const connectState1PatientProps = getDataConnectionProps(createPatientWithConnectionState('connectState1'), false, 'clinic125', setActiveHandlerStub).provider123;

    expect(connectState1PatientProps.buttonDisabled).to.equal('connectState1 handler buttonDisabled stub');
    expect(connectState1PatientProps.buttonHandler).to.be.a('function');
    expect(connectState1PatientProps.buttonIcon).to.equal('connectState1 handler buttonIcon stub');
    expect(connectState1PatientProps.buttonStyle).to.equal('connectState1 handler buttonStyle stub');
    expect(connectState1PatientProps.buttonText).to.equal('connectState1 handler buttonText stub');
    expect(connectState1PatientProps.icon).to.equal('connectState1 icon stub');
    expect(connectState1PatientProps.iconLabel).to.equal('connection status: connectState1');
    expect(connectState1PatientProps.label).to.equal('provider123 data connection state');
    expect(connectState1PatientProps.logoImage).to.equal('provider123 logo image stub');
    expect(connectState1PatientProps.logoImageLabel).to.equal('provider123 logo');
    expect(connectState1PatientProps.messageColor).to.equal('#6D6D6D');
    expect(connectState1PatientProps.messageText).to.equal('connectState1 message stub');
    expect(connectState1PatientProps.providerName).to.equal('provider123');
    expect(connectState1PatientProps.stateColor).to.equal('connectState1 color stub');
    expect(connectState1PatientProps.stateText).to.equal('connectState1 text stub');

    const connectState2PatientProps = getDataConnectionProps(createPatientWithConnectionState('connectState2'), false, 'clinic125', setActiveHandlerStub).provider123;

    expect(connectState2PatientProps.buttonDisabled).to.equal('connectState2 handler buttonDisabled stub');
    expect(connectState2PatientProps.buttonHandler).to.be.a('function');
    expect(connectState2PatientProps.buttonIcon).to.equal('connectState2 handler buttonIcon stub');
    expect(connectState2PatientProps.buttonStyle).to.equal('connectState2 handler buttonStyle stub');
    expect(connectState2PatientProps.buttonText).to.equal('connectState2 handler buttonText stub');
    expect(connectState2PatientProps.icon).to.equal('connectState2 icon stub');
    expect(connectState2PatientProps.iconLabel).to.equal('connection status: connectState2');
    expect(connectState2PatientProps.label).to.equal('provider123 data connection state');
    expect(connectState2PatientProps.logoImage).to.equal('provider123 logo image stub');
    expect(connectState2PatientProps.logoImageLabel).to.equal('provider123 logo');
    expect(connectState2PatientProps.messageColor).to.equal('#6D6D6D');
    expect(connectState2PatientProps.messageText).to.equal('connectState2 message stub');
    expect(connectState2PatientProps.providerName).to.equal('provider123');
    expect(connectState2PatientProps.stateColor).to.equal('connectState2 color stub');
    expect(connectState2PatientProps.stateText).to.equal('connectState2 text stub');
  });

  it('should set the button handler to call the provided active handler setter with the appropriate args', () => {
    const connectState1PatientProps = getDataConnectionProps(createPatientWithConnectionState('connectState1'), false, 'clinic125', setActiveHandlerStub).provider123;

    expect(connectState1PatientProps.buttonHandler).to.be.a('function');
    sinon.assert.notCalled(setActiveHandlerStub);

    connectState1PatientProps.buttonHandler();
    sinon.assert.calledWith(setActiveHandlerStub, {
      action: 'connectState1 handler action stub',
      args: 'connectState1 handler args stub',
      emailRequired: 'connectState1 handler emailRequired stub',
      patientUpdates: 'connectState1 handler patientUpdates stub',
      providerName: 'provider123',
      connectState: 'connectState1',
      handler: 'connectState1 handler stub',
    });
  });
});

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
      deleteOAuthProviderAuthorization: sinon.stub(),
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
    dataConnectionJustConnected: patientWithState(false, 'connected', { createdTime: getDateInPast(1, 'minutes') }),
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
    api.user.createRestrictedToken.resetHistory();
    api.user.createOAuthProviderAuthorization.resetHistory();
    api.user.deleteOAuthProviderAuthorization.resetHistory();
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
        expect(dexcomConnection.find('.state-text')).to.have.lengthOf(0);
        expect(dexcomConnection.find('.state-message')).to.have.lengthOf(0);

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text')).to.have.lengthOf(0);
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Email Invite');

        store.clearActions();
        dexcomActionButton.simulate('click');
        abbottActionButton.simulate('click');

        setTimeout(() => {
          sinon.assert.calledWith(api.clinics.updateClinicPatient, 'clinicID123', 'patient123', sinon.match({ dataSources: [ { providerName: 'dexcom', state: 'pending' } ] }));
          sinon.assert.calledWith(api.clinics.updateClinicPatient, 'clinicID123', 'patient123', sinon.match({ dataSources: [ { providerName: 'twiist', state: 'pending' } ] }));
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/twiist' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'twiist', 'restrictedTokenID');
          done();
        });
      });
    });

    describe('data connection just connected', () => {
      it('should render data connection status and message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionJustConnected);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Connecting');
        expect(dexcomConnection.find('.state-message').hostNodes().text()).to.equal(' - This can take a few minutes');

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Connecting');
        expect(abbottConnection.find('.state-message').hostNodes().text()).to.equal(' - This can take a few minutes');
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', done => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionJustConnected);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Disconnect');

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Disconnect');

        store.clearActions();
        dexcomActionButton.simulate('click');
        abbottActionButton.simulate('click');

        setTimeout(() => {
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'dexcom');
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'twiist');
          done();
        });
      });
    });

    describe('data connection connected with no data', () => {
      it('should render data connection status and message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionConnectedWithNoData);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Connected');
        expect(dexcomConnection.find('.state-message').hostNodes().text()).to.equal(' - No data found as of 5 minutes ago');

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Connected');
        expect(abbottConnection.find('.state-message').hostNodes().text()).to.equal(' - No data found as of 5 minutes ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', done => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionConnectedWithNoData);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Disconnect');

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Disconnect');

        store.clearActions();
        dexcomActionButton.simulate('click');
        abbottActionButton.simulate('click');

        setTimeout(() => {
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'dexcom');
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'twiist');
          done();
        });
      });
    });

    describe('data connection connected with data', () => {
      it('should render data connection status and message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionConnectedWithData);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Connected');
        expect(dexcomConnection.find('.state-message').hostNodes().text()).to.equal(' - Last data 35 minutes ago');

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Connected');
        expect(abbottConnection.find('.state-message').hostNodes().text()).to.equal(' - Last data 35 minutes ago');
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', done => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionConnectedWithData);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Disconnect');

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Disconnect');

        store.clearActions();
        dexcomActionButton.simulate('click');
        abbottActionButton.simulate('click');

        setTimeout(() => {
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'dexcom');
          sinon.assert.calledWith(api.user.deleteOAuthProviderAuthorization, 'twiist');
          done();
        });
      });
    });

    describe('data connection disconnected', () => {
      it('should not render data connection status or message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionDisconnected);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text')).to.have.lengthOf(0);
        expect(dexcomConnection.find('.state-message')).to.have.lengthOf(0);

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text')).to.have.lengthOf(0);
        expect(abbottConnection.find('.state-message')).to.have.lengthOf(0);
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', done => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionDisconnected);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Connect');

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
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

          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/twiist' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'twiist', 'restrictedTokenID');
          done();
        });
      });
    });

    describe('data connection error', () => {
      it('should render data connection status and message', () => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionError);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        expect(dexcomConnection.find('.state-text').hostNodes().text()).to.equal('Error Connecting');
        expect(dexcomConnection.find('.state-message').hostNodes().text()).to.equal(' - Last update 6 days ago. Please reconnect your account to keep syncing data.');

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        expect(abbottConnection.find('.state-text').hostNodes().text()).to.equal('Error Connecting');
        expect(abbottConnection.find('.state-message').hostNodes().text()).to.equal(' - Last update 6 days ago. Please reconnect your account to keep syncing data.');
      });

      it('should render appropriate buttons and dispatch appropriate actions when clicked', done => {
        const store = mockStore(patientUserLoggedInState);
        mountWrapper(store, userPatients.dataConnectionError);

        const connections = wrapper.find('.data-connection').hostNodes();
        expect(connections).to.have.lengthOf(2);

        const dexcomConnection = wrapper.find('#data-connection-dexcom').hostNodes();
        expect(dexcomConnection).to.have.lengthOf(1);
        const dexcomActionButton = dexcomConnection.find('.action').hostNodes();
        expect(dexcomActionButton).to.have.lengthOf(1);
        expect(dexcomActionButton.text()).to.equal('Reconnect');

        const abbottConnection = wrapper.find('#data-connection-twiist').hostNodes();
        expect(abbottConnection).to.have.lengthOf(1);
        const abbottActionButton = abbottConnection.find('.action').hostNodes();
        expect(abbottActionButton).to.have.lengthOf(1);
        expect(abbottActionButton.text()).to.equal('Reconnect');

        store.clearActions();
        dexcomActionButton.simulate('click');
        abbottActionButton.simulate('click');

        setTimeout(() => {
          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/dexcom' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'dexcom', 'restrictedTokenID');

          sinon.assert.calledWith(api.user.createRestrictedToken, sinon.match({ paths: [ '/v1/oauth/twiist' ] }));
          sinon.assert.calledWith(api.user.createOAuthProviderAuthorization, 'twiist', 'restrictedTokenID');
          done();
        });
      });
    });
  });
});

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import moment from 'moment-timezone';
import defaults from 'lodash/defaults';
import filter from 'lodash/filter';
import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import intersection from 'lodash/intersection';
import isFunction from 'lodash/isFunction';
import keys from 'lodash/keys';
import map from 'lodash/map';
import max from 'lodash/max';
import noop from 'lodash/noop';
import orderBy from 'lodash/orderBy';
import reduce from 'lodash/reduce';
import { utils as vizUtils } from '@tidepool/viz';

import * as actions from '../../redux/actions';
import { useToasts } from '../../providers/ToastProvider';
import api from '../../core/api';
import { useIsFirstRender, usePrevious } from '../../core/hooks';
import i18next from '../../core/language';
import DataConnection from './DataConnection';
import PatientEmailModal from './PatientEmailModal';
import ResendDataSourceConnectRequestDialog from '../clinic/ResendDataSourceConnectRequestDialog';
import DataSourceDisconnectDialog from './DataSourceDisconnectDialog';
import { Box, BoxProps } from 'theme-ui';
import dexcomLogo from '../../core/icons/dexcom_logo.png';
import libreLogo from '../../core/icons/libre_logo.svg';
import ouraLogo from '../../core/icons/oura_logo.svg';
import twiistLogo from '../../core/icons/twiist_logo.svg';
import { colors } from '../../themes/baseTheme';

const { formatTimeAgo } = vizUtils.datetime;
const t = i18next.t.bind(i18next);

export const providers = {
  dexcom: {
    id: 'oauth/dexcom',
    displayName: 'Dexcom',
    displayOrderIndex: 0,
    restrictedTokenCreate: {
        paths: [
          '/v1/oauth/dexcom',
        ],
    },
    dataSourceFilter: {
      providerType: 'oauth',
      providerName: 'dexcom',
    },
    logoImage: dexcomLogo,
  },
  abbott: {
    id: 'oauth/abbott',
    displayName: 'FreeStyle Libre',
    displayOrderIndex: 2,
    restrictedTokenCreate: {
        paths: [
          '/v1/oauth/abbott',
        ],
    },
    dataSourceFilter: {
      providerType: 'oauth',
      providerName: 'abbott',
    },
    logoImage: libreLogo,
    disconnectInstructions: {
      title: t('Please disconnect in your FreeStyle Libre or LibreView application as well.'),
      message: t('Disconnecting here has stopped new data collection from your FreeStyle Libre device. To fully revoke consent for sharing data with Tidepool, log into your FreeStyle Libre or LibreView app, access the "Connected Apps" page, and click "Manage" and then "Disconnect" next to Tidepool.'),
    },
  },
  oura: {
    id: 'oauth/oura',
    displayName: 'ŌURA',
    displayOrderIndex: 3,
    restrictedTokenCreate: {
        paths: [
          '/v1/oauth/oura',
        ],
    },
    dataSourceFilter: {
      providerType: 'oauth',
      providerName: 'oura',
    },
    logoImage: ouraLogo,
    requiresLoggedInUser: true,
    requiresExistingDataSource: true,
  },
  twiist: {
    id: 'oauth/twiist',
    displayName: 'twiist',
    displayOrderIndex: 1,
    restrictedTokenCreate: {
        paths: [
          '/v1/oauth/twiist',
        ],
    },
    dataSourceFilter: {
      providerType: 'oauth',
      providerName: 'twiist',
    },
    logoImage: twiistLogo,
    indeterminateDataImportTime: true,
  },
};

export const availableProviders = orderBy(keys(providers), provider => providers[provider].displayOrderIndex);

export const getActiveProviders = (overrides = {}) => {
  const activeProviders = defaults(overrides, {
    abbott: true,
    dexcom: true,
    oura: true,
    twiist: true,
  });

  return filter(availableProviders, provider => activeProviders[provider]);
};

export function getProviderHandlers(patient, selectedClinicId, provider) {
  const { id, restrictedTokenCreate, dataSourceFilter } = provider;
  const providerName = dataSourceFilter?.providerName;

  // Clinician-initiated send and resend invite handlers will potentially need to gather an email
  // address and set the initial data source pending status on the patient if these do not exist.
  const emailRequired = !!(selectedClinicId && !patient?.email && patient?.permissions?.custodian);
  const hasProviderDataSource = !!find(patient?.dataSources, { providerName });

  let patientUpdates;

  if (!hasProviderDataSource) {
    patientUpdates = {
      dataSources: [
        ...patient?.dataSources || [],
        { providerName, state: 'pending' },
      ],
    };
  }

  return {
    connect: {
      buttonText: t('Connect'),
      buttonStyle: 'solid',
      action: actions.async.connectDataSource,
      args: [api, id, restrictedTokenCreate, dataSourceFilter],
    },
    disconnect: {
      buttonText: t('Disconnect'),
      buttonStyle: providerName === 'twiist' ? 'hidden' : 'text',
      action: actions.async.disconnectDataSource,
      args: [api, dataSourceFilter],
    },
    inviteSent: {
      buttonDisabled: true,
      buttonIcon: CheckRoundedIcon,
      buttonText: t('Invite Sent'),
      buttonStyle: 'staticText',
      action: actions.async.connectDataSource,
      args: [api, id, restrictedTokenCreate, dataSourceFilter],
    },
    reconnect: {
      buttonText: t('Reconnect'),
      buttonStyle: 'solid',
      action: actions.async.connectDataSource,
      args: [api, id, restrictedTokenCreate, dataSourceFilter],
    },
    sendInvite: {
      buttonText: t('Email Invite'),
      buttonStyle: 'solid',
      action: actions.async.sendPatientDataProviderConnectRequest,
      args: [api, selectedClinicId, patient?.id, providerName],
      emailRequired,
      patientUpdates,
    },
    resendInvite: {
      buttonText: t('Resend Invite'),
      buttonStyle: 'solid',
      action: actions.async.sendPatientDataProviderConnectRequest,
      args: [api, selectedClinicId, patient?.id, providerName],
      emailRequired,
      patientUpdates,
    },
  }
};

export const getCurrentDataSourceForProvider = (patient, providerName) => {
  const dataSources = filter(patient?.dataSources, { providerName }) || [];

  if (dataSources.length === 0) {
    return undefined;
  }

  // Define state priority order
  const statePriority = {
    pending: 1,
    connected: 2,
    error: 3,
    pendingReconnect: 4,
    disconnected: 5,
  };

  // Sort by state priority, then by lastImportTime (descending) for disconnected states
  const sortedDataSources = orderBy(dataSources, [
    (ds) => statePriority[ds.state] || 999, // Unknown states go to the end
    (ds) => ds.state === 'disconnected' ? -(new Date(ds.lastImportTime || 0).getTime()) : 0
  ], ['asc', 'asc']);

  return sortedDataSources[0];
};

export const getConnectStateUI = (patient, isLoggedInUser, providerName) => {
  const dataSource = getCurrentDataSourceForProvider(patient, providerName);

  const mostRecentConnectionUpdateTime = isLoggedInUser
    ? max([
      dataSource?.createdTime,
      dataSource?.latestDataTime || dataSource?.lastImportTime,
      dataSource?.modifiedTime,
    ]) : max([
      dataSource?.modifiedTime,
      patient?.connectionRequests?.[providerName]?.[0]?.createdTime
    ]);

  let timeAgo;
  let inviteJustSent;

  if (mostRecentConnectionUpdateTime) {
    const { daysAgo, daysText, hoursAgo, hoursText, minutesAgo, minutesText } = formatTimeAgo(mostRecentConnectionUpdateTime);
    timeAgo = daysText;
    if (daysAgo < 1)  timeAgo = hoursAgo < 1 ? minutesText : hoursText;
    if (!isLoggedInUser && minutesAgo < 1) inviteJustSent = true;
  }

  let patientConnectedMessage;
  let patientConnectedIcon;
  let patientConnectedText = t('Connected');

  if (!dataSource?.lastImportTime && !providers[providerName]?.indeterminateDataImportTime) {
    patientConnectedMessage = t('Awaiting data, this can take a few minutes');
    patientConnectedText = t('Connected');
  } else if (!dataSource?.latestDataTime) {
    patientConnectedMessage = t('No data found as of {{timeAgo}}', { timeAgo });
  } else {
    // the general connection update timeAgo variable above is not always the latest data time so we
    // need to use the latest data time specifically for the displaying it in the connected state
    const { daysAgo, daysText, hoursAgo, hoursText, minutesText } = formatTimeAgo(dataSource.latestDataTime);
    let dataTimeAgo = daysText;
    if (daysAgo < 1)  dataTimeAgo = hoursAgo < 1 ? minutesText : hoursText;
    patientConnectedMessage = t('Last data {{dataTimeAgo}}', { dataTimeAgo });
    patientConnectedIcon = CheckCircleRoundedIcon;
  }

  return {
    noPendingConnections: {
      color: colors.grays[5],
      handler: isLoggedInUser ? 'connect' : 'sendInvite',
      icon: null,
      message: null,
      text: null,
    },
    inviteJustSent: {
      color: colors.grays[5],
      handler: 'inviteSent',
      icon: null,
      message: null,
      text: t('Connection Pending'),
    },
    pending: {
      color: colors.grays[5],
      handler: isLoggedInUser ? 'connect' : 'resendInvite',
      icon: null,
      message: t('Invite sent {{timeAgo}}', { timeAgo }),
      text: t('Connection Pending'),
      inviteJustSent,
    },
    pendingReconnect: {
      color: colors.grays[5],
      handler: isLoggedInUser ? 'connect' : 'resendInvite',
      icon: null,
      message: t('Invite sent {{timeAgo}}', { timeAgo }),
      text: t('Invite Sent'),
      inviteJustSent,
    },
    pendingExpired: {
      color: colors.feedback.warning,
      handler: isLoggedInUser ? 'connect' : 'resendInvite',
      icon: ErrorRoundedIcon,
      message: t('Sent over one month ago'),
      text: t('Invite Expired'),
    },
    connected: {
      color: colors.text.primary,
      handler: isLoggedInUser ? 'disconnect' : null,
      message: isLoggedInUser && (providerName !== 'twiist') ? patientConnectedMessage : null, // Temporarily hide the message for twiist while we await a backend data source fix
      icon: isLoggedInUser ? patientConnectedIcon : CheckCircleRoundedIcon,
      text: isLoggedInUser ? patientConnectedText : t('Connected'),
    },
    disconnected: {
      color: colors.feedback.warning,
      handler: isLoggedInUser ? 'connect' : 'resendInvite',
      icon: isLoggedInUser ? null : ErrorRoundedIcon,
      message: isLoggedInUser ? null : t('Last update {{timeAgo}}', { timeAgo }),
      text: isLoggedInUser ? null : t('Patient Disconnected'),
    },
    error: {
      color: colors.feedback.warning,
      handler: isLoggedInUser ? 'reconnect' : 'resendInvite',
      icon: ErrorRoundedIcon,
      message: isLoggedInUser
        ? t('Last update {{timeAgo}}. Please reconnect your account to keep syncing data.', { timeAgo })
        : t('Last update {{timeAgo}}', { timeAgo }),
      text: t('Error Connecting'),
    },
    unknown: {
      color: colors.feedback.warning,
      handler: null,
      icon: ErrorRoundedIcon,
      text: t('Unknown Status'),
    },
  }
};

export const getDataConnectionProps = (patient, isLoggedInUser, selectedClinicId, setActiveHandler) => reduce(availableProviders, (result, providerName) => {

  const provider = providers[providerName];
  const dataSource = getCurrentDataSourceForProvider(patient, providerName);
  const connectStateUI = getConnectStateUI(patient, isLoggedInUser, providerName);
  const inviteExpired = dataSource?.expirationTime < moment.utc().toISOString();

  // If the provider requires a logged in user to create the connection, then ensure that is the case.
  if (!!provider.requiresLoggedInUser && !isLoggedInUser) {
    return result;
  }

  // If the provider requires an existing data source to create the connection, then ensure that is the case.
  // This mechanism can be used to limit access to certain providers to only users who have previously connected
  // or where Tidepool has created a data source on their behalf.
  if (!!provider.requiresExistingDataSource && !dataSource) {
    return result;
  }

  let connectState;
  if (dataSource?.state) {
    connectState = includes(keys(connectStateUI), dataSource.state)
      ? dataSource.state
      : 'unknown';

    if (includes(['pending', 'pendingReconnect'], connectState)) {
      if (inviteExpired) {
        connectState = 'pendingExpired';
      } else if (connectStateUI[connectState].inviteJustSent) {
        connectState = 'inviteJustSent';
      }
    }
  } else {
    connectState = 'noPendingConnections';
  }

  const { color, icon, message, text, handler } = connectStateUI[connectState];

  const {
    action,
    args,
    buttonDisabled,
    buttonIcon,
    buttonText,
    buttonStyle,
    emailRequired,
    patientUpdates,
  } = getProviderHandlers(patient, selectedClinicId, provider)[handler] || {};

  // Now that we have everything we need, add the provider
  result[providerName] = {};

  if (action) {
    result[providerName].buttonDisabled = buttonDisabled;
    result[providerName].buttonIcon = buttonIcon;
    result[providerName].buttonHandler = () => setActiveHandler({ action, args, emailRequired, patientUpdates, providerName, connectState, handler });
    result[providerName].buttonText = buttonText;
    result[providerName].buttonStyle = buttonStyle;
  }

  result[providerName].icon = icon;
  result[providerName].iconLabel = `connection status: ${connectState}`;
  result[providerName].label = `${providerName} data connection state`;
  result[providerName].messageColor = colors.grays[5];
  result[providerName].messageText = message;
  result[providerName].stateColor = color;
  result[providerName].stateText = text;
  result[providerName].providerName = providerName;
  result[providerName].logoImage = provider?.logoImage;
  result[providerName].logoImageLabel = `${providerName} logo`;

  return result;
}, {});

export const DataConnections = (props) => {
  const {
    patient,
    shownProviders,
    trackMetric,
    ...themeProps
  } = props;

  const dispatch = useDispatch();
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const isLoggedInUser = useSelector((state) => state.blip.loggedInUserId === patient?.id);
  const [showResendDataSourceConnectRequest, setShowResendDataSourceConnectRequest] = useState(false);
  const [dataSourceDisconnectInstructions, setDataSourceDisconnectInstructions] = useState();
  const [showPatientEmailModal, setShowPatientEmailModal] = useState(false);
  const [patientEmailFormContext, setPatientEmailFormContext] = useState();
  const [processingEmailUpdate, setProcessingEmailUpdate] = useState(false);
  const [patientUpdates, setPatientUpdates] = useState({});
  const [activeHandler, setActiveHandler] = useState(null);
  const dataConnectionProps = getDataConnectionProps(patient, isLoggedInUser, selectedClinicId, setActiveHandler);
  const activeProviders = filter(getActiveProviders(), providerName => !!dataConnectionProps[providerName]); // Only those with connection props

  const {
    sendingPatientDataProviderConnectRequest,
    updatingClinicPatient,
    disconnectingDataSource,
    fetchingDataSources,
  } = useSelector((state) => state.blip.working);

  const previousSendingPatientDataProviderConnectRequest = usePrevious(sendingPatientDataProviderConnectRequest);
  const previousUpdatingClinicPatient = usePrevious(updatingClinicPatient);
  const previousDisconnectingDataSource = usePrevious(disconnectingDataSource);

  const fetchPatientDetails = useCallback(() => {
    dispatch(actions.async.fetchPatientFromClinic(api, selectedClinicId, patient?.id));
  }, [
    dispatch,
    selectedClinicId,
    patient?.id,
  ]);

  // Pull the patient on load to ensure the most recent dexcom connection state is made available
  useEffect(() => {
    if (selectedClinicId && patient?.id) fetchPatientDetails();
  }, []);

  const handleAsyncResult = useCallback((workingState, successMessage, onComplete) => {
    const { inProgress, completed, notification, prevInProgress } = workingState;

    if (!isFirstRender && !inProgress && prevInProgress !== false) {
      if (completed) {
        if (isFunction(onComplete)) onComplete();

        if (successMessage) setToast({
          message: successMessage,
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });

        setShowPatientEmailModal(false);
        setProcessingEmailUpdate(false);
        setPatientUpdates({});
        setActiveHandler(null);
      }
    }
  }, [
    isFirstRender,
    setToast,
  ]);

  const handleAddPatientEmailOpen = useCallback(() => {
    trackMetric('Data Connections - add patient email', { selectedClinicId });
    setShowPatientEmailModal(true);
  }, [
    selectedClinicId,
    trackMetric,
  ]);

  const handleAddPatientEmailClose = () => {
    setShowPatientEmailModal(false);
    setActiveHandler(null);
  };

  const handleAddPatientEmailFormChange = (formikContext) => {
    setPatientEmailFormContext({ ...formikContext });
  };

  const handleAddPatientEmailConfirm = () => {
    trackMetric('Data Connections - add patient email confirmed', { selectedClinicId });
    patientEmailFormContext?.handleSubmit();
    setProcessingEmailUpdate(true);
  };

  const handleUpdatePatientComplete = useCallback(() => {
    fetchPatientDetails();
    setShowPatientEmailModal(false);
    setProcessingEmailUpdate(false);
    setPatientUpdates({});

    if (activeHandler?.action) {
      if (activeHandler?.emailRequired) {
        // Immediately after adding a new patient email address. There will be a small amount
        // of time where the backend services may not be able to find the patient, so we wait
        // a second before requesting that a connection request email be sent.
        setTimeout(() => dispatch(activeHandler.action(...activeHandler.args)), 1000);
      } else {
        // If we haven't just added an email to a patient, we can fire this right away.
        dispatch(activeHandler.action(...activeHandler.args));
      }
    }
  }, [
    activeHandler,
    dispatch,
    fetchPatientDetails,
  ]);

  const handleResendDataSourceConnectEmailOpen = useCallback(() => {
    trackMetric('Clinic - Resend DataSource connect email', {
      clinicId: selectedClinicId,
      providerName: activeHandler?.providerName,
      dataSourceConnectState: activeHandler?.connectState,
      source: 'patientForm',
    });

    setShowResendDataSourceConnectRequest(true);
  }, [
    activeHandler?.connectState,
    activeHandler?.providerName,
    selectedClinicId,
    trackMetric,
  ]);

  const handleResendDataSourceConnectEmailClose = () => {
    setShowResendDataSourceConnectRequest(false);
    setActiveHandler(null);
  };

  const handleDataSourceDisconnectDialogClose = () => {
    setDataSourceDisconnectInstructions();
  };

  const handleResendDataSourceConnectEmailConfirm = () => {
    trackMetric('Clinic - Resend DataSource connect email confirm', { clinicId: selectedClinicId, source: 'patientForm' });
    if (activeHandler?.action) dispatch(activeHandler.action(...activeHandler.args));
  };

  const handleActiveHandlerComplete = useCallback(() => {
    setShowPatientEmailModal(false);
    setShowResendDataSourceConnectRequest(false);
    setActiveHandler(null);

    if (selectedClinicId) {
      fetchPatientDetails();
    } else {
      if (!fetchingDataSources?.inProgress) dispatch(actions.async.fetchDataSources(api));
    }
  }, [fetchPatientDetails, selectedClinicId, fetchingDataSources?.inProgress, dispatch]);

  const authorizedDataSource = useSelector(state => state.blip.authorizedDataSource);
  const previousAuthorizedDataSource = usePrevious(authorizedDataSource);

  useEffect(() => {
    if (!!previousAuthorizedDataSource && !authorizedDataSource && activeHandler) {
      handleActiveHandlerComplete()
    }
  }, [
    activeHandler,
    authorizedDataSource,
    handleActiveHandlerComplete,
    previousAuthorizedDataSource,
  ]);

  useEffect(() => {
    if(activeHandler?.action && !activeHandler?.inProgress) {
      setActiveHandler({ ...activeHandler, inProgress: true });

      if (activeHandler.emailRequired) {
        // Store any patient updates in state.  We will collect the email address, and then add it
        // to the updates obect before applying them.
        setPatientUpdates(activeHandler.patientUpdates || {});
        handleAddPatientEmailOpen();
      } else if (patient && activeHandler.patientUpdates) {
        // We have updates to apply before we can fire the data connection action.
        dispatch(actions.async.updateClinicPatient(api, selectedClinicId, patient.id, { ...patient, ...activeHandler.patientUpdates }));
      } else if (activeHandler.handler === 'resendInvite') {
        handleResendDataSourceConnectEmailOpen();
      } else {
        // No need to update patient object prior to firing data connection action. Fire away.
        dispatch(activeHandler.action(...activeHandler.args));
      }
    }
  }, [
    activeHandler,
    dispatch,
    handleAddPatientEmailOpen,
    handleResendDataSourceConnectEmailOpen,
    patient,
    selectedClinicId,
  ]);

  useEffect(() => {
    handleAsyncResult({ ...updatingClinicPatient, prevInProgress: previousUpdatingClinicPatient?.inProgress}, t('You have successfully updated a patient.'), handleUpdatePatientComplete);
  }, [
    handleAsyncResult,
    handleUpdatePatientComplete,
    updatingClinicPatient,
    previousUpdatingClinicPatient?.inProgress,
    setToast,
  ]);

  useEffect(() => {
    handleAsyncResult({ ...sendingPatientDataProviderConnectRequest, prevInProgress: previousSendingPatientDataProviderConnectRequest?.inProgress }, t('{{ providerDisplayName }} connection request to {{email}} has been sent.', {
      email: patient?.email,
      providerDisplayName: providers[activeHandler?.providerName]?.displayName,
    }), handleActiveHandlerComplete);
  }, [
    sendingPatientDataProviderConnectRequest,
    previousSendingPatientDataProviderConnectRequest?.inProgress,
    handleAsyncResult,
    handleActiveHandlerComplete,
    activeHandler?.providerName,
    patient?.email
  ]);

  useEffect(() => {
    handleAsyncResult({ ...disconnectingDataSource, prevInProgress: previousDisconnectingDataSource?.inProgress }, t('{{ providerDisplayName }} connection has been disconnected.', {
      providerDisplayName: providers[activeHandler?.providerName]?.displayName,
    }), () => {
      setDataSourceDisconnectInstructions(providers?.[activeHandler?.providerName]?.disconnectInstructions);
      handleActiveHandlerComplete();
    });
  }, [
    disconnectingDataSource,
    previousDisconnectingDataSource?.inProgress,
    handleAsyncResult,
    handleActiveHandlerComplete,
    activeHandler?.providerName,
  ]);

  return (
    <>
      <Box id="data-connections" {...themeProps}>
        {map(intersection(shownProviders, activeProviders), (provider, i) => (
          <DataConnection
            id={`data-connection-${provider}`}
            className="data-connection"
            key={i}
            mb={1}
            buttonProcessing={activeHandler?.providerName === provider && !showPatientEmailModal && !showResendDataSourceConnectRequest}
            { ...dataConnectionProps[provider]}
          />
        ))}
      </Box>

      {showPatientEmailModal && <PatientEmailModal
        open
        onClose={handleAddPatientEmailClose}
        onFormChange={handleAddPatientEmailFormChange}
        onSubmit={handleAddPatientEmailConfirm}
        patient={{ ...patient, ...patientUpdates }}
        processing={processingEmailUpdate}
        trackMetric={trackMetric}
      />}

      <ResendDataSourceConnectRequestDialog
        api={api}
        onClose={handleResendDataSourceConnectEmailClose}
        onConfirm={handleResendDataSourceConnectEmailConfirm}
        open={showResendDataSourceConnectRequest}
        patient={patient}
        providerName={activeHandler?.providerName}
        t={t}
        trackMetric={trackMetric}
      />

      <DataSourceDisconnectDialog
        onClose={handleDataSourceDisconnectDialogClose}
        onConfirm={handleDataSourceDisconnectDialogClose}
        open={!!dataSourceDisconnectInstructions}
        disconnectInstructions={dataSourceDisconnectInstructions}
      />
    </>
  );
};

const clinicPatientDataSourceShape = {
  expirationTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  providerName: PropTypes.string.isRequired,
  state: PropTypes.oneOf(['connected', 'disconnected', 'error', 'pending', 'pendingReconnect']).isRequired,
};

const userDataSourceShape = {
  createdTime: PropTypes.string,
  lastImportTime: PropTypes.string,
  latestDataTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  providerName: PropTypes.string.isRequired,
  state: PropTypes.oneOf(['connected', 'disconnected', 'error', 'pending', 'pendingReconnect']).isRequired,
};

DataConnections.propTypes = {
  ...BoxProps,
  patient: PropTypes.shape({
    dataSources: PropTypes.oneOf([PropTypes.shape(clinicPatientDataSourceShape), PropTypes.shape(userDataSourceShape)])
  }),
  shownProviders: PropTypes.arrayOf(PropTypes.oneOf(availableProviders)),
  trackMetric: PropTypes.func.isRequired,
};

DataConnections.defaultProps = {
  shownProviders: availableProviders,
  trackMetric: noop,
};

export default DataConnections;

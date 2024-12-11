import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import moment from 'moment-timezone';
import find from 'lodash/find';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import map from 'lodash/map';
import max from 'lodash/max';
import noop from 'lodash/noop';
import reduce from 'lodash/reduce';
import { utils as vizUtils } from '@tidepool/viz';

import * as actions from '../../redux/actions';
import api from '../../core/api';
import i18next from '../../core/language';
import DataConnection from './DataConnection';
import { Box, BoxProps } from 'theme-ui';
import dexcomLogo from '../../core/icons/dexcom_logo.svg';
import libreLogo from '../../core/icons/libre_logo.svg';
import twiistLogo from '../../core/icons/twiist_logo.svg';
import { colors } from '../../themes/baseTheme';

const { formatTimeAgo } = vizUtils.datetime;
const t = i18next.t.bind(i18next);

export const providers = {
  dexcom: {
    id: 'oauth/dexcom',
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
  libre: {
    id: 'oauth/libre',
    restrictedTokenCreate: {
        paths: [
          '/v1/oauth/libre',
        ],
    },
    dataSourceFilter: {
      providerType: 'oauth',
      providerName: 'libre',
    },
    logoImage: libreLogo,
  },
  twiist: {
    id: 'oauth/twiist',
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
  },
};

export function getProviderHandlers(patient, selectedClinicId, provider) {
  const { id, restrictedTokenCreate, dataSourceFilter } = provider;
  const hasProviderDataSource = !!find(patient?.dataSources, { providerName: dataSourceFilter?.providerName });
  const addProviderDataSource = !hasProviderDataSource;

  const patientWithDataSourceUpdates = {
    ...patient,
    dataSources: addProviderDataSource ? [
      ...patient?.dataSources || [],
      { providerName: dataSourceFilter?.providerName, state: 'pending' },
    ] : patient?.dataSources || [],
  };

  return {
    connect: {
      buttonText: t('Connect'),
      buttonStyle: 'solid',
      action: actions.async.connectDataSource,
      args: [api, id, restrictedTokenCreate, dataSourceFilter]
    },
    disconnect: {
      buttonText: t('Disconnect'),
      buttonStyle: 'text',
      action: actions.async.disconnectDataSource,
      args: [api, id, restrictedTokenCreate, dataSourceFilter]
    },
    reconnect: {
      buttonText: t('Reconnect'),
      buttonStyle: 'solid',
      action: actions.async.sendPatientDataProviderConnectRequest,
      args: [api, id, restrictedTokenCreate, dataSourceFilter]
    },
    sendInvite: {
      buttonText: t('Email Invite'),
      buttonStyle: 'solid',
      action: actions.async.sendPatientDataProviderConnectRequest, // TODO: need to submit patient with updated data source ste
      args: [api, id, restrictedTokenCreate, dataSourceFilter] // TODO: need to submit patient with updated data source state
    },
    resendInvite: {
      buttonText: t('Resend Invite'),
      buttonStyle: 'solid',
      action: actions.async.sendPatientDataProviderConnectRequest, // TODO: need to submit patient with updated data source ste
      args: [api, id, restrictedTokenCreate, dataSourceFilter] // TODO: need to submit patient with updated data source state
    },
  }
};

export const getConnectStateUI = (patient, loggedInUserId, providerName) => {
  const userIsPatient = loggedInUserId === patient?.id;

  const mostRecentConnectionUpdateTime = userIsPatient
    ? max([
      find(patient?.dataSources, {providerName})?.createdTime,
      find(patient?.dataSources, {providerName})?.latestDataTime || find(patient?.dataSources, {providerName})?.lastImportTime,
      find(patient?.dataSources, {providerName})?.modifiedTime,
    ]) : max([
      find(patient?.dataSources, { providerName })?.modifiedTime,
      patient?.connectionRequests?.[providerName]?.[0]?.createdTime
    ]);

  let timeAgo;

  if (mostRecentConnectionUpdateTime) {
    const { daysAgo, daysText, hoursAgo, hoursText, minutesText } = formatTimeAgo(mostRecentConnectionUpdateTime);
    timeAgo = daysText;
    if (daysAgo < 1)  timeAgo = hoursAgo < 1 ? minutesText : hoursText;
  }

  let patientConnectedMessage;
  let patientConnectedIcon;
  let patientConnectedText = t('Connected');

  if (!find(patient?.dataSources, {providerName})?.lastImportTime) {
    patientConnectedMessage = t('This can take a few minutes');
    patientConnectedText = t('Connecting');
  } else if (!find(patient?.dataSources, {providerName})?.latestDataTime) {
    patientConnectedMessage = t('No data found as of {{timeAgo}}', { timeAgo });
  } else {
    patientConnectedMessage = t('Last data {{timeAgo}}', { timeAgo });
    patientConnectedIcon = CheckCircleRoundedIcon;
  }

  return {
    noPendingConnections: {
      color: colors.grays[5],
      handler: userIsPatient ? 'connect' : 'sendInvite',
      icon: null,
      message: null,
      text: userIsPatient ? null : t('No Pending Connections'),
    },
    pending: {
      color: colors.grays[5],
      handler: userIsPatient ? 'connect' : 'resendInvite',
      icon: null,
      message: t('Invite sent {{timeAgo}}', { timeAgo }), // TODO: null immediately after sending
      text: t('Connection Pending'),
    },
    pendingReconnect: {
      color: colors.grays[5],
      handler: userIsPatient ? 'connect' : 'resendInvite',
      icon: null,
      message: t('Invite sent {{timeAgo}}', { timeAgo }),
      text: t('Invite Sent'),
    },
    pendingExpired: {
      color: colors.feedback.warning,
      handler: userIsPatient ? 'connect' : 'resendInvite',
      icon: ErrorRoundedIcon,
      message: t('Sent over one month ago'),
      text: t('Invite Expired'),
    },
    connected: {
      color: colors.text.primary,
      handler: userIsPatient ? 'disconnect' : null,
      message: userIsPatient ? patientConnectedMessage : null,
      icon: userIsPatient ? patientConnectedIcon : CheckCircleRoundedIcon,
      text: userIsPatient ? patientConnectedText : t('Connected'),
    },
    disconnected: {
      color: colors.feedback.warning,
      handler: userIsPatient ? 'connect' : 'resendInvite',
      icon: userIsPatient ? null : ErrorRoundedIcon,
      message: userIsPatient ? null : t('Last update {{timeAgo}}', { timeAgo }),
      text: userIsPatient ? null : t('Patient Disconnected'),
    },
    error: {
      color: colors.feedback.warning,
      handler: userIsPatient ? 'reconnect' : 'resendInvite',
      icon: ErrorRoundedIcon,
      message: userIsPatient
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

export const activeProviders = [
  'dexcom',
  'libre',
  // 'twiist',
];

export const getDataConnectionProps = (patient, loggedInUserId, selectedClinicId, dispatch) => reduce(activeProviders, (result, providerName) => {
  result[providerName] = {};

  let connectState;

  const connectStateUI = getConnectStateUI(patient, loggedInUserId, providerName);
  const dataSource = find(patient?.dataSources, { providerName: providerName });
  const inviteExpired = dataSource.expirationTime < moment.utc().toISOString();

  if (dataSource?.state) {
    connectState = includes(keys(connectStateUI), dataSource.state)
      ? dataSource.state
      : 'unknown';

    if (includes(['pending', 'pendingReconnect'], connectState) && inviteExpired) connectState = 'pendingExpired';
  } else {
    connectState = 'noPendingConnections';
  }

  const { color, icon, message, text, handler } = connectStateUI[connectState];
  const handlerProps = getProviderHandlers(patient, selectedClinicId, providers[providerName])[handler];

  if (handlerProps) {
    result[providerName].buttonHandler = () => dispatch(handlerProps.action, ...[handlerProps.args]);
    result[providerName].buttonText = handlerProps.buttonText;
    result[providerName].buttonStyle = handlerProps.buttonStyle;
  }

  result[providerName].icon = icon;
  result[providerName].iconLabel = `connection status: ${connectState}`;
  result[providerName].label = `${providerName} data connection state`;
  result[providerName].messageColor = colors.grays[5];
  result[providerName].messageText = message;
  result[providerName].stateColor = color;
  result[providerName].stateText = text;
  result[providerName].providerName = providerName;
  result[providerName].logoImage = providers[providerName]?.logoImage;
  result[providerName].logoImageLabel = `${providerName} logo`;

  return result;
}, {});

export function DataConnections(props) {
  const {
    api,
    dataSource,
    label,
    message,
    onAction,
    patient,
    ...themeProps
  } = props;

  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const dataConnectionProps = getDataConnectionProps(patient, loggedInUserId, selectedClinicId, dispatch);
  const [processing, setProcessing] = useState(false);

  return (
    <Box>
      {map(activeProviders, (provider, i) => (
        <DataConnection buttonProcessing={processing} { ...dataConnectionProps[provider]} key={i} id={`data-connection-${provider}`} {...themeProps} />
      ))}
    </Box>
  );
}

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
  label: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  patient: PropTypes.oneOf([PropTypes.shape(clinicPatientDataSourceShape), PropTypes.shape(userDataSourceShape)]),
};

DataConnections.defaultProps = {
  onSuccess: noop,
};

export default DataConnections;

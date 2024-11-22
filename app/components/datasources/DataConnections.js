import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import moment from 'moment-timezone';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import map from 'lodash/map';
import noop from 'lodash/noop';
import reduce from 'lodash/reduce';

import * as actions from '../../redux/actions';
import i18next from '../../core/language';
import DataConnection from './DataConnection';
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
  },
  abbot: {
    id: 'oauth/abbot',
    restrictedTokenCreate: {
        paths: [
          '/v1/oauth/abbot',
        ],
    },
    dataSourceFilter: {
      providerType: 'oauth',
      providerName: 'abbot',
    },
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
  },
};

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
  const userIsPatient = loggedInUserId === patient?.id;

  function getProviderHandlers({ id, restrictedTokenCreate, dataSourceFilter }) {
    const hasDexcomDataSource = !!find(patient?.dataSources, { providerName: dataSourceFilter?.providerName });
    const connectDexcom = (hasDexcomDataSource || (!disableDexcom && patient?.connectDexcom)) || false;
    const addDexcomDataSource = connectDexcom && !hasDexcomDataSource;

    const patientWithDataSourceUpdates = {
      ...patient,
      dataSources: addDexcomDataSource ? [
        ...patient?.dataSources || [],
        { providerName: 'dexcom', state: 'pending' },
      ] : patient?.dataSources || [],
    };


    return {
      connect: {
        buttonText: t('Connect'),
        buttonVariant: 'primary',
        action: actions.async.connectDataSource,
        args: [api, id, restrictedTokenCreate, dataSourceFilter]
      },
      disconnect: {
        buttonText: t('Disconnect'),
        buttonVariant: 'textPrimary',
        action: actions.async.disconnectDataSource,
        args: [api, id, restrictedTokenCreate, dataSourceFilter]
      },
      resconnect: {
        buttonText: t('Reconnect'),
        buttonVariant: 'primary',
        action: actions.async.connectDataSource,
        args: [api, id, restrictedTokenCreate, dataSourceFilter]
      },
      sendInvite: {
        buttonText: t('Email Invite'),
        buttonVariant: 'primary',
        action: actions.async.connectDataSource, // TODO: need to submit patient with updated data source state
        args: [api, id, restrictedTokenCreate, dataSourceFilter] // TODO: need to submit patient with updated data source state
      },
      resendInvite: {
        buttonText: t('Email Invite'),
        buttonVariant: 'primary',
        action: actions.async.connectDataSource, // TODO: need to submit patient with updated data source state
        args: [api, id, restrictedTokenCreate, dataSourceFilter] // TODO: need to submit patient with updated data source state
      },
    }
  };

  const connectStateUI = React.useMemo(() => ({
    noPendingConnections: {
      color: 'neutral',
      handler: userIsPatient ? 'connect' : 'sendInvite',
      icon: null,
      message: null,
      text: t('No Pending Connections'),
    },
    pending: {
      color: 'neutral',
      handler: userIsPatient ? 'connect' : 'resendInvite',
      icon: null,
      message: t('Invite sent [time] ago'), // TODO: null immediately after sending
      text: t('Connection Pending'),
    },
    pendingReconnect: {
      color: 'neutral',
      handler: userIsPatient ? 'connect' : 'resendInvite',
      icon: null,
      message: t('Invite sent [time] ago'), // TODO: Time needs to be dynamic
      text: t('Invite Sent'),
    },
    pendingExpired: {
      color: 'warning',
      handler: userIsPatient ? 'connect' : 'resendInvite',
      icon: ErrorRoundedIcon,
      message: t('Sent >30 days ago'),
      text: t('Invite Expired'),
    },
    connected: {
      color: 'primary',
      handler: userIsPatient ? 'disconnect' : null,
      icon: CheckCircleRoundedIcon,
      text: t('Connected'),
    },
    disconnected: {
      color: 'warning',
      handler: userIsPatient ? 'connect' : 'resendInvite',
      icon: ErrorRoundedIcon,
      message: t('Last update [time] ago'), // TODO: Time needs to be dynamic
      text: t('Patient Disconnected'),
    },
    error: {
      color: 'warning',
      handler: userIsPatient ? 'reconnect' : 'resendInvite',
      icon: ErrorRoundedIcon,
      message: t('Last update [time] ago'), // TODO: Time needs to be dynamic
      text: t('Error Connecting'),
    },
    unknown: {
      color: 'warning',
      handler: null,
      icon: ErrorRoundedIcon,
      text: t('Unknown Status'),
    },
  }), [userIsPatient]);

  const activeProviders = [
    'dexcom',
    'abbot',
  ];

  const dataConnectionProps = reduce(activeProviders, (result, provider) => {
    result[provider] = {};

    let connectState;

    const dataSource = find(patient?.dataSources, { providerName: provider });
    const inviteExpired = dataSource.expirationTime < moment.utc().toISOString();

    if (dataSource) {
      connectState = includes(keys(connectStateUI), dataSource?.state)
        ? dataSource.state
        : 'unknown';

      if (includes(['pending', 'pendingReconnect'], connectState) && inviteExpired) connectState = 'pendingExpired';
    } else {
      connectState = 'noPendingConnections';
    }

    const { color, icon, message, text, handler } = connectStateUI[connectState];
    const handlerProps = getProviderHandlers(providers[provider])[handler];

    if (handlerProps) {
      result.buttonHandler = () => dispatch(handlerProps.action, ...[handlerProps.args]);
      result.buttonText = handlerProps.buttonText;
      result.buttonVariant = handlerProps.buttonVariant;
    }

    result.icon = icon;
    result.iconLabel = `connection status: ${connectState}`;
    result.label = `${provider} data connection state`;
    result.message = message;
    result.stateText = text;
    result.stateColor = color;

    return result;
  }, {});


  return (
    <>
      {map(activeProviders, (provider, i) => (
        <DataConnection { ...dataConnectionProps[provider]} key={i} id={`data-connection-${provider}`} />
      ))}
    </>
  );
}

DataConnections.propTypes = {
  ...FlexProps,
  api: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  patient: PropTypes.object,
};

DataConnections.defaultProps = {
  onSuccess: noop,
};

export default DataConnections;

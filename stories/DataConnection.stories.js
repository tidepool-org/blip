import React from 'react';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from '@emotion/react';
import moment from 'moment-timezone';
import keys from 'lodash/keys';
import map from 'lodash/map';
import noop from 'lodash/noop';

import baseTheme from '../app/themes/baseTheme';
import { providers, getDataConnectionProps } from '../app/components/datasources/DataConnections';
import DataConnection from '../app/components/datasources/DataConnection';
import { Divider } from 'theme-ui';
import { Subheading } from '../app/components/elements/FontStyles';
import { reduce } from 'lodash';

/* eslint-disable max-len */

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'DataConnection',
  decorators: [withTheme],
};

const providerNames = keys(providers);

const patientWithState = (isClinicContext, state, opts = {}) => ({
  id: 'patientId',
  dataSources: map(providerNames, providerName => ({
    providerName,
    state,
    createdTime: opts.createdTime,
    modifiedTime: opts.modifiedTime,
    expirationTime: opts.expirationTime,
    latestDataTime: opts.latestDataTime,
  })),
  connectionRequests: isClinicContext && opts.createdTime ? reduce(providerNames, (res, providerName) => {
    res[providerName] = [{ providerName, createdTime: opts.createdTime }];
    return res;
  }, {}) : undefined,
});

const getDateInPast = (amount, unit) => moment.utc().subtract(amount, unit).toISOString();

// TODO: one story for clinic context, one for patient
// Show each provider in the same state, for all states

export const ClinicUser = {
  render: () => {
    const dataConnectionUnset = getDataConnectionProps(patientWithState(true), 'clinicianId', 'clinicID', noop);
    const dataConnectionPending = getDataConnectionProps(patientWithState(true, 'pending', { createdTime: getDateInPast(5, 'days') }), 'clinicianId', 'clinicID', noop);
    const dataConnectionPendingReconnect = getDataConnectionProps(patientWithState(true, 'pendingReconnect', { createdTime: getDateInPast(10, 'days') }), 'clinicianId', 'clinicID', noop);
    const dataConnectionPendingExpired = getDataConnectionProps(patientWithState(true, 'pending', {  createdTime: getDateInPast(31, 'days'), expirationTime: getDateInPast(1, 'days') }), 'clinicianId', 'clinicID', noop);
    const dataConnectionConnected = getDataConnectionProps(patientWithState(true, 'connected'), 'clinicianId', 'clinicID', noop);
    const dataConnectionDisconnected = getDataConnectionProps(patientWithState(true, 'disconnected', { modifiedTime: getDateInPast(7, 'hours') }), 'clinicianId', 'clinicID', noop);
    const dataConnectionError = getDataConnectionProps(patientWithState(true, 'error', { modifiedTime: getDateInPast(20, 'minutes') }), 'clinicianId', 'clinicID', noop);
    const dataConnectionUnknown = getDataConnectionProps(patientWithState(true, 'foo'), 'clinicianId', 'clinicID', noop);

    return (
      <React.Fragment>
        <Subheading>No Pending Connections</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionUnset[provider]}
            buttonHandler={dataConnectionUnset[provider]?.buttonText ? () => action(dataConnectionUnset[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Pending</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionPending[provider]}
            buttonHandler={dataConnectionPending[provider]?.buttonText ? () => action(dataConnectionPending[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Pending Reconnection</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionPendingReconnect[provider]}
            buttonHandler={dataConnectionPendingReconnect[provider]?.buttonText ? () => action(dataConnectionPendingReconnect[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Pending Expired</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionPendingExpired[provider]}
            buttonHandler={dataConnectionPendingExpired[provider]?.buttonText ? () => action(dataConnectionPendingExpired[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Connected</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionConnected[provider]}
            buttonHandler={dataConnectionConnected[provider]?.buttonText ? () => action(dataConnectionConnected[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Disconnected</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionDisconnected[provider]}
            buttonHandler={dataConnectionDisconnected[provider]?.buttonText ? () => action(dataConnectionDisconnected[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Error</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionError[provider]}
            buttonHandler={dataConnectionError[provider]?.buttonText ? () => action(dataConnectionError[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Unknown</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionUnknown[provider]}
            buttonHandler={dataConnectionUnknown[provider]?.buttonText ? () => action(dataConnectionUnknown[provider]?.buttonText)(provider) : undefined}
          />
        ))}
      </React.Fragment>
    );
  },

  name: 'Clinic User',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/LdoOQCUyQKIS2d6fUhfFJx/Cloud-to-Cloud?node-id=2212-18679&node-type=section&t=qP2OFSYnWA1USfSp-0',
    },
  },
};

export const PatientUser = {
  render: () => {
    const dataConnectionUnset = getDataConnectionProps(patientWithState(false), 'patientId', null, noop);
    const dataConnectionConnected = getDataConnectionProps(patientWithState(false, 'connected', { createdTime: getDateInPast(1, 'minutes') }), 'patientId', null, noop);
    const dataConnectionConnectedWithData = getDataConnectionProps(patientWithState(false, 'connected', { latestDataTime: getDateInPast(35, 'minutes') }), 'patientId', null, noop);
    const dataConnectionDisconnected = getDataConnectionProps(patientWithState(false, 'disconnected', { modifiedTime: getDateInPast(1, 'hour') }), 'patientId', null, noop);
    const dataConnectionError = getDataConnectionProps(patientWithState(false, 'error', { modifiedTime: getDateInPast(6, 'days') }), 'patientId', null, noop);
    const dataConnectionUnknown = getDataConnectionProps(patientWithState(false, 'foo'), 'patientId', null, noop);

    return (
      <React.Fragment>
        <Subheading>No Pending Connections</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionUnset[provider]}
            buttonHandler={dataConnectionUnset[provider]?.buttonText ? () => action(dataConnectionUnset[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Connected</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionConnected[provider]}
            buttonHandler={dataConnectionConnected[provider]?.buttonText ? () => action(dataConnectionConnected[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Connected With Data</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionConnectedWithData[provider]}
            buttonHandler={dataConnectionConnectedWithData[provider]?.buttonText ? () => action(dataConnectionConnectedWithData[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Disconnected</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionDisconnected[provider]}
            buttonHandler={dataConnectionDisconnected[provider]?.buttonText ? () => action(dataConnectionDisconnected[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Error</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionError[provider]}
            buttonHandler={dataConnectionError[provider]?.buttonText ? () => action(dataConnectionError[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} sx={{ color: 'border.dividerDark' }} />
        <Subheading>Unknown</Subheading>

        {map(providerNames, (provider, index) => (
          <DataConnection
            my={2}
            key={`provider-${index}`}
            {...dataConnectionUnknown[provider]}
            buttonHandler={dataConnectionUnknown[provider]?.buttonText ? () => action(dataConnectionUnknown[provider]?.buttonText)(provider) : undefined}
          />
        ))}
      </React.Fragment>
    );
  },

  name: 'Patient User',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/LdoOQCUyQKIS2d6fUhfFJx/Cloud-to-Cloud?node-id=2212-18679&node-type=section&t=qP2OFSYnWA1USfSp-0',
    },
  },
};

import React from 'react';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from '@emotion/react';
import moment from 'moment-timezone';
import map from 'lodash/map';
import noop from 'lodash/noop';

import baseTheme from '../app/themes/baseTheme';
import { activeProviders, getDataConnectionProps } from '../app/components/datasources/DataConnections';
import DataConnection from '../app/components/datasources/DataConnection';
import PatientDetails from '../app/components/datasources/PatientDetails';
import { Divider } from 'theme-ui';
import { Subheading } from '../app/components/elements/FontStyles';
import { clinicPatientFromAccountInfo } from '../app/core/personutils';
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

const getDateInPast = (amount, unit) => moment.utc().subtract(amount, unit).toISOString();

// TODO: one story for clinic context, one for patient
// Show each provider in the same state, for all states

export const ClinicUser = {
  render: () => {
    const dataConnectionUnset = getDataConnectionProps(patientWithState(true), false, 'clinicID', noop);
    const dataConnectionInviteJustSent = getDataConnectionProps(patientWithState(true, 'pending', { createdTime: getDateInPast(5, 'seconds') }), false, 'clinicID', noop);
    const dataConnectionPending = getDataConnectionProps(patientWithState(true, 'pending', { createdTime: getDateInPast(5, 'days') }), false, 'clinicID', noop);
    const dataConnectionPendingReconnect = getDataConnectionProps(patientWithState(true, 'pendingReconnect', { createdTime: getDateInPast(10, 'days') }), false, 'clinicID', noop);
    const dataConnectionPendingExpired = getDataConnectionProps(patientWithState(true, 'pending', { createdTime: getDateInPast(31, 'days'), expirationTime: getDateInPast(1, 'days') }), false, 'clinicID', noop);
    const dataConnectionConnected = getDataConnectionProps(patientWithState(true, 'connected'), false, 'clinicID', noop);
    const dataConnectionDisconnected = getDataConnectionProps(patientWithState(true, 'disconnected', { modifiedTime: getDateInPast(7, 'hours') }), false, 'clinicID', noop);
    const dataConnectionError = getDataConnectionProps(patientWithState(true, 'error', { modifiedTime: getDateInPast(20, 'minutes') }), false, 'clinicID', noop);
    const dataConnectionUnknown = getDataConnectionProps(patientWithState(true, 'foo'), false, 'clinicID', noop);

    return (
      <React.Fragment>
        <Subheading>No Pending Connections</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionUnset[provider]}
            buttonHandler={dataConnectionUnset[provider]?.buttonText ? () => action(dataConnectionUnset[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Invite Just Sent</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionInviteJustSent[provider]}
            buttonHandler={dataConnectionInviteJustSent[provider]?.buttonText ? () => action(dataConnectionInviteJustSent[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Pending</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionPending[provider]}
            buttonHandler={dataConnectionPending[provider]?.buttonText ? () => action(dataConnectionPending[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Pending Reconnection</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionPendingReconnect[provider]}
            buttonHandler={dataConnectionPendingReconnect[provider]?.buttonText ? () => action(dataConnectionPendingReconnect[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Pending Expired</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionPendingExpired[provider]}
            buttonHandler={dataConnectionPendingExpired[provider]?.buttonText ? () => action(dataConnectionPendingExpired[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Connected</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionConnected[provider]}
            buttonHandler={dataConnectionConnected[provider]?.buttonText ? () => action(dataConnectionConnected[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Disconnected</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionDisconnected[provider]}
            buttonHandler={dataConnectionDisconnected[provider]?.buttonText ? () => action(dataConnectionDisconnected[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Error</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionError[provider]}
            buttonHandler={dataConnectionError[provider]?.buttonText ? () => action(dataConnectionError[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Unknown</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
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
    const dataConnectionUnset = getDataConnectionProps(patientWithState(false), true, null, noop);
    const dataConnectionConnected = getDataConnectionProps(patientWithState(false, 'connected', { createdTime: getDateInPast(1, 'minutes') }), true, null, noop);
    const dataConnectionConnectedWithNoData = getDataConnectionProps(patientWithState(false, 'connected', { lastImportTime: getDateInPast(5, 'minutes') }), true, null, noop);
    const dataConnectionConnectedWithData = getDataConnectionProps(patientWithState(false, 'connected', { lastImportTime: getDateInPast(1, 'minutes'), latestDataTime: getDateInPast(35, 'minutes') }), true, null, noop);
    const dataConnectionDisconnected = getDataConnectionProps(patientWithState(false, 'disconnected', { modifiedTime: getDateInPast(1, 'hour') }), true, null, noop);
    const dataConnectionError = getDataConnectionProps(patientWithState(false, 'error', { modifiedTime: getDateInPast(6, 'days') }), true, null, noop);
    const dataConnectionUnknown = getDataConnectionProps(patientWithState(false, 'foo'), true, null, noop);

    return (
      <React.Fragment>
        <Subheading>No Pending Connections</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionUnset[provider]}
            buttonHandler={dataConnectionUnset[provider]?.buttonText ? () => action(dataConnectionUnset[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Connected</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionConnected[provider]}
            buttonHandler={dataConnectionConnected[provider]?.buttonText ? () => action(dataConnectionConnected[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Connected With No Data</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionConnectedWithNoData[provider]}
            buttonHandler={dataConnectionConnectedWithNoData[provider]?.buttonText ? () => action(dataConnectionConnectedWithNoData[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Connected With Data</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionConnectedWithData[provider]}
            buttonHandler={dataConnectionConnectedWithData[provider]?.buttonText ? () => action(dataConnectionConnectedWithData[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Disconnected</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionDisconnected[provider]}
            buttonHandler={dataConnectionDisconnected[provider]?.buttonText ? () => action(dataConnectionDisconnected[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Error</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
            key={`provider-${index}`}
            {...dataConnectionError[provider]}
            buttonHandler={dataConnectionError[provider]?.buttonText ? () => action(dataConnectionError[provider]?.buttonText)(provider) : undefined}
          />
        ))}

        <Divider pt={3} variant="styles.dividerDark" />
        <Subheading>Unknown</Subheading>

        {map(activeProviders, (provider, index) => (
          <DataConnection
            my={1}
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

export const PatientDetailBar = {
  render: () => {
    const clinicPatient = {
      fullName: 'Jonathan Jellyfish',
      birthDate: '1984-08-24',
      mrn: '123456',
    };

    const noMRNPatient = {
      fullName: 'James Jellyfish',
      birthDate: '1994-06-20',
    };

    const accountPatient = {
      profile: {
        fullName: 'Jill Jellyfish',
        patient: {
          birthday: '1988-07-04',
          mrn: '654321',
        }
      }
    };

    return (
      <React.Fragment>
        <PatientDetails mb={2} patient={clinicPatient} />
        <PatientDetails mb={2} patient={noMRNPatient} />
        <PatientDetails patient={clinicPatientFromAccountInfo(accountPatient)} />
      </React.Fragment>
    );
  },

  name: 'Patient Details',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/LdoOQCUyQKIS2d6fUhfFJx/Cloud-to-Cloud?node-id=2212-18679&node-type=section&t=qP2OFSYnWA1USfSp-0',
    },
  },
};

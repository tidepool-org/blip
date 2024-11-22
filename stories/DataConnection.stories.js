import React from 'react';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from '@emotion/react';
import map from 'lodash/map';

import baseTheme from '../app/themes/baseTheme';
import DataConnection from '../app/components/datasources/DataConnection';

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

function dataConnectionProps(providerName, state, modifiedTime, expirationTime) {
  return {
    dataSource: { providerName, state, expirationTime, modifiedTime },
  };
}

// TODO: one story for clinic context, one for patient
// Show each provider in the same state, for all states

export const DataConnectionStory = {
  render: () => {
    const bars = [
      dataConnectionProps('dexcom', 'connected'),
      // dataConnectionProps('dexcom', 'pending'),
    ];

    return (
      <React.Fragment>
        {map(bars, (bar, index) => (
          <DataConnection
            my={2}
            key={`bar-${index}`}
            label={`bar-${index}`}
            onSuccess={bar.actionText ? () => action(bar.actionText)() : undefined}
            {...bar}
          />
        ))}
      </React.Fragment>
    );
  },

  name: 'DataConnection',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/LdoOQCUyQKIS2d6fUhfFJx/Cloud-to-Cloud?node-id=2212-18679&node-type=section&t=qP2OFSYnWA1USfSp-0',
    },
  },
};

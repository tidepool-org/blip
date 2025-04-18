import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { Box, Flex } from 'theme-ui';
import map from 'lodash/map';
import { action } from '@storybook/addon-actions';

import baseTheme from '../app/themes/baseTheme';
import Card from '../app/components/elements/Card';
import UploaderBanner from '../app/components/elements/Card/Banners/Uploader.png';
import DataConnectionsBanner from '../app/components/elements/Card/Banners/DataConnections.png';

/* eslint-disable max-len */

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Box variant="containers.largeBordered" p={3}>
      <Story />
    </Box>
  </ThemeProvider>
);

export default {
  title: 'Cards',
  decorators: [withTheme],
};

export const Cards = {
  render: () => {
    const cards = [
      {
        title: 'Connect a Device Account',
        subtitle: 'Does your patient use a Dexcom or twiist device? Automatically sync data from those devices with the patient\'s permission.',
        bannerImage: DataConnectionsBanner,
        onClick: action('Connect a Device'),
      },
      {
        title: 'Upload Data Directly with Tidepool Uploader',
        subtitle: 'Tidepool Uploader supports over 85 devices. Download Tidepool Uploader to get started.',
        bannerImage: UploaderBanner,
        onClick: action('Get Uploader'),
      },
    ];

    return (
      <Flex sx={{ gap: 3, flexWrap: ['wrap', null, 'nowrap'] }}>
        {map(cards, card => <Card {...card} />)}
      </Flex>
    );
  },

  name: 'Default',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/LdoOQCUyQKIS2d6fUhfFJx/Cloud-to-Cloud?node-id=2044-16648&t=uxeFnlP3CHzgkNRt-0',
    },
  },
};

export const HorizontalCards = {
  render: () => {
    const cards = [
      {
        title: 'Connect a Device Account',
        subtitle: 'Does your patient use a Dexcom or twiist device? Automatically sync data from those devices with the patient\'s permission.',
        bannerImage: DataConnectionsBanner,
        onClick: action('Connect a Device'),
      },
      {
        title: 'Upload Data Directly with Tidepool Uploader',
        subtitle: 'Tidepool Uploader supports over 85 devices. Download Tidepool Uploader to get started.',
        bannerImage: UploaderBanner,
        onClick: action('Get Uploader'),
      },
    ];

    return (
      <Flex sx={{ flexDirection: 'column', gap: 3 }}>
        {map(cards, card => <Card variant="containers.cardHorizontal" {...card} />)}
      </Flex>
    );
  },

  name: 'Horizontal',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/LdoOQCUyQKIS2d6fUhfFJx/Cloud-to-Cloud?node-id=2044-16648&t=uxeFnlP3CHzgkNRt-0',
    },
  },
};

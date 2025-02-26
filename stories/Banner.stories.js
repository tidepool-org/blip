import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';
import map from 'lodash/map';

import baseTheme from '../app/themes/baseTheme';
import Banner from '../app/components/elements/Banner';

/* eslint-disable max-len */

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Banner',
  decorators: [withTheme],
};

const bannerTitleText = () =>
  text(
    'Banner Title Text',
    'Consectetur adipiscing elit, sed do eiusmod tempor.'
  );

const bannerMessageText = () =>
  text(
    'Banner Message Text',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.'
  );

function createBanner(message, title, variant, dismissable = true, actionText = '', messageLinkText = '') {
  return { message, title, variant, dismissable, actionText, messageLinkText };
}

export const BannerStory = {
  render: () => {
    const [alerts, setAlerts] = useState([
      createBanner(bannerMessageText(), null, 'info'),
      createBanner(bannerMessageText(), null, 'info', false),
      createBanner(bannerMessageText(), null, 'info', true, 'Info Action'),
      createBanner(bannerMessageText(), bannerTitleText(), 'info', false, null, 'Message Link'),
      createBanner(bannerMessageText(), null, 'warning'),
      createBanner(bannerMessageText(), null, 'warning', false),
      createBanner(bannerMessageText(), null, 'warning', true, 'Warning Action'),
      createBanner(bannerMessageText(), bannerTitleText(), 'warning', false, null, 'Message Link'),
      createBanner(bannerMessageText(), null, 'danger'),
      createBanner(bannerMessageText(), null, 'danger', false),
      createBanner(bannerMessageText(), null, 'danger', true, 'Danger Action'),
      createBanner(bannerMessageText(), bannerTitleText(), 'danger', false, null, 'Message Link'),
      createBanner(bannerMessageText(), null, 'success'),
      createBanner(bannerMessageText(), null, 'success', false),
      createBanner(bannerMessageText(), null, 'success', true, 'Success Action'),
      createBanner(bannerMessageText(), bannerTitleText(), 'success', false, null, 'Message Link'),
    ]);

    const handleDismissed = (index) => {
      alerts.splice(index, 1);
      setAlerts([...alerts]);
    };

    return (
      <React.Fragment>
        {map(alerts, (alert, index) => (
          <Banner
            my={2}
            key={`banner-${index}`}
            label={`banner-${index}`}
            onDismiss={() => () => handleDismissed(index)}
            onAction={alert.actionText ? () => action(alert.actionText)() : undefined}
            {...alert}
          />
        ))}
      </React.Fragment>
    );
  },

  name: 'Banner',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=1206%3A0',
    },
  },
};

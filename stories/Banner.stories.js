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

const bannerText = () =>
  text(
    'Banner Text',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.'
  );
const bannerTextDanger = () =>
  text(
    'Banner Text Danger',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.'
  );
const bannerTextWarning = () =>
  text(
    'Banner Text Warning',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.'
  );
const bannerTextSuccess = () =>
  text(
    'Banner Text Success',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.'
  );

function createBanner(message, variant, dismissable = true, actionText) {
  return { message, variant, dismissable, actionText };
}

export const BannerStory = {
  render: () => {
    const [alerts, setAlerts] = useState([
      createBanner(bannerText(), 'info'),
      createBanner(bannerText(), 'info', false),
      createBanner(bannerText(), 'info', true, 'Info Action'),
      createBanner(bannerTextWarning(), 'warning'),
      createBanner(bannerTextWarning(), 'warning', false),
      createBanner(bannerTextWarning(), 'warning', true, 'Warning Action'),
      createBanner(bannerTextDanger(), 'danger'),
      createBanner(bannerTextDanger(), 'danger', false),
      createBanner(bannerTextDanger(), 'danger', true, 'Danger Action'),
      createBanner(bannerTextSuccess(), 'success'),
      createBanner(bannerTextSuccess(), 'success', false),
      createBanner(bannerTextSuccess(), 'success', true, 'Success Action'),
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

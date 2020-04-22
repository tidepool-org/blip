import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import map from 'lodash/map';

import baseTheme from '../app/themes/baseTheme';
import Banner from '../app/components/elements/Banner';

/* eslint-disable max-len */

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Banner',
  decorators: [withDesign, withKnobs, withTheme],
};

const bannerText = () => text('Banner Text', 'Fluffer ur givin me a spook. lotsa pats smol borking doggo with shooberino boofers. Fluffer ur givin me a spook. lotsa pats smol borking doggo with shooberino boofers. ');
const bannerTextDanger = () => text('Banner Text Danger', 'Wrinkler h*ck doggorino. He made many woofs mlem, many pats.');
const bannerTextWarning = () => text('Banner Text Warning', 'Wrinkler h*ck doggorino clouds, you are doing me a frighten.');

function createBanner(message, variant, dismissable = true) {
  return { message, variant, dismissable };
}

export const BannerStory = () => {
  const [alerts, setAlerts] = useState([
    createBanner(bannerText(), 'default'),
    createBanner(bannerText(), 'default', false),
    createBanner(bannerTextWarning(), 'warning'),
    createBanner(bannerTextWarning(), 'warning', false),
    createBanner(bannerTextDanger(), 'danger'),
    createBanner(bannerTextDanger(), 'danger', false),
  ]);

  const handleDismissed = index => {
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
          {...alert}
        />
      ))}
    </React.Fragment>
  );
};

BannerStory.story = {
  name: 'Banner',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=1206%3A0',
    },
  },
};

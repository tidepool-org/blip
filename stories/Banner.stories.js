import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from 'styled-components';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';

import baseTheme from '../app/themes/baseTheme';
import Banner from '../app/components/elements/Banner';
import Icon from '../app/components/elements/Icon';

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
const bannerTextNoIcon = () => text('Banner Text', 'Fluffer ur givin me a spook. lotsa pats smol borking doggo with shooberino boofers. Fluffer ur givin me a spook. lotsa pats smol borking doggo with shooberino boofers. ');


export const BannerStory = () => (

  <React.Fragment>
    <Banner my={2} message={bannerText()} onClick={action('onClick called')}>
      <Icon icon={InfoIcon} variant="banner" />
    </Banner>
    <Banner my={2} variant="danger" message={bannerTextDanger()}>
      <Icon icon={WarningIcon} variant="banner" />
    </Banner>
    <Banner my={2} variant="warning" message={bannerTextWarning()}>
      <Icon icon={WarningIcon} variant="banner" />
    </Banner>
    <Banner my={2} message={bannerTextNoIcon()} />
    <Banner my={2} variant="warning" message={bannerTextWarning()} dismissable="true">
      <Icon icon={WarningIcon} variant="banner" />
    </Banner>
    <Banner my={2} message={bannerTextNoIcon()} dismissable="true" />
  </React.Fragment>
);

BannerStory.story = {
  name: 'Banner',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=1206%3A0',
    },
  },
};

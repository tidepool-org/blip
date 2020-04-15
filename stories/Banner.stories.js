import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Text } from 'rebass/styled-components';

import baseTheme from '../app/themes/baseTheme';
import { Body2 } from '../app/components/elements/FontStyles';
// import Avatar from '../app/components/elements/Avatar';
import Banner from '../app/components/elements/Banner';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Banner',
  decorators: [withDesign, withKnobs, withTheme],
};

const bannerText = () => text('Banner Text', 'Fluffer ur givin me a spook. lotsa pats smol borking doggo with shooberino boofers. ');
const bannerText2 = () => text('Banner Text 2', 'He made many woofs mlem, many pats. Wrinkler h*ck doggorino clouds, you are doing me a frighten.');

export const BannerStory = () => (
  // <React.Fragment>
  //   <Body2>
  //     {bannerText()}
  //   </Body2>
  // </React.Fragment>
    <React.Fragment>
      <Banner my={2} />
      <Banner my={2} variant="inverse" />
      <Banner my={2} backgroundColor="oranges.2" />
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

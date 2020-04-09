import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text, color } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Avatar from '../app/components/elements/Avatar';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Avatar',
  decorators: [withDesign, withKnobs, withTheme],
};

const initials = () => text('Initials', 'JJ');
const bgColor = () => color('Background Color', '#FAE2E2');

export const AvatarStory = () => (
  <Avatar
    bgColor={bgColor()}
    initials={initials()}
  />
);

AvatarStory.story = {
  name: 'Basic Avatar',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=9%3A0',
    },
  },
};

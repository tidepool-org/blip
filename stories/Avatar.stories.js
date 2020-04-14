import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text, color } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Avatar from '../app/components/elements/Avatar';
import Avatar2 from '../app/components/elements/Avatar2';

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
const bgColor = () => color('Background Color', '#BFE8F9');
const textColor = () => color('Text Color', '#4F6A92');

export const AvatarStory = () => (
  <React.Fragment>
    <Avatar
      bgColor={bgColor()}
      initials={initials()}
      textColor={textColor()}
    />
    <Avatar2 my={2} />
    <Avatar2 my={2} variant="orange" />
    <Avatar2 my={2} variant="blue" backgroundColor="purples.4" color="white" />
  </React.Fragment>
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

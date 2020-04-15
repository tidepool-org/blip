import React from 'react';

import { withDesign } from 'storybook-addon-designs';
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
  decorators: [withDesign, withTheme],
};

export const AvatarStory = () => (
  <React.Fragment>
    <Avatar my={2} />
    <Avatar my={2} variant="inverse" />
    <Avatar my={2} backgroundColor="oranges.2" />
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

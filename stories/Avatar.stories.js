import React from 'react';
import { ThemeProvider } from '@emotion/react';

import baseTheme from '../app/themes/baseTheme';
import Avatar from '../app/components/elements/Avatar';

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Avatar',
  decorators: [withTheme],
};

export const AvatarStory = {
  render: () => (
    <React.Fragment>
      <Avatar initials="JJ" my={2} />
      <Avatar initials="PP" my={2} variant="inverse" />
      <Avatar initials="OO" my={2} backgroundColor="oranges.2" />
    </React.Fragment>
  ),

  name: 'Basic Avatar',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=9%3A0',
    },
  },
};

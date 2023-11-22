import React from 'react';


import { text } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';
import { Link } from 'theme-ui';

import baseTheme from '../app/themes/baseTheme';

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Text Link',
  component: Link,
  decorators: [withTheme],
};

const linkText = () => text('Link Text', 'Link Text');
const link = () => text('URL', '');

export const TextLinkStory = {
  render: () => <Link to={link()}>{linkText()}</Link>,

  name: 'Basic Link',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=986%3A140',
    },
  },
};

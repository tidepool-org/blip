import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Link } from 'rebass/styled-components';

import baseTheme from '../app/themes/baseTheme';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Text Link',
  component: Link,
  decorators: [withDesign, withKnobs, withTheme],
};

const linkText = () => text('Link Text', 'Link Text');
const link = () => text('URL', '');

export const TextLinkStory = () => (
  <Link href={link()}>
    {linkText()}
  </Link>
);

TextLinkStory.story = {
  name: 'Basic Link',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=986%3A140',
    },
  },
};

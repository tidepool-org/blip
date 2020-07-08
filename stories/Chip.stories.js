import React from 'react';

import { Flex } from 'rebass/styled-components';
import { withDesign } from 'storybook-addon-designs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Chip from '../app/components/elements/Chip';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Chip',
  decorators: [withDesign, withTheme],
};

export const ChipStory = () => (
  <Flex flexWrap="wrap" justifyContent="center">
    <Chip text="default" />
    <Chip text="hover" variant="hover" />
    <Chip text="active" variant="active" />
    <Chip text="focus" variant="focus" />
    <Chip text="selected" variant="selected" />
    <Chip text="disabled" variant="disabled" />
  </Flex>
);

ChipStory.story = {
  name: 'Basic Chip',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=2517%3A161',
    },
  },
};

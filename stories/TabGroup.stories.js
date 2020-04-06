import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import {TabGroup, tabProps, tabPanelProps} from '../app/components/elements/TabGroup';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { Box } from 'rebass/styled-components';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Tabs',
  decorators: [withDesign, withKnobs, withTheme],
};

const tabDisabled = i => boolean(`Tab ${i+1} Disabled`, false);

export const TabGroupStory = () => {
  const [selected, setSelected] = React.useState(0);

  const handleChange = (event, newValue) => {
    setSelected(newValue);
  };

  const tabGroupProps = {
    id: 'my-tab-group',
    tabs: [
      {
        label: 'One',
        disabled: tabDisabled(0)
      },
      {
        label: 'Two',
        disabled: tabDisabled(1)
      },
      {
        label: 'Three',
        disabled: tabDisabled(2)
      },
    ],
    onChange: handleChange,
    value: selected,
    'aria-label': 'My Tab Group',
  };

  return (
    <TabGroup {...tabGroupProps}>
      <Box>
        Content 1
      </Box>
      <Box>
        Content 2
      </Box>
      <Box>
        Content 3
      </Box>
    </TabGroup>
  );
};

TabGroupStory.story = {
  name: 'Tab Group',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A131',
    },
  },
};

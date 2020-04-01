import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
// import { default as Tabs, Tab } from '../app/components/elements/Tabs';

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

const tab1disabled = () => boolean('Tab 1 Disabled', false);
const tab2disabled = () => boolean('Tab 2 Disabled', false);
const tab3disabled = () => boolean('Tab 3 Disabled', false);

function tabProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function panelProps(value, index) {
  return {
    role: 'tabpanel',
    hidden: value !== index,
    id: `simple-tabpanel-${index}`,
    'aria-labelledby': `simple-tab-${index}`,
  };
}

export const TabGroup = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <React.Fragment>
      <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
        <Tab label="One" {...tabProps(0)} disabled={tab1disabled()} />
        <Tab label="Two" {...tabProps(1)} disabled={tab2disabled()} />
        <Tab label="Three" {...tabProps(2)} disabled={tab3disabled()} />
      </Tabs>
      <Box {...panelProps(value, 0)}>
        Content 1
      </Box>
      <Box {...panelProps(value, 1)}>
        Content 2
      </Box>
      <Box {...panelProps(value, 2)}>
        Content 3
      </Box>
    </React.Fragment>
  );
};

TabGroup.story = {
  name: 'Tab Group',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A131',
    },
  },
};

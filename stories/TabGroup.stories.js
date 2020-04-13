import React from 'react';
import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Box } from 'rebass/styled-components';
import MoreHorizRoundedIcon from '@material-ui/icons/MoreHorizRounded';
import NotificationsRoundedIcon from '@material-ui/icons/NotificationsRounded';

import baseTheme from '../app/themes/baseTheme';
import TabGroup from '../app/components/elements/TabGroup';
import Icon from '../app/components/elements/Icon';

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

const tabDisabled = i => boolean(`Tab ${i + 1} Disabled`, false);

const orientations = {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
};

const backgrounds = {
  None: 'transparent',
  'Light Grey': 'lightGrey',
};

const orientation = () => options('Tabs Orientation', orientations, 'horizontal', { display: 'inline-radio' });
const background = () => options('Tabs Background', backgrounds, 'transparent', { display: 'inline-radio' });

export const TabGroupStory = () => {
  const [selected, setSelected] = React.useState(0);

  const handleChange = (event, newValue) => {
    setSelected(newValue);
  };

  const props = {
    tabs: [
      {
        label: 'One',
        disabled: tabDisabled(0),
      },
      {
        icon: <Icon label="notifications" icon={NotificationsRoundedIcon} />,
        disabled: tabDisabled(1),
      },
      {
        icon: <Icon label="more" icon={MoreHorizRoundedIcon} />,
        label: 'Three',
        disabled: tabDisabled(2),
      },
      {
        label: 'Four',
      },
      {
        label: 'Five',
      },
      {
        label: 'Six',
      },
    ],
    variant: orientation(),
    'aria-label': 'My Tab Group',
    id: 'my-tab-group',
    onChange: handleChange,
    value: selected,
    themeProps: {
      wrapper: {
        margin: 2,
        sx: {
          border: '1px solid #eee',
        },
      },
      panel: {
        padding: 3,
        minHeight: '20em',
      },
      tabs: {
        backgroundColor: background(),
      },
    },
  };

  return (
    <TabGroup {...props}>
      <Box>
        Content 1
      </Box>
      <Box>
        Content 2
      </Box>
      <Box>
        Content 3
      </Box>
      <Box>
        Content 4
      </Box>
      <Box>
        Content 5
      </Box>
      <Box>
        Content 6
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

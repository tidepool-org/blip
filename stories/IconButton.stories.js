import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MoreHorizRoundedIcon from '@material-ui/icons/MoreHorizRounded';
import NotificationsRoundedIcon from '@material-ui/icons/NotificationsRounded';

import baseTheme from '../app/themes/baseTheme';
import IconButton from '../app/components/elements/IconButton';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Icon Buttons',
  decorators: [withDesign, withKnobs, withTheme],
};

const disabled = () => boolean('Disabled', false);

export const Icon = () => {

  return (
    <React.Fragment>
      <IconButton
        label="Close"
        icon={CloseRoundedIcon}
        onClick={action('onClick called')}
        disabled={disabled()}
      />
      <IconButton
        sx={{
          color: 'mediumPurple',
          mr: '10px',
        }}
        label="More"
        icon={MoreHorizRoundedIcon}
        onClick={action('onClick called')}
        disabled={disabled()}
      />
      <IconButton
        label="Close"
        icon={NotificationsRoundedIcon}
        onClick={action('onClick called')}
        disabled={disabled()}
      />
    </React.Fragment>
  );
};

Icon.story = {
  name: 'Simple',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};



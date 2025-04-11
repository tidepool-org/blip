import React from 'react';

import { action } from '@storybook/addon-actions';
import { boolean as bool } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MoreHorizRoundedIcon from '@material-ui/icons/MoreHorizRounded';
import NotificationsRoundedIcon from '@material-ui/icons/NotificationsRounded';

import baseTheme from '../app/themes/baseTheme';
import Icon from '../app/components/elements/Icon';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Icons',
  decorators: [withTheme],
};

const disabled = () => bool('Disabled', false);

export const Default = {
  render: () => (
    <React.Fragment>
      <Icon
        sx={{
          mr: '10px',
        }}
        label="Close"
        icon={CloseRoundedIcon}
        onClick={action('onClick called')}
        disabled={disabled()}
      />
      <Icon
        color="mediumPurple"
        mr="10px"
        label="More"
        icon={MoreHorizRoundedIcon}
        onClick={action('onClick called')}
        disabled={disabled()}
      />
      <Icon
        sx={{
          fontSize: '40px',
        }}
        label="Close"
        icon={NotificationsRoundedIcon}
        onClick={action('onClick called')}
        disabled={disabled()}
      />
    </React.Fragment>
  ),

  name: 'Default',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=11%3A2',
    },
  },
};

export const Button = {
  render: () => (
    <React.Fragment>
      <Icon
        variant="button"
        sx={{
          mr: '10px',
        }}
        label="Close"
        icon={CloseRoundedIcon}
        onClick={action('onClick called')}
        disabled={disabled()}
      />
      <Icon
        variant="button"
        color="mediumPurple"
        mr="10px"
        label="More"
        icon={MoreHorizRoundedIcon}
        onClick={action('onClick called')}
        disabled={disabled()}
      />
      <Icon
        variant="button"
        sx={{
          fontSize: '40px',
        }}
        label="Close"
        icon={NotificationsRoundedIcon}
        onClick={action('onClick called')}
        disabled={disabled()}
      />
    </React.Fragment>
  ),

  name: 'Button',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=11%3A2',
    },
  },
};

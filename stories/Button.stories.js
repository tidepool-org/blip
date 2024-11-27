import React from 'react';
import { action } from '@storybook/addon-actions';
import { boolean as bool, text } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { Flex } from 'theme-ui';

import baseTheme from '../app/themes/baseTheme';
import Button from '../app/components/elements/Button';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Buttons',
  decorators: [withTheme],
};

const disabled = () => bool('Disabled', false);
const processing = () => bool('Processing', false);

export const Primary = {
  render: () => {
    const buttonText = () => text('Button Text', 'Primary');

    const [selected, setSelected] = React.useState(false);

    return (
      <Button
        variant="primary"
        disabled={disabled()}
        processing={processing()}
        selected={selected}
        onClick={() => setSelected(!selected)}
        >
        {buttonText()}
      </Button>
    );
  },

  name: 'Primary',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};

export const Secondary = {
  render: () => {
    const buttonText = () => text('Button Text', 'Secondary');

    return (
      <Button
        variant="secondary"
        disabled={disabled()}
        onClick={action('onClick called')}
        processing={processing()}
        >
        {buttonText()}
      </Button>
    );
  },

  name: 'Secondary',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};

export const Tertiary = {
  render: () => {
    const buttonText = () => text('Button Text', 'Tertiary');

    return (
      <Button
        variant="tertiary"
        disabled={disabled()}
        onClick={action('onClick called')}
        processing={processing()}
        >
        {buttonText()}
      </Button>
    );
  },

  name: 'Tertiary',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};

export const Text = {
  render: () => {
    const buttonPrimaryText = () => text('Primary Button Text', 'Apply');
    const buttonSecondaryText = () => text('Secondary Button Text', 'Cancel');

    return (
      <Flex>
        <Button
          mr={2}
          variant="textSecondary"
          disabled={disabled()}
          onClick={action('onClick called')}
          processing={processing()}
        >
          {buttonSecondaryText()}
        </Button>
        <Button
          variant="textPrimary"
          disabled={disabled()}
          onClick={action('onClick called')}
          processing={processing()}
        >
          {buttonPrimaryText()}
        </Button>
      </Flex>
    );
  },

  name: 'Text',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};

export const Filter = {
  render: () => {
    const buttonText = () => text('Button Text', 'Filter');
    const selected = () => bool('Selected', false);

    return (
      <Button
        variant="filter"
        selected={selected()}
        disabled={disabled()}
        onClick={action('onClick called')}
        processing={processing()}
        icon={KeyboardArrowDownRoundedIcon}
        iconLabel="Open filters"
        >
        {buttonText()}
      </Button>
    );
  },

  name: 'Filter',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=987%3A145',
    },
  },
};

export const Chip = {
  render: () => {
    const button1Text = () => text('Chip 1 Text', 'Chip 1');
    const button2Text = () => text('Chip 2 Text', 'Chip 2');
    const [selectedChip, setSelectedChip] = React.useState();

    return (
      <Flex>
        <Button
          mr={2}
          variant="chip"
          disabled={disabled()}
          selected={selectedChip === 'chip1'}
          onClick={() => setSelectedChip('chip1')}
          processing={processing()}
        >
          {button1Text()}
        </Button>
        <Button
          variant="chip"
          disabled={disabled()}
          selected={selectedChip === 'chip2'}
          onClick={() => setSelectedChip('chip2')}
          processing={processing()}
        >
          {button2Text()}
        </Button>
      </Flex>
    );
  },

  name: 'Chip',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=2517%3A161',
    },
  },
};

export const Icon = {
  render: () => {
    const buttonText = () => text('Button Text', 'Primary');

    const [selected, setSelected] = React.useState(false);

    return (
      <Button
        variant="primary"
        disabled={disabled()}
        processing={processing()}
        selected={selected}
        onClick={() => setSelected(!selected)}
        icon={OpenInNewRoundedIcon}
        iconLabel="Open in new tab"
        >
        {buttonText()}
      </Button>
    );
  },

  name: 'Icon',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};

export const Large = {
  render: () => {
    const buttonText = () => text('Button Text', 'Large');

    const [selected, setSelected] = React.useState(false);

    return (
      <Button
        variant="large"
        disabled={disabled()}
        processing={processing()}
        selected={selected}
        onClick={() => setSelected(!selected)}
        >
        {buttonText()}
      </Button>
    );
  },

  name: 'Large',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};

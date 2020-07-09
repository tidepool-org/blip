import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import { Flex } from 'rebass/styled-components';

import baseTheme from '../app/themes/baseTheme';
import Button from '../app/components/elements/Button';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Buttons',
  decorators: [withDesign, withKnobs, withTheme],
};

const disabled = () => boolean('Disabled', false);
const processing = () => boolean('Processing', false);
const active = () => boolean('Active', false);

export const Primary = () => {
  const buttonText = () => text('Button Text', 'Primary');

  return (
    <React.Fragment>
      <Button
        variant="primary"
        disabled={disabled()}
        onClick={action('onClick called')}
        processing={processing()}
      >
        {buttonText()}
      </Button>
    </React.Fragment>
  );
};

Primary.story = {
  name: 'Primary',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};

export const Secondary = () => {
  const buttonText = () => text('Button Text', 'Secondary');

  return (
    <React.Fragment>
      <Button
        variant="secondary"
        disabled={disabled()}
        onClick={action('onClick called')}
        processing={processing()}
      >
        {buttonText()}
      </Button>
    </React.Fragment>
  );
};

Secondary.story = {
  name: 'Secondary',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};

export const Text = () => {
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
};

Text.story = {
  name: 'Text',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=3%3A2',
    },
  },
};

export const Filter = () => {
  const buttonText = () => text('Button Text', 'Filter');

  return (
    <React.Fragment>
      <Button
        variant="filter"
        active={active()}
        disabled={disabled()}
        onClick={action('onClick called')}
        processing={processing()}
        icon={KeyboardArrowDownRoundedIcon}
        iconLabel="Open filters"
      >
        {buttonText()}
      </Button>
    </React.Fragment>
  );
};

Filter.story = {
  name: 'Filter',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=987%3A145',
    },
  },
};

export const Chip = () => {
  const button1Text = () => text('Chip 1 Text', 'Chip 1');
  const button2Text = () => text('Chip 2 Text', 'Chip 2');
  const [activeChip, setActiveChip] = React.useState();

  return (
    <Flex>
      <Button
        mr={2}
        variant="chip"
        disabled={disabled()}
        active={activeChip === 'chip1'}
        onClick={() => setActiveChip('chip1')}
        processing={processing()}
      >
        {button1Text()}
      </Button>
      <Button
        variant="chip"
        disabled={disabled()}
        active={activeChip === 'chip2'}
        onClick={() => setActiveChip('chip2')}
        processing={processing()}
      >
        {button2Text()}
      </Button>
    </Flex>
  );
};

Chip.story = {
  name: 'Chip',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=2517%3A161',
    },
  },
};

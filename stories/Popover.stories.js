import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import {
  usePopupState,
  bindTrigger,
  bindPopover,
} from 'material-ui-popup-state/hooks'

import baseTheme from '../app/themes/baseTheme';
import Popover from '../app/components/elements/Popover';
import { IconButton } from '../app/components/elements/IconButton';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import { Body1, Subheading } from '../app/components/elements/FontStyles';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Popovers',
  decorators: [withDesign, withKnobs, withTheme],
};

export const Simple = () => {
  const disableScrollLock = () => boolean('Disable Scroll Lock', true);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });

  return (
    <React.Fragment>
      <IconButton label="info" icon={InfoRoundedIcon} {...bindTrigger(popupState)} />
      <Popover
        {...bindPopover(popupState)}
        disableScrollLock={disableScrollLock()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Subheading>
          Insulin Sensitivity Factor
        </Subheading>
        <Body1>
          The insulin sensitivity factor (ISF) governs the expected drop in blood glucose given one unit of insulin.
        </Body1>
      </Popover>
    </React.Fragment>
  );
};

Simple.story = {
  name: 'Simple',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=0%3A1',
    },
  },
};

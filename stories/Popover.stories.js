import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Text } from 'rebass/styled-components';

import {
  usePopupState,
  bindHover,
  bindPopover,
  bindTrigger,
} from 'material-ui-popup-state/hooks';

import baseTheme from '../app/themes/baseTheme';
import Popover from '../app/components/elements/Popover';
import { Icon } from '../app/components/elements/Icon';
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
  const onHover = () => boolean('Trigger On Hover', false);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });

  return (
    <React.Fragment>
      <Text color="text.primary">
        <Icon
          variant="icons.static"
          label="info"
          icon={InfoRoundedIcon}
          {...(onHover() ? bindHover(popupState) : bindTrigger(popupState))}
        />
      </Text>
      <Popover {...bindPopover(popupState)}>
        <Subheading>
            Insulin Sensitivity Factor
        </Subheading>
        <Body1>
          <Text color="text.primarySubdued">
            The insulin sensitivity factor (ISF) governs the expected drop in blood glucose given one unit of insulin.
          </Text>
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
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A379',
    },
  },
};

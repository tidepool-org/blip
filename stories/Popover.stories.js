import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Box, Text } from 'rebass/styled-components';

import {
  usePopupState,
  bindHover,
  bindPopover,
  bindTrigger,
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
  const disableScrollLock = () => boolean('Disable Scroll Lock', false);
  const onHover = () => boolean('Trigger On Hover', false);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });

  return (
    <React.Fragment>
      <Popover
        {...bindPopover(popupState)}
        disableScrollLock={disableScrollLock()}
      >
        <Subheading>
          <Text fontWeight='bold'>
            Insulin Sensitivity Factor
          </Text>
        </Subheading>
        <Body1>
          The insulin sensitivity factor (ISF) governs the expected drop in blood glucose given one unit of insulin.
        </Body1>
      </Popover>

      <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo aut nam dolores repudiandae aliquid! Iure magnam enim minima aut nihil hic ad minus, deserunt porro delectus dolore! Eum, possimus? Dolorem!</Body1>
      <Box as='span' {...(onHover() ? bindHover(popupState) : bindTrigger(popupState))}>
        <IconButton
          label="info"
          icon={InfoRoundedIcon}
        />
      </Box>
      <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo aut nam dolores repudiandae aliquid! Iure magnam enim minima aut nihil hic ad minus, deserunt porro delectus dolore! Eum, possimus? Dolorem!</Body1>
      <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo aut nam dolores repudiandae aliquid! Iure magnam enim minima aut nihil hic ad minus, deserunt porro delectus dolore! Eum, possimus? Dolorem!</Body1>
      <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo aut nam dolores repudiandae aliquid! Iure magnam enim minima aut nihil hic ad minus, deserunt porro delectus dolore! Eum, possimus? Dolorem!</Body1>
      <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo aut nam dolores repudiandae aliquid! Iure magnam enim minima aut nihil hic ad minus, deserunt porro delectus dolore! Eum, possimus? Dolorem!</Body1>
      <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo aut nam dolores repudiandae aliquid! Iure magnam enim minima aut nihil hic ad minus, deserunt porro delectus dolore! Eum, possimus? Dolorem!</Body1>
      <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo aut nam dolores repudiandae aliquid! Iure magnam enim minima aut nihil hic ad minus, deserunt porro delectus dolore! Eum, possimus? Dolorem!</Body1>
      <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo aut nam dolores repudiandae aliquid! Iure magnam enim minima aut nihil hic ad minus, deserunt porro delectus dolore! Eum, possimus? Dolorem!</Body1>
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

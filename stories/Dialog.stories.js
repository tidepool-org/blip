import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Dialog from '../app/components/elements/Dialog';
import Button from '../app/components/elements/Button';
import { Body1, Title } from '../app/components/elements/FontStyles';

// This silly decorator allows the components to properly re-render when knob values are changed
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Dialogs',
  decorators: [withDesign, withKnobs, withTheme],
};

export const DialogStory = () => {
  const getInitialOpen = () => boolean('Initially Open', true);
  const getTitle = () => text('Dialog Title', 'Dialog Title');


  const TriggerElement = props => (
    <Button variant="primary" {...props}>
      Open Dialog
    </Button>
  );

  const TitleElement = props => (
    <Title {...props}>{unescape(getTitle())}</Title>
  );

  return (
    <Dialog
      id="confirmDialog"
      initialOpen={getInitialOpen()}
      titleElement={TitleElement}
      triggerElement={TriggerElement}
      onSubmit={() => console.log('Submitted')}
      onClose={() => console.log('Closed')}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
    >
      <Body1>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </Body1>
      <Body1>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </Body1>
    </Dialog>
  );
};

DialogStory.story = {
  name: 'Confirmation',
  parameters: {
    design: {
      type: 'iframe',
      // url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=8%3A826',
      url: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FiuXkrpuLTXExSnuPJE3Jtn%2FTidepool-Design-System-Sprint-1%3Fnode-id%3D8%253A826',
    },
  },
};

import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../app/components/elements/Dialog';
import Button from '../app/components/elements/Button';
import { Body1, Title } from '../app/components/elements/FontStyles';

/* eslint-disable max-len */

// Wrap each story component with the base theme
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

  const [open, setOpen] = useState(getInitialOpen());

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSubmit = () => setOpen(false);

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Dialog
      </Button>

      <Dialog
        id="confirmDialog"
        open={open}
        onClose={handleClose}
        // Disabled focus to allow DialogTitle text knob to focus. Should not disable in regular use
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
      >
        <DialogTitle onClose={handleClose}>
          <Title>{getTitle()}</Title>
        </DialogTitle>

        <DialogContent>
          <Body1>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

DialogStory.story = {
  name: 'Confirmation',
  parameters: {
    design: {
      type: 'iframe',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=8%3A826',
    },
  },
};

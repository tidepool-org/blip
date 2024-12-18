import React, { useState } from 'react';
import { boolean as bool, text, number } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';

import baseTheme from '../app/themes/baseTheme';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '../app/components/elements/Dialog';
import Button from '../app/components/elements/Button';
import { Paragraph1, MediumTitle } from '../app/components/elements/FontStyles';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Dialogs',
  decorators: [withTheme],
};

export const DialogStory = {
  render: () => {
    const initiallyOpen = () => bool('Initially Open', true);

    const showTitle = () => bool('Show Title', true);
    const showTitleClose = () => bool('Show Close Icon', true);
    const titleText = () => text('Title Text', 'Dialog Title');

    const showContent = () => bool('Show Content', true);
    const showDividers = () => bool('Show Dividers', true);
    const numberOfParagraphs = () => number('Number of Paragraphs', 2, {});

    const getParagraphs = () => {
      const paragraphs = [];
      let i = numberOfParagraphs();

      while (i > 0) {
        paragraphs.push(
          <Paragraph1 id={`paragraph-${i}`} key={`paragraph-${i}`}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Paragraph1>
        );
        i--;
      }

      return paragraphs;
    };

    const showActions = () => bool('Show Actions', true);
    const alertOnActions = () => bool('Alert on Action', false);
    const showAlert = alertOnActions();

    const [open, setOpen] = useState(initiallyOpen());

    const handleClickOpen = () => setOpen(true);

    const handleClose = () => {
      if (showAlert) alert('Closed!'); // eslint-disable-line no-alert
      setOpen(false);
    };

    const handleSubmit = () => {
      if (showAlert) alert('Submitted!'); // eslint-disable-line no-alert
      setOpen(false);
    };

    return (
      <React.Fragment>
        <Button variant="primary" onClick={handleClickOpen}>
          Open Dialog
        </Button>

        <Dialog
          id="confirmDialog"
          aria-labelledby="dialog-title"
          open={open}
          onClose={handleClose}
          // Disabled focus to allow DialogTitle text knob to focus. Should not disable in regular use
          disableAutoFocus
          disableEnforceFocus
          disableRestoreFocus
        >
          {showTitle() && (
            <DialogTitle
              divider={showDividers()}
              onClose={handleClose}
              closeIcon={showTitleClose()}
            >
              <MediumTitle id="dialog-title">{titleText()}</MediumTitle>
            </DialogTitle>
          )}

          {showContent() && (
            <DialogContent divider={showDividers()}>{getParagraphs()}</DialogContent>
          )}

          {showActions() && (
            <DialogActions>
              <Button variant="secondary" onClick={() => handleClose(alertOnActions())}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                Confirm
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </React.Fragment>
    );
  },

  name: 'Confirmation',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=8%3A826',
    },
  },
};

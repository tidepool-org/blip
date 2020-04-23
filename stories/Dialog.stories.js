import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, text, number } from '@storybook/addon-knobs';
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

const DIALOG = 'Dialog';
const TITLE = 'Title';
const CONTENT = 'Content';
const ACTIONS = 'Actions';

export const DialogStory = () => {
  const initiallyOpen = () => boolean('Initially Open', true, DIALOG);

  const showTitle = () => boolean('Show Title', true, TITLE);
  const showTitleClose = () => boolean('Show Close Icon', true, TITLE);
  const titleText = () => text('Title Text', 'Dialog Title', TITLE);

  const showContent = () => boolean('Show Content', true, CONTENT);
  const showDividers = () => boolean('Show Dividers', true, CONTENT);
  const numberOfParagraphs = () => number('Number of Paragraphs', 2, {}, CONTENT);

  const getParagraphs = () => {
    const paragraphs = [];
    let i = numberOfParagraphs();

    while (i > 0) {
      paragraphs.push((
        <Body1 id={`paragraph-${i}`} key={`paragraph-${i}`}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Body1>
      ));
      i--;
    }

    return paragraphs;
  };

  const showActions = () => boolean('Show Actions', true, ACTIONS);
  const alertOnActions = () => boolean('Alert on Action', false, ACTIONS);
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
          <DialogTitle divider={showDividers()} onClose={handleClose} closeIcon={showTitleClose()}>
            <Title id="dialog-title">{titleText()}</Title>
          </DialogTitle>
        )}

        {showContent() && (
          <DialogContent divider={showDividers()}>
            {getParagraphs()}
          </DialogContent>
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
};

DialogStory.story = {
  name: 'Confirmation',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=8%3A826',
    },
  },
};

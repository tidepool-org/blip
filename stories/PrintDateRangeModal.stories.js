import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Button from '../app/components/elements/Button';
import PrintDateRangeModal from '../app/components/PrintDateRangeModal';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Print Date Range Modals',
  decorators: [withDesign, withTheme],
};

export const PrintDateRangeModalStory = () => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setSubmitted(false);
    setError(false);
  };

  const validateDates = ({ startDate, endDate }) => setError(!startDate || !endDate);

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Print Dialog
      </Button>
      <PrintDateRangeModal
        error={error}
        open={open}
        onClose={handleClose}
        onClickPrint={dates => {
          setSubmitted(true);
          validateDates(dates);
          action('clicked Print')(dates);
        }}
        onDatesChange={dates => submitted && validateDates(dates)}
        timePrefs={{
          timezoneName: 'UTC',
        }}
      />
    </React.Fragment>
  );
};

PrintDateRangeModalStory.story = {
  name: 'Print Date Range Modal',
  parameters: {
    design: {
      type: 'figma',
      url:
        'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=2209%3A256',
    },
  },
};

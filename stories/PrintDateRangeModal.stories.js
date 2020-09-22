import React, { useState } from 'react';
import moment from 'moment-timezone';
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
  const initialErrorState = {
    basics: false,
    bgLog: false,
    daily: false,
  };

  const [open, setOpen] = useState(true);
  const [errors, setErrors] = useState(initialErrorState);
  const [submitted, setSubmitted] = useState(false);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setSubmitted(false);
    setErrors(initialErrorState);
  };

  const validateDates = ({ basics, bgLog, daily }) => setErrors({
    basics: !basics.startDate || !basics.endDate,
    bgLog: !bgLog.startDate || !bgLog.endDate,
    daily: !daily.startDate || !daily.endDate,
  });

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Print Dialog
      </Button>
      <PrintDateRangeModal
        errors={errors}
        mostRecentDatumDates={{
          basics: moment.utc().valueOf(),
          bgLog: moment.utc().subtract(2, 'd').valueOf(),
          daily: moment.utc().valueOf(),
        }}
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

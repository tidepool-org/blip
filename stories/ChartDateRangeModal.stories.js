import React, { useState } from 'react';
import moment from 'moment-timezone';
import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Button from '../app/components/elements/Button';
import ChartDateRangeModal from '../app/components/ChartDateRangeModal';

/* eslint-disable max-len */
const sleep = m => new Promise(r => setTimeout(r, m));

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Chart Date Range Modals',
  decorators: [withDesign, withTheme],
};

export const ChartDateRangeModalStory = () => {
  const [open, setOpen] = useState(true);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
  };

  const [processing, setProcessing] = React.useState(false);

  const fetchedUntil = moment.utc().subtract(30, 'days').valueOf();

  const handleClickPrint = async range => {
    action('Clicked Apply')(range);
    setProcessing(true);

    // Determine the earliest start date needed to fetch data to.
    const fetchUntil = range[0];

    // If fetchUntil is earlier than the point to which we've fetched data, we need to fetch more.
    if (fetchUntil < fetchedUntil) {
      action('Fetching Data')(range);
      await sleep(2000);
    }

    await sleep(1000);
    setProcessing(false);
    action('Applying Dates')(range);
  };

  const mostRecentDatumDate = moment.utc().subtract(2, 'd').valueOf();

  const defaultDates = [
    moment.utc(mostRecentDatumDate).subtract(5, 'd').valueOf(),
    mostRecentDatumDate,
  ];

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Chart Dates Dialog
      </Button>
      <ChartDateRangeModal
        defaultDates={defaultDates}
        mostRecentDatumDate={mostRecentDatumDate}
        open={open}
        onClose={handleClose}
        onSubmit={handleClickPrint}
        onDatesChange={dates => action('Updated Dates')(dates)}
        processing={processing}
        timePrefs={{
          timezoneName: 'UTC',
        }}
      />
    </React.Fragment>
  );
};

ChartDateRangeModalStory.story = {
  name: 'Chart Date Range Modal',
};
